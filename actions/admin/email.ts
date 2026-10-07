'use server';

import { resend } from '@/lib/resend';
import { createAdminClient } from '@/lib/supabase/admin';
import { EMAIL_CONFIG, APP_CONFIG } from '@/lib/config';

type BulkEmailParams = {
    segment: 'active';
    subject: string;
    content: string;
};

type BulkEmailResult = {
    /** Recipients Resend actually accepted */
    sentCount: number;
    /** Recipients Resend rejected (or that we could not attempt) */
    failedCount: number;
    /** Total unique recipients the segment resolved to */
    recipientCount: number;
    /** Human-readable rejection reasons, deduplicated */
    failures?: string[];
    error?: string;
};

/** Resend accepts at most 100 messages per batch call. */
const BATCH_SIZE = 100;

/**
 * Resend allows 10 requests per second per team. Batching already puts us far
 * under that, but a large segment still issues several calls back to back, so
 * pace them and retry anything the API still rate-limits.
 */
const BATCH_INTERVAL_MS = 250;
const MAX_RATE_LIMIT_RETRIES = 4;

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const isRateLimited = (error: { name?: string; message?: string } | null) =>
    error?.name === 'rate_limit_exceeded' ||
    /rate limit|too many requests/i.test(error?.message ?? '');

export async function sendBulkEmail({ segment, subject, content }: BulkEmailParams): Promise<BulkEmailResult> {
    const empty = { sentCount: 0, failedCount: 0, recipientCount: 0 };

    if (!segment || !subject || !content) {
        return { ...empty, error: 'Missing required fields' };
    }

    const supabase = createAdminClient();

    let query = supabase.from('ads').select('email, title').eq('type', 'offer');

    switch (segment) {
        case 'active':
            query = query.eq('status', 'active');
            break;
    }

    const { data: ads, error } = await query;

    if (error) {
        console.error('Error fetching ads for bulk email:', error);
        return { ...empty, error: 'Failed to fetch recipients' };
    }

    if (!ads || ads.length === 0) {
        return empty;
    }

    // Deduplicate emails
    const uniqueEmails = [...new Set(ads.map(a => a.email).filter(Boolean))];

    if (uniqueEmails.length === 0) {
        return empty;
    }

    let sentCount = 0;
    let failedCount = 0;
    const failures = new Set<string>();

    // Send in batches: one API call per 100 recipients instead of one per
    // recipient, so a large segment cannot run into the per-second rate limit
    // or the function's execution time budget.
    for (let i = 0; i < uniqueEmails.length; i += BATCH_SIZE) {
        const chunk = uniqueEmails.slice(i, i + BATCH_SIZE);

        if (i > 0) await sleep(BATCH_INTERVAL_MS);

        const payload = chunk.map(email => ({
            from: EMAIL_CONFIG.noreplyFrom,
            to: email,
            subject,
            text: content,
        }));

        try {
            // NOTE: the Resend SDK does NOT throw on API errors — it resolves to
            // { data, error }. The `error` field must be inspected explicitly or
            // every rejection (rate limit, suppressed recipient, invalid address)
            // passes silently and we report a success that never happened.
            //
            // 'permissive' validation is deliberate: addresses come from user
            // submissions, and under the default 'strict' mode a single malformed
            // one makes Resend reject the entire batch. Permissive mode delivers
            // the rest and reports the bad ones per index.
            let attempt = 0;
            let data: Awaited<ReturnType<typeof resend.batch.send>>['data'] = null;
            let sendError: Awaited<ReturnType<typeof resend.batch.send>>['error'] = null;

            // Retry only on rate limiting; any other rejection is reported as-is.
            for (;;) {
                ({ data, error: sendError } = await resend.batch.send(payload, {
                    batchValidation: 'permissive',
                }));

                if (!isRateLimited(sendError) || attempt >= MAX_RATE_LIMIT_RETRIES) break;

                attempt++;
                const backoff = BATCH_INTERVAL_MS * 2 ** attempt;
                console.warn(`Bulk email batch rate-limited, retrying in ${backoff}ms (attempt ${attempt})`);
                await sleep(backoff);
            }

            if (sendError) {
                failedCount += chunk.length;
                failures.add(sendError.message || String(sendError));
                console.error('Bulk email batch rejected by Resend:', sendError);
                continue;
            }

            const accepted = data?.data?.length ?? 0;
            sentCount += accepted;

            for (const rejected of data?.errors ?? []) {
                const address = chunk[rejected.index] ?? `#${rejected.index}`;
                failures.add(`${address}: ${rejected.message}`);
                console.error('Bulk email recipient rejected:', rejected);
            }

            const missing = chunk.length - accepted;
            if (missing > 0) {
                failedCount += missing;
            }
        } catch (err) {
            // Only transport-level faults (network, abort) land here.
            failedCount += chunk.length;
            failures.add(err instanceof Error ? err.message : String(err));
            console.error('Failed to send bulk email batch:', err);
        }
    }

    return {
        sentCount,
        failedCount,
        recipientCount: uniqueEmails.length,
        ...(failures.size > 0 ? { failures: [...failures] } : {}),
    };
}

/**
 * Send a single email from admin panel
 */
export async function sendAdminEmail(params: {
    to: string;
    subject: string;
    content: string;
}) {
    const { to, subject, content } = params;

    if (!to || !subject || !content) {
        return { success: false, error: 'Missing required fields' };
    }

    try {
        const { error } = await resend.emails.send({
            from: EMAIL_CONFIG.from,
            to,
            subject,
            html: `
                <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
                    ${content}
                    <hr style="margin-top: 30px; border: none; border-top: 1px solid #e5e5e5;" />
                    <p style="font-size: 12px; color: #888;">
                        Wiadomość wysłana z panelu administracyjnego ${APP_CONFIG.name}
                    </p>
                </div>
            `,
        });

        if (error) {
            console.error('Admin email rejected by Resend:', error);
            return { success: false, error: error.message || String(error) };
        }

        return { success: true };
    } catch (error) {
        console.error('Admin email failed:', error);
        return { success: false, error: String(error) };
    }
}

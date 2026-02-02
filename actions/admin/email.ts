'use server';

import { resend } from '@/lib/resend';
import { createAdminClient } from '@/lib/supabase/admin';
import { EMAIL_CONFIG, APP_CONFIG } from '@/lib/config';

type BulkEmailParams = {
    segment: 'active' | 'expired' | 'expiring_soon';
    subject: string;
    content: string;
};

export async function sendBulkEmail({ segment, subject, content }: BulkEmailParams) {
    if (!segment || !subject || !content) {
        return { sentCount: 0, error: 'Missing required fields' };
    }

    const supabase = createAdminClient();

    const now = new Date();
    const sevenDaysFromNow = new Date();
    sevenDaysFromNow.setDate(sevenDaysFromNow.getDate() + 7);

    let query = supabase.from('ads').select('email, title').eq('type', 'offer');

    switch (segment) {
        case 'active':
            query = query.eq('status', 'active');
            break;
        case 'expired':
            query = query.eq('status', 'expired');
            break;
        case 'expiring_soon':
            query = query
                .eq('status', 'active')
                .gte('expires_at', now.toISOString())
                .lte('expires_at', sevenDaysFromNow.toISOString());
            break;
    }

    const { data: ads, error } = await query;

    if (error) {
        console.error('Error fetching ads for bulk email:', error);
        return { sentCount: 0, error: 'Failed to fetch recipients' };
    }

    if (!ads || ads.length === 0) {
        return { sentCount: 0 };
    }

    // Deduplicate emails
    const uniqueEmails = [...new Set(ads.map(a => a.email).filter(Boolean))];

    if (uniqueEmails.length === 0) {
        return { sentCount: 0 };
    }

    let sentCount = 0;
    for (const email of uniqueEmails) {
        try {
            await resend.emails.send({
                from: EMAIL_CONFIG.noreplyFrom,
                to: email,
                subject: subject,
                text: content,
            });
            sentCount++;
        } catch (err) {
            console.error('Failed to send bulk email to recipient:', err);
        }
    }

    return { sentCount };
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
        await resend.emails.send({
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
        return { success: true };
    } catch (error) {
        console.error('Admin email failed:', error);
        return { success: false, error: String(error) };
    }
}

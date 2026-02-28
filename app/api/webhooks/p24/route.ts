import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { getBaseUrl } from '@/lib/config';
import crypto from 'crypto';

const P24_CRC = process.env.P24_CRC;

function p24JsonStringify(obj: Record<string, unknown>): string {
    return JSON.stringify(obj)
        .replace(/\\u[\dA-F]{4}/gi, function (match) {
            return String.fromCharCode(parseInt(match.replace(/\\u/g, ''), 16));
        })
        .replace(/\\\//g, '/');
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();

        const {
            merchantId,
            posId,
            sessionId,
            amount,
            originAmount,
            currency,
            orderId,
            methodId,
            statement,
            sign
        } = body;

        if (!sessionId || !merchantId || !amount || !sign) {
            console.error('[P24 Webhook] Missing required fields');
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        if (!P24_CRC) {
            console.error('[P24 Webhook] P24_CRC not configured');
            return NextResponse.json({ error: 'Server configuration error' }, { status: 500 });
        }

        const signData = {
            merchantId,
            posId,
            sessionId,
            amount,
            originAmount,
            currency,
            orderId,
            methodId,
            statement,
            crc: P24_CRC
        };
        const expectedSign = crypto
            .createHash('sha384')
            .update(p24JsonStringify(signData))
            .digest('hex');

        if (sign !== expectedSign) {
            console.error('[P24 Webhook] Invalid signature for session:', sessionId);
            return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
        }

        const supabase = createAdminClient();

        const { data, error } = await supabase.rpc('complete_payment', {
            p_transaction_id: sessionId,
            p_payment_id: orderId?.toString() || null,
        });

        if (error) {
            console.error('[P24 Webhook] RPC error:', error);
            return NextResponse.json({ error: 'Database error' }, { status: 500 });
        }

        await supabase
            .from('transactions')
            .update({ webhook_received_at: new Date().toISOString() })
            .eq('id', sessionId);

        const { data: tx } = await supabase
            .from('transactions')
            .select('type, ad_id')
            .eq('id', sessionId)
            .single();

        if (tx?.type === 'activation') {
            const { data: ad } = await supabase
                .from('ads')
                .select('email, title, management_token, id, phone_contact')
                .eq('id', tx.ad_id)
                .single();

            if (ad) {
                if (ad.phone_contact) {
                    try {
                        const { normalizeAndHashPhone } = await import('@/actions/user/hash_phone');
                        const { hash } = normalizeAndHashPhone(ad.phone_contact);

                        await supabase
                            .from('ads')
                            .update({ phone_hash: hash })
                            .eq('id', ad.id);
                    } catch (hashError) {
                        console.error('[P24 Webhook] Failed to update phone_hash:', hashError);
                    }
                }
                try {
                    const { sendEmail } = await import('@/actions/emails');
                    const baseUrl = getBaseUrl();
                    await sendEmail({
                        to: ad.email,
                        type: 'welcome',
                        props: {
                            adTitle: ad.title,
                            manageLink: `${baseUrl}/offers/manage/${ad.management_token}`,
                            publicLink: `${baseUrl}/offers/${ad.id}`
                        }
                    });

                } catch (emailError) {
                    console.error('[P24 Webhook] Failed to send welcome email:', emailError);
                }
            }
        }

        return NextResponse.json({ status: 'ok' });

    } catch (error) {
        console.error('[P24 Webhook] Unexpected error:', error);
        return NextResponse.json({ error: 'Internal error' }, { status: 500 });
    }
}

export async function GET() {
    return NextResponse.json({ status: 'P24 webhook endpoint active' });
}

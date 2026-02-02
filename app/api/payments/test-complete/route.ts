import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { getBaseUrl, AD_CONFIG } from '@/lib/config';

export async function POST(request: NextRequest) {
    const isP24FullyConfigured =
        process.env.P24_MERCHANT_ID &&
        process.env.P24_POS_ID &&
        process.env.P24_CRC &&
        process.env.P24_API_KEY;

    if (isP24FullyConfigured) {
        return NextResponse.json(
            { error: 'Test endpoint disabled - P24 is fully configured' },
            { status: 403 }
        );
    }

    try {
        const { sessionId } = await request.json();

        if (!sessionId) {
            return NextResponse.json({ error: 'Missing sessionId' }, { status: 400 });
        }

        const supabase = createAdminClient();

        const { data: tx, error: txError } = await supabase
            .from('transactions')
            .select('id, status, ad_id, type')
            .eq('id', sessionId)
            .single();

        if (txError || !tx) {
            return NextResponse.json({ error: 'Transaction not found' }, { status: 404 });
        }

        if (tx.status === 'completed') {
            return NextResponse.json({ error: 'Transaction already completed' }, { status: 400 });
        }

        // @ts-ignore
        const { error: rpcError } = await supabase.rpc('complete_payment', {
            p_transaction_id: sessionId,
            p_payment_id: `TEST-${Date.now()}`,
        });

        if (rpcError) {
            await supabase
                .from('transactions')
                .update({
                    status: 'completed',
                    payment_id: `TEST-${Date.now()}`,
                    webhook_received_at: new Date().toISOString(),
                })
                .eq('id', sessionId);

            if (tx.type === 'activation') {
                const { data: ad } = await supabase
                    .from('ads')
                    .select('phone_contact')
                    .eq('id', tx.ad_id)
                    .single();

                let hashUpdate = {};
                if (ad?.phone_contact) {
                    try {
                        const { normalizeAndHashPhone } = await import('@/actions/user/hash_phone');
                        const { hash } = normalizeAndHashPhone(ad.phone_contact);
                        hashUpdate = { phone_hash: hash };
                    } catch (e) {
                        console.error('Failed to hash phone in test-complete:', e);
                    }
                }

                await supabase
                    .from('ads')
                    .update({
                        status: 'active',
                        expires_at: new Date(Date.now() + AD_CONFIG.validityMs).toISOString(),
                        visible_at: new Date().toISOString(),
                        ...hashUpdate
                    })
                    .eq('id', tx.ad_id);
            } else if (tx.type === 'extension') {
                const { data: ad } = await supabase
                    .from('ads')
                    .select('expires_at')
                    .eq('id', tx.ad_id)
                    .single();

                const baseDate = ad?.expires_at && new Date(ad.expires_at) > new Date()
                    ? new Date(ad.expires_at)
                    : new Date();

                await supabase
                    .from('ads')
                    .update({
                        status: 'active',
                        expires_at: new Date(baseDate.getTime() + AD_CONFIG.extensionMs).toISOString(),
                        expiring_warning_sent_at: null,
                    })
                    .eq('id', tx.ad_id);
            } else if (tx.type === 'bump') {
                await supabase
                    .from('ads')
                    .update({
                        visible_at: new Date().toISOString(),
                    })
                    .eq('id', tx.ad_id);
            }
        }

        if (tx.type === 'activation') {
            const { data: ad } = await supabase
                .from('ads')
                .select('email, title, management_token, id')
                .eq('id', tx.ad_id)
                .single();

            if (ad) {
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
                    console.error('[Test Complete] Failed to send welcome email:', emailError);
                }
            }
        }

        return NextResponse.json({ success: true });

    } catch (error) {
        console.error('[Test Complete] Error:', error);
        return NextResponse.json({ error: 'Internal error' }, { status: 500 });
    }
}

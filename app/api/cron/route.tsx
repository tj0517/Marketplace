import { createAdminClient } from "@/lib/supabase/admin";
import { sendEmail } from '@/actions/emails';
import { getBaseUrl, AD_CONFIG } from '@/lib/config';
import { NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
    const authHeader = request.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET;

    if (process.env.NODE_ENV === 'production' && !cronSecret) {
        console.error('CRON_SECRET is not configured in production');
        return Response.json({ error: 'Server configuration error' }, { status: 500 });
    }

    if (cronSecret) {
        const expectedToken = `Bearer ${cronSecret}`;
        if (authHeader !== expectedToken) {
            return Response.json({ error: 'Unauthorized' }, { status: 401 });
        }
    }

    const supabase = createAdminClient();

    let effectiveBaseUrl: string;
    try {
        effectiveBaseUrl = getBaseUrl();
    } catch {
        return Response.json({ error: 'Server configuration error' }, { status: 500 });
    }

    const now = new Date();
    const warningDate = new Date();
    warningDate.setDate(warningDate.getDate() + AD_CONFIG.expiryWarningDays);

    const { data: expiringAds } = await supabase
        .from('ads')
        .select('*')
        .eq('status', 'active')
        .eq('type', 'offer')
        .is('expiring_warning_sent_at', null)
        .gte('expires_at', now.toISOString())
        .lte('expires_at', warningDate.toISOString());

    let expiringSoonCount = 0;

    if (expiringAds && expiringAds.length > 0) {
        const adIds = expiringAds.map(ad => ad.id);

        const { error: batchUpdateError } = await supabase
            .from('ads')
            .update({ expiring_warning_sent_at: new Date().toISOString() })
            .in('id', adIds);

        if (batchUpdateError) {
            console.error('Failed to batch update warning flags:', batchUpdateError);
        } else {
            for (const ad of expiringAds) {
                try {
                    const manageLink = `${effectiveBaseUrl}/offers/manage/${ad.management_token}`;

                    await sendEmail({
                        to: ad.email,
                        type: 'expiring_soon',
                        props: {
                            adTitle: ad.title,
                            expiresAt: ad.expires_at,
                            manageLink: manageLink
                        }
                    });

                    expiringSoonCount++;
                } catch (error) {
                    console.error(`Failed to send expiring soon email to ${ad.email}:`, error);
                }
            }
        }
    }

    const { data: expiredAds } = await supabase
        .from('ads')
        .select('*')
        .eq('status', 'active')
        .eq('type', 'offer')
        .lt('expires_at', now.toISOString());

    let expiredCount = 0;

    if (expiredAds && expiredAds.length > 0) {
        const expiredAdIds = expiredAds.map(ad => ad.id);

        const { error: batchExpireError } = await supabase
            .from('ads')
            .update({ status: 'expired' })
            .in('id', expiredAdIds);

        if (batchExpireError) {
            console.error('Error batch updating expired ads:', batchExpireError);
        } else {
            for (const ad of expiredAds) {
                try {
                    const manageLink = `${effectiveBaseUrl}/offers/manage/${ad.management_token}`;

                    await sendEmail({
                        to: ad.email,
                        type: 'expired',
                        props: {
                            adTitle: ad.title,
                            manageLink: manageLink
                        }
                    });

                    expiredCount++;
                } catch (error) {
                    console.error(`Failed to send expired email to ${ad.email}:`, error);
                }
            }
        }
    }

    const transactionTimeout = new Date(Date.now() - AD_CONFIG.transactionTimeoutMs);

    const { data: abandonedTx } = await supabase
        .from('transactions')
        .select('id')
        .eq('status', 'pending')
        .lt('created_at', transactionTimeout.toISOString());

    let abandonedTxCount = 0;

    if (abandonedTx && abandonedTx.length > 0) {
        const { error } = await supabase
            .from('transactions')
            .update({
                status: 'failed',
                error_message: 'Timeout - no webhook received'
            })
            .in('id', abandonedTx.map(t => t.id));

        if (!error) {
            abandonedTxCount = abandonedTx.length;
        } else {
            console.error('Error updating abandoned transactions:', error);
        }
    }

    return Response.json({
        message: 'Cron job completed',
        expiringSoonEmailsSent: expiringSoonCount,
        expiredEmailsSent: expiredCount,
        abandonedTransactionsMarked: abandonedTxCount
    }, { status: 200 });
}

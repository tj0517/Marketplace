import { createAdminClient } from "@/lib/supabase/admin";
import { AD_CONFIG } from '@/lib/config';
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
        abandonedTransactionsMarked: abandonedTxCount
    }, { status: 200 });
}

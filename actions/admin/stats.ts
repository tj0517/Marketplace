'use server';

import { createClient } from '@/lib/supabase/server';

export async function getAdminStats() {
    const supabase = await createClient();

    // Get total ads count
    const { count: adsCount, error: adsError } = await supabase
        .from('ads')
        .select('*', { count: 'exact', head: true });

    if (adsError) {
        console.error('Error fetching ads count:', adsError);
    }

    // Get total successful transactions count and sum revenue
    const { data: transactions, error: transactionsError } = await supabase
        .from('transactions')
        .select('amount, status')
        .eq('status', 'completed');

    if (transactionsError) {
        console.error('Error fetching transactions stats:', transactionsError);
    }

    const successfulPaymentsCount = transactions?.length || 0;
    const totalRevenue = transactions?.reduce((sum, txn) => sum + (txn.amount || 0), 0) || 0;

    return {
        adsCount: adsCount || 0,
        successfulPaymentsCount,
        totalRevenue
    };
}

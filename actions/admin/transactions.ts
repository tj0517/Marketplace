'use server';

import { createClient } from '@/lib/supabase/server';

export async function getAdminTransactions() {
    const supabase = await createClient();

    const { data: transactions, error } = await supabase
        .from('transactions')
        .select(`
            *,
            ads (
                title,
                email
            )
        `)
        .order('created_at', { ascending: false });

    if (error) {
        console.error('Error fetching admin transactions:', error);
        throw new Error('Failed to fetch transactions');
    }

    return transactions;
}

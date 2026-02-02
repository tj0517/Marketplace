'use server';

import { createAdminClient } from '@/lib/supabase/admin';
import { revalidatePath } from 'next/cache';

export async function getAdminAds() {
    const supabase = await createAdminClient();

    const { data: ads, error } = await supabase
        .from('ads')
        .select('*')
        .order('created_at', { ascending: false });

    if (error) {
        console.error('Error fetching admin ads:', error);
        throw new Error('Failed to fetch ads');
    }

    return ads;
}

export async function updateAdStatus(adId: string, status: 'active' | 'expired' | 'banned') {
    const supabase = await createAdminClient();

    const { error } = await supabase
        .from('ads')
        .update({ status })
        .eq('id', adId);

    if (error) {
        console.error('[Server] updateAdStatus DB Error:', error);
    } else {
    }

    if (error) {
        console.error('Error updating ad status:', error);
        throw new Error('Failed to update ad status');
    }

    revalidatePath('/admin');
}

export async function deleteAd(adId: string) {
    const supabase = await createAdminClient();

    const { error } = await supabase
        .from('ads')
        .update({ status: 'deleted' })
        .eq('id', adId);

    if (error) {
        console.error('[Server] deleteAd DB Error:', error);
        throw new Error('Failed to delete ad');
    }

    revalidatePath('/admin');
}

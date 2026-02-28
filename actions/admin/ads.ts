'use server';

import { createAdminClient } from '@/lib/supabase/admin';
import { revalidatePath } from 'next/cache';

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function getAdminAds() {
    const supabase = createAdminClient();

    const { data: ads, error } = await supabase
        .from('ads')
        .select('id, title, email, status, type, created_at, expires_at, views_count, contact_count')
        .neq('status', 'deleted')
        .order('created_at', { ascending: false });

    if (error) {
        console.error('Error fetching admin ads:', error);
        throw new Error('Failed to fetch ads');
    }

    return ads;
}

export async function updateAdStatus(adId: string, status: 'active' | 'expired' | 'banned') {
    if (!adId || !UUID_REGEX.test(adId)) {
        throw new Error('Invalid ad ID');
    }

    const supabase = createAdminClient();

    const { error } = await supabase
        .from('ads')
        .update({ status })
        .eq('id', adId);

    if (error) {
        console.error('[Admin] updateAdStatus error:', error);
        throw new Error('Failed to update ad status');
    }

    revalidatePath('/admin');
}

export async function deleteAd(adId: string) {
    if (!adId || !UUID_REGEX.test(adId)) {
        throw new Error('Invalid ad ID');
    }

    const supabase = createAdminClient();

    const { error } = await supabase
        .from('ads')
        .update({ status: 'deleted' })
        .eq('id', adId);

    if (error) {
        console.error('[Admin] deleteAd error:', error);
        throw new Error('Failed to delete ad');
    }

    revalidatePath('/admin');
}

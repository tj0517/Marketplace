'use server';

import { requireAdmin } from '@/lib/admin-guard';
import { createAdminClient } from '@/lib/supabase/admin';
import { revalidatePath, updateTag } from 'next/cache';

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
/** PostgREST returns at most `max_rows` (supabase/config.toml) rows per request. */
const PAGE_SIZE = 1000;

/** Normalized e-mails with an active marketing consent (LK-2.01: stored as lower(btrim(email))). */
async function getActiveConsentEmails(supabase: ReturnType<typeof createAdminClient>): Promise<Set<string>> {
    const emails = new Set<string>();
    for (let from = 0; ; from += PAGE_SIZE) {
        const { data, error } = await supabase
            .from('marketing_consents')
            .select('email')
            .eq('status', 'active')
            .order('email')
            .range(from, from + PAGE_SIZE - 1);

        if (error) {
            console.error('Error fetching marketing consents:', error);
            throw new Error('Failed to fetch marketing consents');
        }

        data.forEach(row => emails.add(row.email));
        if (data.length < PAGE_SIZE) {
            return emails;
        }
    }
}

export async function getAdminAds() {
    await requireAdmin();

    const supabase = createAdminClient();

    const { data: ads, error } = await supabase
        .from('ads')
        .select('id, title, email, phone_contact, status, type, created_at, views_count, contact_count')
        .neq('status', 'deleted')
        .order('created_at', { ascending: false });

    if (error) {
        console.error('Error fetching admin ads:', error);
        throw new Error('Failed to fetch ads');
    }

    const consentEmails = await getActiveConsentEmails(supabase);

    return ads.map(ad => ({
        ...ad,
        has_marketing_consent: consentEmails.has(ad.email.trim().toLowerCase()),
    }));
}

export async function updateAdStatus(adId: string, status: 'active' | 'banned') {
    await requireAdmin();

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

    updateTag('ads');
    revalidatePath('/');
    revalidatePath('/admin');
}

export async function deleteAd(adId: string) {
    await requireAdmin();

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

    updateTag('ads');
    revalidatePath('/');
    revalidatePath('/admin');
}

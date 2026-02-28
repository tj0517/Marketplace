'use server';

import { createAdminClient } from '@/lib/supabase/admin';
import { revalidatePath } from 'next/cache';
import { AD_CONFIG } from '@/lib/config';
import crypto from 'crypto';

export type CreateFeaturedAdInput = {
    title: string;
    description: string;
    subject: string;
    location: string;
    price_amount?: number | null;
    price_unit?: string | null;
    tutor_gender?: string | null;
    education_level?: string[];
    email: string;
    phone_contact?: string;
};

export async function createFeaturedAd(input: CreateFeaturedAdInput) {
    const supabase = createAdminClient();

    const now = new Date();
    const expiresAt = new Date(now.getTime() + AD_CONFIG.validityDays * 24 * 60 * 60 * 1000 * 12); // 1 year
    const managementToken = crypto.randomUUID();

    // visible_at set to far future so featured ads sort first (visible_at DESC)
    const featuredVisibleAt = new Date('2099-01-01T00:00:00Z').toISOString();

    const { data, error } = await supabase
        .from('ads')
        .insert({
            title: input.title,
            description: input.description,
            subject: input.subject,
            location: input.location,
            price_amount: input.price_amount ?? null,
            price_unit: input.price_unit ?? null,
            tutor_gender: input.tutor_gender ?? null,
            education_level: input.education_level ?? [],
            email: input.email,
            phone_contact: input.phone_contact || 'brak',
            phone_hash: 'admin-' + crypto.randomUUID(),
            type: 'offer',
            status: 'active',
            is_featured: true,
            visible_at: featuredVisibleAt,
            expires_at: expiresAt.toISOString(),
            management_token: managementToken,
        })
        .select('id')
        .single();

    if (error) {
        console.error('[Admin] createFeaturedAd error:', error);
        throw new Error('Nie udało się dodać ogłoszenia.');
    }

    revalidatePath('/');
    revalidatePath('/admin');

    return data;
}

export async function toggleFeaturedAd(adId: string, featured: boolean) {
    const supabase = createAdminClient();

    const updateData: Record<string, unknown> = { is_featured: featured };

    if (featured) {
        // Pinned to top
        updateData.visible_at = new Date('2099-01-01T00:00:00Z').toISOString();
    } else {
        // Restore to now so it sorts naturally
        updateData.visible_at = new Date().toISOString();
    }

    const { error } = await supabase
        .from('ads')
        .update(updateData)
        .eq('id', adId);

    if (error) {
        console.error('[Admin] toggleFeaturedAd error:', error);
        throw new Error('Nie udało się zmienić statusu promowania.');
    }

    revalidatePath('/');
    revalidatePath('/admin');
}

export async function extendFeaturedAd(adId: string) {
    const supabase = createAdminClient();

    const newExpiresAt = new Date();
    newExpiresAt.setFullYear(newExpiresAt.getFullYear() + 1);

    const { error } = await supabase
        .from('ads')
        .update({ expires_at: newExpiresAt.toISOString(), status: 'active' })
        .eq('id', adId);

    if (error) {
        console.error('[Admin] extendFeaturedAd error:', error);
        throw new Error('Nie udało się przedłużyć ogłoszenia.');
    }

    revalidatePath('/admin');
}

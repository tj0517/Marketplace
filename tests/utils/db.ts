import { createClient } from '@supabase/supabase-js';

// Re-construct types locally or import if available in tests config
// Ideally we import Database from '@/types/supabase' but path aliases might need setup in tsconfig
// For now using 'any' for simplicity in test helper to avoid build complexity
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
}

export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

export async function clearTestData(phoneNumber: string) {
    // 1. Get hash for the phone number logic if we could, 
    // but since hashing logic is internal, we might clear by metadata or just delete headers
    // For "Ad Lifecycle", we can delete ads created with a specific title prefix

    // Delete ads with test prefix
    await supabaseAdmin.from('ads').delete().ilike('title', 'TEST_%');

    // NOTE: Clearing phone_hashes is harder without knowing the hash logic here.
    // Ideally, tests should use a fresh random phone number each time to avoid collision.
    // But if we need to reset "free slot", we might need to delete from phone_hashes.
    // Since we can't easily replicate the hash here without importing the lib (which might be ESM/CJS issue), 
    // we will rely on unique inputs.
}

export async function setAdExpired(adId: string) {
    const { error } = await supabaseAdmin
        .from('ads')
        .update({
            expires_at: new Date(Date.now() - 3600 * 1000).toISOString(), // 1 hour ago
            status: 'active'
        })
        .eq('id', adId);

    if (error) throw error;
}

export async function getActivivationToken(adId: string) {
    const { data } = await supabaseAdmin
        .from('ads')
        .select('management_token')
        .eq('id', adId)
        .single();
    return data?.management_token;
}

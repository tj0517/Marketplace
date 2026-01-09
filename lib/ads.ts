
import { unstable_cache } from 'next/cache';
import { createClient } from '@supabase/supabase-js';
import { Database } from '@/types/supabase';

type Ad = Database['public']['Tables']['ads']['Row'];


// Helper to fetch all ads (Cached)
const fetchAllAds = unstable_cache(
    async (): Promise<Ad[]> => {
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
        const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

        if (!supabaseUrl || !supabaseKey) {
            return [];
        }

        const supabase = createClient<Database>(supabaseUrl, supabaseKey);
        const { data, error } = await supabase.from('ads').select('*');

        if (error) {
            console.error('Error fetching ads:', error);
            throw error;
        }

        return data || [];
    },
    ['all-ads-cache'],
    {
        revalidate: 60,
        tags: ['ads'],
    }
);

export const getAds = async (params?: { query?: string }): Promise<Ad[]> => {
    const allAds = await fetchAllAds();

    if (!params?.query) {
        return allAds;
    }

    const searchTerm = params.query.toLowerCase();

    return allAds.filter(ad => {
        const titleMatch = ad.title?.toLowerCase().includes(searchTerm) ?? false;
        const descriptionMatch = ad.description?.toLowerCase().includes(searchTerm) ?? false;
        const subjectMatch = ad.subject?.toLowerCase().includes(searchTerm) ?? false;
        const locationMatch = ad.location?.toLowerCase().includes(searchTerm) ?? false;

        return titleMatch || descriptionMatch || subjectMatch || locationMatch;
    });
};

export const getAd = async (id: string): Promise<Ad | null> => {
    const allAds = await fetchAllAds();
    const ad = allAds.find(a => a.id === id);
    return ad || null;
};

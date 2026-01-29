
import { unstable_cache } from 'next/cache';
import { createClient } from '@supabase/supabase-js';
import { Database } from '@/types/supabase';

type Ad = Database['public']['Tables']['ads']['Row'];


// Initialize client outside to reuse connection/instance
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient<Database>(supabaseUrl, supabaseKey);

const fetchAllAds = unstable_cache(
    async (): Promise<Ad[]> => {
        if (!supabaseUrl || !supabaseKey) {
            return [];
        }


        // Select only necessary columns for the listing to reduce memory usage
        const { data, error } = await supabase
            .from('ads')
            .select('id, type, title, description, subject, location, education_level, price_amount, price_unit, phone_contact, created_at, expires_at, views_count, email, tutor_gender, management_token');

        if (error) {
            console.error('Error fetching ads:', error);
            throw error;
        }

        return (data as unknown as Ad[]) || [];
    },
    ['all-ads-cache'],
    {
        revalidate: 60,
        tags: ['ads'],
    }
);

export const filterAds = (ads: Ad[], query: string | undefined, type: 'offer' | 'search' = 'offer'): Ad[] => {
    let filteredResults = ads.filter(ad => ad.type === type);

    if (!query) {
        return filteredResults;
    }
    const searchTerm = query.toLowerCase().trim();
    return filteredResults.filter(ad => {
        const titleMatch = ad.title?.toLowerCase().includes(searchTerm) ?? false;
        const descriptionMatch = ad.description?.toLowerCase().includes(searchTerm) ?? false;
        const subjectMatch = ad.subject?.toLowerCase().includes(searchTerm) ?? false;
        const locationMatch = ad.location?.toLowerCase().includes(searchTerm) ?? false;
        const levelMatch = ad.education_level?.some(level => level.toLowerCase().includes(searchTerm)) ?? false;

        return titleMatch || descriptionMatch || subjectMatch || locationMatch || levelMatch;
    });
};

export const getAdsCount = async (params?: { query?: string, type?: 'offer' | 'search' }): Promise<number> => {
    const allAds = await fetchAllAds();
    const filteredAds = filterAds(allAds, params?.query, params?.type);
    return filteredAds.length;
};

export const getAds = async (params?: { query?: string, page?: number, limit?: number, type?: 'offer' | 'search' }): Promise<Ad[]> => {
    const allAds = await fetchAllAds();
    const filteredAds = filterAds(allAds, params?.query, params?.type);

    const page = params?.page || 1;
    const limit = params?.limit || 10;

    return filteredAds.slice((page - 1) * limit, page * limit);
};

// Direct DB call to ensure fresh data for single page view
export const getAd = async (id: string): Promise<Ad | null> => {
    const { data, error } = await supabase
        .from('ads')
        .select('*')
        .eq('id', id)
        .single();

    if (error) return null;
    return data;
};

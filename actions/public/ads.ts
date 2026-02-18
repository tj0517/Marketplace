
import { unstable_cache } from 'next/cache';
import { createClient } from '@supabase/supabase-js';
import { Database } from '@/types/supabase';

type Ad = Database['public']['Tables']['ads']['Row'];

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient<Database>(supabaseUrl, supabaseKey);

export type PublicAd = Pick<Ad,
    'id' | 'type' | 'title' | 'description' | 'subject' | 'location' |
    'education_level' | 'price_amount' | 'price_unit' | 'created_at' |
    'expires_at' | 'views_count' | 'tutor_gender' | 'visible_at'
>;

const fetchAllAds = unstable_cache(
    async (): Promise<PublicAd[]> => {
        if (!supabaseUrl || !supabaseKey) {
            return [];
        }

        const { data, error } = await supabase
            .from('ads')
            .select('id, type, title, description, subject, location, education_level, price_amount, price_unit, created_at, expires_at, views_count, tutor_gender, visible_at')
            .eq('status', 'active')
            .order('visible_at', { ascending: false });

        if (error) {
            console.error('Error fetching ads:', error);
            throw error;
        }

        return (data as PublicAd[]) || [];
    },
    ['all-ads-cache'],
    {
        revalidate: 60,
        tags: ['ads'],
    }
);

export const filterAds = (ads: PublicAd[], query: string | undefined, type: 'offer' | 'search' = 'offer'): PublicAd[] => {
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

export const getAds = async (params?: { query?: string, page?: number, limit?: number, type?: 'offer' | 'search' }): Promise<PublicAd[]> => {
    const allAds = await fetchAllAds();
    const filteredAds = filterAds(allAds, params?.query, params?.type);

    const page = params?.page || 1;
    const limit = params?.limit || 10;

    return filteredAds.slice((page - 1) * limit, page * limit);
};

export const getAdPublic = async (id: string): Promise<PublicAd | null> => {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(id)) {
        return null;
    }

    const { data, error } = await supabase
        .from('ads')
        .select('id, type, title, description, subject, location, education_level, price_amount, price_unit, created_at, expires_at, views_count, tutor_gender, visible_at')
        .eq('id', id)
        .neq('status', 'deleted')
        .single();

    if (error) {
        if (error.code !== 'PGRST116') {
            console.error('Error fetching ad:', error);
        }
        return null;
    }
    return data;
};

export const getAd = getAdPublic;

export const searchAdsNative = async (params: {
    query: string;
    type?: 'offer' | 'search';
    page?: number;
    limit?: number;
}): Promise<{ ads: PublicAd[]; count: number }> => {
    const { query, type = 'offer', page = 1, limit = 10 } = params;
    const offset = (page - 1) * limit;

    let queryBuilder = supabase
        .from('ads')
        .select('id, type, title, description, subject, location, education_level, price_amount, price_unit, created_at, expires_at, views_count, tutor_gender, visible_at', { count: 'exact' })
        .eq('status', 'active')
        .eq('type', type);

    if (query && query.trim()) {
        queryBuilder = queryBuilder.textSearch('fts', query, {
            type: 'websearch',
            config: 'polish'
        });
    }

    const { data, error, count } = await queryBuilder
        .order('visible_at', { ascending: false })
        .range(offset, offset + limit - 1);

    if (error) {
        console.error('Error searching ads:', error);
        return { ads: [], count: 0 };
    }

    return {
        ads: (data as PublicAd[]) || [],
        count: count || 0
    };
};

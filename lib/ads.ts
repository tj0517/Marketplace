
import { unstable_cache } from 'next/cache';
import { createClient } from '@supabase/supabase-js';
import { Database } from '@/types/supabase';

type Ad = Database['public']['Tables']['ads']['Row'];


export const getAds = unstable_cache(
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
    ['ads-cache'], // Key parts
    {
        revalidate: 60, // Cache for 60 seconds
        tags: ['ads'], // Tags for on-demand revalidation
    }
);

export const getAd = unstable_cache(
    async (id: string): Promise<Ad | null> => {
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
        const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

        if (!supabaseUrl || !supabaseKey) {
            return null;
        }

        const supabase = createClient<Database>(supabaseUrl, supabaseKey);
        const { data, error } = await supabase.from('ads').select('*').eq('id', id).single();

        if (error) {
            console.error(`Error fetching ad ${id}:`, error);
            return null;
        }

        return data;
    },
    ['ad-details'],
    {
        revalidate: 60,
        tags: ['ads']
    }
);

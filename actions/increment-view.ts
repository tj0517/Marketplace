'use server'

import { createClient } from "@/lib/supabase/server"

export async function incrementAdView(adId: string) {
    const supabase = await createClient()

    const { error } = await supabase.rpc('increment_ad_view', { ad_id: adId })

    if (error) {
        console.error('Error incrementing view count:', error)
    }
}

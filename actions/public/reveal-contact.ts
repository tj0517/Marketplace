'use server'

import { createClient } from '@/lib/supabase/server'

export async function revealContact(adId: string): Promise<string | null> {
    // Validate adId format (UUID)
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!adId || !uuidRegex.test(adId)) {
        return null;
    }

    const supabase = await createClient()

    const { data, error } = await supabase
        .from('ads')
        .select('phone_contact')
        .eq('id', adId)
        .single()

    if (error || !data) {
        console.error('Error revealing contact:', error)
        return null
    }

    return data.phone_contact
}

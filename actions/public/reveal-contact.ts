'use server'

import { createClient } from '@/lib/supabase/server'
import { headers } from 'next/headers'
import { checkRateLimit } from '@/lib/rate-limit'

export async function revealContact(adId: string): Promise<string | null> {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!adId || !uuidRegex.test(adId)) {
        return null;
    }

    const headersList = await headers()
    const ip = headersList.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown'
    const { allowed } = checkRateLimit(`reveal-contact:${ip}`)

    if (!allowed) {
        return null
    }

    const supabase = await createClient()

    const { data, error } = await supabase
        .from('ads')
        .select('phone_contact')
        .eq('id', adId)
        .single()

    if (error || !data) {
        return null
    }

    return data.phone_contact
}

'use server'

import { createAdminClient } from '@/lib/supabase/admin'
import { revalidatePath } from 'next/cache'

export type PromoteAdResult = {
    success: boolean
    message: string
    promotedAt?: string
}

export async function promoteAd(token: string): Promise<PromoteAdResult> {
    if (!token) {
        return {
            success: false,
            message: 'Brak tokenu zarządzania.',
        }
    }

    const supabase = createAdminClient()

    // Get the ad by management token
    const { data: ad, error: fetchError } = await supabase
        .from('ads')
        .select('id, status, type, expires_at')
        .eq('management_token', token)
        .single()

    if (fetchError || !ad) {
        console.error('Fetch Error:', fetchError)
        return {
            success: false,
            message: 'Nie znaleziono ogłoszenia.',
        }
    }

    // Only allow promotion for 'offer' type ads
    if (ad.type === 'search') {
        return {
            success: false,
            message: 'Ogłoszenia typu "szukam" nie mogą być promowane.',
        }
    }

    // Check if ad is active
    if (ad.status !== 'active') {
        return {
            success: false,
            message: 'Tylko aktywne ogłoszenia mogą być promowane.',
        }
    }

    // Check if ad is not expired
    if (ad.expires_at && new Date(ad.expires_at) < new Date()) {
        return {
            success: false,
            message: 'Ogłoszenie wygasło. Najpierw je przedłuż.',
        }
    }

    const promotedAt = new Date().toISOString()

    // Update the ad with promoted_at
    const { error: updateError } = await supabase
        .from('ads')
        .update({
            promoted_at: promotedAt,
        })
        .eq('id', ad.id)

    if (updateError) {
        console.error('Update Error:', updateError)
        return {
            success: false,
            message: 'Nie udało się promować ogłoszenia.',
        }
    }

    // Create transaction record (payment webhooks disabled for now)
    const { error: transactionError } = await supabase
        .from('transactions')
        .insert({
            ad_id: ad.id,
            amount: 10.00, // Promotion price
            type: 'bump',
            status: 'completed', // Auto-complete since payments are disabled
        })

    if (transactionError) {
        console.error('Transaction Error:', transactionError)
        // Don't fail the operation, just log
    }

    revalidatePath('/offers')
    revalidatePath(`/offers/${ad.id}`)
    revalidatePath(`/offers/manage/${token}`)

    return {
        success: true,
        message: 'Ogłoszenie zostało promowane i pojawi się na górze listy.',
        promotedAt,
    }
}

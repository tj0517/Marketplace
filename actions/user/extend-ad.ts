'use server'

import { createAdminClient } from '@/lib/supabase/admin'
import { revalidatePath } from 'next/cache'

export type ExtendAdResult = {
    success: boolean
    message: string
    newExpiresAt?: string
}

export async function extendAdExpiration(token: string): Promise<ExtendAdResult> {
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
        .select('id, expires_at, status, type')
        .eq('management_token', token)
        .single()

    if (fetchError || !ad) {
        console.error('Fetch Error:', fetchError)
        return {
            success: false,
            message: 'Nie znaleziono ogłoszenia.',
        }
    }

    // Only allow extension for 'offer' type ads
    if (ad.type === 'search') {
        return {
            success: false,
            message: 'Ogłoszenia typu "szukam" nie wymagają przedłużenia.',
        }
    }

    // Calculate new expiration date
    // If ad is expired or has no expiration, start from now
    // Otherwise, extend from current expiration
    const now = new Date()
    let baseDate: Date

    if (!ad.expires_at || new Date(ad.expires_at) < now) {
        baseDate = now
    } else {
        baseDate = new Date(ad.expires_at)
    }

    const newExpiresAt = new Date(baseDate)
    newExpiresAt.setDate(newExpiresAt.getDate() + 30)

    // Update the ad
    const { error: updateError } = await supabase
        .from('ads')
        .update({
            expires_at: newExpiresAt.toISOString(),
            status: 'active', // Reactivate if was expired
        })
        .eq('id', ad.id)

    if (updateError) {
        console.error('Update Error:', updateError)
        return {
            success: false,
            message: 'Nie udało się przedłużyć ogłoszenia.',
        }
    }

    // Create transaction record (payment webhooks disabled for now)
    const { error: transactionError } = await supabase
        .from('transactions')
        .insert({
            ad_id: ad.id,
            amount: 10.00, // Extension price
            type: 'extension',
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
        message: 'Ogłoszenie zostało przedłużone o 30 dni.',
        newExpiresAt: newExpiresAt.toISOString(),
    }
}

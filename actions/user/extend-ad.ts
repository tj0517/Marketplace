'use server'

import { createAdminClient } from '@/lib/supabase/admin'
import { revalidatePath } from 'next/cache'
import { getBaseUrl, AD_CONFIG, getPriceInCurrency } from '@/lib/config'

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

    const { data: ad, error: fetchError } = await supabase
        .from('ads')
        .select('id, expires_at, status, type, email, title')
        .eq('management_token', token)
        .single()

    if (fetchError || !ad) {
        console.error('Fetch Error:', fetchError)
        return {
            success: false,
            message: 'Nie znaleziono ogłoszenia.',
        }
    }

    if (ad.type === 'search') {
        return {
            success: false,
            message: 'Ogłoszenia typu "szukam" nie wymagają przedłużenia.',
        }
    }

    const now = new Date()
    let baseDate: Date

    if (!ad.expires_at || new Date(ad.expires_at) < now) {
        baseDate = now
    } else {
        baseDate = new Date(ad.expires_at)
    }

    const newExpiresAt = new Date(baseDate)
    newExpiresAt.setDate(newExpiresAt.getDate() + AD_CONFIG.extensionDays)

    const { error: updateError } = await supabase
        .from('ads')
        .update({
            expires_at: newExpiresAt.toISOString(),
            status: 'active',
            expiring_warning_sent_at: null,
        })
        .eq('id', ad.id)

    if (updateError) {
        console.error('Update Error:', updateError)
        return {
            success: false,
            message: 'Nie udało się przedłużyć ogłoszenia.',
        }
    }

    const { error: transactionError } = await supabase
        .from('transactions')
        .insert({
            ad_id: ad.id,
            amount: getPriceInCurrency('extension'),
            type: 'extension',
            status: 'completed',
            payment_provider: 'manual',
        })

    if (transactionError) {
        console.error('Transaction Error:', transactionError)
    }

    try {
        const { sendEmail } = await import('@/actions/emails')
        const baseUrl = getBaseUrl()

        await sendEmail({
            to: ad.email,
            type: 'payment_extend',
            props: {
                adTitle: ad.title,
                newExpiresAt: newExpiresAt.toISOString(),
                manageLink: `${baseUrl}/offers/manage/${token}`,
            },
        })
    } catch (emailError) {
        console.error('Failed to send extend confirmation email:', emailError)
    }

    revalidatePath('/offers')
    revalidatePath(`/offers/${ad.id}`)
    revalidatePath(`/offers/manage/${token}`)

    return {
        success: true,
        message: `Ogłoszenie zostało przedłużone o ${AD_CONFIG.extensionDays} dni.`,
        newExpiresAt: newExpiresAt.toISOString(),
    }
}

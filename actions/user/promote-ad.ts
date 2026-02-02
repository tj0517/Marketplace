'use server'

import { createAdminClient } from '@/lib/supabase/admin'
import { revalidatePath } from 'next/cache'
import { getBaseUrl, getPriceInCurrency } from '@/lib/config'

export type PromoteAdResult = {
    success: boolean
    message: string
    visibleAt?: string
}

export async function promoteAd(token: string): Promise<PromoteAdResult> {
    if (!token) {
        return {
            success: false,
            message: 'Brak tokenu zarządzania.',
        }
    }

    const supabase = createAdminClient()

    const { data: ad, error: fetchError } = await supabase
        .from('ads')
        .select('id, status, type, expires_at, email, title')
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
            message: 'Ogłoszenia typu "szukam" nie mogą być promowane.',
        }
    }

    if (ad.status !== 'active') {
        return {
            success: false,
            message: 'Tylko aktywne ogłoszenia mogą być promowane.',
        }
    }

    if (ad.expires_at && new Date(ad.expires_at) < new Date()) {
        return {
            success: false,
            message: 'Ogłoszenie wygasło. Najpierw je przedłuż.',
        }
    }

    const visibleAt = new Date().toISOString()

    const { error: updateError } = await supabase
        .from('ads')
        .update({
            visible_at: visibleAt,
        })
        .eq('id', ad.id)

    if (updateError) {
        console.error('Update Error:', updateError)
        return {
            success: false,
            message: 'Nie udało się promować ogłoszenia.',
        }
    }

    const { error: transactionError } = await supabase
        .from('transactions')
        .insert({
            ad_id: ad.id,
            amount: getPriceInCurrency('bump'),
            type: 'bump',
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
            type: 'payment_bump',
            props: {
                adTitle: ad.title,
                manageLink: `${baseUrl}/offers/manage/${token}`,
            },
        })
    } catch (emailError) {
        console.error('Failed to send bump confirmation email:', emailError)
    }

    revalidatePath('/offers')
    revalidatePath(`/offers/${ad.id}`)
    revalidatePath(`/offers/manage/${token}`)

    return {
        success: true,
        message: 'Ogłoszenie zostało promowane i pojawi się na górze listy.',
        visibleAt,
    }
}

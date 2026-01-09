'use server'

import { createAdminClient } from '@/supabase/admin'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export async function activateOffer(prevState: any, formData: FormData) {
    const offerId = formData.get('offerId') as string

    if (!offerId) {
        return {
            success: false,
            message: 'Brak ID ogłoszenia.',
        }
    }

    const supabase = createAdminClient()

    const { error } = await supabase
        .from('ads')
        .update({ status: 'active' })
        .eq('id', offerId)

    if (error) {
        console.error('Activation Error:', error)
        return {
            success: false,
            message: 'Nie udało się aktywować ogłoszenia.',
        }
    }

    revalidatePath('/offers')
    revalidatePath(`/offers/${offerId}`)
    redirect(`/offers/${offerId}`)
}

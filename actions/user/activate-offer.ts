'use server'

import { createAdminClient } from '@/lib/supabase/admin'
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

    const { data: ad } = await supabase
        .from('ads')
        .select('*')
        .eq('id', offerId)
        .single()

    if (error) {
        console.error('Activation Error:', error)
        return {
            success: false,
            message: 'Nie udało się aktywować ogłoszenia.',
        }
    }


    try {
        const { sendEmail } = await import('@/actions/emails');
        const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
        const magicLink = `${baseUrl}/offers/manage/${ad.management_token}`;
        const publicLink = `${baseUrl}/offers/${ad.id}`;

        await sendEmail({
            to: ad.email,
            type: 'welcome',
            props: {
                adTitle: ad.title,
                manageLink: magicLink,
                publicLink: publicLink
            }
        });
    } catch (emailError) {
        console.error('Failed to send confirmation email', emailError);
    }

    revalidatePath('/offers')
    revalidatePath(`/offers/${offerId}`)
    redirect(`/offers/${offerId}`)
}

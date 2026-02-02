'use server'

import { createAdminClient } from '@/lib/supabase/admin'
import { getBaseUrl, AD_CONFIG } from '@/lib/config'
import { normalizeAndHashPhone } from './hash_phone'
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

    const now = new Date()
    const expiresAt = new Date(now.getTime() + AD_CONFIG.validityMs)

    const { data: ad, error: fetchError } = await supabase
        .from('ads')
        .select('*')
        .eq('id', offerId)
        .single()

    if (fetchError || !ad) {
        console.error('Fetch Error:', fetchError)
        return {
            success: false,
            message: 'Nie znaleziono ogłoszenia.',
        }
    }

    if (ad.status === 'active') {
        return {
            success: false,
            message: 'Ogłoszenie jest już aktywne.',
        }
    }

    const { hash, isValid } = normalizeAndHashPhone(ad.phone_contact)

    if (!isValid || !hash) {
        return {
            success: false,
            message: 'Nieprawidłowy numer telefonu.',
        }
    }

    const { data: phoneRecord, error: phoneQueryError } = await supabase
        .from('phone_hashes')
        .select('free_used_at')
        .eq('phone_hash', hash)
        .single()

    if (phoneQueryError && phoneQueryError.code !== 'PGRST116') {
        console.error('Phone query error:', phoneQueryError)
        return {
            success: false,
            message: 'Błąd podczas weryfikacji numeru telefonu.',
        }
    }

    const { error: phoneHashError } = await supabase
        .from('phone_hashes')
        .upsert(
            {
                phone_hash: hash,
                free_used_at: phoneRecord?.free_used_at ?? now.toISOString()
            },
            { onConflict: 'phone_hash' }
        )

    if (phoneHashError) {
        console.error('Phone Hash Error:', phoneHashError)
        return {
            success: false,
            message: 'Nie udało się zarejestrować numeru telefonu.',
        }
    }

    const { error } = await supabase
        .from('ads')
        .update({
            status: 'active',
            phone_hash: hash,
            visible_at: now.toISOString(),
            expires_at: expiresAt.toISOString()
        })
        .eq('id', offerId)

    if (error) {
        console.error('Activation Error:', error)
        return {
            success: false,
            message: 'Nie udało się aktywować ogłoszenia.',
        }
    }

    try {
        const { sendEmail } = await import('@/actions/emails');
        const baseUrl = getBaseUrl();
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

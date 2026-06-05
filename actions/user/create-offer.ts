'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createAdminClient } from '@/lib/supabase/admin'
import { normalizeAndHashPhone } from './hash_phone'
import { adSchema } from '@/lib/ad-validation'
import { getBaseUrl, AD_CONFIG } from '@/lib/config'

export async function createOffer(prevState: any, formData: FormData) {
    const educationLevels = formData.getAll('education_level')
    const subjects = formData.getAll('subjects') as string[]

    const validatedFields = adSchema.safeParse({
        type: formData.get('type'),
        title: formData.get('title'),
        description: formData.get('description'),
        subjects,
        location: formData.get('location'),
        education_level: educationLevels,
        price_amount: formData.get('price_amount'),
        price_unit: formData.get('price_unit'),
        email: formData.get('email'),
        phone_contact: formData.get('phone_contact'),
        tutor_gender: formData.get('tutor_gender'),
    })

    if (!validatedFields.success) {
        return {
            errors: validatedFields.error.flatten().fieldErrors,
            message: 'Sprawdź formularz i spróbuj ponownie.',
        }
    }

    const { hash, formatted, isValid } = normalizeAndHashPhone(validatedFields.data.phone_contact)

    if (!isValid) {
        return {
            errors: {
                phone_contact: ['Nieprawidłowy numer telefonu'],
            },
            message: 'Sprawdź formularz i spróbuj ponownie.',
        }
    }

    const supabase = createAdminClient()

    if (validatedFields.data.type === 'offer') {
        // Check for existing active offer with same phone (one phone = one offer)
        const { data: existingAd } = await supabase
            .from('ads')
            .select('id')
            .eq('phone_hash', hash)
            .eq('status', 'active')
            .eq('type', 'offer')
            .limit(1)
            .single()

        if (existingAd) {
            return {
                message: 'Ten numer telefonu jest już powiązany z aktywnym ogłoszeniem. Jeśli potrzebujesz pomocy, skontaktuj się z nami przez formularz kontaktowy.',
            }
        }

        // Check deletion cooldown
        const { data: phoneRecord } = await supabase
            .from('phone_hashes')
            .select('deleted_at')
            .eq('phone_hash', hash)
            .single()

        if (phoneRecord?.deleted_at) {
            const deletedAt = new Date(phoneRecord.deleted_at)
            const cooldownEnd = new Date(deletedAt.getTime() + AD_CONFIG.deletionCooldownDays * 24 * 60 * 60 * 1000)

            if (new Date() < cooldownEnd) {
                const daysLeft = Math.ceil((cooldownEnd.getTime() - Date.now()) / (24 * 60 * 60 * 1000))
                return {
                    message: `Twoje poprzednie ogłoszenie zostało niedawno usunięte. Nowe ogłoszenie będzie można dodać za ${daysLeft} dni. W razie pytań skontaktuj się z nami przez formularz kontaktowy.`,
                }
            }
        }
    }

    const isOffer = validatedFields.data.type === 'offer'

    const { data, error } = await supabase.from('ads').insert({
        type: validatedFields.data.type,
        title: validatedFields.data.title,
        description: validatedFields.data.description,
        subjects: validatedFields.data.subjects,
        subject: validatedFields.data.subjects[0] ?? '',
        location: validatedFields.data.location,
        education_level: validatedFields.data.education_level,
        price_amount: isOffer ? validatedFields.data.price_amount : null,
        price_unit: isOffer ? validatedFields.data.price_unit : null,
        email: validatedFields.data.email,
        phone_contact: formatted,
        phone_hash: hash,
        tutor_gender: validatedFields.data.tutor_gender || null,
        status: 'active',
        visible_at: new Date().toISOString(),
    }).select().single()

    if (error) {
        console.error('Database Error:', error)
        return {
            message: 'Błąd bazy danych: Nie udało się dodać ogłoszenia.',
        }
    }

    // Upsert phone_hashes: clear cooldown timestamp
    await supabase
        .from('phone_hashes')
        .upsert(
            { phone_hash: hash, deleted_at: null },
            { onConflict: 'phone_hash' }
        )

    const { data: ad } = await supabase
        .from('ads')
        .select('*')
        .eq('id', data!.id)
        .single()

    try {
        const { sendEmail } = await import('@/actions/emails')
        const baseUrl = getBaseUrl()
        const magicLink = `${baseUrl}/offers/manage/${ad.management_token}`
        const publicLink = `${baseUrl}/offers/${ad.id}`

        await sendEmail({
            to: ad.email,
            type: 'welcome',
            props: {
                adTitle: ad.title,
                manageLink: magicLink,
                publicLink: publicLink
            }
        })
    } catch (emailError) {
        console.error('Failed to send confirmation email', emailError)
    }

    revalidatePath('/offers')
    revalidatePath(`/offers/${data!.id}`)
    redirect(`/offers/${data!.id}`)
}

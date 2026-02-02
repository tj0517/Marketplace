'use server'

import { revalidatePath } from 'next/cache'
import { createAdminClient } from '@/lib/supabase/admin'
import { normalizeAndHashPhone } from './hash_phone'
import { adSchema } from '@/lib/ad-validation'

export async function updateAd(
    token: string,
    prevState: any,
    formData: FormData
) {
    const locationFromForm = formData.get('location') as string | null
    const cityText = formData.get('city_text') as string | null
    const isRemote = formData.get('is_remote') === 'on'

    let finalLocation: string
    if (cityText !== null) {
        const parts: string[] = []
        if (cityText.trim()) parts.push(cityText.trim())
        if (isRemote) parts.push('Zdalnie')
        finalLocation = parts.join(', ') || ''
    } else {
        finalLocation = locationFromForm || ''
    }

    const validatedFields = adSchema.safeParse({
        type: formData.get('type'),
        title: formData.get('title'),
        description: formData.get('description'),
        subject: formData.get('subject'),
        location: finalLocation,
        education_level: formData.getAll('education_level'),
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

    const data = validatedFields.data

    const { hash, formatted, isValid } = normalizeAndHashPhone(data.phone_contact)

    if (!isValid) {
        return {
            errors: {
                phone_contact: ['Nieprawidłowy numer telefonu'],
            },
            message: 'Sprawdź formularz i spróbuj ponownie.',
        }
    }

    const supabase = createAdminClient()

    const { data: result, error } = await supabase
        .from('ads')
        .update({
            title: data.title,
            description: data.description,
            subject: data.subject,
            location: data.location,
            education_level: data.education_level,
            price_amount: data.type === 'search' ? null : data.price_amount,
            price_unit: data.type === 'search' ? null : data.price_unit,
            email: data.email,
            phone_contact: formatted,
            phone_hash: hash,
            tutor_gender: data.type === 'search' ? null : (data.tutor_gender || null),
        })
        .eq('management_token', token)
        .select('id')
        .single()

    if (error) {
        console.error('Database Error:', error)
        return {
            message: 'Błąd bazy danych: Nie udało się zaktualizować ogłoszenia.',
        }
    }

    revalidatePath(`/offers/manage/${token}`)
    revalidatePath(`/offers/${(result as any).id}`)

    return {
        message: 'Ogłoszenie zostało zaktualizowane!',
        success: true
    }
}

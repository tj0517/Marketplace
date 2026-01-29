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
    const validatedFields = adSchema.safeParse({
        type: formData.get('type'),
        title: formData.get('title'),
        description: formData.get('description'),
        subject: formData.get('subject'),
        location: formData.get('location'),
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

    const validatedFieldsWithoutSuccess = validatedFields.data; // Just for cleaner access

    const { hash, formatted, isValid } = normalizeAndHashPhone(validatedFieldsWithoutSuccess.phone_contact)

    if (!isValid) {
        return {
            errors: {
                phone_contact: ['Nieprawidłowy numer telefonu'],
            },
            message: 'Sprawdź formularz i spróbuj ponownie.',
        }
    }

    const supabase = createAdminClient()

    const { data, error } = await supabase
        .from('ads')
        .update({
            title: validatedFieldsWithoutSuccess.title,
            description: validatedFieldsWithoutSuccess.description,
            subject: validatedFieldsWithoutSuccess.subject,
            location: validatedFieldsWithoutSuccess.location,
            education_level: validatedFieldsWithoutSuccess.education_level,
            price_amount: validatedFieldsWithoutSuccess.type === 'search' ? null : validatedFieldsWithoutSuccess.price_amount,
            price_unit: validatedFieldsWithoutSuccess.type === 'search' ? null : validatedFieldsWithoutSuccess.price_unit,
            email: validatedFieldsWithoutSuccess.email,
            phone_contact: formatted,
            phone_hash: hash,
            tutor_gender: validatedFieldsWithoutSuccess.type === 'search' ? null : (validatedFieldsWithoutSuccess.tutor_gender || null),
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
    revalidatePath(`/offers/${(data as any).id}`)

    return {
        message: 'Ogłoszenie zostało zaktualizowane!',
        success: true
    }
}

'use server'

import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { createAdminClient } from '@/supabase/admin'
import { normalizeAndHashPhone } from './hash_phone'

const adSchema = z.object({
    title: z.string().min(5, 'Tytuł musi mieć minimum 5 znaków'),
    description: z.string().min(20, 'Opis musi mieć minimum 20 znaków'),
    subject: z.string().min(1, 'Wybierz przedmiot'),
    location: z.string().min(1, 'Podaj lokalizację'),
    education_level: z.array(z.string()).min(1, 'Wybierz przynajmniej jeden poziom'),
    price_amount: z.coerce.number().min(1, 'Podaj cenę'),
    price_unit: z.string().min(1, 'Wybierz jednostkę'),
    email: z.string().email('Nieprawidłowy adres email'),
    phone_contact: z.string().min(9, 'Podaj numer telefonu'),
    tutor_gender: z.string().optional(),
})

export async function updateAd(
    token: string,
    prevState: any,
    formData: FormData
) {
    const validatedFields = adSchema.safeParse({
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

    const { error } = await supabase
        .from('ads')
        .update({
            title: validatedFieldsWithoutSuccess.title,
            description: validatedFieldsWithoutSuccess.description,
            subject: validatedFieldsWithoutSuccess.subject,
            location: validatedFieldsWithoutSuccess.location,
            education_level: validatedFieldsWithoutSuccess.education_level,
            price_amount: validatedFieldsWithoutSuccess.price_amount,
            price_unit: validatedFieldsWithoutSuccess.price_unit,
            email: validatedFieldsWithoutSuccess.email,
            phone_contact: formatted,
            phone_hash: hash,
            tutor_gender: validatedFieldsWithoutSuccess.tutor_gender || null,
        })
        .eq('management_token', token)

    if (error) {
        console.error('Database Error:', error)
        return {
            message: 'Błąd bazy danych: Nie udało się zaktualizować ogłoszenia.',
        }
    }

    revalidatePath(`/offers/manage/${token}`)
    revalidatePath('/offers/[slug]')

    return {
        message: 'Ogłoszenie zostało zaktualizowane!',
        success: true
    }
}

'use server'

import { redirect } from 'next/navigation'
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

export async function createAd(prevState: any, formData: FormData) {
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

    const { data, error } = await supabase.from('ads').insert({
        title: validatedFields.data.title,
        description: validatedFields.data.description,
        subject: validatedFields.data.subject,
        location: validatedFields.data.location,
        education_level: validatedFields.data.education_level,
        price_amount: validatedFields.data.price_amount,
        price_unit: validatedFields.data.price_unit,
        email: validatedFields.data.email,
        phone_contact: formatted,
        phone_hash: hash,
        tutor_gender: validatedFields.data.tutor_gender || null,
        type: 'offer',
        status: 'active',
    }).select().single()

    if (error) {
        console.error('Database Error:', error)
        return {
            message: 'Błąd bazy danych: Nie udało się dodać ogłoszenia.',
        }
    }


    redirect(`/offers/${data.id}`)
}

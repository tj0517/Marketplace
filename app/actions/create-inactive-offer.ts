'use server'

import { createAdminClient } from '@/supabase/admin'
import { normalizeAndHashPhone } from './hash_phone'
import { adSchema } from '@/app/lib/ad-validation'

export async function createInactiveOffer(prevState: any, formData: FormData) {
    const educationLevels = formData.getAll('education_level')

    // Server-side validation
    const validatedFields = adSchema.safeParse({
        title: formData.get('title'),
        description: formData.get('description'),
        subject: formData.get('subject'),
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

    // Check if phone exists for pricing logic
    const { count: phoneCount } = await supabase
        .from('ads')
        .select('*', { count: 'exact', head: true })
        .eq('phone_hash', hash)

    const phoneExists = phoneCount !== null && phoneCount > 0

    // Pricing logic
    const priceInfo = phoneExists
        ? {
            amount: 19.00,
            label: "Płatność (Użytkownik powracający)",
            description: "Cena za wystawienie kolejnego ogłoszenia."
        }
        : {
            amount: 9.00,
            label: "Płatność (Nowy użytkownik)",
            description: "Promocyjna cena dla nowego ogłoszeniodawcy."
        }

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
        status: 'disabled', // Created as disabled (inactive/draft)
    }).select().single()

    if (error) {
        console.error('Database Error:', error)
        return {
            message: 'Błąd bazy danych: Nie udało się dodać ogłoszenia.',
        }
    }

    return {
        success: true,
        offerId: data.id,
        priceInfo,
        phoneExists,
        message: 'Ogłoszenie utworzone (nieaktywne).',
    }
}

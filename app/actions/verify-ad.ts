'use server'

import { z } from 'zod'
import { createAdminClient } from '@/supabase/admin'
import { normalizeAndHashPhone } from './hash_phone'
import { adSchema } from '@/app/lib/ad-validation'

export type VerifyAdResult = {
    isValid: boolean
    phoneExists?: boolean
    errors?: Record<string, string[]>
    message?: string
    data?: {
        phone_contact: string
        phone_hash: string
    }
    priceInfo?: {
        amount: number
        label: string
        description: string
    }
}

export async function verifyAd(prevState: any, formData: FormData): Promise<VerifyAdResult> {
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
            isValid: false,
            errors: validatedFields.error.flatten().fieldErrors,
            message: 'Sprawdź formularz i spróbuj ponownie.',
        }
    }

    const { hash, formatted, isValid } = normalizeAndHashPhone(validatedFields.data.phone_contact)

    if (!isValid) {
        return {
            isValid: false,
            errors: {
                phone_contact: ['Nieprawidłowy numer telefonu'],
            },
            message: 'Sprawdź formularz i spróbuj ponownie.',
        }
    }

    const supabase = createAdminClient()

    const { count, error } = await supabase
        .from('ads')
        .select('*', { count: 'exact', head: true })
        .eq('phone_hash', hash)

    if (error) {
        console.error('Database Error:', error)
        return {
            isValid: false,
            message: 'Błąd bazy danych podczas weryfikacji.',
        }
    }

    const phoneExists = count !== null && count > 0

    // Pricing logic placeholder
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

    return {
        isValid: true,
        phoneExists,
        data: {
            phone_contact: formatted,
            phone_hash: hash
        },
        priceInfo
    }
}

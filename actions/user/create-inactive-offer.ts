'use server'

import { createAdminClient } from '@/lib/supabase/admin'
import { normalizeAndHashPhone } from './hash_phone'
import { adSchema } from '@/lib/ad-validation'
import { getPriceInCurrency } from '@/lib/config'

export async function createInactiveOffer(prevState: any, formData: FormData) {
    const educationLevels = formData.getAll('education_level')

    const validatedFields = adSchema.safeParse({
        type: formData.get('type'),
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

    const { data: phoneRecord } = await supabase
        .from('phone_hashes')
        .select('free_used_at')
        .eq('phone_hash', hash)
        .single()

    const hasUsedFreeSlot = phoneRecord !== null && phoneRecord.free_used_at !== null

    const priceInfo = hasUsedFreeSlot
        ? {
            amount: getPriceInCurrency('activation'),
            label: "Płatność wymagana",
            description: "Cena za wystawienie kolejnego ogłoszenia."
        }
        : {
            amount: 0.00,
            label: "Darmowe ogłoszenie",
            description: "Pierwsze ogłoszenie jest bezpłatne."
        }

    const offerId = formData.get('offerId') as string | null

    let data;
    let error;

    if (offerId) {
        const result = await supabase.from('ads')
            .update({
                type: validatedFields.data.type,
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
            })
            .eq('id', offerId)
            .select()
            .single()

        data = result.data;
        error = result.error;
    } else {
        const result = await supabase.from('ads').insert({
            type: validatedFields.data.type,
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
            status: 'inactive',
        }).select().single()

        data = result.data;
        error = result.error;
    }

    if (error) {
        console.error('Database Error:', error)
        return {
            message: 'Błąd bazy danych: Nie udało się dodać ogłoszenia.',
        }
    }

    return {
        success: true,
        offerId: data.id,
        managementToken: data.management_token,
        priceInfo,
        hasUsedFreeSlot,
        message: 'Ogłoszenie utworzone (nieaktywne).',
    }
}

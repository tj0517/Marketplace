'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createAdminClient } from '@/lib/supabase/admin'
import { normalizeAndHashPhone } from './hash_phone'
import { adSchema } from '@/lib/ad-validation'
import { getBaseUrl } from '@/lib/config'

export async function createInformalOffer(prevState: any, formData: FormData) {

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


    const { data, error } = await supabase.from('ads').insert({
        type: validatedFields.data.type,
        title: validatedFields.data.title,
        description: validatedFields.data.description,
        subject: validatedFields.data.subject,
        location: validatedFields.data.location,
        education_level: validatedFields.data.education_level,
        price_amount: null,
        price_unit: null,
        email: validatedFields.data.email,
        phone_contact: formatted,
        phone_hash: hash,
        tutor_gender: validatedFields.data.tutor_gender || null,
        status: 'active',
    }).select().single()

    if (error) {
        console.error('Database Error:', error)
        return {
            message: 'Błąd bazy danych: Nie udało się dodać ogłoszenia.',
        }
    }

    const { data: ad } = await supabase
        .from('ads')
        .select('*')
        .eq('id', data!.id)
        .single()

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
    revalidatePath(`/offers/${data!.id}`)
    redirect(`/offers/${data!.id}`)
}

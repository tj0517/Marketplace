'use server'
import { createAdminClient } from '@/lib/supabase/admin'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export async function deleteAd(token: string) {
    if (!token) {
        return {
            success: false,
            message: 'Błąd: Brak tokenu zarządzania.',
        }
    }

    const supabase = createAdminClient()

    // 1. Verify ad exists with this token
    const { data: ad, error: fetchError } = await supabase
        .from('ads')
        .select('id')
        .eq('management_token', token)
        .single()

    if (fetchError || !ad) {
        return {
            success: false,
            message: 'Błąd: Nie znaleziono ogłoszenia lub nieprawidłowy token.',
        }
    }

    // 2. Delete the ad
    const { error: deleteError } = await supabase
        .from('ads')
        .delete()
        .eq('id', ad.id)

    if (deleteError) {
        console.error('Delete Error:', deleteError)
        return {
            success: false,
            message: 'Błąd bazy danych: Nie udało się usunąć ogłoszenia.',
        }
    }

    // 3. Revalidate and Redirect
    revalidatePath('/offers')
    redirect('/')
}

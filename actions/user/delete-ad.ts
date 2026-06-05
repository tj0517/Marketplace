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

    const { data: ad, error: fetchError } = await supabase
        .from('ads')
        .select('id, phone_hash')
        .eq('management_token', token)
        .single()

    if (fetchError || !ad) {
        return {
            success: false,
            message: 'Błąd: Nie znaleziono ogłoszenia lub nieprawidłowy token.',
        }
    }

    const { error: deleteError } = await supabase
        .from('ads')
        .update({ status: 'deleted' })
        .eq('id', ad.id)

    if (deleteError) {
        console.error('Delete Error:', deleteError)
        return {
            success: false,
            message: 'Błąd bazy danych: Nie udało się usunąć ogłoszenia.',
        }
    }

    // Record deletion timestamp for cooldown enforcement
    if (ad.phone_hash) {
        await supabase
            .from('phone_hashes')
            .upsert(
                { phone_hash: ad.phone_hash, deleted_at: new Date().toISOString() },
                { onConflict: 'phone_hash' }
            )
    }

    revalidatePath('/offers')
    redirect('/')
}

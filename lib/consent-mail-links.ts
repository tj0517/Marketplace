import type { SupabaseClient } from '@supabase/supabase-js';
import { maskEmail, normalizeEmail } from '@/lib/marketing-consent';

// LK-2.06: linki w mailu po zgodzie. Bez importu klucza service_role — klienta bazy dostaje z zewnątrz,
// żeby dało się to testować. Token zarządzania to dane dostępowe do ogłoszenia: tylko do linków, nigdy do logów.

type Db = SupabaseClient;

export interface ConsentMailLinks {
    /** Panel z otwartym oknem płatności (`?podbij=1`); null, gdy adres nie ma aktywnego ogłoszenia offer */
    bumpLink: string | null;
    panelLink: string | null;
    recoverLink: string;
}

/** Wzorzec ILIKE dopasowujący dosłownie (bez symboli wieloznacznych `%` i `_`, częstego w adresach). */
export function escapeLikePattern(value: string): string {
    return value.replace(/[\\%_]/g, (c) => `\\${c}`);
}

/**
 * Token najnowszego aktywnego ogłoszenia offer dla adresu (porównanie bez wielkości liter, jak has_ad_for_email).
 * Błąd odczytu → null: mail idzie z linkiem do /recover-magic-link, zgoda zostaje.
 */
export async function findNewestActiveOfferToken(db: Db, email: string): Promise<string | null> {
    const normalized = normalizeEmail(email);
    try {
        const { data, error } = await db
            .from('ads')
            .select('management_token')
            .ilike('email', escapeLikePattern(normalized))
            .eq('type', 'offer')
            .eq('status', 'active')
            .order('created_at', { ascending: false })
            .limit(1)
            .maybeSingle<{ management_token: string | null }>();

        if (error) {
            console.error('Marketing email: ad lookup failed', { to: maskEmail(normalized), code: error.code });
            return null;
        }
        return data?.management_token ?? null;
    } catch (error) {
        console.error('Marketing email: ad lookup failed', { to: maskEmail(normalized), error: (error as Error).message });
        return null;
    }
}

export function buildConsentMailLinks(baseUrl: string, managementToken: string | null): ConsentMailLinks {
    const recoverLink = `${baseUrl}/recover-magic-link`;
    if (!managementToken) return { bumpLink: null, panelLink: null, recoverLink };
    const panelLink = `${baseUrl}/offers/manage/${encodeURIComponent(managementToken)}`;
    return { bumpLink: `${panelLink}?podbij=1`, panelLink, recoverLink };
}

/** Czy adres ma uprawnienie w dowolnym statusie (granted/reserved/used) — wtedy panel nie pokazuje baneru. */
export async function hasPromotionEntitlement(db: Db, email: string): Promise<boolean> {
    try {
        const { data, error } = await db
            .from('promotion_entitlements')
            .select('status')
            .eq('email', normalizeEmail(email))
            .maybeSingle();
        if (error) {
            console.error('Manage panel: entitlement lookup failed', { to: maskEmail(email), code: error.code });
            return false;
        }
        return !!data;
    } catch (error) {
        console.error('Manage panel: entitlement lookup failed', { to: maskEmail(email), error: (error as Error).message });
        return false;
    }
}

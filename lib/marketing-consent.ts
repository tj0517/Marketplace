import { z } from 'zod'

// =============================================================================
// TREŚĆ ZGODY (O-04: placeholder do czasu treści od tj/klienta — bez wdrożenia na prod)
// =============================================================================

export const MARKETING_CONSENT = {
    /** Wersja treści zapisywana przy każdej zgodzie; zmień razem z tekstem */
    version: 'placeholder-2026-11-04',

    /** Treść zgody przy checkboxie (formularz i strona zgody) */
    text: '[PLACEHOLDER O-04] Wyrażam zgodę na otrzymywanie od Lekcjo.pl informacji marketingowych na podany adres e-mail. Zgodę mogę wycofać w każdej chwili.',
} as const

// =============================================================================
// STRONA /zgoda-marketingowa — tekst zatwierdzony przez tj 2026-11-04 (LK-2.01)
// =============================================================================

export const CONSENT_PAGE_COPY = {
    heading: 'Zapisz się na newsletter i podbij ogłoszenie za 1 zł',
    description:
        'Masz już ogłoszenie na Lekcjo.pl? Zapisz się na nasze wiadomości: nowości w serwisie, porady dla korepetytorów i promocje. ' +
        'W podziękowaniu dostaniesz jednorazowe podbicie ogłoszenia na górę listy za 1 zł. ' +
        'Wpisz adres e-mail podany przy dodawaniu ogłoszenia. Zgodę możesz wycofać w każdej chwili linkiem z wiadomości.',
    button: 'Zapisuję się i odbieram podbicie za 1 zł',
} as const

export const CONSENT_MESSAGES = {
    success: 'Dziękujemy! Twoja zgoda jest zapisana.',
    noAd: 'Nie znaleziono ogłoszenia powiązanego z tym adresem.',
    rateLimited: 'Zbyt wiele prób. Spróbuj ponownie za minutę.',
    invalid: 'Sprawdź formularz i spróbuj ponownie.',
    error: 'Nie udało się zapisać zgody. Spróbuj ponownie później.',
    withdrawn: 'Gotowe. Jeśli ten link dotyczył aktywnej zgody, została ona wycofana i nie wyślemy już na ten adres wiadomości marketingowych.',
    withdrawalInvalid: 'Link jest nieprawidłowy albo zgoda była już wycofana. Jeśli nadal dostajesz wiadomości, napisz do nas.',
} as const

export type ConsentSource = 'form' | 'consent_page'

export function normalizeEmail(email: string): string {
    return email.trim().toLowerCase()
}

/** Adres do logów: pełny tylko dla @seed.test, inaczej zamaskowany */
export function maskEmail(email: string): string {
    const normalized = normalizeEmail(email)
    if (normalized.endsWith('@seed.test')) return normalized
    const [local, domain] = normalized.split('@')
    if (!domain) return '***'
    return `${local.slice(0, 1)}***@${domain}`
}

export const consentPageSchema = z.object({
    email: z.string().trim().email('Nieprawidłowy adres email').max(254),
    consent: z.literal('on', { message: 'Zaznacz zgodę, aby się zapisać.' }),
})

export const withdrawalSchema = z.object({
    token: z.string().uuid(),
})

/** Checkbox w formularzu dodawania: dobrowolny, tylko 'on' oznacza zgodę */
export function isConsentChecked(value: FormDataEntryValue | null): boolean {
    return value === 'on'
}

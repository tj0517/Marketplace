import { z } from 'zod'

// =============================================================================
// TREŚĆ ZGODY v2 (O-07 rozstrzygnięte 2026-11-15, docs/04-open-questions.md) — tekst klienta dosłownie
// =============================================================================

const CONSENT_HEADING = '🎁 ZGARNIJ LIMITOWANE PODBICIE ZA 1 ZŁ!'
const CONSENT_BODY_BEFORE_LINK = 'Dołącz do newslettera Lekcjo.pl i odbierz swoje pierwsze '
const CONSENT_LINK_TEXT = 'podbicie ogłoszenia'
const CONSENT_BODY_AFTER_LINK = ' za 1 zł. Korzystaj z promocji, nowości i wskazówek, jak zdobywać więcej uczniów.'

export const MARKETING_CONSENT = {
    /** Wersja treści zapisywana przy każdej zgodzie; zmień razem z tekstem */
    version: 'v2-2026-11-15',

    /** Pełna treść zgody przy checkboxie (formularz i strona zgody) */
    text: `${CONSENT_HEADING} ${CONSENT_BODY_BEFORE_LINK}${CONSENT_LINK_TEXT}${CONSENT_BODY_AFTER_LINK}`,

    /** Ta sama treść w częściach: UI pokazuje nagłówek, treść i frazę „podbicie ogłoszenia” jako link */
    heading: CONSENT_HEADING,
    bodyBeforeLink: CONSENT_BODY_BEFORE_LINK,
    linkText: CONSENT_LINK_TEXT,
    linkHref: '/podbicie-ogloszenia',
    bodyAfterLink: CONSENT_BODY_AFTER_LINK,
} as const

// =============================================================================
// STRONA /zgoda-marketingowa — tekst klienta (LK-2.05, brief w docs/tasks/LK-2.05.md),
// z poprawkami ortografii zatwierdzonymi przez tj 2026-11-15
// =============================================================================

export const CONSENT_PAGE_COPY = {
    heading: '🎁 Zgarnij pierwsze podbicie ogłoszenia za 1 zł!',
    intro: [
        'Dołącz do newslettera Lekcjo.pl i odbierz jednorazową zniżkę, podbij swoje ogłoszenie za 1 zł! 🚀',
        'Otrzymasz przydatne porady, jak zdobywać więcej uczniów, oraz informacje o nowościach i promocjach w Lekcjo.pl.',
    ],
    benefitsHeading: '🚀 Co daje podbicie ogłoszenia?',
    benefitsLead: 'Podbij ogłoszenie i wyświetlaj się jako pierwszy w 4 kluczowych miejscach Lekcjo.pl!',
    places: [
        { icon: '🏠', title: 'Strona główna', text: 'Twoje ogłoszenie wyświetla się na samej górze strony głównej Lekcjo.pl.' },
        { icon: '📍', title: 'Twoje miasto', text: 'wskakujesz na 1. miejsce w swojej lokalizacji.' },
        {
            icon: '📚',
            title: 'Przedmioty i poziomy',
            text: 'pojawiasz się na szczycie wyników dla swoich przedmiotów (np. matematyka, angielski, fizyka) i poziomów (od szkoły podstawowej i E8, po liceum, maturę czy studia).',
        },
        { icon: '💻', title: 'Korepetycje online', text: 'trafiasz na czoło listy dla uczniów szukających zajęć zdalnych z całej Polski.' },
    ],
    summary: '⚡ Jedno podbicie = Twoje ogłoszenie na czele 4 kluczowych miejsc Lekcjo.pl!',
    emailHelper:
        'Wpisz adres e-mail podany przy dodawaniu ogłoszenia. Zgodę możesz wycofać w każdej chwili, korzystając z linku zawartego w wiadomości.',
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

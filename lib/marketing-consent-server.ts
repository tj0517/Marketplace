import 'server-only';
import { createAdminClient } from '@/lib/supabase/admin'
import { resend } from '@/lib/resend'
import { EMAIL_CONFIG, getBaseUrl } from '@/lib/config'
import { MarketingConsentEmail } from '@/emails/marketing-consent-email'
import { MARKETING_CONSENT, maskEmail, normalizeEmail, type ConsentSource } from '@/lib/marketing-consent'

// Poza plikiem 'use server', żeby nie dało się tego wywołać jako akcji z przeglądarki.

/**
 * Zapisuje zgodę i przyznaje uprawnienie (atomowo w bazie), potem wysyła mail marketingowy.
 * Mail tylko przy nowej aktywnej zgodzie; jego błąd nie cofa zgody.
 */
export async function recordMarketingConsent(email: string, source: ConsentSource): Promise<{ ok: boolean }> {
    const normalized = normalizeEmail(email)
    const supabase = createAdminClient()

    const { data, error } = await supabase
        .rpc('grant_marketing_consent', {
            p_email: normalized,
            p_source: source,
            p_content_version: MARKETING_CONSENT.version,
        })
        .single<{ consent_created: boolean; withdrawal_token: string | null; entitlement_granted: boolean }>()

    if (error || !data) {
        console.error('Marketing consent: grant failed', { source, to: maskEmail(normalized), code: error?.code })
        return { ok: false }
    }

    console.info('Marketing consent: recorded', {
        source,
        to: maskEmail(normalized),
        consentCreated: data.consent_created,
        entitlementGranted: data.entitlement_granted,
    })

    if (data.consent_created && data.withdrawal_token) {
        await sendMarketingConsentEmail(normalized, data.withdrawal_token)
    }

    return { ok: true }
}

async function sendMarketingConsentEmail(to: string, withdrawalToken: string) {
    const baseUrl = getBaseUrl()
    try {
        const { error } = await resend.emails.send({
            from: EMAIL_CONFIG.marketingFrom,
            to,
            subject: 'Dziękujemy za zapis — podbicie ogłoszenia za 1 zł 🎁',
            react: MarketingConsentEmail({
                recoverLink: `${baseUrl}/recover-magic-link`,
                withdrawLink: `${baseUrl}/zgoda-marketingowa/wycofaj/${withdrawalToken}`,
            }),
        })

        if (error) {
            console.error('Marketing email rejected by Resend:', { to: maskEmail(to), error: error.name })
        }
    } catch (error) {
        console.error('Marketing email sending failed:', { to: maskEmail(to), error: (error as Error).message })
    }
}

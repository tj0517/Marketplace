'use server'

import { headers } from 'next/headers'
import { createAdminClient } from '@/lib/supabase/admin'
import { checkRateLimit } from '@/lib/rate-limit'
import { recordMarketingConsent } from '@/lib/marketing-consent-server'
import { CONSENT_MESSAGES, consentPageSchema, withdrawalSchema } from '@/lib/marketing-consent'

export type ConsentActionState = {
    status: 'success' | 'error'
    message: string
    errors?: { email?: string[]; consent?: string[] }
} | null

async function clientIp() {
    const headersList = await headers()
    return headersList.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown'
}

export async function subscribeMarketingConsent(_prevState: ConsentActionState, formData: FormData): Promise<ConsentActionState> {
    const { allowed } = checkRateLimit(`marketing-consent:${await clientIp()}`)
    if (!allowed) {
        return { status: 'error', message: CONSENT_MESSAGES.rateLimited }
    }

    const validated = consentPageSchema.safeParse({
        email: formData.get('email'),
        consent: formData.get('consent'),
    })

    if (!validated.success) {
        return {
            status: 'error',
            message: CONSENT_MESSAGES.invalid,
            errors: validated.error.flatten().fieldErrors,
        }
    }

    const supabase = createAdminClient()
    const { data: hasAd, error } = await supabase.rpc('has_ad_for_email', { p_email: validated.data.email })

    if (error) {
        console.error('Marketing consent: ad lookup failed', { code: error.code })
        return { status: 'error', message: CONSENT_MESSAGES.error }
    }

    if (!hasAd) {
        return { status: 'error', message: CONSENT_MESSAGES.noAd }
    }

    const { ok } = await recordMarketingConsent(validated.data.email, 'consent_page')
    if (!ok) {
        return { status: 'error', message: CONSENT_MESSAGES.error }
    }

    return { status: 'success', message: CONSENT_MESSAGES.success }
}

export async function withdrawMarketingConsent(_prevState: ConsentActionState, formData: FormData): Promise<ConsentActionState> {
    const { allowed } = checkRateLimit(`marketing-withdraw:${await clientIp()}`)
    if (!allowed) {
        return { status: 'error', message: CONSENT_MESSAGES.rateLimited }
    }

    const validated = withdrawalSchema.safeParse({ token: formData.get('token') })

    // Zły lub nieznany token daje ten sam komunikat co prawidłowy — nic nie zdradza.
    if (validated.success) {
        const supabase = createAdminClient()
        const { error } = await supabase
            .from('marketing_consents')
            .update({ status: 'withdrawn', withdrawn_at: new Date().toISOString() })
            .eq('withdrawal_token', validated.data.token)
            .eq('status', 'active')

        if (error) {
            console.error('Marketing consent: withdrawal failed', { code: error.code })
            return { status: 'error', message: CONSENT_MESSAGES.error }
        }
    }

    return { status: 'success', message: CONSENT_MESSAGES.withdrawn }
}

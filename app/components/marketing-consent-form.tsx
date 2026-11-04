'use client'

import { useActionState } from 'react'
import { subscribeMarketingConsent } from '@/actions/public/marketing-consent'
import { Button } from '@/app/components/ui/button'
import { Input } from '@/app/components/ui/input'
import { Checkbox } from '@/app/components/ui/checkbox'
import { Label } from '@/app/components/ui/label'
import { CheckCircle2, Loader2 } from 'lucide-react'
import { CONSENT_PAGE_COPY, MARKETING_CONSENT } from '@/lib/marketing-consent'

export function MarketingConsentForm() {
    const [state, formAction, isPending] = useActionState(subscribeMarketingConsent, null)

    if (state?.status === 'success') {
        return (
            <div className="rounded-xl border border-green-200 bg-green-50 p-6 text-center">
                <div className="mb-3 flex justify-center">
                    <CheckCircle2 className="h-10 w-10 text-green-600" />
                </div>
                <p className="font-medium text-green-800">{state.message}</p>
            </div>
        )
    }

    return (
        <form action={formAction} className="space-y-5">
            <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" name="email" type="email" placeholder="twoj@email.com" required />
                {state?.errors?.email && <p className="text-sm text-red-500">{state.errors.email}</p>}
            </div>

            <div className="flex items-start space-x-3">
                <Checkbox id="consent" name="consent" required />
                <div className="grid gap-1.5 leading-none">
                    <Label htmlFor="consent" className="text-sm font-normal cursor-pointer">
                        {MARKETING_CONSENT.text}
                    </Label>
                    {state?.errors?.consent && <p className="text-sm text-red-500">{state.errors.consent}</p>}
                </div>
            </div>

            {state?.status === 'error' && (
                <div className="rounded-lg bg-red-50 border border-red-200 p-4 text-sm text-red-600">
                    {state.message}
                </div>
            )}

            <Button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700 h-12 text-base font-semibold" disabled={isPending}>
                {isPending ? <Loader2 className="size-5 animate-spin" /> : CONSENT_PAGE_COPY.button}
            </Button>
        </form>
    )
}

'use client'

import { useActionState } from 'react'
import { withdrawMarketingConsent } from '@/actions/public/marketing-consent'
import { Button } from '@/app/components/ui/button'
import { CheckCircle2, CircleAlert, Loader2 } from 'lucide-react'

export function WithdrawConsentForm({ token }: { token: string }) {
    const [state, formAction, isPending] = useActionState(withdrawMarketingConsent, null)

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

    if (state?.status === 'invalid') {
        return (
            <div className="rounded-xl border border-amber-200 bg-amber-50 p-6 text-center">
                <div className="mb-3 flex justify-center">
                    <CircleAlert className="h-10 w-10 text-amber-600" />
                </div>
                <p className="font-medium text-amber-900">{state.message}</p>
            </div>
        )
    }

    return (
        <form action={formAction} className="space-y-4">
            <input type="hidden" name="token" value={token} />
            {state?.status === 'error' && (
                <div className="rounded-lg bg-red-50 border border-red-200 p-4 text-sm text-red-600">
                    {state.message}
                </div>
            )}
            <Button type="submit" className="w-full h-12 text-base font-semibold" disabled={isPending}>
                {isPending ? <Loader2 className="size-5 animate-spin" /> : 'Wycofaj zgodę'}
            </Button>
        </form>
    )
}

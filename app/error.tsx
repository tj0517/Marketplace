'use client'

import { Button } from '@/app/components/ui/button'
import { AlertTriangle } from 'lucide-react'

export default function Error({
    reset,
}: {
    error: Error & { digest?: string }
    reset: () => void
}) {
    return (
        <div className="flex min-h-screen flex-col items-center justify-center px-4 text-center bg-slate-50">
            <div className="mb-6 rounded-2xl bg-red-50 p-6">
                <AlertTriangle className="h-12 w-12 text-red-400" />
            </div>

            <h1 className="text-2xl font-bold text-slate-900">
                Coś poszło nie tak
            </h1>

            <p className="mt-3 max-w-md text-slate-600">
                Przepraszamy, wystąpił nieoczekiwany błąd. Spróbuj odświeżyć stronę.
            </p>

            <Button
                onClick={reset}
                size="lg"
                className="mt-8 bg-indigo-600 hover:bg-indigo-700 font-semibold"
            >
                Spróbuj ponownie
            </Button>
        </div>
    )
}

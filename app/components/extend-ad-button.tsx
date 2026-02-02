'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/app/components/ui/button'
import { RefreshCcw, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/app/components/ui/alert-dialog"

interface ExtendAdButtonProps {
    token: string
    adId: string
}

export function ExtendAdButton({ token, adId }: ExtendAdButtonProps) {
    const router = useRouter()
    const [isProcessing, setIsProcessing] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const handleExtend = async () => {
        setIsProcessing(true)
        setError(null)

        try {
            const response = await fetch('/api/payments/create', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ad_id: adId,
                    type: 'extension',
                    management_token: token,
                }),
            })

            const data = await response.json()

            if (data.redirectUrl) {
                window.location.href = data.redirectUrl
            } else if (data.error) {
                setError(data.error)
                toast.error(data.error)
                setIsProcessing(false)
            } else {
                // Unexpected response - no redirectUrl and no error
                const unexpectedError = 'Nieoczekiwana odpowiedź serwera. Spróbuj ponownie.'
                setError(unexpectedError)
                toast.error(unexpectedError)
                setIsProcessing(false)
            }
        } catch (err) {
            console.error("Payment init failed", err)
            const errorMsg = 'Wystąpił błąd podczas inicjowania płatności.'
            setError(errorMsg)
            toast.error(errorMsg)
            setIsProcessing(false)
        }
    }

    return (
        <AlertDialog>
            <AlertDialogTrigger asChild>
                <Button className="w-full" variant="outline" disabled={isProcessing}>
                    {isProcessing ? (
                        <>
                            <Loader2 className="mr-2 size-4 animate-spin" />
                            Przekierowywanie...
                        </>
                    ) : (
                        <>
                            <RefreshCcw className="mr-2 size-4" />
                            Przedłuż o 30 dni (10 zł)
                        </>
                    )}
                </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle className="flex items-center gap-2">
                        <RefreshCcw className="size-5 text-indigo-600" />
                        Przedłuż ogłoszenie
                    </AlertDialogTitle>
                    <AlertDialogDescription>
                        Twoje ogłoszenie zostanie przedłużone o 30 dni. Koszt: 10 zł.
                        Zostaniesz przekierowany do płatności.
                        {error && (
                            <span className="block mt-2 text-red-600">{error}</span>
                        )}
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel>Anuluj</AlertDialogCancel>
                    <AlertDialogAction
                        onClick={handleExtend}
                        className="bg-indigo-600 hover:bg-indigo-700"
                        disabled={isProcessing}
                    >
                        {isProcessing ? 'Przetwarzanie...' : 'Przejdź do płatności'}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    )
}

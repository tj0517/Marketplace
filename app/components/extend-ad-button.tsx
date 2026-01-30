'use client'

import { useState } from 'react'
import { extendAdExpiration } from '@/actions/user/extend-ad'
import { Button } from '@/app/components/ui/button'
import { RefreshCcw, Loader2, CheckCircle } from 'lucide-react'
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
}

export function ExtendAdButton({ token }: ExtendAdButtonProps) {
    const [isExtending, setIsExtending] = useState(false)
    const [result, setResult] = useState<{ success: boolean; message: string } | null>(null)

    const handleExtend = async () => {
        setIsExtending(true)
        setResult(null)
        try {
            const response = await extendAdExpiration(token)
            setResult(response)
            if (response.success) {
                // Refresh the page after a short delay to show updated expiration
                setTimeout(() => {
                    window.location.reload()
                }, 1500)
            }
        } catch (error) {
            console.error("Extend failed", error)
            setResult({ success: false, message: 'Wystąpił błąd podczas przedłużania.' })
        } finally {
            setIsExtending(false)
        }
    }

    if (result?.success) {
        return (
            <Button className="w-full" variant="outline" disabled>
                <CheckCircle className="mr-2 size-4 text-green-600" />
                Przedłużono
            </Button>
        )
    }

    return (
        <AlertDialog>
            <AlertDialogTrigger asChild>
                <Button className="w-full" variant="outline" disabled={isExtending}>
                    {isExtending ? (
                        <>
                            <Loader2 className="mr-2 size-4 animate-spin" />
                            Przedłużanie...
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
                        {result && !result.success && (
                            <span className="block mt-2 text-red-600">{result.message}</span>
                        )}
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel>Anuluj</AlertDialogCancel>
                    <AlertDialogAction onClick={handleExtend} className="bg-indigo-600 hover:bg-indigo-700">
                        Przedłuż teraz
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    )
}

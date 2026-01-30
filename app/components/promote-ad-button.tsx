'use client'

import { useState } from 'react'
import { promoteAd } from '@/actions/user/promote-ad'
import { Button } from '@/app/components/ui/button'
import { ArrowUpCircle, Loader2, CheckCircle } from 'lucide-react'
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

interface PromoteAdButtonProps {
    token: string
}

export function PromoteAdButton({ token }: PromoteAdButtonProps) {
    const [isPromoting, setIsPromoting] = useState(false)
    const [result, setResult] = useState<{ success: boolean; message: string } | null>(null)

    const handlePromote = async () => {
        setIsPromoting(true)
        setResult(null)
        try {
            const response = await promoteAd(token)
            setResult(response)
            if (response.success) {
                // Refresh the page after a short delay to show result
                setTimeout(() => {
                    window.location.reload()
                }, 1500)
            }
        } catch (error) {
            console.error("Promote failed", error)
            setResult({ success: false, message: 'Wystąpił błąd podczas promowania.' })
        } finally {
            setIsPromoting(false)
        }
    }

    if (result?.success) {
        return (
            <Button className="w-full bg-white text-indigo-600 hover:bg-indigo-50 font-semibold" disabled>
                <CheckCircle className="mr-2 size-4 text-green-600" />
                Promowano
            </Button>
        )
    }

    return (
        <AlertDialog>
            <AlertDialogTrigger asChild>
                <Button className="w-full bg-white text-indigo-600 hover:bg-indigo-50 font-semibold" disabled={isPromoting}>
                    {isPromoting ? (
                        <>
                            <Loader2 className="mr-2 size-4 animate-spin" />
                            Promowanie...
                        </>
                    ) : (
                        <>
                            <ArrowUpCircle className="mr-2 size-4" />
                            Podbij ogłoszenie (10 zł)
                        </>
                    )}
                </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle className="flex items-center gap-2">
                        <ArrowUpCircle className="size-5 text-indigo-600" />
                        Promuj ogłoszenie
                    </AlertDialogTitle>
                    <AlertDialogDescription>
                        Twoje ogłoszenie zostanie wyświetlone na górze listy. Koszt: 10 zł.
                        {result && !result.success && (
                            <span className="block mt-2 text-red-600">{result.message}</span>
                        )}
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel>Anuluj</AlertDialogCancel>
                    <AlertDialogAction onClick={handlePromote} className="bg-indigo-600 hover:bg-indigo-700">
                        Podbij teraz
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    )
}

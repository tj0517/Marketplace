'use client'

import { useState } from 'react'
import { deleteAd } from '@/app/actions/delete-ad'
import { Button } from '@/app/components/ui/button'
import { Trash2, Loader2, AlertTriangle } from 'lucide-react'
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

interface DeleteAdButtonProps {
    token: string
}

export function DeleteAdButton({ token }: DeleteAdButtonProps) {
    const [isDeleting, setIsDeleting] = useState(false)

    const handleDelete = async () => {
        setIsDeleting(true)
        try {
            await deleteAd(token)
        } catch (error) {
            console.error("Delete failed", error)
            setIsDeleting(false)
        }
    }

    return (
        <AlertDialog>
            <AlertDialogTrigger asChild>
                <Button variant="destructive" className="w-full bg-red-600 hover:bg-red-700" disabled={isDeleting}>
                    {isDeleting ? (
                        <>
                            <Loader2 className="mr-2 size-4 animate-spin" />
                            Usuwanie...
                        </>
                    ) : (
                        <>
                            <Trash2 className="mr-2 size-4" />
                            Usuń ogłoszenie
                        </>
                    )}
                </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle className="flex items-center gap-2 text-red-600">
                        <AlertTriangle className="size-5" />
                        Czy na pewno chcesz usunąć to ogłoszenie?
                    </AlertDialogTitle>
                    <AlertDialogDescription>
                        Tej operacji nie można cofnąć. Twoje ogłoszenie zostanie trwale usunięte z naszej bazy danych.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel>Anuluj</AlertDialogCancel>
                    <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700">
                        Tak, usuń trwale
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    )
}

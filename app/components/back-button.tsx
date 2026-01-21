"use client"

import { ArrowLeft } from "lucide-react"
import { redirect, useRouter } from "next/navigation"
import { Button } from "./ui/button"

export function BackButton() {
    const router = useRouter()

    return (
        <Button
            variant="ghost"
            size="sm"
            className="gap-2 text-slate-600 hover:bg-violet-50 hover:text-violet-700 transition-colors"
            onClick={() => redirect("/")}
        >
            <ArrowLeft className="size-4" />
            Wróć
        </Button>
    )
}

"use client"

import { ArrowLeft } from "lucide-react"
import { redirect } from "next/navigation"
import { Button } from "./ui/button"

export function BackButton() {
    return (
        <Button
            variant="ghost"
            size="sm"
            className="gap-2 text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-colors"
            onClick={() => redirect("/")}
        >
            <ArrowLeft className="size-4" />
            Wróć
        </Button>
    )
}

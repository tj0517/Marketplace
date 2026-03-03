"use client"

import Link from "next/link"
import { Plus, BookOpen, Search } from "lucide-react"
import { Button } from "./ui/button"
import { BackButton } from "./back-button"

interface NavbarProps {
    showBackButton?: boolean;
}

export function Navbar({ showBackButton = false }: NavbarProps) {
    return (
        <nav className="sticky top-0 z-50 w-full bg-white border-b border-slate-200">
            <div className="mx-auto flex h-auto py-3 sm:h-16 sm:py-0 max-w-6xl items-center justify-between px-4 sm:px-6">
                {/* Logo or Back Button */}
                <div className="flex items-center gap-2">
                    {showBackButton ? (
                        <BackButton />
                    ) : (
                        <Link href="/" className="flex items-center gap-2">
                            <div className="flex items-center justify-center size-9 rounded-lg bg-indigo-600">
                                <BookOpen className="size-5 text-white" />
                            </div>
                            <span className="text-lg font-bold text-slate-900 hidden sm:block">
                                Lekcjo
                            </span>
                        </Link>
                    )}
                </div>

                {/* Right Actions */}
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-1.5 sm:gap-3">
                    <Button
                        asChild
                        className="rounded-lg bg-indigo-600 hover:bg-indigo-700 h-9 px-4 text-sm font-medium text-white"
                    >
                        <Link href="/add-offer?query=offer" className="flex items-center gap-1.5">
                            <Plus className="size-4 shrink-0" />
                            <span className="whitespace-nowrap">Dodaj ogłoszenie</span>
                        </Link>
                    </Button>
                    <Button
                        asChild
                        variant="outline"
                        className="rounded-lg border-slate-200 h-9 px-4 text-sm font-medium text-slate-700 hover:bg-slate-50 hover:border-slate-300"
                    >
                        <Link href="/add-offer?query=search" className="flex items-center gap-1.5">
                            <Search className="size-4 shrink-0" />
                            <span className="whitespace-nowrap">Szukam korepetycji</span>
                        </Link>
                    </Button>
                </div>
            </div>
        </nav>
    )
}

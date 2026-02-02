"use client"

import Link from "next/link"
import { Plus, BookOpen } from "lucide-react"
import { Button } from "./ui/button"
import { BackButton } from "./back-button"

interface NavbarProps {
    showBackButton?: boolean;
}

export function Navbar({ showBackButton = false }: NavbarProps) {
    return (
        <nav className="sticky top-0 z-50 w-full bg-white border-b border-slate-200">
            <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
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
                                Korepetycje
                            </span>
                        </Link>
                    )}
                </div>

                {/* Right Actions */}
                <div className="flex items-center gap-2 sm:gap-3">
                    <Button
                        asChild
                        variant="outline"
                        className="rounded-lg border-slate-200 px-2 sm:px-4 h-9 font-medium text-slate-700 hover:bg-slate-50 hover:border-slate-300"
                    >
                        <Link href="/add-offer?query=offer" className="flex items-center gap-1.5">
                            <Plus className="size-4" />
                            <span className="hidden sm:inline">Dodaj ogłoszenie</span>
                            <span className="sm:hidden">Dodaj</span>
                        </Link>
                    </Button>
                    <Button
                        asChild
                        className="rounded-lg bg-indigo-600 hover:bg-indigo-700 px-2 sm:px-4 h-9 font-medium text-white"
                    >
                        <Link href="/add-offer?query=search" className="flex items-center gap-1.5">
                            <Plus className="size-4" />
                            <span className="hidden sm:inline">Szukam korepetycji</span>
                            <span className="sm:hidden">Szukam</span>
                        </Link>
                    </Button>
                </div>
            </div>
        </nav>
    )
}

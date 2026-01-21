"use client"

import Link from "next/link"
import { Plus } from "lucide-react"
import { Button } from "./ui/button"
import { BackButton } from "./back-button"

interface NavbarProps {
    showBackButton?: boolean;
}

export function Navbar({ showBackButton = false }: NavbarProps) {
    return (
        <nav className="sticky top-0 z-50 w-full border-b border-violet-600/50 bg-white/60 backdrop-blur-xl transition-all duration-300">
            <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
                {/* Logo or Back Button */}
                <div className="flex items-center gap-2">
                    {showBackButton ? (
                        <BackButton />
                    ) : (
                        <Link href="/" className="group flex items-center gap-2">
                            <span className="text-2xl font-black text-violet-600">
                                Korepetycje.
                            </span>
                        </Link>
                    )}
                </div>

                {/* Right Actions */}
                <div className="flex items-center gap-2 sm:gap-4">
                    <Button
                        asChild
                        className="relative overflow-hidden rounded-full bg-violet-600 px-3 sm:px-6 py-1 h-9 sm:h-10 font-semibold text-white shadow-lg shadow-indigo-500/20 transition-all hover:scale-105 hover:bg-violet-700 hover:shadow-indigo-500/40 group"
                    >
                        <Link href="/add-offer?query=offer" className="flex items-center gap-1 sm:gap-2">
                            <div className="absolute inset-0 bg-violet-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                            <span className="relative flex items-center gap-1 sm:gap-2 z-10 text-xs sm:text-sm">
                                <Plus className="size-3.5 sm:size-4" />
                                <span className="sm:hidden">Ogłoszenie</span>
                                <span className="hidden sm:inline">Dodaj ogłoszenie</span>
                            </span>
                        </Link>
                    </Button>
                    <Button
                        asChild
                        className="relative overflow-hidden rounded-full bg-violet-600 px-3 sm:px-6 py-1 h-9 sm:h-10 font-semibold text-white shadow-lg shadow-indigo-500/20 transition-all hover:scale-105 hover:bg-violet-700 hover:shadow-indigo-500/40 group"
                    >
                        <Link href="/add-offer?query=search" className="flex items-center gap-1 sm:gap-2">
                            <div className="absolute inset-0 bg-violet-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                            <span className="relative flex items-center gap-1 sm:gap-2 z-10 text-xs sm:text-sm">
                                <Plus className="size-3.5 sm:size-4" />
                                <span className="sm:hidden">Zapytanie</span>
                                <span className="hidden sm:inline">Dodaj zapytanie</span>
                            </span>
                        </Link>
                    </Button>
                </div>
            </div>
        </nav >
    )
}

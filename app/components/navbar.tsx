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
        <nav className="sticky top-0 z-50 w-full border-b border-white/20 bg-white/60 backdrop-blur-xl transition-all duration-300">
            <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
                {/* Logo or Back Button */}
                <div className="flex items-center gap-2">
                    {showBackButton ? (
                        <BackButton />
                    ) : (
                        <Link href="/" className="group flex items-center gap-2">
                            <span className="text-2xl font-black bg-gradient-to-r from-violet-600 via-fuchsia-600 to-indigo-600 bg-[length:200%_auto] bg-clip-text text-transparent animate-gradient group-hover:scale-105 transition-transform duration-300">
                                Korepetycje
                                <span className="text-fuchsia-500">.</span>
                            </span>
                        </Link>
                    )}
                </div>

                {/* Right Actions */}
                <div className="flex items-center gap-4">
                    <Button
                        asChild
                        className="relative overflow-hidden rounded-full bg-slate-900 px-6 font-semibold text-white shadow-lg shadow-indigo-500/20 transition-all hover:scale-105 hover:shadow-indigo-500/40 group"
                    >
                        <Link href="/add-offer" className="flex items-center gap-2">
                            <div className="absolute inset-0 bg-gradient-to-r from-violet-600 via-fuchsia-600 to-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                            <span className="relative flex items-center gap-2 z-10">
                                <Plus className="size-4" />
                                Dodaj ogłoszenie
                            </span>
                        </Link>
                    </Button>
                </div>
            </div>
        </nav>
    )
}

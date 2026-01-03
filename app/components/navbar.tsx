"use client"

import Link from "next/link"
import { Plus } from "lucide-react"
import { Button } from "./ui/button"

export function Navbar() {
    return (
        <nav className="sticky top-0 z-50 w-full border-b border-gray-200 bg-white/80 backdrop-blur-md dark:border-gray-800 dark:bg-gray-950/80">
            <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
                {/* Logo */}
                <Link href="/" className="flex items-center gap-2">
                    <span className="text-xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                        Korepetycje
                    </span>
                </Link>

                {/* Right Actions */}
                <div className="flex items-center gap-4">
                    <Button
                        asChild
                        className="gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 font-semibold shadow-md transition-all hover:from-indigo-700 hover:to-purple-700"
                    >
                        <Link href="/add-offer">
                            <Plus className="size-4" />
                            Dodaj ogłoszenie
                        </Link>
                    </Button>
                </div>
            </div>
        </nav>
    )
}

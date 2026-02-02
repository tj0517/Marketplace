"use client"

import { Suspense } from "react"
import { useSearchParams, usePathname, useRouter } from "next/navigation"
import { ChevronLeft, ChevronRight, MoreHorizontal } from "lucide-react"
import { Button } from "./ui/button"
import { cn } from "@/lib/utils"

interface PaginationProps {
    totalPages: number
}

function PaginationContent({ totalPages }: PaginationProps) {
    const router = useRouter()
    const pathname = usePathname()
    const searchParams = useSearchParams()

    const currentPage = Number(searchParams.get("page")) || 1

    const createPageURL = (pageNumber: number | string) => {
        const params = new URLSearchParams(searchParams)
        params.set("page", pageNumber.toString())
        return `${pathname}?${params.toString()}`
    }

    const handlePageChange = (page: number) => {
        if (page >= 1 && page <= totalPages) {
            router.push(createPageURL(page))
        }
    }

    const getPageNumbers = () => {
        const pages = []
        const showMax = 5

        if (totalPages <= showMax) {
            for (let i = 1; i <= totalPages; i++) {
                pages.push(i)
            }
        } else {
            if (currentPage <= 3) {
                for (let i = 1; i <= 4; i++) pages.push(i)
                pages.push("...")
                pages.push(totalPages)
            } else if (currentPage >= totalPages - 2) {
                pages.push(1)
                pages.push("...")
                for (let i = totalPages - 3; i <= totalPages; i++) pages.push(i)
            } else {
                pages.push(1)
                pages.push("...")
                pages.push(currentPage - 1)
                pages.push(currentPage)
                pages.push(currentPage + 1)
                pages.push("...")
                pages.push(totalPages)
            }
        }
        return pages
    }

    if (totalPages <= 1) return null

    return (
        <div className="py-10">
            <div className="flex flex-col items-center gap-3">
                {/* Page info */}
                <p className="text-sm text-slate-500">
                    Strona <span className="font-semibold text-slate-700">{currentPage}</span> z <span className="font-semibold text-slate-700">{totalPages}</span>
                </p>

                {/* Pagination controls */}
                <div className="flex items-center gap-1">
                    <Button
                        variant="outline"
                        size="icon"
                        className="h-9 w-9 rounded-lg border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-40"
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={currentPage <= 1}
                    >
                        <ChevronLeft className="h-4 w-4" />
                        <span className="sr-only">Poprzednia strona</span>
                    </Button>

                    <div className="flex items-center gap-1">
                        {getPageNumbers().map((page, index) => {
                            if (page === "...") {
                                return (
                                    <div
                                        key={`ellipsis-${index}`}
                                        className="flex h-9 w-9 items-center justify-center text-slate-400"
                                    >
                                        <MoreHorizontal className="h-4 w-4" />
                                    </div>
                                )
                            }

                            const isCurrent = page === currentPage

                            return (
                                <Button
                                    key={page}
                                    variant={isCurrent ? "default" : "outline"}
                                    onClick={() => handlePageChange(Number(page))}
                                    className={cn(
                                        "h-9 w-9 rounded-lg font-medium",
                                        isCurrent
                                            ? "bg-indigo-600 text-white hover:bg-indigo-700"
                                            : "border-slate-200 text-slate-600 hover:bg-slate-50"
                                    )}
                                >
                                    {page}
                                </Button>
                            )
                        })}
                    </div>

                    <Button
                        variant="outline"
                        size="icon"
                        className="h-9 w-9 rounded-lg border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-40"
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={currentPage >= totalPages}
                    >
                        <ChevronRight className="h-4 w-4" />
                        <span className="sr-only">Następna strona</span>
                    </Button>
                </div>
            </div>
        </div>
    )
}

export function Pagination({ totalPages }: PaginationProps) {
    if (totalPages <= 1) return null

    return (
        <Suspense fallback={<div className="py-10 text-center text-slate-400">Ładowanie...</div>}>
            <PaginationContent totalPages={totalPages} />
        </Suspense>
    )
}


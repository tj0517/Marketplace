"use client"

import { useSearchParams, usePathname, useRouter } from "next/navigation"
import { ChevronLeft, ChevronRight, MoreHorizontal } from "lucide-react"
import { Button } from "./ui/button"
import { cn } from "@/lib/utils"

interface PaginationProps {
    totalPages: number
}

export function Pagination({ totalPages }: PaginationProps) {
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
        <div className="flex items-center justify-center gap-2 py-8 animate-fade-in">
            <Button
                variant="outline"
                size="icon"
                className="h-10 w-10 rounded-xl border-slate-200 bg-white hover:border-violet-200 hover:bg-violet-50 hover:text-violet-600 disabled:opacity-50"
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage <= 1}
            >
                <ChevronLeft className="h-5 w-5" />
                <span className="sr-only">Poprzednia strona</span>
            </Button>

            <div className="flex items-center gap-1">
                {getPageNumbers().map((page, index) => {
                    if (page === "...") {
                        return (
                            <div
                                key={`ellipsis-${index}`}
                                className="flex h-10 w-10 items-center justify-center text-slate-400"
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
                                "h-10 w-10 rounded-xl font-bold transition-all",
                                isCurrent
                                    ? "bg-violet-600 text-white shadow-lg shadow-violet-500/25 hover:bg-violet-700 hover:scale-105"
                                    : "border-slate-200 bg-white text-slate-600 hover:border-violet-200 hover:bg-violet-50 hover:text-violet-600"
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
                className="h-10 w-10 rounded-xl border-slate-200 bg-white hover:border-violet-200 hover:bg-violet-50 hover:text-violet-600 disabled:opacity-50"
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage >= totalPages}
            >
                <ChevronRight className="h-5 w-5" />
                <span className="sr-only">Następna strona</span>
            </Button>
        </div>
    )
}

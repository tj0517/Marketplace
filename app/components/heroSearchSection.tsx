"use client"

import { useState } from "react"
import { Search, Sparkles } from "lucide-react"
import { Button } from "@/app/components/ui/button"
import { Input } from "@/app/components/ui/input"
import { Badge } from "@/app/components/ui/badge"
import { useRouter, useSearchParams } from "next/navigation"
import { useEffect } from "react"

const quickFilters = ["Matura", "Szkoła Podstawowa", "Angielski", "Online"]

export function HeroSearchSection() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [activeTab, setActiveTab] = useState<"offer" | "search">("offer")
  const [searchQuery, setSearchQuery] = useState(searchParams.get("query") || "")

  useEffect(() => {
    setSearchQuery(searchParams.get("query") || "")
    const type = searchParams.get("type") as "offer" | "search" | null
    if (type) {
      setActiveTab(type)
    }
  }, [searchParams])

  const handleTabChange = (tab: "offer" | "search") => {
    setActiveTab(tab)
    const params = new URLSearchParams(searchParams)
    params.set("type", tab)
    params.delete("page")
    router.push(`/?${params.toString()}`)
  }

  const handleSearch = () => {
    const params = new URLSearchParams(searchParams)
    if (searchQuery) {
      params.set("query", searchQuery)
    } else {
      params.delete("query")
    }
    // Ensure type is preserved or set
    params.set("type", activeTab)
    params.delete("page") // Reset to first page on search
    router.push(`/?${params.toString()}`)
  }

  return (
    <div className="relative isolate w-full overflow-hidden  bg-slate-50 pb-20 pt-32 sm:pb-32 lg:pb-40">
      {/* Aurora Background */}
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute -left-[10%] -top-[20%] h-[500px] w-[500px] rounded-full bg-violet-400 opacity-20 blur-[100px] animate-pulse-slow" />
        <div className="absolute left-[20%] top-[40%] h-[400px] w-[400px] rounded-full bg-fuchsia-400 opacity-20 blur-[100px] animate-pulse-slow [animation-delay:2s]" />
        <div className="absolute -right-[10%] -top-[10%] h-[600px] w-[600px] rounded-full bg-cyan-400 opacity-20 blur-[100px] animate-pulse-slow [animation-delay:4s]" />
      </div>

      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">

          {/* Animated Badge */}
          <div className="mb-8 flex justify-center">
            <Badge
              variant="outline"
              className="group relative overflow-hidden rounded-full border-violet-200 bg-white/50 px-4 py-1.5 text-sm font-medium text-violet-700 backdrop-blur-sm transition-all hover:bg-white/80"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-violet-400/20 via-fuchsia-400/20 to-violet-400/20 opacity-0 transition-opacity group-hover:opacity-100 animate-gradient bg-[length:200%_auto]" />
              <span className="relative flex items-center">
                <Sparkles className="mr-2 size-4 text-fuchsia-500 animate-pulse" />
                Nowoczesna edukacja
              </span>
            </Badge>
          </div>

          <h1 className="text-balance text-4xl font-extrabold tracking-tight text-slate-900 sm:text-6xl lg:text-7xl">
            {activeTab === "offer" ? "Znajdź idealnego" : "Znajdź pilnego"} <br />
            <span className="bg-gradient-to-r from-violet-600 via-fuchsia-600 to-indigo-600 bg-clip-text text-transparent animate-gradient bg-[length:200%_auto]">
              {activeTab === "offer" ? "korepetytora" : "ucznia"}
            </span>
          </h1>

          <p className="mt-6 text-lg font-medium leading-8 text-slate-600">
            {activeTab === "offer"
              ? "Połącz się z najlepszymi nauczycielami w Polsce."
              : "Dotrzyj do uczniów poszukujących Twojej wiedzy."} <br className="hidden sm:inline" />
            <span className="text-violet-600">Prosty proces</span>, sprawdzone opinie i <span className="text-fuchsia-600">gwarancja satysfakcji</span>.
          </p>

          <div className="mt-12 flex flex-col items-center gap-6">

            {/* Type Toggle */}
            <div className="flex bg-white/50 backdrop-blur-sm p-1.5 rounded-full border border-violet-100 shadow-sm">
              <button
                onClick={() => handleTabChange("offer")}
                className={`px-6 py-2 rounded-full text-sm font-semibold transition-all duration-300 ${activeTab === "offer"
                  ? "bg-violet-600 text-white shadow-md shadow-violet-500/25"
                  : "text-slate-600 hover:text-violet-700 hover:bg-white/60"
                  }`}
              >
                Szukam korepetytora
              </button>
              <button
                onClick={() => handleTabChange("search")}
                className={`px-6 py-2 rounded-full text-sm font-semibold transition-all duration-300 ${activeTab === "search"
                  ? "bg-violet-600 text-white shadow-md shadow-violet-500/25"
                  : "text-slate-600 hover:text-violet-700 hover:bg-white/60"
                  }`}
              >
                Szukam ucznia
              </button>
            </div>

            {/* Search Capsule */}
            <div className="relative w-full max-w-2xl animate-float">
              <div className="group relative flex w-full items-center overflow-hidden rounded-2xl bg-white/80 p-2 shadow-2xl shadow-violet-500/10 ring-1 ring-white/50 backdrop-blur-xl transition-all hover:shadow-violet-500/20 hover:scale-[1.01] focus-within:ring-violet-400 focus-within:scale-[1.01]">
                {/* Glowing border effect on focus */}
                <div className="absolute inset-0 -z-10 bg-gradient-to-r from-violet-500 via-fuchsia-500 to-cyan-500 opacity-0 transition-opacity duration-300 group-focus-within:opacity-10" />

                <Search className="ml-4 size-6 text-violet-400" />
                <Input
                  type="text"
                  placeholder={activeTab === "offer" ? "Czego chcesz się nauczyć? (np. Matematyka)" : "Kogo chcesz uczyć? (np. Fizyka)"}
                  className="h-14 border-none bg-transparent px-4 text-lg text-slate-900 placeholder:text-slate-400 focus-visible:ring-0 shadow-none"
                  value={searchQuery}
                  onChange={(e) => {
                    const value = e.target.value
                    setSearchQuery(value)
                    const params = new URLSearchParams(searchParams)
                    if (value) {
                      params.set("query", value)
                    } else {
                      params.delete("query")
                    }
                    // Persist type in search
                    params.set("type", activeTab)
                    params.delete("page") // Reset to first page on input change
                    router.push(`/?${params.toString()}`)
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      handleSearch()
                    }
                  }}
                />
                <Button
                  onClick={handleSearch}
                  className="h-12 rounded-xl bg-violet-600 px-8 text-base font-bold text-white shadow-lg shadow-violet-500/25 transition-all hover:scale-105 hover:bg-violet-700"
                >
                  Szukaj
                </Button>
              </div>
            </div>

            {/* Quick Filters */}
            <div className="flex flex-wrap justify-center  items-center gap-3">
              <span className="text-sm font-semibold text-slate-400 py-1.5 uppercase tracking-wide text-[10px]">Popularne</span>
              {quickFilters.map((filter) => (
                <button
                  key={filter}
                  className="group relative rounded-full border border-slate-200 bg-white/60 px-4 py-1.5 text-sm font-medium text-slate-600 backdrop-blur-sm transition-all hover:-translate-y-0.5 hover:border-violet-200 hover:text-violet-700 hover:shadow-lg hover:shadow-violet-500/10"
                  onClick={() => {
                    setSearchQuery(filter);
                    const params = new URLSearchParams(searchParams)
                    params.set("query", filter)
                    params.set("type", activeTab)
                    router.push(`/?${params.toString()}`);
                  }}
                >
                  <span className="relative z-10">{filter}</span>
                  <div className="absolute inset-0 -z-10 rounded-full bg-gradient-to-r from-violet-50 to-fuchsia-50 opacity-0 transition-opacity group-hover:opacity-100" />
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

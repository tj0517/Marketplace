"use client"

import { useState } from "react"
import { Search, Users, Sparkles } from "lucide-react"
import { Button } from "@/app/components/ui/button"
import { Input } from "@/app/components/ui/input"
import { useRouter, useSearchParams } from "next/navigation"
import { useEffect } from "react"

const quickFilters = ["Matematyka", "Angielski", "Fizyka", "Matura"]

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
    params.set("type", activeTab)
    params.delete("page")
    router.push(`/?${params.toString()}`)
  }

  return (
    <div className="relative w-full overflow-hidden bg-gradient-to-b from-indigo-50 via-white to-slate-50 pb-12 pt-20 sm:pb-28 sm:pt-32">
      {/* Decorative elements */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Subtle gradient orbs */}
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-indigo-100 rounded-full blur-3xl opacity-60" />
        <div className="absolute -bottom-24 -left-24 w-80 h-80 bg-indigo-50 rounded-full blur-3xl opacity-60" />

        {/* Grid pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#6366f110_1px,transparent_1px),linear-gradient(to_bottom,#6366f110_1px,transparent_1px)] bg-[size:32px_32px]" />
      </div>

      <div className="relative mx-auto max-w-4xl px-4 sm:px-6 relative z-10">
        <div className="text-center">

          {/* Badge */}
          <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-indigo-100 px-4 py-1.5 text-sm font-medium text-indigo-700">
            <Sparkles className="size-4" />
            Nowoczesna edukacja
          </div>

          {/* Heading */}
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-5xl lg:text-6xl">
            {activeTab === "offer" ? "Znajdź idealnego" : "Znajdź pilnego"}{" "}
            <span className="text-indigo-600 underline decoration-indigo-600 underline-offset-8 decoration-2">
              {activeTab === "offer" ? "korepetytora" : "ucznia"}
            </span>
          </h1>

          <p className="mt-6 text-lg text-slate-600 max-w-2xl mx-auto">
            {activeTab === "offer"
              ? "Tysiące sprawdzonych nauczycieli gotowych pomóc Ci w nauce."
              : "Dotrzyj do uczniów szukających Twojej wiedzy i doświadczenia."}
          </p>

          {/* Search Section */}
          <div className="mt-10 flex flex-col items-center gap-5">

            {/* Type Toggle */}
            <div className="flex flex-col sm:flex-row bg-white p-1.5 rounded-2xl border border-slate-200 shadow-lg shadow-slate-200/50">
              <button
                onClick={() => handleTabChange("offer")}
                className={`px-5 py-2.5 rounded-xl text-sm font-semibold transition-all ${activeTab === "offer"
                  ? "bg-indigo-600 text-white shadow-md"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                  }`}
              >
                <span className="flex items-center justify-center gap-2">
                  <Search className="size-4" />
                  Szukam korepetytora
                </span>
              </button>
              <button
                onClick={() => handleTabChange("search")}
                className={`px-5 py-2.5 rounded-xl text-sm font-semibold transition-all ${activeTab === "search"
                  ? "bg-indigo-600 text-white shadow-md"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                  }`}
              >
                <span className="flex items-center justify-center gap-2">
                  <Users className="size-4" />
                  Szukam korepetycji
                </span>
              </button>
            </div>

            {/* Search Input */}
            <div className="w-full max-w-xl">
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 p-2 bg-white rounded-2xl border border-slate-200 shadow-xl shadow-indigo-100/50 focus-within:border-indigo-300 focus-within:ring-4 focus-within:ring-indigo-100 transition-all">
                <div className="flex items-center flex-1 w-full">
                  <div className="pl-3">
                    <Search className="size-5 text-indigo-500" />
                  </div>
                  <Input
                    type="text"
                    placeholder={activeTab === "offer" ? "Czego chcesz się nauczyć?" : "Jakiego przedmiotu uczysz?"}
                    className="h-12 border-none bg-transparent text-base text-slate-900 placeholder:text-slate-400 focus-visible:ring-0 shadow-none w-full"
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
                      params.set("type", activeTab)
                      params.delete("page")
                      router.push(`/?${params.toString()}`)
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        handleSearch()
                      }
                    }}
                  />
                </div>
                <Button
                  onClick={handleSearch}
                  className="h-11 w-full sm:w-auto px-6 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl shadow-md shadow-indigo-200"
                >
                  Szukaj
                </Button>
              </div>
            </div>

            {/* Quick Filters */}
            <div className="flex flex-wrap justify-center items-center gap-2 mt-2">
              <span className="text-xs font-medium text-slate-400 uppercase tracking-wide mr-2">Popularne:</span>
              {quickFilters.map((filter) => (
                <button
                  key={filter}
                  className="rounded-full bg-white border border-slate-200 px-4 py-1.5 text-sm font-medium text-slate-600 hover:border-indigo-300 hover:text-indigo-600 hover:bg-indigo-50 hover:shadow-md transition-all"
                  onClick={() => {
                    setSearchQuery(filter)
                    const params = new URLSearchParams(searchParams)
                    params.set("query", filter)
                    params.set("type", activeTab)
                    router.push(`/?${params.toString()}`)
                  }}
                >
                  {filter}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Creative Curve Divider */}
      <div className="absolute bottom-0 left-0 right-0 z-0 text-white">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 160" className="w-full h-auto block fill-current">
          <path fillOpacity="1" d="M0,0 C480,160 960,160 1440,0 L1440,160 L0,160 Z"></path>
        </svg>
      </div>
    </div>
  )
}

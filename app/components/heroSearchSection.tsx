"use client"

import { useState, Suspense } from "react"
import { Search, Users, Sparkles, MapPin } from "lucide-react"
import { Button } from "@/app/components/ui/button"
import { Input } from "@/app/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/app/components/ui/select"
import { useRouter, useSearchParams } from "next/navigation"
import { useEffect } from "react"
import { LEVELS, SUBJECTS, parseLevel, parseSubject } from "@/lib/ad-options"

const quickFilters = ["Matematyka", "Angielski", "Fizyka", "Matura"]

// Radix Select cannot hold an empty value, so "no filter" has its own item.
const ANY = "__any"

function HeroSearchContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [activeTab, setActiveTab] = useState<"offer" | "search">("offer")
  const [searchQuery, setSearchQuery] = useState(searchParams.get("query") || "")
  const [subject, setSubject] = useState<string>(parseSubject(searchParams.get("subject")) ?? ANY)
  const [level, setLevel] = useState<string>(parseLevel(searchParams.get("level")) ?? ANY)
  const [city, setCity] = useState(searchParams.get("city") || "")

  useEffect(() => {
    setSearchQuery(searchParams.get("query") || "")
    setSubject(parseSubject(searchParams.get("subject")) ?? ANY)
    setLevel(parseLevel(searchParams.get("level")) ?? ANY)
    setCity(searchParams.get("city") || "")
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

  const scrollToResults = () => {
    setTimeout(() => {
      document.getElementById("wyniki")?.scrollIntoView({ behavior: "smooth", block: "start" })
    }, 200)
  }

  const handleSearch = () => {
    const params = new URLSearchParams(searchParams)
    const setOrDelete = (key: string, value: string) => {
      if (value && value !== ANY) {
        params.set(key, value)
      } else {
        params.delete(key)
      }
    }
    setOrDelete("query", searchQuery.trim())
    setOrDelete("subject", subject)
    setOrDelete("level", level)
    setOrDelete("city", city.trim())
    params.set("type", activeTab)
    params.delete("page")
    router.push(`/?${params.toString()}`, { scroll: false })
    scrollToResults()
  }

  return (
    <>
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
                placeholder="Przedmiot, poziom lub miasto"
                className="h-12 border-none bg-transparent text-base text-slate-900 placeholder:text-slate-400 focus-visible:ring-0 shadow-none w-full"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
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

          {/* Filters: combined with the text field (AND) */}
          <div className="mt-3 grid grid-cols-1 sm:grid-cols-3 gap-2 text-left">
            <Select value={subject} onValueChange={setSubject}>
              <SelectTrigger aria-label="Przedmiot" className="h-11 data-[size=default]:h-11 w-full bg-white rounded-xl">
                <SelectValue placeholder="Przedmiot" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={ANY}>Wszystkie przedmioty</SelectItem>
                {SUBJECTS.map((s) => (
                  <SelectItem key={s} value={s}>{s}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={level} onValueChange={setLevel}>
              <SelectTrigger aria-label="Poziom" className="h-11 data-[size=default]:h-11 w-full bg-white rounded-xl">
                <SelectValue placeholder="Poziom" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={ANY}>Wszystkie poziomy</SelectItem>
                {LEVELS.map((l) => (
                  <SelectItem key={l} value={l}>{l}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
              <Input
                type="text"
                aria-label="Miasto"
                placeholder="Miasto"
                maxLength={50}
                className="h-11 pl-9 bg-white rounded-xl"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    handleSearch()
                  }
                }}
              />
            </div>
          </div>
        </div>

        {/* Quick Filters */}
        <div className="flex flex-wrap justify-center items-center gap-2 mt-4 sm:mt-6">
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
                params.delete("page") // Reset pagination
                router.push(`/?${params.toString()}`, { scroll: false })
                scrollToResults()
              }}
            >
              {filter}
            </button>
          ))}
        </div>
      </div>
    </>
  )
}

function HeroSearchFallback() {
  return (
    <>
      <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-indigo-100 px-4 py-1.5 text-sm font-medium text-indigo-700">
        <Sparkles className="size-4" />
        Nowoczesna edukacja
      </div>
      <h1 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-5xl lg:text-6xl">
        Znajdź idealnego{" "}
        <span className="text-indigo-600 underline decoration-indigo-600 underline-offset-8 decoration-2">
          korepetytora
        </span>
      </h1>
      <p className="mt-6 text-lg text-slate-600 max-w-2xl mx-auto">
        Tysiące sprawdzonych nauczycieli gotowych pomóc Ci w nauce.
      </p>
      <div className="mt-10 h-32 flex items-center justify-center">
        <div className="animate-pulse text-slate-400">Ładowanie...</div>
      </div>
    </>
  )
}

export function HeroSearchSection() {
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
          <Suspense fallback={<HeroSearchFallback />}>
            <HeroSearchContent />
          </Suspense>
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

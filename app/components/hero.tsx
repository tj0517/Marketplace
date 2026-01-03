"use client"

import { useState } from "react"
import { Search, ChevronDown, Sparkles } from "lucide-react"
import { Button } from "@/app/components/ui/button"
import { Input } from "@/app/components/ui/input"
import { Popover, PopoverContent, PopoverTrigger } from "@/app/components/ui/popover"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/app/components/ui/select"
import { Badge } from "@/app/components/ui/badge"

const subjects = ["Matematyka", "Angielski", "Chemia", "Fizyka", "Biologia", "Historia", "Polski", "Informatyka"]
const locations = ["Warszawa", "Kraków", "Wrocław", "Poznań", "Gdańsk", "Łódź", "Online"]
const levels = ["Przedszkole", "Podstawówka", "Liceum", "Studia"]

const quickFilters = ["Matura", "Szkoła Podstawowa", "Angielski", "Online"]

export function HeroSearchSection() {
  const [activeTab, setActiveTab] = useState<"offering" | "looking">("offering")
  const [selectedSubject, setSelectedSubject] = useState("")
  const [selectedLocation, setSelectedLocation] = useState("")
  const [selectedLevel, setSelectedLevel] = useState("")

  return (
    <div className="relative min-h-[600px] w-full overflow-hidden bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 dark:from-indigo-950 dark:via-purple-950 dark:to-pink-950">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:24px_24px]" />

      <div className="relative mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8">
        {/* Hero Headline */}
        <div className="mb-12 text-center">
          <h1 className="mb-4 text-balance text-4xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-5xl lg:text-6xl">
            Znajdź idealnego korepetytora
          </h1>
          <p className="mx-auto max-w-2xl text-pretty text-lg text-gray-600 dark:text-gray-300">
            Tysiące wykwalifikowanych nauczycieli gotowych pomóc Ci osiągnąć sukces w nauce
          </p>
        </div>

        {/* Floating Search Card */}
        <div className="mx-auto max-w-4xl">
          <div className="rounded-2xl bg-white p-6 shadow-2xl ring-1 ring-gray-900/5 dark:bg-gray-900 dark:ring-white/10 sm:p-8">
            {/* Custom Toggle Tabs */}
            <div className="mb-6 flex gap-2 rounded-xl bg-gray-100 p-1.5 dark:bg-gray-800">
              <button
                onClick={() => setActiveTab("offering")}
                className={`flex-1 rounded-lg px-6 py-3 text-sm font-semibold transition-all ${
                  activeTab === "offering"
                    ? "bg-indigo-600 text-white shadow-md"
                    : "text-gray-700 hover:bg-gray-200 dark:text-gray-300 dark:hover:bg-gray-700"
                }`}
              >
                <span className="mr-2">🟢</span>
                Oferuję korepetycje
              </button>
              <button
                onClick={() => setActiveTab("looking")}
                className={`flex-1 rounded-lg px-6 py-3 text-sm font-semibold transition-all ${
                  activeTab === "looking"
                    ? "bg-indigo-600 text-white shadow-md"
                    : "text-gray-700 hover:bg-gray-200 dark:text-gray-300 dark:hover:bg-gray-700"
                }`}
              >
                <span className="mr-2">🔵</span>
                Szukam korepetytora
              </button>
            </div>

            {/* Main Search Interface */}
            <div className="space-y-4">
              {/* Search Bar with Inline Filters */}
              <div className="flex flex-col gap-3 rounded-xl border-2 border-gray-200 bg-white p-2 shadow-lg transition-all focus-within:border-indigo-500 focus-within:ring-4 focus-within:ring-indigo-100 dark:border-gray-700 dark:bg-gray-800 dark:focus-within:ring-indigo-900 sm:flex-row sm:items-center">
                {/* Main Search Input */}
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 size-5 -translate-y-1/2 text-gray-400" />
                  <Input
                    type="search"
                    placeholder="Czego chcesz się nauczyć? (np. Matematyka)"
                    className="h-12 border-0 bg-transparent pl-11 text-base shadow-none focus-visible:ring-0"
                  />
                </div>

 
              </div>

              {/* Search Button */}
              <Button
                size="lg"
                className="h-14 w-full gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-base font-semibold shadow-lg transition-all hover:from-indigo-700 hover:to-purple-700 hover:shadow-xl"
              >
                Szukaj korepetytorów
                <Search className="size-5" />
              </Button>
            </div>

            {/* Quick Filter Pills */}
            <div className="mt-6 border-t border-gray-100 pt-6 dark:border-gray-700">
              <p className="mb-3 text-sm font-medium text-gray-600 dark:text-gray-400">Popularne wyszukiwania:</p>
              <div className="flex flex-wrap gap-2">
                {quickFilters.map((filter) => (
                  <Badge
                    key={filter}
                    variant="secondary"
                    className="cursor-pointer rounded-full px-4 py-2 text-sm font-medium transition-all hover:scale-105 hover:bg-indigo-100 hover:text-indigo-700 dark:hover:bg-indigo-900 dark:hover:text-indigo-300"
                  >
                    <Sparkles className="mr-1.5 size-3.5" />
                    {filter}
                  </Badge>
                ))}
              </div>
            </div>
          </div>

          {/* Info Banner for "Looking for Tutor" Tab */}
          {activeTab === "looking" && (
            <div className="mt-4 rounded-xl border-2 border-blue-200 bg-blue-50 p-4 shadow-md dark:border-blue-800 dark:bg-blue-950">
              <p className="text-center text-sm font-medium text-blue-900 dark:text-blue-100">
                ℹ️ Ogłoszenia w tej kategorii są bezpłatne i mają charakter informacyjny
              </p>
            </div>
          )}
        </div>

        {/* Trust Indicators */}
        <div className="mt-12 grid grid-cols-2 gap-6 text-center sm:grid-cols-4">
          <div>
            <p className="text-3xl font-bold text-indigo-600 dark:text-indigo-400">5,000+</p>
            <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">Korepetytorów</p>
          </div>
          <div>
            <p className="text-3xl font-bold text-purple-600 dark:text-purple-400">50+</p>
            <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">Przedmiotów</p>
          </div>
          <div>
            <p className="text-3xl font-bold text-pink-600 dark:text-pink-400">4.8★</p>
            <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">Średnia ocen</p>
          </div>
          <div>
            <p className="text-3xl font-bold text-indigo-600 dark:text-indigo-400">24/7</p>
            <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">Dostępność</p>
          </div>
        </div>
      </div>
    </div>
  )
}

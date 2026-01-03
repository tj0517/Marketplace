"use client"

import { useState } from "react"
import { Search, MapPin, SlidersHorizontal } from "lucide-react"
import { Button } from "@/app/components/ui/button"
import { Input } from "@/app/components/ui/input"
import { Label } from "@/app/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/app/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/app/components/ui/select"
import { Checkbox } from "@/app/components/ui/checkbox"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/app/components/ui/sheet"

const subjects = ["Matematyka", "Angielski", "Chemia", "Fizyka", "Biologia", "Historia", "Polski", "Informatyka"]

const educationLevels = [
  { id: "przedszkole", label: "Przedszkole" },
  { id: "podstawowa", label: "Szkoła podstawowa" },
  { id: "srednia", label: "Szkoła średnia" },
  { id: "matura", label: "Matura" },
  { id: "studia", label: "Studia" },
  { id: "inne", label: "Inne" },
]

function FilterControls() {
  const [selectedLevels, setSelectedLevels] = useState<string[]>([])

  const toggleLevel = (levelId: string) => {
    setSelectedLevels((prev) => (prev.includes(levelId) ? prev.filter((id) => id !== levelId) : [...prev, levelId]))
  }

  return (
    <div className="space-y-6">
      {/* Subject Filter */}
      <div className="space-y-2">
        <Label htmlFor="subject" className="text-sm font-medium">
          Przedmiot
        </Label>
        <Select>
          <SelectTrigger id="subject">
            <SelectValue placeholder="Wybierz przedmiot" />
          </SelectTrigger>
          <SelectContent>
            {subjects.map((subject) => (
              <SelectItem key={subject} value={subject.toLowerCase()}>
                {subject}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Location Filter */}
      <div className="space-y-2">
        <Label htmlFor="location" className="text-sm font-medium">
          Lokalizacja
        </Label>
        <div className="relative">
          <MapPin className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input id="location" placeholder="np. Warszawa, Kraków" className="pl-10" />
        </div>
      </div>

      {/* Education Level Filter */}
      <div className="space-y-3">
        <Label className="text-sm font-medium">Zakres materiału</Label>
        <div className="space-y-3">
          {educationLevels.map((level) => (
            <div key={level.id} className="flex items-center gap-2">
              <Checkbox
                id={level.id}
                checked={selectedLevels.includes(level.id)}
                onCheckedChange={() => toggleLevel(level.id)}
              />
              <Label
                htmlFor={level.id}
                className="text-sm font-normal leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                {level.label}
              </Label>
            </div>
          ))}
        </div>
      </div>

      {/* Price Range Filter */}
      <div className="space-y-2">
        <Label className="text-sm font-medium">Cena (zł/h)</Label>
        <div className="flex items-center gap-2">
          <Input type="number" placeholder="Od" min="0" className="w-full" />
          <span className="text-sm text-muted-foreground">-</span>
          <Input type="number" placeholder="Do" min="0" className="w-full" />
        </div>
      </div>

      {/* Apply Filters Button - Mobile Only */}
      <Button className="w-full bg-indigo-600 hover:bg-indigo-700 md:hidden">Zastosuj filtry</Button>
    </div>
  )
}

export function SearchFilterSection() {
  return (
    <div className="w-full bg-background">
      <div className="mx-auto max-w-7xl px-4 py-8">
        {/* Main Tabs */}
        <Tabs defaultValue="offering" className="w-full">
          <div className="mb-6 flex flex-col gap-4">
            {/* Tabs List */}
            <TabsList className="grid w-full max-w-md grid-cols-2">
              <TabsTrigger
                value="offering"
                className="data-[state=active]:bg-indigo-600 data-[state=active]:text-white"
              >
                Oferuję korepetycje
              </TabsTrigger>
              <TabsTrigger value="looking" className="data-[state=active]:bg-indigo-600 data-[state=active]:text-white">
                Szukam korepetytora
              </TabsTrigger>
            </TabsList>

            {/* Search Bar */}
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 size-5 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Czego szukasz? (np. Matematyka, Warszawa, Matura)"
                className="h-12 pl-12 pr-4 text-base"
              />
            </div>
          </div>

          {/* Offering Tab Content */}
          <TabsContent value="offering" className="mt-0">
            <div className="flex flex-col gap-6 md:flex-row">
              {/* Desktop Sidebar */}
              <aside className="hidden w-64 shrink-0 rounded-lg border bg-card p-6 md:block">
                <h3 className="mb-4 font-semibold">Filtry</h3>
                <FilterControls />
              </aside>

              {/* Mobile Filter Button */}
              <div className="flex md:hidden">
                <Sheet>
                  <SheetTrigger asChild>
                    <Button variant="outline" className="w-full gap-2 bg-transparent">
                      <SlidersHorizontal className="size-4" />
                      Filtry
                    </Button>
                  </SheetTrigger>
                  <SheetContent side="left" className="w-80 overflow-y-auto">
                    <SheetHeader>
                      <SheetTitle>Filtry</SheetTitle>
                    </SheetHeader>
                    <div className="mt-6">
                      <FilterControls />
                    </div>
                  </SheetContent>
                </Sheet>
              </div>

              {/* Results Area */}
              <div className="min-h-96 flex-1 rounded-lg border bg-card p-6">
                <p className="text-sm text-muted-foreground">Wyniki wyszukiwania pojawią się tutaj...</p>
              </div>
            </div>
          </TabsContent>

          {/* Looking for Tutor Tab Content */}
          <TabsContent value="looking" className="mt-0">
            <div className="mb-4 rounded-lg border border-indigo-200 bg-indigo-50 p-4 dark:border-indigo-900 dark:bg-indigo-950">
              <p className="text-sm font-medium text-indigo-900 dark:text-indigo-100">
                ℹ️ Ogłoszenia w tej kategorii są bezpłatne i mają charakter informacyjny
              </p>
            </div>

            <div className="flex flex-col gap-6 md:flex-row">
              {/* Desktop Sidebar */}
              <aside className="hidden w-64 shrink-0 rounded-lg border bg-card p-6 md:block">
                <h3 className="mb-4 font-semibold">Filtry</h3>
                <FilterControls />
              </aside>

              {/* Mobile Filter Button */}
              <div className="flex md:hidden">
                <Sheet>
                  <SheetTrigger asChild>
                    <Button variant="outline" className="w-full gap-2 bg-transparent">
                      <SlidersHorizontal className="size-4" />
                      Filtry
                    </Button>
                  </SheetTrigger>
                  <SheetContent side="left" className="w-80 overflow-y-auto">
                    <SheetHeader>
                      <SheetTitle>Filtry</SheetTitle>
                    </SheetHeader>
                    <div className="mt-6">
                      <FilterControls />
                    </div>
                  </SheetContent>
                </Sheet>
              </div>

              {/* Results Area */}
              <div className="min-h-96 flex-1 rounded-lg border bg-card p-6">
                <p className="text-sm text-muted-foreground">Wyniki wyszukiwania pojawią się tutaj...</p>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

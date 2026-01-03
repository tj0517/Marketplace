"use client"
import Link from "next/link"
import { Star, MapPin, GraduationCap, Clock, Heart } from "lucide-react"
import { Button } from "./ui/button"
import { Badge } from "./ui/badge"
import { Card, CardContent } from "./ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar"
import { useState } from "react"
import { Database } from '@/types/supabase';

type Ad = Database['public']['Tables']['ads']['Row'];

interface TutorListingProps {
  initialAds: Ad[];
}

export function TutorListing({ initialAds = [] }: TutorListingProps) {
  const [ads] = useState<Ad[]>(initialAds);

  function getInitials(email: string): string {
    return email.charAt(0).toUpperCase()
  }

  function getAvatarUrl(gender: string | null, email: string): string {
    const hash = email.split("@")[0]
    if (gender === "female") {
      return `/female-teacher.png`
    } else if (gender === "male") {
      return `/male-teacher.png`
    }
    // Default to a neutral avatar
    return `/teacher-woman.png`
  }


  function formatPrice(priceAmount: number | null, priceUnit: string | null): string {
    if (!priceAmount) return "Negocjowalna"
    const unit = priceUnit === "hour" ? "godz" : priceUnit === "month" ? "mies" : "sesja"
    return `${priceAmount} zł/${unit}`
  }


  return (
    <section className="w-full bg-gradient-to-b from-white to-gray-50 px-4 py-16 dark:from-gray-900 dark:to-gray-950 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        {/* Section Header */}
        <div className="mb-10 text-center">
          <h2 className="mb-3 text-balance text-3xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-4xl">
            Polecani korepetytorzy
          </h2>
          <p className="mx-auto max-w-2xl text-pretty text-lg text-gray-600 dark:text-gray-300">
            Poznaj najlepiej ocenianych nauczycieli gotowych pomóc Ci osiągnąć cele
          </p>
        </div>

        {/* Filters Bar */}
        <div className="mb-8 flex flex-wrap items-center justify-between gap-4 rounded-xl bg-white p-4 shadow-md dark:bg-gray-900">
          <div className="flex flex-wrap gap-2">
            <Badge
              variant="secondary"
              className="cursor-pointer rounded-full px-4 py-2 transition-all hover:bg-indigo-100 hover:text-indigo-700 dark:hover:bg-indigo-900"
            >
              Wszystkie ({ads.length})
            </Badge>
            <Badge
              variant="outline"
              className="cursor-pointer rounded-full px-4 py-2 transition-all hover:bg-indigo-50 dark:hover:bg-indigo-950"
            >
              Online
            </Badge>
            <Badge
              variant="outline"
              className="cursor-pointer rounded-full px-4 py-2 transition-all hover:bg-indigo-50 dark:hover:bg-indigo-950"
            >
              Zweryfikowani
            </Badge>
            <Badge
              variant="outline"
              className="cursor-pointer rounded-full px-4 py-2 transition-all hover:bg-indigo-50 dark:hover:bg-indigo-950"
            >
              Najwyżej ocenieni
            </Badge>
          </div>
          <select className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm transition-all hover:border-indigo-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300">
            <option>Sortuj: Rekomendowane</option>
            <option>Sortuj: Cena rosnąco</option>
            <option>Sortuj: Cena malejąco</option>
            <option>Sortuj: Najwyżej ocenieni</option>
          </select>
        </div>

        {/* Tutors Grid */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {ads.map((ad) => {
            const avatarUrl = getAvatarUrl(ad.tutor_gender, ad.email)
            const initials = getInitials(ad.email)
            const priceDisplay = formatPrice(ad.price_amount, ad.price_unit)

            return (
              <Card
                key={ad.id}
                className="group overflow-hidden border-2 border-gray-100 transition-all hover:border-indigo-200 hover:shadow-xl dark:border-gray-800 dark:hover:border-indigo-800"
              >
                <CardContent className="p-6">
                  {/* Header with Avatar */}
                  <div className="mb-4 flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <Avatar className="size-14 ring-2 ring-indigo-100 dark:ring-indigo-900">
                        <AvatarImage src={avatarUrl || "/placeholder.svg"} alt={ad.title} />
                        <AvatarFallback>{initials}</AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold text-gray-900 dark:text-white">{ad.title}</h3>
                          {/* Placeholder for verified badge - can be added later */}
                        </div>

                      </div>
                    </div>
                  </div>

                  {/* Bio */}
                  <p className="mb-4 line-clamp-2 text-sm text-gray-600 dark:text-gray-400">{ad.description}</p>

                  {/* Subjects */}
                  <div className="mb-4 flex flex-wrap gap-2">
                    <Badge
                      variant="secondary"
                      className="rounded-full bg-indigo-50 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300"
                    >
                      {ad.subject}
                    </Badge>
                  </div>

                  {/* Info Grid */}
                  <div className="mb-4 grid grid-cols-2 gap-3 text-sm">
                    <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                      <MapPin className="size-4 text-indigo-600 dark:text-indigo-400" />
                      <span>{ad.location}</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                      <GraduationCap className="size-4 text-indigo-600 dark:text-indigo-400" />
                      <span>{ad.education_level?.[0] || "Wszystkie"}</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                      <Clock className="size-4 text-indigo-600 dark:text-indigo-400" />
                      <span>Szybka odp.</span>
                    </div>
                    <div className="flex items-center gap-2 font-semibold text-gray-900 dark:text-white">
                      <span className="text-lg text-indigo-600 dark:text-indigo-400">{priceDisplay}</span>
                    </div>
                  </div>


                  <Button
                    asChild
                    className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 font-semibold transition-all hover:from-indigo-700 hover:to-purple-700 hover:shadow-lg"
                  >
                    <Link href={`/offers/${ad.id}`}>
                      Zobacz profil
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            )
          })}
        </div>

        {/* Load More Button */}

      </div>
    </section>
  )
}

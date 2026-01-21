"use client"
import Link from "next/link"
import { Star, MapPin, GraduationCap, Clock, Heart, SearchX } from "lucide-react"
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

  function getInitials(email: string): string {
    return email.charAt(0).toUpperCase()
  }

  function formatPrice(priceAmount: number | null, priceUnit: string | null): string {
    if (!priceAmount) return "Negocjowalna"
    const unit = priceUnit === "hour" ? "godz" : priceUnit === "month" ? "mies" : "sesja"
    return `${priceAmount} zł/${unit}`
  }


  return (
    <section className="relative w-full overflow-hidden bg-white px-4 py-20 sm:px-6 lg:px-8">
      {/* Subtle Background Blobs */}
      <div className="absolute top-0 right-0 -mr-40 -mt-40 h-[500px] w-[500px] rounded-full bg-violet-100/50 blur-[100px]" />
      <div className="absolute bottom-[500px] left-0 -ml-40 -mb-40 h-[500px] w-[500px] rounded-full bg-fuchsia-100/50 blur-[100px]" />

      <div className="relative mx-auto max-w-7xl">
        {/* Section Header */}
        <div className="mb-12 text-center">
          <h2 className="mb-4 text-balance text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
            Polecani <span className="text-violet-600">korepetytorzy</span>
          </h2>
          <p className="mx-auto max-w-2xl text-pretty text-lg text-slate-600">
            Poznaj najlepiej ocenianych nauczycieli gotowych pomóc Ci osiągnąć cele
          </p>
        </div>

        {/* Tutors Grid */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {initialAds.length === 0 && (
            <div className="col-span-full flex flex-col items-center justify-center py-16 text-center">
              <div className="mb-4 rounded-full bg-slate-50 p-6 ring-1 ring-slate-100">
                <SearchX className="size-10 text-slate-400" />
              </div>
              <h3 className="mb-2 text-lg font-bold text-slate-900">Nie znaleźliśmy ogłoszeń</h3>
              <p className="max-w-xs text-sm text-slate-500">
                Spróbuj zmienić parametry wyszukiwania lub wróć później.
              </p>
            </div>
          )}
          {initialAds.map((ad) => {
            const initials = getInitials(ad.email)
            const priceDisplay = formatPrice(ad.price_amount, ad.price_unit)

            return (
              <Card
                key={ad.id}
                className="group relative overflow-hidden rounded-2xl border-1 bg-white shadow-xl shadow-slate-200/50 transition-all hover:scale-[1.02] hover:shadow-2xl hover:shadow-violet-500/10"
              >


                <CardContent className="relative h-full rounded-2xl bg-white p-6">
                  {/* Header with Avatar */}
                  <div className="mb-4 flex items-start justify-between">
                    <div className="flex items-center gap-4">
                      <div className="relative">
                        <div className="absolute inset-0 rounded-full bg-gradient-to-br from-violet-400 to-fuchsia-400 blur-sm opacity-50" />
                        <Avatar className="relative size-14 border-2 border-white">
                          <AvatarFallback className="bg-slate-50 text-violet-600 font-bold">{initials}</AvatarFallback>
                        </Avatar>
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-bold text-slate-900 group-hover:text-violet-700 transition-colors">{ad.title}</h3>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Bio */}
                  <p className="mb-4 min-h-[2.5rem] line-clamp-2 text-sm text-slate-600">{ad.description}</p>

                  {/* Subjects */}
                  <div className="mb-4 flex flex-wrap gap-2">
                    <Badge
                      variant="secondary"
                      className="rounded-md bg-violet-50 px-2.5 py-0.5 text-xs font-semibold text-violet-700"
                    >
                      {ad.subject}
                    </Badge>
                  </div>

                  {/* Info Grid */}
                  <div className="mb-6 grid grid-cols-2 gap-3 text-sm">
                    <div className="flex items-center gap-2 text-slate-500">
                      <MapPin className="size-4 text-violet-400" />
                      <span>{ad.location}</span>
                    </div>
                    <div className="flex items-center gap-2 text-slate-500">
                      <GraduationCap className="size-4 text-fuchsia-400" />
                      <span>{ad.education_level?.[0] || "Wszystkie"} {(ad.education_level?.length ?? 0) > 1 ? "..." : ""}</span>
                    </div>

                    <div className="col-span-2 mt-2 flex items-center gap-2 font-bold text-slate-900">
                      <span className="text-lg bg-gradient-to-r from-violet-600 to-fuchsia-600 bg-clip-text text-transparent">{priceDisplay}</span>
                    </div>
                  </div>


                  <Button
                    asChild
                    className="w-full rounded-xl bg-violet-600 text-white font-semibold transition-all hover:bg-violet-600 hover:shadow-lg hover:shadow-violet-500/25"
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

"use client"
import Link from "next/link"
import { MapPin, GraduationCap, SearchX, ArrowRight } from "lucide-react"
import { Button } from "./ui/button"
import { Badge } from "./ui/badge"
import { Card, CardContent } from "./ui/card"
import { Avatar, AvatarFallback } from "./ui/avatar"
import { PublicAd } from '@/actions/public/ads';

interface TutorListingProps {
  initialAds: PublicAd[];
}

export function TutorListing({ initialAds = [] }: TutorListingProps) {

  function getInitials(name: string): string {
    return name.charAt(0).toUpperCase()
  }

  function formatPrice(priceAmount: number | null, priceUnit: string | null): string {
    if (!priceAmount) return "Negocjowalna"
    const unit = priceUnit === "hour" ? "godz" : priceUnit === "month" ? "mies" : "sesja"
    return `${priceAmount} zł/${unit}`
  }

  function getAvatarColor(id: string): { bg: string; text: string } {
    const colors = [
      { bg: "bg-indigo-100", text: "text-indigo-600" },
      { bg: "bg-emerald-100", text: "text-emerald-600" },
      { bg: "bg-amber-100", text: "text-amber-600" },
      { bg: "bg-rose-100", text: "text-rose-600" },
      { bg: "bg-cyan-100", text: "text-cyan-600" },
      { bg: "bg-violet-100", text: "text-violet-600" },
    ]
    // Simple hash from string
    let hash = 0;
    for (let i = 0; i < id.length; i++) {
      hash = id.charCodeAt(i) + ((hash << 5) - hash);
    }
    const index = Math.abs(hash) % colors.length
    return colors[index]
  }


  return (
    <section className="w-full box-border bg-white px-4 py-8 sm:py-12 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl w-full">
        {/* Section Header */}
        <div className="mb-10 text-center">
          <h2 className="text-2xl font-bold text-slate-900 sm:text-3xl">
            Najnowsze ogłoszenia
          </h2>
          <p className="mt-2 text-slate-600">
            Przeglądaj oferty korepetytorów i znajdź idealnego nauczyciela
          </p>
        </div>

        {/* Tutors Grid */}
        <div className="grid gap-4 sm:gap-6 sm:grid-cols-2 lg:grid-cols-3 w-full min-w-0">
          {initialAds.length === 0 && (
            <div className="col-span-full flex flex-col items-center justify-center py-16 text-center">
              <div className="mb-4 rounded-2xl bg-slate-100 p-6">
                <SearchX className="size-10 text-slate-400" />
              </div>
              <h3 className="mb-2 text-lg font-semibold text-slate-900">Nie znaleźliśmy ogłoszeń</h3>
              <p className="max-w-sm text-slate-500 text-sm">
                Spróbuj zmienić parametry wyszukiwania lub wróć później.
              </p>
            </div>
          )}
          {initialAds.map((ad) => {
            const initials = getInitials(ad.title || '?')
            const priceDisplay = formatPrice(ad.price_amount, ad.price_unit)
            const avatarColor = getAvatarColor(ad.id)

            return (
              <Card
                key={ad.id}
                className="min-w-0 px-0 group border border-slate-200 bg-white rounded-2xl shadow-sm hover:shadow-lg hover:border-slate-300 transition-all duration-300"
              >
                <CardContent className="p-4 sm:p-5">
                  {/* Header with Avatar */}
                  <div className="mb-3 sm:mb-4 flex items-start gap-3 sm:gap-4">
                    <Avatar className="size-12 sm:size-14 border-2 border-white shadow-md">
                      <AvatarFallback className={`${avatarColor.bg} ${avatarColor.text} font-bold text-lg`}>
                        {initials}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-slate-900 truncate group-hover:text-indigo-600 transition-colors">
                        {ad.title}
                      </h3>
                      <Badge
                        variant="secondary"
                        className="mt-1.5 bg-indigo-50 text-indigo-700 border-0 text-xs font-medium"
                      >
                        {ad.subject}
                      </Badge>
                    </div>
                  </div>

                  {/* Bio */}
                  <p className="mb-3 sm:mb-4 line-clamp-2 text-sm text-slate-600 leading-relaxed min-h-10">
                    {ad.description}
                  </p>

                  {/* Info */}
                  <div className="mb-3 sm:mb-4 space-y-1 sm:space-y-2">
                    <div className="flex items-center gap-2 text-sm text-slate-500">
                      <MapPin className="size-4 text-slate-400" />
                      <span>{ad.location}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-slate-500">
                      <GraduationCap className="size-4 text-slate-400" />
                      <span>
                        {ad.education_level?.[0] || "Wszystkie poziomy"}
                        {(ad.education_level?.length ?? 0) > 1 && ` +${(ad.education_level?.length ?? 0) - 1}`}
                      </span>
                    </div>
                  </div>

                  {/* Price and CTA */}
                  <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                    <div>
                      <p className="text-xs text-slate-400 uppercase tracking-wide font-medium">Cena</p>
                      <p className="text-xl font-bold text-slate-900">{priceDisplay}</p>
                    </div>
                    <Button
                      asChild
                      className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium px-4 py-2 rounded-lg shadow-sm"
                    >
                      <Link href={`/offers/${ad.id}`} className="flex items-center gap-1.5">
                        Zobacz
                        <ArrowRight className="size-4" />
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>
    </section>
  )
}

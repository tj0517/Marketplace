import { notFound } from "next/navigation"
import { MapPin, Calendar, Eye, CheckCircle2, BookOpen, GraduationCap, ArrowRight, Phone } from "lucide-react"
import { Button } from "@/app/components/ui/button"
import { Badge } from "@/app/components/ui/badge"
import { Card, CardContent } from "@/app/components/ui/card"
import { Avatar, AvatarFallback } from "@/app/components/ui/avatar"
import { getAd } from "@/actions/public/ads"
import { Navbar } from "../../components/navbar"
import { ViewCounter } from "../../components/view-counter"
import { ContactButton } from "../../components/contact-button"


// Helper to get initials from title (since email is hidden)
function getInitials(title: string): string {
  return title.charAt(0).toUpperCase()
}

function formatPrice(priceAmount: number | null, priceUnit: string | null): string {
  if (!priceAmount) return "Negocjowalna"
  const unit = priceUnit === "hour" ? "godz" : priceUnit === "month" ? "mies" : "sesja"
  return `${priceAmount} zł/${unit}`
}

function formatDate(dateString: string): string {
  const date = new Date(dateString)
  return date.toLocaleDateString("pl-PL", { year: "numeric", month: "long", day: "numeric" })
}

export default async function OfferPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params

  const ad = await getAd(slug)

  if (!ad) {
    notFound()
  }

  const initials = getInitials(ad.title)
  const priceDisplay = formatPrice(ad.price_amount, ad.price_unit)

  const isSearch = ad.type === 'search'
  const isSearchWithDummyLevels = isSearch && ad.education_level && (ad.education_level.length === 0 || (ad.education_level.length === 1 && ad.education_level[0] === 'Dorośli'))

  const showPrice = !isSearch
  const showLevels = !isSearchWithDummyLevels
  const subjectLabel = isSearch ? "Szukany przedmiot" : "Wykładany przedmiot"


  // Single accent color based on type
  const accentBg = isSearch ? "bg-slate-900" : "bg-indigo-600"
  const accentHover = isSearch ? "hover:bg-slate-800" : "hover:bg-indigo-700"
  const accentLight = isSearch ? "bg-slate-50" : "bg-indigo-50"
  const accentText = isSearch ? "text-slate-700" : "text-indigo-700"

  return (
    <main className="flex flex-col w-full min-h-screen bg-slate-50">
      <ViewCounter adId={ad.id} />
      <Navbar showBackButton />

      <div className="w-full max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-10">

        {/* Hero Card */}
        <Card className="border-0 shadow-lg rounded-2xl overflow-hidden mb-6">
          <div className={`h-1 w-full ${accentBg}`} />
          <CardContent className="p-6 sm:p-8">
            <div className="flex flex-col lg:flex-row items-center lg:items-start gap-6 lg:gap-8">

              {/* Avatar */}
              <div className="relative shrink-0">
                <Avatar className="size-28 sm:size-36 border-4 border-white shadow-xl">
                  <AvatarFallback className={`text-4xl sm:text-5xl font-bold ${accentLight} ${accentText}`}>
                    {initials}
                  </AvatarFallback>
                </Avatar>
                <div className="absolute -bottom-1 -right-1 size-8 rounded-full bg-emerald-500 border-4 border-white flex items-center justify-center">
                  <CheckCircle2 className="size-4 text-white" />
                </div>
              </div>

              {/* Info */}
              <div className="flex-1 text-center lg:text-left">
                {/* Type Badge */}
                <div className="mb-3">
                  {isSearch ? (
                    <Badge className="bg-slate-100 text-slate-700 border-0 font-medium px-3 py-1">
                      <BookOpen className="mr-1.5 size-3.5" /> Szukam korepetytora
                    </Badge>
                  ) : (
                    <Badge className="bg-indigo-100 text-indigo-700 border-0 font-medium px-3 py-1">
                      <GraduationCap className="mr-1.5 size-3.5" /> Korepetytor
                    </Badge>
                  )}
                </div>

                {/* Title */}
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-slate-900 mb-4">
                  {ad.title}
                </h1>

                {/* Meta */}
                <div className="flex flex-wrap items-center justify-center lg:justify-start gap-3 text-sm text-slate-500">
                  <span className="flex items-center gap-1.5 bg-slate-100 px-3 py-1.5 rounded-full">
                    <MapPin className="size-4" />
                    {ad.location}
                  </span>
                  <span className="flex items-center gap-1.5 bg-slate-100 px-3 py-1.5 rounded-full">
                    <Eye className="size-4" />
                    {ad.views_count || 0} wyświetleń
                  </span>
                </div>

                {/* Subject Pill */}
                <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl mt-4 ${accentLight}`}>
                  <div className={`size-2.5 rounded-full ${accentBg}`} />
                  <span className={`font-semibold ${accentText}`}>{ad.subject}</span>
                </div>
              </div>



            </div>
          </CardContent>
        </Card>

        {/* Content Grid */}
        <div className="grid lg:grid-cols-3 gap-6">

          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">

            {/* Description Card */}
            <Card className="border-0 shadow-lg rounded-2xl overflow-hidden">
              <CardContent className="p-6 sm:p-8">
                <div className="flex items-center gap-3 mb-5">
                  <div className={`size-10 rounded-xl ${accentLight} flex items-center justify-center`}>
                    <BookOpen className={`size-5 ${accentText}`} />
                  </div>
                  <h2 className="text-xl font-bold text-slate-900">Opis</h2>
                </div>
                <p className="text-slate-600 leading-relaxed whitespace-pre-line text-base">
                  {ad.description}
                </p>
              </CardContent>
            </Card>

            {/* Subject & Levels Card */}
            <Card className="border-0 shadow-lg rounded-2xl overflow-hidden">
              <CardContent className="p-6 sm:p-8">
                <div className="flex items-center gap-3 mb-5">
                  <div className={`size-10 rounded-xl ${accentLight} flex items-center justify-center`}>
                    <GraduationCap className={`size-5 ${accentText}`} />
                  </div>
                  <h2 className="text-xl font-bold text-slate-900">
                    {isSearch ? "Szczegóły" : "Przedmiot i poziomy"}
                  </h2>
                </div>

                <div className="space-y-6">
                  {/* Subject */}
                  <div className={`rounded-xl p-5 ${accentLight}`}>
                    <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">
                      {subjectLabel}
                    </p>
                    <div className="flex items-center gap-2">
                      <div className={`size-3 rounded-full ${accentBg}`} />
                      <span className={`text-lg font-bold ${accentText}`}>{ad.subject}</span>
                    </div>
                  </div>

                  {/* Education Levels */}
                  {showLevels && ad.education_level && ad.education_level.length > 0 && (
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-3">
                        Poziomy nauczania
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {ad.education_level.map((level) => (
                          <Badge
                            key={level}
                            variant="secondary"
                            className="px-4 py-2 text-sm font-medium bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors"
                          >
                            {level}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="lg:sticky lg:top-24 space-y-6">
              {/* Contact Card */}
              <Card className="border-0 shadow-lg rounded-2xl overflow-hidden">
                <CardContent className="p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className={`size-10 rounded-xl ${accentLight} flex items-center justify-center`}>
                      <Phone className={`size-5 ${accentText}`} />
                    </div>
                    <h3 className="font-bold text-slate-900">Kontakt</h3>
                  </div>
                  <p className="text-slate-600 mb-4 text-sm">
                    Zainteresowany? Skontaktuj się bezpośrednio z ogłoszeniodawcą.
                  </p>
                  <div className="space-y-3">
                    <ContactButton adId={ad.id} />
                  </div>
                </CardContent>
              </Card>

              {/* Info Card */}
              <Card className="border-0 shadow-lg rounded-2xl overflow-hidden">
                <CardContent className="p-6">
                  <h3 className="font-bold text-slate-900 mb-4">Informacje</h3>

                  <div className="space-y-4">
                    <div className="flex items-center gap-4 pb-4 border-b border-slate-100">
                      <div className={`size-10 rounded-xl ${accentLight} flex items-center justify-center shrink-0`}>
                        <Calendar className={`size-5 ${accentText}`} />
                      </div>
                      <div>
                        <p className="text-xs text-slate-500 font-medium uppercase">Dodano</p>
                        <p className="font-semibold text-slate-900">{formatDate(ad.created_at!)}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 pb-4 border-b border-slate-100">
                      <div className={`size-10 rounded-xl ${accentLight} flex items-center justify-center shrink-0`}>
                        <Eye className={`size-5 ${accentText}`} />
                      </div>
                      <div>
                        <p className="text-xs text-slate-500 font-medium uppercase">Wyświetlenia</p>
                        <p className="font-semibold text-slate-900">{ad.views_count || 0}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="size-10 rounded-xl bg-emerald-50 flex items-center justify-center shrink-0">
                        <CheckCircle2 className="size-5 text-emerald-600" />
                      </div>
                      <div>
                        <p className="text-xs text-slate-500 font-medium uppercase">Status</p>
                        <p className="font-semibold text-emerald-600">Aktywne</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Secondary CTA */}


            </div>
          </div>

        </div>
      </div>
    </main>
  )
}

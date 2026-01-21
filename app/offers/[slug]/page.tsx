import { notFound } from "next/navigation"
import { MapPin, GraduationCap, Phone, Mail, Calendar, Eye, Share2, Flag } from "lucide-react"
import { Button } from "@/app/components/ui/button"
import { Badge } from "@/app/components/ui/badge"
import { Card, CardContent } from "@/app/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/app/components/ui/avatar"
import { Separator } from "@/app/components/ui/separator"
import { getAd } from "@/lib/ads"
import { Navbar } from "../../components/navbar"


function getInitials(email: string): string {
  return email.charAt(0).toUpperCase()
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

  const initials = getInitials(ad.email)
  const priceDisplay = formatPrice(ad.price_amount, ad.price_unit)

  const isSearch = ad.type === 'search'
  const isSearchWithDummyLevels = isSearch && ad.education_level && (ad.education_level.length === 0 || (ad.education_level.length === 1 && ad.education_level[0] === 'Dorośli'))

  const showPrice = !isSearch
  const showLevels = !isSearchWithDummyLevels
  const subjectLabel = isSearch ? "Szukany przedmiot" : "Wykładany przedmiot"
  const ctaText = isSearch ? "Zgłoś się" : "Napisz teraz"



  return (
    <main className="relative flex flex-col w-full min-h-screen bg-slate-50 overflow-x-hidden">
      <Navbar showBackButton />
      <div className="w-full max-w-6xl mx-auto mt-4 sm:mt-10 px-4 sm:px-6">

        <Card className="relative mx-auto border-0 bg-white/80 shadow-xl backdrop-blur-xl ring-1 ring-slate-200/50 py-6 sm:py-10 mb-6">
          <CardContent className="flex flex-col items-center sm:items-start text-center sm:text-left gap-6 px-4 sm:px-6">

            {/* Top Row: Avatar & Badges */}
            <div className="flex flex-col sm:flex-row items-center sm:items-end gap-6 w-full">
              {/* Avatar Container */}


              <div className="relative group border-0">
                <div className="absolute inset-0 rounded-full " />
                <Avatar className="size-32 sm:size-40 ring-4 ring-white shadow-xl">
                  <AvatarFallback className={isSearch ? "bg-blue-100 text-5xl font-black text-blue-600" : "bg-purple-100 text-5xl font-black text-violet-600"}>{initials}</AvatarFallback>
                </Avatar>
                {/* Status dot */}
                <div className="absolute bottom-2 right-2 size-6 rounded-full bg-emerald-400 ring-4 ring-white shadow-lg" />
              </div>

              {/* Header Info */}
              <div className="flex-1 pb-2 sm:pl-6 w-full">
                <h1 className={isSearch ? "text-3xl sm:text-5xl font-extrabold text-slate-800 tracking-tight drop-shadow-sm mb-3" : "text-3xl sm:text-5xl font-extrabold text-violet-600 tracking-tight drop-shadow-md mb-3"}>{ad.title}</h1>

                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 mt-4 ">
                  <Badge className="bg-white/20 hover:bg-white/30 border-0 backdrop-blur-md px-3 py-1 text-black!">
                    <MapPin className="mr-1.5 size-3.5" /> {ad.location}
                  </Badge>
                  {isSearch && (
                    <Badge variant="secondary" className="bg-blue-100 text-blue-700 hover:bg-blue-200 border-0 px-3 py-1">
                      Szukam korepetytora
                    </Badge>
                  )}
                </div>
              </div>


              {/* Action Buttons (Desktop) */}
              <div className="hidden lg:flex flex-col gap-3 shrink-0">
                <Button size="lg" className={isSearch ? "bg-blue-600 text-white hover:bg-blue-700 font-bold transition-transform hover:scale-105" : "bg-violet-500 text-white hover:bg-slate-50 font-bold transition-transform hover:scale-105 hover:bg-violet-600"}>
                  <Mail className="mr-2 size-5" /> Wyślij wiadomość
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>


        {/* Main Content Area - Overlapping the header */}
        <div className="relative mx-auto pb-20">
          <div className="grid gap-8 lg:grid-cols-3">

            {/* Left Column */}
            <div className="space-y-6 lg:col-span-2">
              <div className="block lg:hidden">
                <Button size="lg" className={isSearch ? "w-full bg-blue-600 text-white font-bold h-12 shadow-xl" : "w-full bg-violet-600 text-white font-bold h-12 shadow-xl"}>
                  <Mail className="mr-2 size-5" /> Wyślij wiadomość
                </Button>
              </div>


              {/* Description Card */}
              <Card className="overflow-hidden border-0 bg-white/80 shadow-xl backdrop-blur-xl ring-1 ring-slate-200/50">
                <div className={isSearch ? "h-2 w-full bg-gradient-to-r from-blue-500 via-cyan-500 to-teal-500" : "h-2 w-full bg-gradient-to-r from-violet-500 via-fuchsia-500 to-cyan-500"} />
                <CardContent className="p-5 sm:p-8">
                  <h2 className="mb-4 text-2xl font-bold text-slate-900 flex items-center gap-2">
                    <span className="text-2xl">📝</span> Opis
                  </h2>
                  <div className="prose prose-slate max-w-none">
                    <p className="whitespace-pre-line text-slate-600 leading-relaxed text-lg">{ad.description}</p>
                  </div>
                </CardContent>
              </Card>

              {/* Subject & Levels */}
              <Card className="overflow-hidden border-0 bg-white shadow-lg ring-1 ring-slate-200">
                <CardContent className="p-5 sm:p-8">
                  <h2 className="mb-6 text-2xl font-bold text-slate-900 flex items-center gap-2">
                    <span className="text-2xl">🎓</span> {isSearch ? "Szczegóły" : "Przedmiot i poziomy"}
                  </h2>

                  <div className="space-y-6">
                    <div className={isSearch ? "bg-blue-50 rounded-2xl p-4 border border-blue-100" : "bg-violet-50 rounded-2xl p-4 border border-violet-100"}>
                      <p className={isSearch ? "mb-2 text-xs font-bold uppercase tracking-wider text-blue-600/70" : "mb-2 text-xs font-bold uppercase tracking-wider text-violet-600/70"}>{subjectLabel}</p>
                      <div className={isSearch ? "text-lg font-bold text-blue-900 flex items-center gap-2" : "text-lg font-bold text-violet-900 flex items-center gap-2"}>
                        <div className={isSearch ? "size-2 rounded-full bg-blue-500" : "size-2 rounded-full bg-violet-500"} /> {ad.subject}
                      </div>
                    </div>

                    {showLevels && ad.education_level && ad.education_level.length > 0 && (
                      <div>
                        <p className="mb-3 text-xs font-bold uppercase tracking-wider text-slate-400 ml-1">Poziomy nauczania</p>
                        <div className="flex flex-wrap gap-2">
                          {ad.education_level.map((level) => (
                            <Badge key={level} variant="secondary" className="px-4 py-2 bg-slate-100 text-slate-700 hover:bg-slate-200 text-sm font-medium">
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

            {/* Right Column (Sticky Sidebar) */}
            <div className="space-y-6 lg:sticky lg:top-24 lg:self-start">

              {/* Pricing Card */}
              {showPrice ? (
                <Card className="relative overflow-hidden border-0 bg-slate-900 text-white shadow-2xl">
                  <div className="absolute inset-0 bg-violet-600 opacity-90" />
                  <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20" />

                  <CardContent className="relative p-6 text-center">
                    <p className="text-indigo-100 font-medium mb-1">Inwestycja w wiedzę</p>
                    <div className="text-4xl font-black mb-6 tracking-tight">{priceDisplay}</div>

                    <Button className="w-full h-12 bg-white text-indigo-700 font-bold hover:bg-indigo-50 hover:scale-105 transition-all shadow-lg text-lg">
                      <Mail className="mr-2 size-5" /> {ctaText}
                    </Button>

                    <div className="mt-4 flex justify-center gap-4 text-sm text-indigo-100 font-medium">
                      <span className="flex items-center gap-1"><Calendar className="size-4" /> Dostępny</span>
                      <span className="flex items-center gap-1"><Flag className="size-4" /> Zweryfikowany</span>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <Card className="relative overflow-hidden border-0 bg-white text-slate-900 shadow-xl ring-1 ring-slate-200">
                  <CardContent className="relative p-6 text-center">
                    <p className="text-slate-500 font-medium mb-4">Skontaktuj się z ogłoszeniodawcą</p>
                    <Button className="w-full h-12 bg-blue-600 text-white font-bold hover:bg-blue-700 hover:scale-105 transition-all shadow-lg text-lg">
                      <Mail className="mr-2 size-5" /> {ctaText}
                    </Button>
                    <div className="mt-4 flex justify-center gap-4 text-sm text-slate-500 font-medium">
                      <span className="flex items-center gap-1"><Calendar className="size-4" /> Aktulane</span>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Quick Stats */}
              <Card className="border-0 bg-white shadow-lg ring-1 ring-slate-200">
                <CardContent className="p-6 space-y-4">
                  <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
                    <div className={isSearch ? "size-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-600" : "size-10 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600"}>
                      <Calendar className="size-5" />
                    </div>
                    <div>
                      <p className="text-xs text-slate-500 font-bold uppercase">Data dodania</p>
                      <p className="font-semibold text-slate-900">{formatDate(ad.created_at!)}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className={isSearch ? "size-10 rounded-full bg-cyan-50 flex items-center justify-center text-cyan-600" : "size-10 rounded-full bg-fuchsia-50 flex items-center justify-center text-fuchsia-600"}>
                      <Eye className="size-5" />
                    </div>
                    <div>
                      <p className="text-xs text-slate-500 font-bold uppercase">Wyświetlenia</p>
                      <p className="font-semibold text-slate-900">{ad.views_count}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Mobile CTA */}

            </div>
          </div>
        </div>
      </div>
    </main>
  )
}


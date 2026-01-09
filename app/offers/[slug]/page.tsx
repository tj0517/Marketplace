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


  return (
    <main className="w-full min-h-screen bg-slate-50 overflow-x-hidden">
      <Navbar showBackButton />

      {/* Vibrant Gradient Header */}
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-br from-violet-600 via-fuchsia-600 to-indigo-600 h-[300px] lg:h-[350px]" />

        {/* Decorative Circles */}
        <div className="absolute inset-0 h-[350px] overflow-hidden">
          <div className="absolute -top-24 -left-24 h-96 w-96 rounded-full bg-white opacity-10 blur-3xl" />
          <div className="absolute top-1/2 right-0 h-64 w-64 rounded-full bg-cyan-400 opacity-20 blur-3xl transform -translate-y-1/2" />
        </div>

        <div className="relative mx-auto max-w-5xl px-4 pt-28 pb-12 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center sm:items-start text-center sm:text-left gap-6">

            {/* Top Row: Avatar & Badges */}
            <div className="flex flex-col sm:flex-row items-center sm:items-end gap-6 w-full">
              {/* Avatar Container */}
              <div className="relative group shrink-0">
                <div className="absolute inset-0 rounded-full bg-gradient-to-br from-white to-white/50 blur-md opacity-50 animate-pulse-slow" />
                <Avatar className="size-32 sm:size-40 border-4 border-white shadow-2xl ring-4 ring-white/20">
                  <AvatarFallback className="bg-white text-5xl font-black text-transparent bg-clip-text bg-gradient-to-br from-violet-600 to-fuchsia-600">{initials}</AvatarFallback>
                </Avatar>
                {/* Status dot */}
                <div className="absolute bottom-2 right-2 size-6 rounded-full bg-emerald-400 ring-4 ring-white shadow-lg" />
              </div>

              {/* Header Info */}
              <div className="flex-1 pb-2">
                <h1 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight drop-shadow-md mb-3">{ad.title}</h1>

                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 mt-4">
                  <Badge className="bg-white/20 hover:bg-white/30 text-white border-0 backdrop-blur-md px-3 py-1">
                    <MapPin className="mr-1.5 size-3.5" /> {ad.location}
                  </Badge>
                  <Badge className="bg-white/20 hover:bg-white/30 text-white border-0 backdrop-blur-md px-3 py-1">
                    <Eye className="mr-1.5 size-3.5" /> {ad.views_count} wyświetleń
                  </Badge>
                </div>
              </div>

              {/* Action Buttons (Desktop) */}
              <div className="hidden sm:flex flex-col gap-3 shrink-0">
                <Button size="lg" className="bg-white text-violet-600 hover:bg-slate-50 font-bold shadow-xl transition-transform hover:scale-105">
                  <Mail className="mr-2 size-5" /> Wyślij wiadomość
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area - Overlapping the header */}
      <div className="relative mx-auto max-w-5xl px-4 pb-20 sm:px-6 lg:px-8 -mt-8">
        <div className="grid gap-8 lg:grid-cols-3">

          {/* Left Column */}
          <div className="space-y-6 lg:col-span-2">

            {/* Description Card */}
            <Card className="overflow-hidden border-0 bg-white/80 shadow-xl backdrop-blur-xl ring-1 ring-slate-200/50">
              <div className="h-2 w-full bg-gradient-to-r from-violet-500 via-fuchsia-500 to-cyan-500" />
              <CardContent className="p-8">
                <h2 className="mb-4 text-2xl font-bold text-slate-900 flex items-center gap-2">
                  <span className="text-2xl">📝</span> O mnie
                </h2>
                <div className="prose prose-slate max-w-none">
                  <p className="whitespace-pre-line text-slate-600 leading-relaxed text-lg">{ad.description}</p>
                </div>
              </CardContent>
            </Card>

            {/* Subject & Levels */}
            <Card className="overflow-hidden border-0 bg-white shadow-lg ring-1 ring-slate-200">
              <CardContent className="p-8">
                <h2 className="mb-6 text-2xl font-bold text-slate-900 flex items-center gap-2">
                  <span className="text-2xl">🎓</span> Przedmiot i poziomy
                </h2>

                <div className="space-y-6">
                  <div className="bg-violet-50 rounded-2xl p-4 border border-violet-100">
                    <p className="mb-2 text-xs font-bold uppercase tracking-wider text-violet-600/70">Wykładany przedmiot</p>
                    <div className="text-lg font-bold text-violet-900 flex items-center gap-2">
                      <div className="size-2 rounded-full bg-violet-500" /> {ad.subject}
                    </div>
                  </div>

                  {ad.education_level && ad.education_level.length > 0 && (
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
          <div className="space-y-6">

            {/* Pricing Card */}
            <Card className="relative overflow-hidden border-0 bg-slate-900 text-white shadow-2xl">
              <div className="absolute inset-0 bg-gradient-to-br from-violet-600 via-fuchsia-600 to-indigo-600 opacity-90" />
              <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20" />

              <CardContent className="relative p-6 text-center">
                <p className="text-indigo-100 font-medium mb-1">Inwestycja w wiedzę</p>
                <div className="text-4xl font-black mb-6 tracking-tight">{priceDisplay}</div>

                <Button className="w-full h-12 bg-white text-indigo-700 font-bold hover:bg-indigo-50 hover:scale-105 transition-all shadow-lg text-lg">
                  <Mail className="mr-2 size-5" /> Napisz teraz
                </Button>

                <div className="mt-4 flex justify-center gap-4 text-sm text-indigo-100 font-medium">
                  <span className="flex items-center gap-1"><Calendar className="size-4" /> Dostępny</span>
                  <span className="flex items-center gap-1"><Flag className="size-4" /> Zweryfikowany</span>
                </div>
              </CardContent>
            </Card>

            {/* Quick Stats */}
            <Card className="border-0 bg-white shadow-lg ring-1 ring-slate-200">
              <CardContent className="p-6 space-y-4">
                <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
                  <div className="size-10 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600">
                    <Calendar className="size-5" />
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 font-bold uppercase">Data dodania</p>
                    <p className="font-semibold text-slate-900">{formatDate(ad.created_at!)}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="size-10 rounded-full bg-fuchsia-50 flex items-center justify-center text-fuchsia-600">
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
            <div className="sm:hidden">
              <Button size="lg" className="w-full bg-violet-600 text-white font-bold h-12 shadow-xl">
                <Mail className="mr-2 size-5" /> Wyślij wiadomość
              </Button>
            </div>

          </div>
        </div>
      </div>
    </main>
  )
}

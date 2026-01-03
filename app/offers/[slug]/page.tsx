import { notFound } from "next/navigation"
import { Star, MapPin, GraduationCap, Clock, Phone, Mail, Calendar, Eye, Share2, Flag } from "lucide-react"
import { Button } from "@/app/components/ui/button"
import { Badge } from "@/app/components/ui/badge"
import { Card, CardContent } from "@/app/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/app/components/ui/avatar"
import { Separator } from "@/app/components/ui/separator"
import { getAd } from "@/lib/ads"


function getAvatarUrl(gender: string | null): string {
  if (gender === "female") {
    return "/female-teacher.png"
  } else if (gender === "male") {
    return "/male-teacher.png"
  }
  return "/teacher-woman.png"
}

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

  const avatarUrl = getAvatarUrl(ad.tutor_gender)
  const initials = getInitials(ad.email)
  const priceDisplay = formatPrice(ad.price_amount, ad.price_unit)

  return (
    <main className="min-h-screen bg-gradient-to-b from-indigo-50 via-purple-50/30 to-white dark:from-indigo-950 dark:via-purple-950/30 dark:to-gray-950">
      {/* Hero Header with Gradient */}
      <div className="relative w-full overflow-hidden bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 px-4 py-12 sm:px-6 lg:px-8">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff0a_1px,transparent_1px),linear-gradient(to_bottom,#ffffff0a_1px,transparent_1px)] bg-[size:24px_24px]" />

        <div className="relative mx-auto max-w-5xl">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:gap-8">
            {/* Tutor Avatar */}
            <div className="flex justify-center sm:justify-start">
              <Avatar className="size-32 border-4 border-white shadow-2xl ring-4 ring-white/20 sm:size-40">
                <AvatarImage src={avatarUrl || "/placeholder.svg"} alt={ad.title} />
                <AvatarFallback className="bg-white text-4xl text-indigo-600">{initials}</AvatarFallback>
              </Avatar>
            </div>

            {/* Title and Meta */}
            <div className="flex-1 text-center sm:text-left">
              <div className="mb-3 flex flex-wrap items-center justify-center gap-2 sm:justify-start">
                <Badge className="bg-white/20 text-white backdrop-blur-sm hover:bg-white/30">
                </Badge>
                <Badge className="bg-green-500/90 text-white hover:bg-green-600">✓ Zweryfikowany</Badge>
              </div>

              <h1 className="mb-3 text-balance text-3xl font-bold text-white sm:text-4xl lg:text-5xl">{ad.title}</h1>

              <div className="mb-4 flex flex-wrap items-center justify-center gap-4 text-white/90 sm:justify-start">
                <div className="flex items-center gap-2">
                  <Star className="size-5 fill-yellow-400 text-yellow-400" />
                  <span className="font-semibold">4.8</span>
                  <span className="text-white/70">({ad.views_count} opinii)</span>
                </div>
                <Separator orientation="vertical" className="h-4 bg-white/30" />
                <div className="flex items-center gap-2">
                  <MapPin className="size-4" />
                  <span>{ad.location}</span>
                </div>
                <Separator orientation="vertical" className="h-4 bg-white/30" />
                <div className="flex items-center gap-2">
                  <Eye className="size-4" />
                  <span>{ad.views_count} wyświetleń</span>
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-center gap-3 sm:justify-start">
                <Button
                  size="lg"
                  className="gap-2 bg-white text-indigo-600 shadow-xl hover:bg-gray-50 hover:shadow-2xl"
                >
                  <Mail className="size-5" />
                  Wyślij wiadomość
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="gap-2 border-white/30 bg-white/10 text-white backdrop-blur-sm hover:bg-white/20"
                >
                  <Phone className="size-5" />
                  Pokaż numer
                </Button>
                <Button size="lg" variant="ghost" className="gap-2 text-white hover:bg-white/10">
                  <Share2 className="size-5" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Left Column - Main Content */}
          <div className="space-y-6 lg:col-span-2">
            {/* Description Card */}
            <Card className="border-2 shadow-lg">
              <CardContent className="p-6">
                <h2 className="mb-4 text-2xl font-bold text-gray-900 dark:text-white">Opis ogłoszenia</h2>
                <p className="whitespace-pre-line text-gray-700 leading-relaxed dark:text-gray-300">{ad.description}</p>
              </CardContent>
            </Card>

            {/* Subject & Education Levels */}
            <Card className="border-2 shadow-lg">
              <CardContent className="p-6">
                <h2 className="mb-4 text-2xl font-bold text-gray-900 dark:text-white">Przedmiot i poziomy</h2>
                <div className="space-y-4">
                  <div>
                    <p className="mb-2 text-sm font-medium text-gray-600 dark:text-gray-400">Przedmiot</p>
                    <Badge
                      variant="secondary"
                      className="rounded-full bg-indigo-100 px-4 py-2 text-base text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300"
                    >
                      {ad.subject}
                    </Badge>
                  </div>
                  {ad.education_level && ad.education_level.length > 0 && (
                    <div>
                      <p className="mb-2 text-sm font-medium text-gray-600 dark:text-gray-400">Poziomy nauczania</p>
                      <div className="flex flex-wrap gap-2">
                        {ad.education_level.map((level) => (
                          <Badge key={level} variant="outline" className="rounded-full px-4 py-2 text-sm">
                            <GraduationCap className="mr-1.5 size-4" />
                            {level}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Reviews Section (Placeholder) */}
            <Card className="border-2 shadow-lg">
              <CardContent className="p-6">
                <h2 className="mb-4 text-2xl font-bold text-gray-900 dark:text-white">Opinie uczniów</h2>
                <div className="space-y-4">
                  {/* Sample Review */}
                  <div className="rounded-lg border bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-800">
                    <div className="mb-2 flex items-center gap-2">
                      <div className="flex">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} className="size-4 fill-yellow-400 text-yellow-400" />
                        ))}
                      </div>
                      <span className="text-sm font-medium text-gray-900 dark:text-white">Marta K.</span>
                      <span className="text-sm text-gray-500">• 2 tygodnie temu</span>
                    </div>
                    <p className="text-sm text-gray-700 dark:text-gray-300">
                      Świetne zajęcia! Dzięki nim zdałam maturę rozszerzoną z matematyki na 90%. Polecam!
                    </p>
                  </div>

                  <div className="rounded-lg border bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-800">
                    <div className="mb-2 flex items-center gap-2">
                      <div className="flex">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} className="size-4 fill-yellow-400 text-yellow-400" />
                        ))}
                      </div>
                      <span className="text-sm font-medium text-gray-900 dark:text-white">Piotr S.</span>
                      <span className="text-sm text-gray-500">• miesiąc temu</span>
                    </div>
                    <p className="text-sm text-gray-700 dark:text-gray-300">
                      Bardzo cierpliwy nauczyciel, umie tłumaczyć nawet najtrudniejsze zagadnienia w prosty sposób.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Sidebar */}
          <div className="space-y-6">
            {/* Price Card */}
            <Card className="border-2 border-indigo-200 shadow-lg dark:border-indigo-800">
              <CardContent className="p-6">
                <div className="mb-4 text-center">
                  <p className="mb-1 text-sm font-medium text-gray-600 dark:text-gray-400">Cena za zajęcia</p>
                  <p className="text-4xl font-bold text-indigo-600 dark:text-indigo-400">{priceDisplay}</p>
                </div>

                <Button className="w-full gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-lg font-semibold shadow-lg hover:from-indigo-700 hover:to-purple-700">
                  <Mail className="size-5" />
                  Skontaktuj się
                </Button>

                <div className="mt-4 space-y-2 text-center text-sm text-gray-600 dark:text-gray-400">
                  <div className="flex items-center justify-center gap-2">
                    <Clock className="size-4 text-green-600" />
                    <span>Odpowiada w ciągu 24h</span>
                  </div>
                  <div className="flex items-center justify-center gap-2">
                    <GraduationCap className="size-4 text-indigo-600" />
                    <span>95% zdawalność matury</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Details Card */}
            <Card className="border-2 shadow-lg">
              <CardContent className="p-6">
                <h3 className="mb-4 font-semibold text-gray-900 dark:text-white">Szczegóły ogłoszenia</h3>
                <div className="space-y-3 text-sm">
                  <div className="flex items-start gap-3">
                    <Calendar className="mt-0.5 size-4 shrink-0 text-gray-400" />
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">Opublikowano</p>
                      <p className="text-gray-600 dark:text-gray-400">{formatDate(ad.created_at!)}</p>
                    </div>
                  </div>
                  <Separator />
                  <div className="flex items-start gap-3">
                    <MapPin className="mt-0.5 size-4 shrink-0 text-gray-400" />
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">Lokalizacja</p>
                      <p className="text-gray-600 dark:text-gray-400">{ad.location}</p>
                    </div>
                  </div>
                  <Separator />
                  <div className="flex items-start gap-3">
                    <Eye className="mt-0.5 size-4 shrink-0 text-gray-400" />
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">Wyświetlenia</p>
                      <p className="text-gray-600 dark:text-gray-400">{ad.views_count} razy</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Report Card */}
            <Card className="border-2 shadow-lg">
              <CardContent className="p-6">
                <Button variant="ghost" className="w-full gap-2 text-gray-600 hover:text-red-600 dark:text-gray-400">
                  <Flag className="size-4" />
                  Zgłoś ogłoszenie
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </main>
  )
}

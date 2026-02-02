import { HeroSearchSection } from "./components/heroSearchSection"
import { TutorListing } from "./components/tutorListing"
import { getAds, getAdsCount } from "@/actions/public/ads"
import { Navbar } from "./components/navbar"
import { Pagination } from "./components/pagination"
import { BookOpen, ArrowRight, Heart } from "lucide-react"
import Link from "next/link"


export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const { query: rawQuery, page: rawPage, type: rawType } = await searchParams
  const query = typeof rawQuery === 'string' ? rawQuery : undefined
  const type = (typeof rawType === 'string' && (rawType === 'offer' || rawType === 'search')) ? rawType : 'offer'

  const adsCount = await getAdsCount({ query, type })
  const page = Number(rawPage) || 1
  const limit = 9
  const ads = await getAds({ query, page, limit, type })


  return (
    <main className="min-h-screen bg-white">
      <Navbar />
      <HeroSearchSection />


      <TutorListing initialAds={ads} />
      <Pagination totalPages={Math.ceil(adsCount / limit)} />

      {/* Footer */}
      <footer className="bg-slate-900 border-t border-slate-800">
        <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
          <div className="flex flex-col items-center text-center">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2 mb-4">
              <div className="flex items-center justify-center size-8 rounded-lg bg-indigo-600">
                <BookOpen className="size-4 text-white" />
              </div>
              <span className="text-lg font-bold text-white">
                Korepetycje
              </span>
            </Link>

            <p className="text-slate-500 text-sm max-w-md mb-6">
              Łączymy uczniów z najlepszymi korepetytorami w Polsce.
            </p>

            {/* Legal Links */}
            <div className="flex flex-col sm:flex-row flex-wrap justify-center items-center gap-4 sm:gap-6 text-sm text-slate-400 mb-6 w-full">
              <Link href="/regulamin" className="hover:text-white transition-colors">Regulamin</Link>
              <Link href="/polityka-prywatnosci" className="hover:text-white transition-colors">Polityka prywatności</Link>
              <Link href="/recover-magic-link" className="hover:text-white transition-colors">Odzyskaj link zarządzania</Link>
              <Link href="/kontakt" className="hover:text-white transition-colors">Kontakt</Link>
            </div>

            {/* Copyright */}
            <div className="pt-6 border-t border-slate-800 w-full">
              <p className="text-slate-500 text-sm flex items-center justify-center gap-1">
                Stworzone z TJ.
              </p>
              <p className="text-slate-600 text-xs mt-1">
                © {new Date().getFullYear()} Korepetycje. Wszystkie prawa zastrzeżone.
              </p>
            </div>
          </div>
        </div>
      </footer>
    </main>
  )
}

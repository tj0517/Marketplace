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

      {/* CTA Section */}
      <section className="bg-slate-900 py-16 sm:py-20">
        <div className="mx-auto max-w-4xl px-4 text-center sm:px-6">
          <h2 className="text-2xl font-bold text-white sm:text-3xl mb-4">
            Zacznij uczyć lub ucz się już dziś
          </h2>

          <p className="text-slate-400 mb-8 max-w-xl mx-auto">
            Dołącz do naszej społeczności. Dodaj ogłoszenie za darmo i połącz się z osobami szukającymi wiedzy.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/add-offer?query=offer"
              className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-6 py-3 text-base font-semibold text-white hover:bg-indigo-700 transition-colors"
            >
              Dodaj ogłoszenie
              <ArrowRight className="size-4" />
            </Link>
            <Link
              href="/add-offer?query=search"
              className="inline-flex items-center gap-2 rounded-lg bg-slate-800 px-6 py-3 text-base font-semibold text-white hover:bg-slate-700 transition-colors border border-slate-700"
            >
              Szukam korepetycji
              <ArrowRight className="size-4" />
            </Link>
          </div>
        </div>
      </section>

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

            {/* Links */}
            <div className="flex flex-wrap justify-center gap-6 text-sm text-slate-400 mb-6">
              <Link href="/" className="hover:text-white transition-colors">Strona główna</Link>
              <Link href="/add-offer?query=offer" className="hover:text-white transition-colors">Dodaj ogłoszenie</Link>
              <Link href="/add-offer?query=search" className="hover:text-white transition-colors">Szukam korepetycji</Link>
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

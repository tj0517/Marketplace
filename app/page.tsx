import { HeroSearchSection } from "./components/heroSearchSection"
import { TutorListing } from "./components/tutorListing"
import { getAds, getAdsCount } from "@/lib/ads"
import { Navbar } from "./components/navbar"
import { Pagination } from "./components/pagination"

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
  const limit = 10
  const ads = await getAds({ query, page, limit, type })


  return (
    <main className="min-h-screen ">
      <Navbar />
      <HeroSearchSection />
      <TutorListing initialAds={ads} />
      <Pagination totalPages={Math.ceil(adsCount / limit)} />
    </main>
  )
}

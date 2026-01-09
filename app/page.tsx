import { HeroSearchSection } from "./components/hero"
import { TutorListing } from "./components/offers_listing"

import { getAds } from "@/lib/ads"
import { Navbar } from "./components/navbar"

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const { query: rawQuery } = await searchParams
  const query = typeof rawQuery === 'string' ? rawQuery : undefined
  const ads = await getAds({ query })

  return (
    <main className="min-h-screen">
      <Navbar />
      <HeroSearchSection />
      <TutorListing initialAds={ads} />
    </main>
  )
}

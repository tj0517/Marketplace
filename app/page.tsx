import { HeroSearchSection } from "./components/hero"
import { TutorListing } from "./components/offers_listing"

import { getAds } from "@/lib/ads"
import { Navbar } from "./components/navbar"

export default async function Home() {
  const ads = await getAds()

  return (
    <main className="min-h-screen">
      <Navbar />
      <HeroSearchSection />
      <TutorListing initialAds={ads} />
    </main>
  )
}

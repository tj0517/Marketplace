import { Navbar } from "@/app/components/navbar"
import { MarketingConsentForm } from '@/app/components/marketing-consent-form'
import { CONSENT_PAGE_COPY } from '@/lib/marketing-consent'
import { Gift } from 'lucide-react'

export const metadata = {
  title: 'Zgoda marketingowa | Lekcjo.pl',
  description: CONSENT_PAGE_COPY.heading,
}

export default function MarketingConsentPage() {
  return (
    <main className="min-h-screen bg-slate-50">
      <Navbar />

      <div className="mx-auto max-w-md px-4 py-10 sm:px-6 sm:py-16">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
          <div className="mb-6 flex justify-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-indigo-100">
              <Gift className="h-7 w-7 text-indigo-600" />
            </div>
          </div>

          <div className="mb-8 text-center">
            <h1 className="mb-2 text-xl font-bold text-slate-900 sm:text-2xl">
              {CONSENT_PAGE_COPY.heading}
            </h1>
            <p className="text-sm text-slate-600 sm:text-base">
              {CONSENT_PAGE_COPY.description}
            </p>
          </div>

          <MarketingConsentForm />
        </div>
      </div>
    </main>
  )
}

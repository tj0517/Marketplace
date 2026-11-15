import { Navbar } from "@/app/components/navbar"
import { MarketingConsentForm } from '@/app/components/marketing-consent-form'
import { CONSENT_PAGE_COPY } from '@/lib/marketing-consent'

export const metadata = {
  title: 'Zgoda marketingowa | Lekcjo.pl',
  description: CONSENT_PAGE_COPY.heading,
}

export default function MarketingConsentPage() {
  return (
    <main className="min-h-screen bg-slate-50">
      <Navbar />

      <div className="mx-auto max-w-2xl px-4 py-10 sm:px-6 sm:py-16">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-10">
          <header className="mb-8 border-b border-slate-100 pb-6">
            <h1 className="text-2xl font-bold text-slate-900 sm:text-3xl">
              {CONSENT_PAGE_COPY.heading}
            </h1>
            {CONSENT_PAGE_COPY.intro.map((paragraph, i) => (
              <p key={i} className="mt-3 text-slate-600">
                {paragraph}
              </p>
            ))}
          </header>

          <section className="mb-8">
            <h2 className="text-lg font-semibold text-slate-900 sm:text-xl">
              {CONSENT_PAGE_COPY.benefitsHeading}
            </h2>
            <p className="mt-2 text-slate-700">{CONSENT_PAGE_COPY.benefitsLead}</p>

            <ul className="mt-5 space-y-4">
              {CONSENT_PAGE_COPY.places.map((place) => (
                <li key={place.title} className="flex items-start gap-3 text-slate-700">
                  <span className="text-lg leading-6">{place.icon}</span>
                  <span className="leading-6">
                    <strong className="font-semibold text-slate-900">{place.title}</strong> – {place.text}
                  </span>
                </li>
              ))}
            </ul>

            <p className="mt-6 rounded-xl bg-indigo-50 px-4 py-3 font-medium text-indigo-900">
              {CONSENT_PAGE_COPY.summary}
            </p>
          </section>

          <MarketingConsentForm />
        </div>
      </div>
    </main>
  )
}

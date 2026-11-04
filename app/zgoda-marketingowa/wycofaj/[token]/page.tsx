import { Navbar } from "@/app/components/navbar"
import { WithdrawConsentForm } from '@/app/components/withdraw-consent-form'
import { MailX } from 'lucide-react'

export const metadata = {
  title: 'Wycofanie zgody marketingowej | Lekcjo.pl',
  robots: { index: false, follow: false },
}

// GET tylko pokazuje przycisk; zgodę zmienia dopiero POST (decyzja tj 2026-11-04 — skanery linków).
export default async function WithdrawConsentPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params

  return (
    <main className="min-h-screen bg-slate-50">
      <Navbar />

      <div className="mx-auto max-w-md px-4 py-10 sm:px-6 sm:py-16">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
          <div className="mb-6 flex justify-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-slate-100">
              <MailX className="h-7 w-7 text-slate-600" />
            </div>
          </div>

          <div className="mb-8 text-center">
            <h1 className="mb-2 text-xl font-bold text-slate-900 sm:text-2xl">
              Wycofanie zgody marketingowej
            </h1>
            <p className="text-sm text-slate-600 sm:text-base">
              Po wycofaniu nie wyślemy już na Twój adres wiadomości marketingowych. Uprawnienie do podbicia za 1 zł zostaje.
            </p>
          </div>

          <WithdrawConsentForm token={token} />
        </div>
      </div>
    </main>
  )
}

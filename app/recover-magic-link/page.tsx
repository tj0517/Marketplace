import { Navbar } from "@/app/components/navbar"
import { RecoverMagicLinkForm } from '@/app/components/recover-magic-link-form'
import { KeyRound } from 'lucide-react'

export const metadata = {
  title: 'Odzyskaj link zarządzania | Lekcjo.pl',
  description: 'Odzyskaj dostęp do swojego ogłoszenia podając email i numer telefonu.',
}

export default function RecoverMagicLinkPage() {
  return (
    <main className="min-h-screen bg-slate-50">
      <Navbar />

      <div className="mx-auto max-w-md px-4 py-10 sm:px-6 sm:py-16">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
          <div className="mb-6 flex justify-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-indigo-100">
              <KeyRound className="h-7 w-7 text-indigo-600" />
            </div>
          </div>

          <div className="mb-8 text-center">
            <h1 className="mb-2 text-xl font-bold text-slate-900 sm:text-2xl">
              Odzyskaj link zarządzania
            </h1>
            <p className="text-sm text-slate-600 sm:text-base">
              Podaj email i numer telefonu użyty przy tworzeniu ogłoszenia.
            </p>
          </div>

          <RecoverMagicLinkForm />
        </div>

        <p className="mt-6 text-center text-sm text-slate-500">
          Nie pamiętasz danych?{' '}
          <a href="/kontakt" className="text-indigo-600 hover:underline">
            Skontaktuj się z nami
          </a>
        </p>
      </div>
    </main>
  )
}

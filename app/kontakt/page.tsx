import { Navbar } from "@/app/components/navbar"
import { Mail, MessageCircle } from 'lucide-react'

export const metadata = {
  title: 'Kontakt | Lekcjo.pl',
  description: 'Skontaktuj się z zespołem Lekcjo.pl - pomoc i wsparcie.',
}

export default function KontaktPage() {
  return (
    <main className="min-h-screen bg-slate-50">
      <Navbar />

      <div className="mx-auto max-w-lg px-4 py-10 sm:px-6 sm:py-16">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-10">
          <div className="mb-6 flex justify-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-indigo-100">
              <MessageCircle className="h-7 w-7 text-indigo-600" />
            </div>
          </div>

          <div className="mb-8 text-center">
            <h1 className="mb-2 text-xl font-bold text-slate-900 sm:text-2xl">
              Kontakt
            </h1>
            <p className="text-sm text-slate-600 sm:text-base">
              Masz pytania lub potrzebujesz pomocy? Chętnie pomożemy!
            </p>
          </div>

          <div className="space-y-4">
            <a
              href="mailto:kontakt@lekcjo.pl"
              className="flex items-center gap-4 rounded-xl border border-slate-200 bg-slate-50 p-4 transition-colors hover:border-indigo-300 hover:bg-indigo-50"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white shadow-sm">
                <Mail className="h-5 w-5 text-indigo-600" />
              </div>
              <div>
                <p className="font-medium text-slate-900">Email</p>
                <p className="text-sm text-indigo-600">kontakt@lekcjo.pl</p>
              </div>
            </a>
          </div>

          <p className="mt-8 text-center text-sm text-slate-500">
            Odpowiadamy zazwyczaj w ciągu 24 godzin.
          </p>
        </div>

        <nav className="mt-6 flex justify-center gap-6 text-sm text-slate-500">
          <a href="/regulamin" className="hover:text-indigo-600 hover:underline">
            Regulamin
          </a>
          <a href="/polityka-prywatnosci" className="hover:text-indigo-600 hover:underline">
            Polityka prywatności
          </a>
        </nav>
      </div>
    </main>
  )
}

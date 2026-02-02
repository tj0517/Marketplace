import { Navbar } from "@/app/components/navbar"

export const metadata = {
  title: 'Regulamin | Lekcjo.pl',
  description: 'Regulamin serwisu Lekcjo.pl - zasady korzystania z platformy.',
}

export default function RegulaminPage() {
  return (
    <main className="min-h-screen bg-slate-50">
      <Navbar />

      <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 sm:py-16">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-10">
          <header className="mb-8 border-b border-slate-100 pb-6">
            <h1 className="text-2xl font-bold text-slate-900 sm:text-3xl">
              Regulamin serwisu Lekcjo.pl
            </h1>
            <p className="mt-2 text-sm text-slate-500">
              Ostatnia aktualizacja: [DATA]
            </p>
          </header>

          <article className="prose prose-slate prose-headings:text-slate-900 prose-p:text-slate-600 prose-h2:text-lg prose-h2:font-semibold prose-h2:mt-8 prose-h2:mb-3 max-w-none">
            <h2>§1. Postanowienia ogólne</h2>
            <p>[Treść do uzupełnienia przez klienta]</p>

            <h2>§2. Definicje</h2>
            <p>[Treść do uzupełnienia przez klienta]</p>

            <h2>§3. Zasady korzystania z serwisu</h2>
            <p>[Treść do uzupełnienia przez klienta]</p>

            <h2>§4. Dodawanie ogłoszeń</h2>
            <p>[Treść do uzupełnienia przez klienta]</p>

            <h2>§5. Płatności</h2>
            <p>[Treść do uzupełnienia przez klienta]</p>

            <h2>§6. Odpowiedzialność</h2>
            <p>[Treść do uzupełnienia przez klienta]</p>

            <h2>§7. Reklamacje</h2>
            <p>[Treść do uzupełnienia przez klienta]</p>

            <h2>§8. Postanowienia końcowe</h2>
            <p>[Treść do uzupełnienia przez klienta]</p>
          </article>
        </div>

        <nav className="mt-6 flex justify-center gap-6 text-sm text-slate-500">
          <a href="/polityka-prywatnosci" className="hover:text-indigo-600 hover:underline">
            Polityka prywatności
          </a>
          <a href="/kontakt" className="hover:text-indigo-600 hover:underline">
            Kontakt
          </a>
        </nav>
      </div>
    </main>
  )
}

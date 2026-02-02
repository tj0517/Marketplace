import { Navbar } from "@/app/components/navbar"

export const metadata = {
  title: 'Polityka prywatności | Lekcjo.pl',
  description: 'Polityka prywatności serwisu Lekcjo.pl - informacje o przetwarzaniu danych.',
}

export default function PolitykaPrywatnosciPage() {
  return (
    <main className="min-h-screen bg-slate-50">
      <Navbar />

      <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 sm:py-16">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-10">
          <header className="mb-8 border-b border-slate-100 pb-6">
            <h1 className="text-2xl font-bold text-slate-900 sm:text-3xl">
              Polityka prywatności
            </h1>
            <p className="mt-2 text-sm text-slate-500">
              Ostatnia aktualizacja: {new Date().toLocaleDateString('pl-PL')}
            </p>
          </header>

          <article className="prose prose-slate prose-headings:text-slate-900 prose-p:text-slate-600 prose-h2:text-lg prose-h2:font-semibold prose-h2:mt-8 prose-h2:mb-3 max-w-none">
            <h2>1. Administrator danych osobowych</h2>
            <p>[Treść RODO do uzupełnienia przez klienta]</p>

            <h2>2. Cele przetwarzania danych</h2>
            <p>[Treść do uzupełnienia przez klienta]</p>

            <h2>3. Podstawa prawna przetwarzania</h2>
            <p>[Treść do uzupełnienia przez klienta]</p>

            <h2>4. Okres przechowywania danych</h2>
            <p>[Treść do uzupełnienia przez klienta]</p>

            <h2>5. Prawa użytkownika</h2>
            <p>[Treść do uzupełnienia przez klienta]</p>

            <h2>6. Pliki cookies</h2>
            <p>[Treść do uzupełnienia przez klienta]</p>

            <h2>7. Odbiorcy danych</h2>
            <p>[Treść do uzupełnienia przez klienta]</p>

            <h2>8. Kontakt w sprawie danych</h2>
            <p>[Treść do uzupełnienia przez klienta]</p>
          </article>
        </div>

        <nav className="mt-6 flex justify-center gap-6 text-sm text-slate-500">
          <a href="/regulamin" className="hover:text-indigo-600 hover:underline">
            Regulamin
          </a>
          <a href="/kontakt" className="hover:text-indigo-600 hover:underline">
            Kontakt
          </a>
        </nav>
      </div>
    </main>
  )
}

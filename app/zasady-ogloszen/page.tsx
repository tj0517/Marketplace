import { Navbar } from "@/app/components/navbar"

export const metadata = {
  title: 'Zasady działania ogłoszeń | Lekcjo.pl',
  description: 'Zasady działania ogłoszeń w serwisie Lekcjo.pl - jak działa dodawanie, zarządzanie i podbijanie ogłoszeń.',
}

const rules: { icon: string; text: string }[] = [
  { icon: "✅", text: "Dodanie ogłoszenia jest darmowe." },
  { icon: "✅", text: "Ogłoszenia są bezterminowe — nie wygasają automatycznie." },
  { icon: "✅", text: "Nie ma odnawiania ogłoszeń i nie ma abonamentu." },
  { icon: "✅", text: "Jeden numer telefonu = jedno aktywne ogłoszenie typu „Oferuję korepetycje”." },
  { icon: "✅", text: "Zarządzanie ogłoszeniem odbywa się przez magic link wysyłany na e-mail." },
  { icon: "💜", text: "Płatne podbicia zwiększają widoczność ogłoszenia w wynikach wyszukiwania dla pasujących filtrów: przedmiot, lokalizacja, typ ogłoszenia." },
  { icon: "ℹ️", text: "Podbicie nie zmienia treści ogłoszenia i nie gwarantuje konkretnej liczby kontaktów." },
]

export default function ZasadyOgloszenPage() {
  return (
    <main className="min-h-screen bg-slate-50">
      <Navbar />

      <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 sm:py-16">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-10">
          <header className="mb-8 border-b border-slate-100 pb-6">
            <h1 className="text-2xl font-bold text-slate-900 sm:text-3xl">
              Zasady działania ogłoszeń
            </h1>
            <p className="mt-2 text-sm text-slate-500">
              Obowiązuje od: 17.08.2026
            </p>
          </header>

          <ul className="space-y-4">
            {rules.map((rule, i) => (
              <li key={i} className="flex items-start gap-3 text-slate-700">
                <span className="text-lg leading-6">{rule.icon}</span>
                <span className="leading-6">{rule.text}</span>
              </li>
            ))}
          </ul>

          <p className="mt-8 text-sm text-slate-500">
            Pełne warunki korzystania z serwisu znajdziesz w{" "}
            <a href="/regulamin" className="text-indigo-600 hover:underline">
              Regulaminie
            </a>{" "}
            oraz{" "}
            <a href="/polityka-prywatnosci" className="text-indigo-600 hover:underline">
              Polityce prywatności
            </a>.
          </p>
        </div>

        <nav className="mt-6 flex justify-center gap-6 text-sm text-slate-500">
          <a href="/regulamin" className="hover:text-indigo-600 hover:underline">
            Regulamin
          </a>
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

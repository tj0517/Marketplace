import { Navbar } from "@/app/components/navbar"

// Tekst klienta dosłownie (brief w docs/tasks/LK-2.05.md); układ jak /zasady-ogloszen.
export const metadata = {
  title: 'Czym jest podbicie ogłoszenia? | Lekcjo.pl',
  description: 'Podbij ogłoszenie i wyświetlaj się jako pierwszy w 4 kluczowych miejscach Lekcjo.pl!',
}

const places: { icon: string; title: string; text: string }[] = [
  {
    icon: "🏠",
    title: "Na samej górze strony głównej",
    text: "Twoje ogłoszenie zostanie wyświetlone na samej górze strony głównej Lekcjo.pl - w miejscu, które odwiedzający widzą zaraz po wejściu na portal.",
  },
  {
    icon: "📍",
    title: "Na szczycie wyników w Twoim mieście",
    text: "Twoja oferta wskakuje na samą górę w swojej lokalizacji. Osoby szukające korepetytora w Twoim mieście zobaczą ją w pierwszej kolejności.",
  },
  {
    icon: "📚",
    title: "W wynikach dla Twoich przedmiotów i poziomów",
    text: "Pojawiasz się na samym szczycie wyszukiwania dla każdego wskazanego przedmiotu (np. matematyka, angielski, fizyka) oraz poziomu (od szkoły podstawowej i E8, przez liceum i maturę, po studia).",
  },
  {
    icon: "💻",
    title: "Na czele listy korepetycji online",
    text: "Pojawiasz się na szczycie wyników korepetycji online i docierasz do uczniów szukających lekcji zdalnych z całej Polski.",
  },
]

export default function PodbicieOgloszeniaPage() {
  return (
    <main className="min-h-screen bg-slate-50">
      <Navbar />

      <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 sm:py-16">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-10">
          <header className="mb-8 border-b border-slate-100 pb-6">
            <h1 className="text-2xl font-bold text-slate-900 sm:text-3xl">
              🚀 Czym jest podbicie ogłoszenia?
            </h1>
            <p className="mt-3 text-slate-600">
              Podbij ogłoszenie i wyświetlaj się jako pierwszy w 4 kluczowych miejscach Lekcjo.pl!
            </p>
          </header>

          <h2 className="mb-5 text-lg font-semibold text-slate-900 sm:text-xl">
            🎯 Gdzie pojawi się Twoje ogłoszenie?
          </h2>

          <ul className="space-y-5">
            {places.map((place) => (
              <li key={place.title} className="flex items-start gap-3 text-slate-700">
                <span className="text-lg leading-6">{place.icon}</span>
                <div>
                  <p className="font-semibold leading-6 text-slate-900">{place.title}</p>
                  <p className="mt-1 leading-6">{place.text}</p>
                </div>
              </li>
            ))}
          </ul>

          <p className="mt-8 rounded-xl bg-indigo-50 px-4 py-3 font-medium text-indigo-900">
            💡 Jedno podbicie = Twoje ogłoszenie na czele 4 kluczowych miejsc Lekcjo.pl!
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

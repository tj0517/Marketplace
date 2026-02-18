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
              Polityka prywatności serwisu Lekcjo.pl
            </h1>
            <p className="mt-2 text-sm text-slate-500">
              Obowiązuje od: 09.02.2026
            </p>
          </header>

          <article className="prose prose-slate prose-headings:text-slate-900 prose-p:text-slate-600 prose-h2:text-lg prose-h2:font-semibold prose-h2:mt-8 prose-h2:mb-3 prose-h3:text-base prose-h3:font-semibold max-w-none">

            <p>Poniżej wyjaśniamy w prosty sposób, jakie dane zbieramy w serwisie lekcjo.pl, po co je przetwarzamy i jakie masz prawa.</p>

            <h2>1. Kto jest administratorem danych?</h2>
            <p>Administratorem danych osobowych jest:</p>
            <ul>
              <li>RybusOne Bartłomiej Rybus (jednoosobowa działalność gospodarcza)</li>
              <li>Adres: Kolberga 12, 99-300 Kutno, Polska</li>
              <li>NIP: 7752676459</li>
              <li>REGON: 541307739</li>
              <li>Kontakt we wszystkich sprawach (w tym dane osobowe): lekcjo.pl@gmail.com</li>
            </ul>

            <h2>2. Jakie dane przetwarzamy?</h2>
            <p>Zakres danych zależy od tego, jak korzystasz z serwisu.</p>

            <h3>A) Gdy przeglądasz ogłoszenia</h3>
            <p>Możemy przetwarzać dane techniczne, takie jak:</p>
            <ul>
              <li>adres IP, identyfikatory logów,</li>
              <li>typ i ustawienia przeglądarki/urządzenia,</li>
              <li>przybliżone dane o aktywności w serwisie (np. odwiedzane podstrony),</li>
              <li>pliki cookies i podobne technologie (opis poniżej).</li>
            </ul>

            <h3>B) Gdy dodajesz ogłoszenie i zarządzasz nim (bez konta)</h3>
            <p>Przetwarzamy:</p>
            <ul>
              <li>adres e-mail (do wysyłki linku do zarządzania ogłoszeniem – tzw. magic link),</li>
              <li>numer telefonu (jako dane kontaktowe w ogłoszeniu „Oferuję"),</li>
              <li>treść ogłoszenia (np. tytuł, opis, lokalizacja, przedmiot/zakres),</li>
              <li>informacje o działaniu ogłoszenia (np. daty publikacji, widoczności, wygaśnięcia).</li>
            </ul>
            <p>W systemie wykorzystujemy hash numeru telefonu jako identyfikator do zasad publikacji (np. „1 numer = 1 darmowe ogłoszenie"). Hash to forma przekształcenia, która nie jest „czytelną" wersją numeru.</p>

            <h3>C) Gdy korzystasz z opcji płatnych</h3>
            <p>W związku z płatnościami możemy przetwarzać:</p>
            <ul>
              <li>identyfikatory transakcji, kwoty, status płatności,</li>
              <li>informacje potrzebne do rozliczeń (np. potwierdzenia).</li>
            </ul>
            <p>Nie przechowujemy danych do logowania w banku ani danych płatniczych takich jak pełny numer karty.</p>

            <h3>D) Gdy kontaktujesz się z nami</h3>
            <p>Przetwarzamy dane, które podasz w wiadomości (np. e-mail, opis sprawy).</p>

            <h2>3. Po co przetwarzamy dane?</h2>
            <p>Przetwarzamy dane głównie po to, aby serwis działał poprawnie i bezpiecznie:</p>
            <ol>
              <li><strong>Prowadzenie serwisu i umożliwienie publikacji ogłoszeń</strong> (dodanie ogłoszenia, wyświetlanie, wyszukiwanie, filtrowanie).</li>
              <li><strong>Wysyłka wiadomości usługowych</strong> (magic link, potwierdzenia publikacji, przypomnienia o wygaśnięciu, informacje o płatnościach, odpowiedzi na zgłoszenia i reklamacje). Nie wysyłamy newslettera ani marketingu e-mailowego w ramach tej wersji polityki.</li>
              <li><strong>Zasady publikacji i ochrona przed nadużyciami</strong> (np. egzekwowanie reguły „1 numer = 1 darmowe ogłoszenie", ograniczanie spamu).</li>
              <li><strong>Obsługa płatności i rozliczeń</strong> (Przedłużenie i Podbicie ogłoszeń, rozliczenia, księgowość).</li>
              <li><strong>Bezpieczeństwo i dochodzenie/obrona roszczeń</strong> (utrzymanie logów, wykrywanie prób nadużyć, zapewnienie integralności usług).</li>
              <li><strong>Analityka i rozwój serwisu (GA4)</strong> (statystyki i ulepszanie serwisu) – tylko na zasadach opisanych w części o cookies.</li>
            </ol>

            <h2>4. Cookies i Google Analytics (GA4)</h2>
            <p>Serwis wykorzystuje pliki cookies i podobne technologie.</p>
            <p><strong>Rodzaje cookies</strong></p>
            <ul>
              <li><strong>Niezbędne:</strong> potrzebne, aby serwis działał prawidłowo (np. bezpieczeństwo, podstawowe funkcje).</li>
              <li><strong>Analityczne:</strong> pomagają nam zrozumieć, jak użytkownicy korzystają z serwisu (Google Analytics 4).</li>
            </ul>
            <p><strong>Zgoda i ustawienia cookies</strong></p>
            <ul>
              <li>Cookies analityczne (GA4) uruchamiamy po wyrażeniu zgody w banerze/panelu cookies (CMP).</li>
              <li>Zgodę możesz w każdej chwili zmienić lub wycofać w ustawieniach cookies (link w serwisie, np. w stopce).</li>
              <li>Możesz też zarządzać cookies w ustawieniach przeglądarki (pamiętaj, że wyłączenie niezbędnych cookies może wpłynąć na działanie serwisu).</li>
            </ul>

            <h2>5. Z kim możemy dzielić się danymi?</h2>
            <p>Dane mogą być przekazywane wyłącznie w zakresie niezbędnym do działania serwisu:</p>
            <ul>
              <li>dostawcom infrastruktury/hostingu (utrzymanie działania aplikacji),</li>
              <li>dostawcom bazy danych i backendu (np. Supabase),</li>
              <li>operatorowi płatności: Przelewy24 (realizacja transakcji),</li>
              <li>dostawcy wysyłki e-mail (wysyłka magic linków i wiadomości usługowych),</li>
              <li>Google (w ramach GA4 – po wyrażeniu zgody na cookies analityczne),</li>
              <li>biuru księgowemu (jeśli korzystamy) – w zakresie rozliczeń,</li>
              <li>organom publicznym – jeśli obowiązek wynika z przepisów.</li>
            </ul>

            <h2>6. Czy dane są przekazywane poza UE/EOG?</h2>
            <p>W związku z korzystaniem z narzędzi analitycznych (GA4) dane mogą być przetwarzane przez dostawców posiadających infrastrukturę poza UE/EOG. W takich przypadkach stosowane są mechanizmy wymagane przepisami (np. standardowe zabezpieczenia umowne), a analityka działa na podstawie Twojej zgody.</p>

            <h2>7. Jak długo przechowujemy dane?</h2>
            <p>Przechowujemy dane tylko tak długo, jak jest to potrzebne do celów opisanych powyżej:</p>
            <ul>
              <li>dane ogłoszeń i panelu zarządzania: przez czas funkcjonowania ogłoszenia oraz przez okres technicznego archiwum (np. bezpieczeństwo, rozliczenia, przeciwdziałanie nadużyciom),</li>
              <li>dane transakcyjne i księgowe: przez okres wymagany przepisami,</li>
              <li>logi techniczne i bezpieczeństwa: przez okres uzasadniony bezpieczeństwem i ewentualnymi roszczeniami,</li>
              <li>dane analityczne (GA4): zgodnie z ustawieniami retencji w GA4 i do czasu wycofania zgody (w zakresie, w jakim jest to możliwe).</li>
            </ul>
            <p>Jeżeli pojawi się spór lub roszczenie, przechowywanie może zostać wydłużone do czasu zakończenia sprawy.</p>

            <h2>8. Jakie masz prawa?</h2>
            <p>Masz prawo do:</p>
            <ul>
              <li>dostępu do danych,</li>
              <li>sprostowania danych,</li>
              <li>usunięcia danych (gdy nie ma podstaw do dalszego przetwarzania),</li>
              <li>ograniczenia przetwarzania,</li>
              <li>przenoszenia danych (w zakresie przewidzianym prawem),</li>
              <li>sprzeciwu wobec przetwarzania opartego na uzasadnionym interesie,</li>
              <li>wycofania zgody (np. na cookies analityczne),</li>
              <li>złożenia skargi do Prezesa Urzędu Ochrony Danych Osobowych (UODO).</li>
            </ul>
            <p>W sprawach dotyczących danych osobowych napisz do nas: lekcjo.pl@gmail.com.</p>

            <h2>9. Czy musisz podać dane?</h2>
            <ul>
              <li>Podanie e-maila jest dobrowolne, ale konieczne, jeśli chcesz dodać ogłoszenie i zarządzać nim przez magic link.</li>
              <li>Podanie numeru telefonu jest konieczne, jeśli chcesz, aby inni mogli się z Tobą skontaktować w ramach ogłoszenia „Oferuję".</li>
              <li>Dane do faktury podajesz tylko wtedy, gdy chcesz otrzymać fakturę VAT.</li>
            </ul>

            <h2>10. Bezpieczeństwo</h2>
            <p>Stosujemy środki techniczne i organizacyjne adekwatne do skali MVP, aby chronić dane przed nieuprawnionym dostępem, utratą i nadużyciami. Rekomendujemy zabezpieczenie skrzynki e-mail, ponieważ magic link umożliwia dostęp do panelu zarządzania ogłoszeniem.</p>

            <h2>11. Zmiany polityki prywatności</h2>
            <p>Możemy aktualizować tę Politykę prywatności, jeśli zmienimy funkcje serwisu lub wymagania prawne. Aktualna wersja będzie zawsze dostępna w Serwisie wraz z datą obowiązywania.</p>

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
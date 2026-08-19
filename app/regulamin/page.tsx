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
              Obowiązuje od: 17.08.2026
            </p>
          </header>

          <article className="prose prose-slate prose-headings:text-slate-900 prose-p:text-slate-600 prose-h2:text-lg prose-h2:font-semibold prose-h2:mt-8 prose-h2:mb-3 prose-h3:text-base prose-h3:font-semibold max-w-none">

            <h2>§1. Postanowienia ogólne</h2>
            <ol>
              <li>Niniejszy Regulamin określa zasady korzystania z serwisu internetowego lekcjo.pl.</li>
              <li>Usługodawcą jest RybusOne Bartłomiej Rybus, jednoosobowa działalność gospodarcza, Kolberga 12, 99-300 Kutno, Polska, NIP: 7752676459, REGON: 541307739, e-mail: lekcjo.pl@gmail.com.</li>
              <li>Serwis umożliwia zamieszczanie i przeglądanie ogłoszeń związanych z korepetycjami i usługami edukacyjnymi.</li>
              <li>Serwis ma charakter tablicy ogłoszeń. Usługodawca nie jest stroną umów ani ustaleń zawieranych pomiędzy Użytkownikami.</li>
              <li>Korzystanie z Serwisu jest równoznaczne z akceptacją niniejszego Regulaminu w zakresie niezbędnym do korzystania z danej funkcji Serwisu.</li>
              <li>Regulamin jest dostępny nieodpłatnie w Serwisie w sposób umożliwiający jego pobranie, zapisanie i wydruk.</li>
            </ol>

            <h2>§2. Definicje</h2>
            <ol>
              <li><strong>Serwis</strong> – strona internetowa lekcjo.pl wraz ze wszystkimi funkcjonalnościami.</li>
              <li><strong>Usługodawca</strong> – RybusOne Bartłomiej Rybus.</li>
              <li><strong>Użytkownik</strong> – każda osoba korzystająca z Serwisu, w szczególności osoba przeglądająca, dodająca lub zarządzająca Ogłoszeniem.</li>
              <li><strong>Ogłoszeniodawca</strong> – Użytkownik, który dodaje Ogłoszenie w Serwisie lub na którego prośbę Ogłoszenie zostało dodane przez administratora Serwisu.</li>
              <li><strong>Ogłoszenie</strong> – treść zamieszczona w Serwisie, dotycząca korepetycji lub usług edukacyjnych.</li>
              <li><strong>Ogłoszenie „Oferuję"</strong> – Ogłoszenie osoby oferującej korepetycje lub usługi edukacyjne.</li>
              <li><strong>Ogłoszenie „Szukam"</strong> – Ogłoszenie osoby szukającej korepetytora.</li>
              <li><strong>Magic link</strong> – unikalny link wysyłany na e-mail Ogłoszeniodawcy, służący do zarządzania konkretnym Ogłoszeniem bez konieczności rejestracji lub logowania.</li>
              <li><strong>Panel Ogłoszenia</strong> – strona dostępna po wejściu przez magic link, umożliwiająca zarządzanie danym Ogłoszeniem.</li>
              <li><strong>Podbicie</strong> – odpłatna usługa zwiększenia widoczności Ogłoszenia w Serwisie.</li>
            </ol>

            <h2>§3. Rodzaje ogłoszeń i charakter Serwisu</h2>
            <ol>
              <li>Serwis umożliwia zamieszczanie dwóch typów Ogłoszeń:
                <ol type="a">
                  <li><strong>„Oferuję"</strong> – Ogłoszenie korepetytora lub osoby oferującej usługi edukacyjne,</li>
                  <li><strong>„Szukam"</strong> – Ogłoszenie ucznia, rodzica lub innej osoby szukającej korepetycji.</li>
                </ol>
              </li>
              <li>Serwis jest platformą ogłoszeniową. Usługodawca nie organizuje korepetycji, nie pośredniczy w rozliczeniach pomiędzy Użytkownikami i nie odpowiada za realizację ustaleń pomiędzy nimi.</li>
              <li>Usługodawca nie weryfikuje kwalifikacji, tożsamości ani jakości usług oferowanych przez Ogłoszeniodawców.</li>
              <li>Użytkownicy samodzielnie decydują o kontakcie, współpracy i warunkach ewentualnych korepetycji.</li>
            </ol>

            <h2>§4. Zasady dodawania ogłoszeń</h2>
            <ol>
              <li>Dodanie Ogłoszenia w Serwisie jest darmowe i nie wymaga rejestracji ani logowania.</li>
              <li>W celu dodania Ogłoszenia Użytkownik podaje dane wymagane w formularzu, w szczególności adres e-mail, treść Ogłoszenia oraz dane kontaktowe.</li>
              <li>W przypadku Ogłoszeń „Oferuję" wymagany jest numer telefonu.</li>
              <li>Adres e-mail służy do wysłania magic linku i obsługi Ogłoszenia.</li>
              <li>Numer telefonu służy jako dane kontaktowe w Ogłoszeniu oraz jako element ograniczający duplikowanie Ogłoszeń „Oferuję".</li>
              <li>Po dodaniu Ogłoszenia na podany adres e-mail wysyłany jest magic link do zarządzania Ogłoszeniem.</li>
              <li>Ogłoszeniodawca jest odpowiedzialny za treść swojego Ogłoszenia, poprawność podanych danych oraz zgodność Ogłoszenia z prawem i Regulaminem.</li>
            </ol>

            <h2>§5. Ogłoszenia „Oferuję" – model publikacji</h2>
            <ol>
              <li>Ogłoszenia „Oferuję" są publikowane bezpłatnie.</li>
              <li>Jednemu numerowi telefonu może być przypisane jedno aktywne Ogłoszenie typu „Oferuję".</li>
              <li>Adres e-mail nie jest głównym ograniczeniem liczby Ogłoszeń. Ten sam adres e-mail może być używany do obsługi więcej niż jednego Ogłoszenia, jeżeli Ogłoszenia te są przypisane do różnych numerów telefonu.</li>
              <li>Ogłoszenia publikowane są bez określonego terminu zakończenia publikacji.</li>
              <li>Ogłoszenie nie wygasa automatycznie i nie wymaga płatnego odnawiania.</li>
              <li>Ogłoszenie pozostaje widoczne w Serwisie do momentu:
                <ol type="a">
                  <li>usunięcia przez Ogłoszeniodawcę,</li>
                  <li>usunięcia, ukrycia lub zablokowania przez Usługodawcę zgodnie z Regulaminem.</li>
                </ol>
              </li>
              <li>Usługodawca może odmówić publikacji, ukryć lub usunąć kolejne Ogłoszenie przypisane do tego samego numeru telefonu, jeżeli narusza zasadę jednego aktywnego Ogłoszenia „Oferuję" na jeden numer telefonu lub ma charakter duplikatu/spamu.</li>
            </ol>

            <h2>§6. Ogłoszenia „Szukam" – model publikacji</h2>
            <ol>
              <li>Ogłoszenia „Szukam" są publikowane bezpłatnie.</li>
              <li>Ogłoszenia „Szukam" służą opisaniu potrzeby znalezienia korepetytora lub usług edukacyjnych.</li>
              <li>Na etapie MVP Ogłoszenia „Szukam" nie posiadają opcji płatnego podbijania ani dodatkowych form promowania.</li>
              <li>Ogłoszeniodawca może w dowolnym momencie usunąć swoje Ogłoszenie „Szukam" za pomocą magic linku.</li>
              <li>Usługodawca może ograniczyć, ukryć lub usunąć Ogłoszenia „Szukam", jeżeli naruszają Regulamin, są nieaktualne, spamowe lub niezgodne z przeznaczeniem Serwisu.</li>
            </ol>

            <h2>§7. Zarządzanie ogłoszeniem i magic link</h2>
            <ol>
              <li>Do zarządzania Ogłoszeniem służy magic link wysyłany na e-mail Ogłoszeniodawcy.</li>
              <li>Za pośrednictwem Panelu Ogłoszenia Ogłoszeniodawca może:
                <ol type="a">
                  <li>edytować treść Ogłoszenia,</li>
                  <li>usunąć Ogłoszenie,</li>
                  <li>podbić Ogłoszenie, jeżeli dana funkcja jest dostępna dla danego typu Ogłoszenia,</li>
                  <li>ponownie otrzymać link do zarządzania Ogłoszeniem, jeżeli funkcja taka jest dostępna w Serwisie.</li>
                </ol>
              </li>
              <li>W przypadku utraty magic linku Ogłoszeniodawca może odzyskać go za pomocą funkcji dostępnej w Serwisie, w szczególności poprzez podanie danych powiązanych z Ogłoszeniem.</li>
              <li>Bezpieczeństwo magic linku jest odpowiedzialnością Ogłoszeniodawcy. Osoba posiadająca dostęp do magic linku może uzyskać dostęp do Panelu Ogłoszenia.</li>
              <li>Ogłoszeniodawca powinien zabezpieczyć swoją skrzynkę e-mail przed dostępem osób nieuprawnionych.</li>
            </ol>

            <h2>§8. Telefoniczne dodawanie ogłoszeń</h2>
            <ol>
              <li>Usługodawca może umożliwiać dodanie Ogłoszenia przez administratora Serwisu podczas kontaktu telefonicznego z Użytkownikiem.</li>
              <li>Dodanie Ogłoszenia przez administratora odbywa się za zgodą Użytkownika.</li>
              <li>Administrator może wprowadzić, zredagować lub sformatować Ogłoszenie na podstawie informacji przekazanych przez Użytkownika.</li>
              <li>Administrator może przygotować Ogłoszenie również na podstawie informacji lub treści wskazanych przez Użytkownika, w tym treści jego ogłoszenia opublikowanego wcześniej w innym miejscu, pod warunkiem uzyskania zgody Użytkownika na publikację Ogłoszenia w Serwisie.</li>
              <li>Użytkownik odpowiada za poprawność danych przekazanych administratorowi oraz za zgodność treści Ogłoszenia z prawdą.</li>
              <li>Po dodaniu Ogłoszenia Użytkownik otrzymuje magic link umożliwiający samodzielne zarządzanie Ogłoszeniem, jego edycję lub usunięcie.</li>
              <li>Otrzymanie magic linku umożliwia Użytkownikowi sprawdzenie treści Ogłoszenia i wprowadzenie ewentualnych zmian.</li>
            </ol>

            <h2>§9. Usuwanie ogłoszenia</h2>
            <ol>
              <li>Ogłoszeniodawca może w każdej chwili usunąć swoje Ogłoszenie z poziomu Panelu Ogłoszenia.</li>
              <li>Po usunięciu Ogłoszenie przestaje być widoczne publicznie w Serwisie.</li>
              <li>Po usunięciu Ogłoszenia magic link przestaje działać w zakresie zarządzania tym Ogłoszeniem.</li>
              <li>Usunięcie Ogłoszenia ma charakter trwały w zakresie publicznej prezentacji Ogłoszenia w Serwisie.</li>
              <li>Po usunięciu Ogłoszenia nowe Ogłoszenie typu „Oferuję" dla tego samego numeru telefonu będzie można dodać po upływie 14 dni od usunięcia poprzedniego Ogłoszenia.</li>
              <li>Usunięcie Ogłoszenia nie uprawnia do zwrotu opłaty za wykonane Podbicie, chyba że obowiązujące przepisy prawa stanowią inaczej.</li>
              <li>Usługodawca zastrzega sobie prawo do usunięcia, ukrycia lub zablokowania Ogłoszenia naruszającego Regulamin lub prawo.</li>
            </ol>

            <h2>§10. Podbicie ogłoszenia</h2>
            <ol>
              <li>Serwis umożliwia odpłatne Podbicie aktywnego Ogłoszenia „Oferuję".</li>
              <li>Cena jednego Podbicia wynosi 10 PLN brutto, chyba że w Serwisie wskazano inną cenę przed dokonaniem płatności.</li>
              <li>Podbicie polega na zwiększeniu widoczności Ogłoszenia w Serwisie poprzez przesunięcie go wyżej w wynikach wyszukiwania lub na listach Ogłoszeń.</li>
              <li>Ogłoszenia w Serwisie mogą być sortowane w szczególności według daty dodania lub ostatniego Podbicia.</li>
              <li>Po opłaceniu Podbicia Ogłoszenie może zostać wyświetlone wyżej w wynikach dla pasujących filtrów, takich jak przedmiot, lokalizacja lub typ Ogłoszenia.</li>
              <li>Jeżeli Użytkownik wyszukuje inny przedmiot, inną lokalizację lub stosuje inne filtry, Ogłoszenie zostanie wyświetlone zgodnie z mechanizmami działania Serwisu oraz dopasowaniem do wybranych kryteriów.</li>
              <li>Podbicie:
                <ol type="a">
                  <li>może być wykonywane wielokrotnie,</li>
                  <li>nie zmienia treści Ogłoszenia,</li>
                  <li>nie tworzy nowego Ogłoszenia,</li>
                  <li>nie wpływa na zasadę jednego aktywnego Ogłoszenia „Oferuję" na jeden numer telefonu.</li>
                </ol>
              </li>
              <li>Usługa Podbicia jest realizowana niezwłocznie po potwierdzeniu płatności przez operatora płatności, z zastrzeżeniem ewentualnych opóźnień technicznych lub opóźnień po stronie operatora płatności.</li>
            </ol>

            <h2>§11. Płatności i faktury</h2>
            <ol>
              <li>Płatności za usługi odpłatne realizowane są za pośrednictwem operatora płatności udostępnionego w Serwisie, według metod dostępnych w Serwisie.</li>
              <li>Za moment dokonania płatności uznaje się potwierdzenie płatności przez operatora płatności.</li>
              <li>Usługodawca jest podatnikiem VAT i wystawia faktury VAT zgodnie z obowiązującymi przepisami.</li>
              <li>Prośby o wystawienie faktury VAT oraz dane do faktury należy przesyłać na adres: lekcjo.pl@gmail.com.</li>
            </ol>

            <h2>§12. Zasady wyszukiwania i kolejność wyświetlania ogłoszeń</h2>
            <ol>
              <li>Serwis może udostępniać wyszukiwarkę, filtrowanie i sortowanie Ogłoszeń.</li>
              <li>Ogłoszenia prezentowane są według prostych zasad, w szczególności z uwzględnieniem daty dodania Ogłoszenia lub daty ostatniego Podbicia.</li>
              <li>Najwyżej mogą być prezentowane Ogłoszenia najnowsze lub ostatnio podbite.</li>
              <li>Dodatkowe parametry, takie jak dopasowanie treści Ogłoszenia do zapytania, przedmiot, lokalizacja lub typ Ogłoszenia, mogą wpływać na sposób prezentacji wyników.</li>
              <li>Usługodawca może zmieniać sposób wyszukiwania, sortowania i prezentacji Ogłoszeń w ramach rozwoju Serwisu.</li>
            </ol>

            <h2>§13. Kontakt między Użytkownikami</h2>
            <ol>
              <li>Kontakt pomiędzy Użytkownikami odbywa się bezpośrednio poza Serwisem.</li>
              <li>W przypadku Ogłoszeń „Oferuję" kontakt może odbywać się w szczególności telefonicznie lub poprzez SMS.</li>
              <li>Na komputerze Serwis może udostępniać przycisk „Pokaż numer".</li>
              <li>Na urządzeniach mobilnych Serwis może udostępniać przycisk „Zadzwoń / SMS".</li>
              <li>Numer telefonu nie jest domyślnie wyświetlany w treści Ogłoszenia i może zostać udostępniony po kliknięciu odpowiedniego przycisku kontaktowego.</li>
              <li>Usługodawca nie odpowiada za treść, przebieg ani skutki kontaktu pomiędzy Użytkownikami.</li>
            </ol>

            <h2>§14. Zasady treści, moderacja i blokady</h2>
            <ol>
              <li>Zabronione jest publikowanie treści sprzecznych z prawem, dobrymi obyczajami, przeznaczeniem Serwisu lub naruszających prawa osób trzecich.</li>
              <li>Zabronione jest w szczególności zamieszczanie Ogłoszeń lub treści:
                <ol type="a">
                  <li>naruszających prawa autorskie, dobra osobiste lub inne prawa osób trzecich,</li>
                  <li>wprowadzających w błąd,</li>
                  <li>o charakterze spamowym, masowym lub niezwiązanym z korepetycjami lub edukacją,</li>
                  <li>zawierających treści nielegalne lub nawołujące do działań nielegalnych,</li>
                  <li>zawierających dane wrażliwe w rozumieniu przepisów o ochronie danych osobowych,</li>
                  <li>zawierających nieprawdziwe lub nieaktualne informacje,</li>
                  <li>stanowiących duplikat innego Ogłoszenia.</li>
                </ol>
              </li>
              <li>Usługodawca może bez uprzedzenia ukryć, ograniczyć widoczność, zablokować lub usunąć Ogłoszenie, jeżeli:
                <ol type="a">
                  <li>istnieje uzasadnione podejrzenie naruszenia prawa lub Regulaminu,</li>
                  <li>jest to konieczne dla bezpieczeństwa Użytkowników lub Serwisu,</li>
                  <li>Ogłoszenie nosi znamiona spamu, nadużycia lub duplikatu,</li>
                  <li>Ogłoszenie jest nieaktualne lub zawiera błędne dane kontaktowe,</li>
                  <li>Ogłoszenie jest niezgodne z przeznaczeniem Serwisu.</li>
                </ol>
              </li>
              <li>O ile to możliwe i zasadne, Usługodawca może poinformować Ogłoszeniodawcę o podjętej decyzji e-mailem.</li>
            </ol>

            <h2>§15. Zgłaszanie naruszeń</h2>
            <ol>
              <li>Każdy Użytkownik może zgłosić treści nielegalne lub naruszające Regulamin, wysyłając zgłoszenie na adres: lekcjo.pl@gmail.com.</li>
              <li>Zgłoszenie powinno zawierać:
                <ol type="a">
                  <li>link lub identyfikator Ogłoszenia,</li>
                  <li>opis naruszenia,</li>
                  <li>dane kontaktowe zgłaszającego, co najmniej adres e-mail.</li>
                </ol>
              </li>
              <li>Usługodawca rozpatruje zgłoszenie w rozsądnym terminie i może poprosić o uzupełnienie informacji.</li>
            </ol>

            <h2>§16. Reklamacje</h2>
            <ol>
              <li>Użytkownik może złożyć reklamację dotyczącą działania Serwisu lub realizacji usług odpłatnych, w szczególności gdy:
                <ol type="a">
                  <li>Podbicie nie zostało zrealizowane mimo potwierdzonej płatności,</li>
                  <li>Panel Ogłoszenia działa nieprawidłowo,</li>
                  <li>wystąpił inny problem techniczny związany z korzystaniem z Serwisu.</li>
                </ol>
              </li>
              <li>Reklamacje należy składać na adres e-mail: lekcjo.pl@gmail.com.</li>
              <li>Reklamacja powinna zawierać: e-mail użyty w Serwisie, numer telefonu przypisany do Ogłoszenia, opis problemu, datę zdarzenia oraz – jeżeli dotyczy płatności – identyfikator transakcji, kwotę lub metodę płatności.</li>
              <li>Usługodawca udzieli odpowiedzi na reklamację w terminie 14 dni od jej otrzymania.</li>
            </ol>

            <h2>§17. Prawo odstąpienia od umowy</h2>
            <ol>
              <li>Konsument oraz Przedsiębiorca na prawach konsumenta, co do zasady, ma prawo odstąpić od umowy zawartej na odległość w terminie 14 dni bez podawania przyczyny, o ile przepisy przewidują takie uprawnienie dla danej umowy.</li>
              <li>Usługa Podbicia jest wykonywana niezwłocznie po potwierdzeniu płatności.</li>
              <li>Jeżeli Użytkownik będący Konsumentem lub Przedsiębiorcą na prawach konsumenta żąda rozpoczęcia świadczenia usługi przed upływem 14 dni, Serwis może wymagać przed zakupem zaznaczenia zgody potwierdzającej:
                <ol type="a">
                  <li>żądanie rozpoczęcia świadczenia przed upływem terminu na odstąpienie od umowy,</li>
                  <li>przyjęcie do wiadomości, że po wykonaniu usługi może dojść do utraty prawa odstąpienia zgodnie z obowiązującymi przepisami.</li>
                </ol>
              </li>
              <li>Oświadczenie o odstąpieniu, jeżeli prawo odstąpienia przysługuje, należy złożyć na adres: lekcjo.pl@gmail.com.</li>
              <li>W przypadku skutecznego odstąpienia Usługodawca zwraca płatność nie później niż w terminie 14 dni od otrzymania oświadczenia, przy użyciu tej samej metody płatności, o ile to możliwe.</li>
            </ol>

            <h2>§18. Dane osobowe i Polityka prywatności</h2>
            <ol>
              <li>Zasady przetwarzania danych osobowych oraz informacje o plikach cookies opisuje Polityka prywatności dostępna w Serwisie.</li>
              <li>Użytkownik przyjmuje do wiadomości, że dane kontaktowe podane w Ogłoszeniu, w szczególności numer telefonu w Ogłoszeniu „Oferuję", mogą zostać udostępnione innym Użytkownikom w zakresie niezbędnym do umożliwienia kontaktu.</li>
            </ol>

            <h2>§19. Zmiany Regulaminu</h2>
            <ol>
              <li>Usługodawca może zmienić Regulamin z ważnych przyczyn, w szczególności: zmiany przepisów prawa, zmiany techniczne, bezpieczeństwo, wprowadzenie nowych funkcji Serwisu lub zmiana zasad działania usług.</li>
              <li>Zmieniony Regulamin zostanie opublikowany w Serwisie wraz z datą wejścia w życie.</li>
            </ol>

            <h2>§20. Postanowienia końcowe</h2>
            <ol>
              <li>W sprawach nieuregulowanych Regulaminem mają zastosowanie przepisy prawa polskiego.</li>
              <li>Regulamin obowiązuje od dnia wskazanego na początku dokumentu.</li>
            </ol>

            <h2 className="mt-12 pt-6 border-t border-slate-200">Załącznik 1. Wzór oświadczenia o odstąpieniu od umowy</h2>
            <p className="text-sm italic text-slate-500">(Wypełnij i wyślij tylko, jeśli prawo odstąpienia przysługuje w danym przypadku)</p>

            <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 mt-4 text-sm">
              <p><strong>Adresat:</strong> RybusOne Bartłomiej Rybus, Kolberga 12, 99-300 Kutno, Polska, e-mail: lekcjo.pl@gmail.com</p>
              <p className="mt-3">Niniejszym informuję o odstąpieniu od umowy dotyczącej usługi: [Podbicie Ogłoszenia]</p>
              <ul className="mt-3 space-y-1">
                <li>Data zawarcia umowy / zakupu: [data]</li>
                <li>Imię i nazwisko: [ ]</li>
                <li>Adres e-mail użyty w Serwisie: [ ]</li>
                <li>Numer telefonu przypisany do Ogłoszenia: [ ]</li>
                <li>Identyfikator transakcji, jeżeli dotyczy: [ ]</li>
                <li>Data: [ ]</li>
              </ul>
            </div>

          </article>
        </div>

        <nav className="mt-6 flex justify-center gap-6 text-sm text-slate-500">
          <a href="/polityka-prywatnosci" className="hover:text-indigo-600 hover:underline">
            Polityka prywatności
          </a>
          <a href="/zasady-ogloszen" className="hover:text-indigo-600 hover:underline">
            Zasady działania ogłoszeń
          </a>
          <a href="/kontakt" className="hover:text-indigo-600 hover:underline">
            Kontakt
          </a>
        </nav>
      </div>
    </main>
  )
}

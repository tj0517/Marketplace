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
              Obowiązuje od: 09.02.2026
            </p>
          </header>

          <article className="prose prose-slate prose-headings:text-slate-900 prose-p:text-slate-600 prose-h2:text-lg prose-h2:font-semibold prose-h2:mt-8 prose-h2:mb-3 prose-h3:text-base prose-h3:font-semibold max-w-none">

            <h2>§1. Postanowienia ogólne</h2>
            <ol>
              <li>Niniejszy Regulamin określa zasady korzystania z serwisu internetowego lekcjo.pl.</li>
              <li>Usługodawcą jest RybusOne Bartłomiej Rybus (jednoosobowa działalność gospodarcza), Kolberga 12, 99-300 Kutno, Polska, NIP: 7752676459, REGON: 541307739, e-mail: lekcjo.pl@gmail.com.</li>
              <li>Serwis umożliwia zamieszczanie i przeglądanie ogłoszeń związanych z korepetycjami i usługami edukacyjnymi.</li>
              <li>Korzystanie z Serwisu jest równoznaczne z akceptacją niniejszego Regulaminu.</li>
            </ol>

            <h2>§2. Definicje</h2>
            <ol>
              <li><strong>Serwis</strong> – strona internetowa lekcjo.pl wraz ze wszystkimi funkcjonalnościami.</li>
              <li><strong>Usługodawca</strong> – RybusOne Bartłomiej Rybus.</li>
              <li><strong>Użytkownik</strong> – każda osoba korzystająca z Serwisu (przeglądająca lub dodająca ogłoszenia).</li>
              <li><strong>Ogłoszeniodawca</strong> – Użytkownik, który dodaje Ogłoszenie w Serwisie.</li>
              <li><strong>Ogłoszenie</strong> – treść zamieszczona w Serwisie przez Ogłoszeniodawcę, dotycząca korepetycji lub usług edukacyjnych.</li>
              <li><strong>Ogłoszenie „Oferuję"</strong> – Ogłoszenie osoby oferującej korepetycje.</li>
              <li><strong>Ogłoszenie „Szukam"</strong> – Ogłoszenie osoby szukającej korepetytora.</li>
              <li><strong>Magic link</strong> – unikalny link wysyłany na e-mail Ogłoszeniodawcy, służący do zarządzania Ogłoszeniem bez konieczności rejestracji/logowania.</li>
              <li><strong>Panel Ogłoszenia</strong> – strona dostępna po wejściu przez magic link, umożliwiająca zarządzanie danym Ogłoszeniem.</li>
              <li><strong>Okres ważności</strong> – czas, przez który Ogłoszenie (typu „Oferuję") jest aktywne od momentu aktywacji (opłacenia).</li>
              <li><strong>Przedłużenie</strong> – odpłatna usługa wydłużenia Okresu ważności Ogłoszenia „Oferuję".</li>
              <li><strong>Podbicie</strong> – odpłatna usługa odświeżenia widoczności (visible_at) Ogłoszenia „Oferuję".</li>
            </ol>

            <h2>§3. Rodzaje ogłoszeń i charakter serwisu</h2>
            <ol>
              <li>Serwis umożliwia zamieszczanie dwóch typów Ogłoszeń:
                <ol type="a">
                  <li><strong>„Oferuję"</strong> – ogłoszenie korepetytora oferującego usługi edukacyjne,</li>
                  <li><strong>„Szukam"</strong> – ogłoszenie ucznia/rodzica szukającego korepetycji.</li>
                </ol>
              </li>
              <li>Serwis jest platformą ogłoszeniową. Usługodawca nie jest stroną umów między Ogłoszeniodawcami a osobami odpowiadającymi na Ogłoszenia i nie odpowiada za ich realizację.</li>
              <li>Usługodawca nie weryfikuje kwalifikacji, tożsamości ani jakości usług oferowanych przez Ogłoszeniodawców.</li>
            </ol>

            <h2>§4. Zasady dodawania ogłoszeń</h2>
            <ol>
              <li>Dodanie Ogłoszenia nie wymaga rejestracji ani logowania – wystarczy podanie adresu e-mail i danych kontaktowych (numer telefonu dla „Oferuję").</li>
              <li>Po dodaniu Ogłoszenia na podany adres e-mail wysyłany jest magic link do zarządzania Ogłoszeniem (edycja, usuwanie, przedłużenie, podbicie).</li>
              <li>Ogłoszeniodawca jest odpowiedzialny za treść swojego Ogłoszenia i jej zgodność z prawem oraz Regulaminem.</li>
            </ol>

            <h2>§5. Ogłoszenia „Oferuję" – model publikacji</h2>
            <ol>
              <li>Ogłoszeniodawca rejestruje ogłoszenie „Oferuję" podając numer telefonu jako dane kontaktowe.</li>
              <li><strong>Pierwsze Ogłoszenie z danym numerem telefonu:</strong>
                <ol type="a">
                  <li>Ogłoszenie jest aktywowane natychmiast i publikowane bezpłatnie.</li>
                  <li>Okres ważności wynosi 30 dni od aktywacji.</li>
                </ol>
              </li>
              <li><strong>Drugie i kolejne Ogłoszenie z tym samym numerem telefonu:</strong>
                <ol type="a">
                  <li>Ogłoszenie trafia do statusu „nieaktywne" (nieopublikowane).</li>
                  <li>Publikacja wymaga dokonania opłaty aktywacyjnej (10 PLN brutto za 30 dni).</li>
                  <li>Po potwierdzeniu płatności Ogłoszenie jest aktywowane, a Okres ważności rozpoczyna się.</li>
                </ol>
              </li>
              <li>Identyfikatorem numeru telefonu w systemie jest jego hash – system nie przechowuje numeru w postaci jawnej do celów weryfikacji unikalności, ale jako hash (patrz Polityka prywatności).</li>
              <li>Po upływie Okresu ważności Ogłoszenie wygasa i przestaje być widoczne publicznie.</li>
              <li>Ogłoszeniodawca otrzymuje e-mail z przypomnieniem o zbliżającym się wygaśnięciu (domyślnie 3 dni przed) oraz e-mail po wygaśnięciu, z informacją o możliwości przedłużenia.</li>
            </ol>

            <h2>§6. Ogłoszenia „Szukam" – model publikacji</h2>
            <ol>
              <li>Ogłoszenia „Szukam" są publikowane bezpłatnie.</li>
              <li>Nie wymagają numeru telefonu – kontakt odbywa się wyłącznie przez e-mail Ogłoszeniodawcy.</li>
              <li>Ogłoszenia „Szukam" nie mają Okresu ważności i nie wygasają automatycznie.</li>
              <li>Ogłoszeniodawca może w dowolnym momencie usunąć swoje Ogłoszenie „Szukam" za pomocą magic linka.</li>
            </ol>

            <h2>§7. Zarządzanie ogłoszeniem (Panel Ogłoszenia)</h2>
            <ol>
              <li>Do zarządzania Ogłoszeniem służy magic link wysyłany na e-mail Ogłoszeniodawcy.</li>
              <li>Za pośrednictwem Panelu Ogłoszenia, Ogłoszeniodawca może:
                <ol type="a">
                  <li>edytować treść Ogłoszenia,</li>
                  <li>usunąć Ogłoszenie,</li>
                  <li>zlecić Przedłużenie lub Podbicie (dotyczy „Oferuję"),</li>
                  <li>sprawdzić status i datę wygaśnięcia.</li>
                </ol>
              </li>
              <li>W przypadku utraty magic linka Ogłoszeniodawca może odzyskać go za pomocą funkcji „Odzyskaj link zarządzania", podając adres e-mail i numer telefonu powiązany z Ogłoszeniem.</li>
              <li>Bezpieczeństwo magic linka jest odpowiedzialnością Ogłoszeniodawcy.</li>
            </ol>

            <h2>§8. Usuwanie ogłoszenia</h2>
            <ol>
              <li>Ogłoszeniodawca może w każdej chwili usunąć swoje Ogłoszenie z poziomu Panelu Ogłoszenia.</li>
              <li>Po usunięciu Ogłoszenie przestaje być widoczne publicznie.</li>
              <li>Usunięcie Ogłoszenia nie uprawnia do zwrotu opłat za aktywację, Przedłużenie lub Podbicie, chyba że przepisy prawa stanowią inaczej (patrz: Prawo odstąpienia).</li>
              <li>Usługodawca zastrzega sobie prawo do usunięcia lub ukrycia Ogłoszenia naruszającego Regulamin lub prawo (patrz: §12).</li>
            </ol>

            <h2>§9. Usługi odpłatne – Przedłużenie i Podbicie</h2>
            <ol>
              <li>Usługi odpłatne dotyczące Ogłoszeń „Oferuję":
                <ol type="a">
                  <li>Przedłużenie Ogłoszenia – 10 PLN brutto za 30 dni widoczności,</li>
                  <li>Podbicie Ogłoszenia – 10 PLN brutto za jednorazowe podbicie (możliwe wielokrotnie).</li>
                </ol>
              </li>
              <li>Termin realizacji: Przedłużenie i Podbicie są realizowane niezwłocznie po potwierdzeniu płatności przez operatora płatności, z zastrzeżeniem ewentualnych opóźnień po stronie systemów bankowych/operatora.</li>
              <li>Skutki usług:
                <ol type="a">
                  <li>Przedłużenie – wydłuża Okres ważności Ogłoszenia o 30 dni oraz przywraca/ustawia bieżącą widoczność,</li>
                  <li>Podbicie – odświeża widoczność Ogłoszenia i wpływa na jego pozycję w sortowaniu; nie wydłuża Okresu ważności.</li>
                </ol>
              </li>
              <li>Usługodawca nie gwarantuje określonej liczby wyświetleń, kontaktów ani konwersji wynikających z Przedłużenia lub Podbicia; usługi wpływają na parametry widoczności w Serwisie zgodnie z opisem.</li>
            </ol>

            <h2>§10. Płatności i faktury</h2>
            <ol>
              <li>Płatności za usługi odpłatne realizowane są za pośrednictwem operatora płatności udostępnionego w Serwisie (np. Przelewy24/BLIK) według metod dostępnych w Serwisie.</li>
              <li>Za moment dokonania płatności uznaje się potwierdzenie płatności przez operatora płatności.</li>
              <li>Usługodawca jest podatnikiem VAT i wystawia faktury VAT. Prośby o wystawienie faktury VAT oraz dane do faktury należy przesyłać na: lekcjo.pl@gmail.com.</li>
            </ol>

            <h2>§11. Zasady wyszukiwania i plasowania ogłoszeń</h2>
            <ol>
              <li>Serwis może udostępniać wyszukiwarkę i filtrowanie ogłoszeń.</li>
              <li>Domyślna kolejność prezentacji Ogłoszeń może opierać się na kryterium „ostatniej widoczności/odświeżenia" (np. „od najnowszych"). Podbicie/odświeżenie wpływa na pozycję Ogłoszenia w ramach tego kryterium.</li>
              <li>Dodatkowe parametry (np. dopasowanie tekstowe do zapytania, filtry) mogą wpływać na prezentację wyników, jednak Serwis nie zapewnia stałej pozycji Ogłoszenia w wynikach.</li>
            </ol>

            <h2>§12. Zasady treści, moderacja i blokady</h2>
            <ol>
              <li>Zabronione jest publikowanie treści sprzecznych z prawem, dobrymi obyczajami oraz naruszających prawa osób trzecich.</li>
              <li>Zabronione jest w szczególności zamieszczanie Ogłoszeń lub treści:
                <ol type="a">
                  <li>naruszających prawa autorskie, dobra osobiste lub inne prawa osób trzecich,</li>
                  <li>wprowadzających w błąd,</li>
                  <li>o charakterze spamowym, masowym lub niezwiązanym z korepetycjami,</li>
                  <li>zawierających treści nielegalne lub nawołujące do działań nielegalnych,</li>
                  <li>zawierających dane wrażliwe w rozumieniu przepisów o ochronie danych.</li>
                </ol>
              </li>
              <li>Usługodawca może bez uprzedzenia ukryć, zablokować (wyłączyć) lub usunąć Ogłoszenie, jeżeli:
                <ol type="a">
                  <li>istnieje uzasadnione podejrzenie naruszenia prawa lub Regulaminu,</li>
                  <li>jest to konieczne dla bezpieczeństwa Użytkowników lub Serwisu,</li>
                  <li>Ogłoszenie nosi znamiona spamu/nadużycia.</li>
                </ol>
              </li>
              <li>O ile to możliwe i zasadne, Usługodawca może poinformować Ogłoszeniodawcę o podjętej decyzji e-mailem.</li>
            </ol>

            <h2>§13. Zgłaszanie naruszeń</h2>
            <ol>
              <li>Każdy Użytkownik może zgłosić treści nielegalne lub naruszające Regulamin, wysyłając zgłoszenie na adres: lekcjo.pl@gmail.com.</li>
              <li>Zgłoszenie powinno zawierać:
                <ol type="a">
                  <li>link/identyfikator Ogłoszenia,</li>
                  <li>opis naruszenia,</li>
                  <li>dane kontaktowe zgłaszającego (co najmniej e-mail).</li>
                </ol>
              </li>
              <li>Usługodawca rozpatruje zgłoszenie w rozsądnym terminie i może poprosić o uzupełnienie informacji.</li>
            </ol>

            <h2>§14. Reklamacje</h2>
            <ol>
              <li>Użytkownik może złożyć reklamację dotyczącą działania Serwisu lub realizacji usług odpłatnych, w szczególności gdy:
                <ol type="a">
                  <li>Przedłużenie/Podbicie nie zostało zrealizowane mimo potwierdzonej płatności,</li>
                  <li>błędnie naliczono Okres ważności,</li>
                  <li>Panel Ogłoszenia działa nieprawidłowo.</li>
                </ol>
              </li>
              <li>Reklamacje należy składać na adres e-mail: lekcjo.pl@gmail.com.</li>
              <li>Reklamacja powinna zawierać: e-mail użyty w Serwisie, numer telefonu przypisany do Ogłoszenia (jeśli dotyczy), opis problemu, datę zdarzenia oraz – jeśli dotyczy płatności – identyfikator transakcji/kwotę/metodę.</li>
              <li>Usługodawca udzieli odpowiedzi na reklamację w terminie 14 dni od jej otrzymania.</li>
            </ol>

            <h2>§15. Prawo odstąpienia od umowy (Konsumenci)</h2>
            <ol>
              <li>Konsument oraz Przedsiębiorca na prawach konsumenta, co do zasady, ma prawo odstąpić od umowy zawartej na odległość w terminie 14 dni bez podawania przyczyny, o ile przepisy przewidują takie uprawnienie dla danej umowy.</li>
              <li>Usługi Przedłużenia i Podbicia są wykonywane niezwłocznie po potwierdzeniu płatności.</li>
              <li>Jeżeli Użytkownik (Konsument/Przedsiębiorca na prawach konsumenta) żąda rozpoczęcia świadczenia usługi przed upływem 14 dni, Serwis może wymagać przed zakupem zaznaczenia zgody (checkbox) potwierdzającej:
                <ol type="a">
                  <li>żądanie rozpoczęcia świadczenia przed upływem terminu na odstąpienie, oraz</li>
                  <li>przyjęcie do wiadomości, że po wykonaniu usługi może dojść do utraty prawa odstąpienia zgodnie z obowiązującymi przepisami.</li>
                </ol>
              </li>
              <li>Oświadczenie o odstąpieniu (jeżeli przysługuje) należy złożyć na adres: lekcjo.pl@gmail.com.</li>
              <li>W przypadku skutecznego odstąpienia, Usługodawca zwraca płatność nie później niż w terminie 14 dni od otrzymania oświadczenia, przy użyciu tej samej metody płatności, o ile to możliwe.</li>
            </ol>

            <h2>§16. Dane osobowe i Polityka prywatności</h2>
            <ol>
              <li>Zasady przetwarzania danych osobowych oraz informacje o plikach cookies opisuje Polityka prywatności dostępna w Serwisie.</li>
              <li>Użytkownik przyjmuje do wiadomości, że dane kontaktowe podane w Ogłoszeniu (w szczególności numer telefonu w Ogłoszeniu „Oferuję") mogą być publicznie widoczne w zakresie niezbędnym do umożliwienia kontaktu.</li>
            </ol>

            <h2>§17. Zmiany Regulaminu</h2>
            <ol>
              <li>Usługodawca może zmienić Regulamin z ważnych przyczyn, w szczególności: zmiany przepisów prawa, zmiany techniczne, bezpieczeństwo, wprowadzenie nowych funkcji Serwisu lub zmiana zasad działania usług.</li>
              <li>Zmieniony Regulamin zostanie opublikowany w Serwisie wraz z datą wejścia w życie.</li>
            </ol>

            <h2>§18. Postanowienia końcowe</h2>
            <ol>
              <li>W sprawach nieuregulowanych Regulaminem mają zastosowanie przepisy prawa polskiego.</li>
              <li>Regulamin obowiązuje od dnia wskazanego na początku dokumentu.</li>
            </ol>

            <h2 className="mt-12 pt-6 border-t border-slate-200">Załącznik 1. Wzór oświadczenia o odstąpieniu od umowy</h2>
            <p className="text-sm italic text-slate-500">(Wypełnij i wyślij tylko, jeśli prawo odstąpienia przysługuje w danym przypadku)</p>

            <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 mt-4 text-sm">
              <p><strong>Adresat:</strong> RybusOne Bartłomiej Rybus, Kolberga 12, 99-300 Kutno, Polska, e-mail: lekcjo.pl@gmail.com</p>
              <p className="mt-3">Niniejszym informuję o odstąpieniu od umowy dotyczącej usługi: [Przedłużenie / Podbicie]</p>
              <ul className="mt-3 space-y-1">
                <li>Data zawarcia umowy (zakupu): [data]</li>
                <li>Imię i nazwisko: [ ]</li>
                <li>Adres e-mail użyty w Serwisie: [ ]</li>
                <li>Identyfikator transakcji (jeśli dotyczy): [ ]</li>
                <li>Data: [ ]</li>
              </ul>
            </div>

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

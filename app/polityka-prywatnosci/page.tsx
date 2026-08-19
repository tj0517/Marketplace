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
              Obowiązuje od: 17.08.2026
            </p>
          </header>

          <article className="prose prose-slate prose-headings:text-slate-900 prose-p:text-slate-600 prose-h2:text-lg prose-h2:font-semibold prose-h2:mt-8 prose-h2:mb-3 prose-h3:text-base prose-h3:font-semibold max-w-none">

            <p>Poniżej wyjaśniamy w prosty sposób, jakie dane zbieramy w serwisie lekcjo.pl, po co je przetwarzamy i jakie masz prawa.</p>

            <h2>1. Administrator danych</h2>
            <p>Administratorem danych osobowych jest:</p>
            <ul>
              <li>RybusOne Bartłomiej Rybus,</li>
              <li>adres: Kolberga 12, 99-300 Kutno, Polska,</li>
              <li>NIP: 7752676459,</li>
              <li>REGON: 541307739.</li>
            </ul>
            <p>Kontakt we wszystkich sprawach dotyczących danych osobowych: lekcjo.pl@gmail.com</p>

            <h2>2. Jakie dane przetwarzamy?</h2>
            <p>Zakres danych zależy od sposobu korzystania z Serwisu.</p>

            <h3>A) Podczas przeglądania Serwisu</h3>
            <p>Możemy przetwarzać dane techniczne, takie jak:</p>
            <ul>
              <li>adres IP,</li>
              <li>dane przeglądarki i urządzenia,</li>
              <li>informacje o aktywności w Serwisie,</li>
              <li>pliki cookies i podobne technologie.</li>
            </ul>

            <h3>B) Podczas publikacji i zarządzania Ogłoszeniem</h3>
            <p>Możemy przetwarzać:</p>
            <ul>
              <li>adres e-mail,</li>
              <li>numer telefonu,</li>
              <li>treść Ogłoszenia,</li>
              <li>dane dotyczące publikacji i widoczności Ogłoszenia,</li>
              <li>informacje związane z korzystaniem z magic linku,</li>
              <li>informacje o kliknięciach w przyciski kontaktowe, jeżeli taka funkcja jest dostępna w Serwisie.</li>
            </ul>
            <p>Adres e-mail służy przede wszystkim do wysyłki magic linku i obsługi Ogłoszenia.</p>
            <p>Numer telefonu wykorzystywany jest jako dane kontaktowe w Ogłoszeniu oraz w celu ograniczania duplikatów, działań spamowych i realizacji zasady jednego aktywnego Ogłoszenia typu „Oferuję" dla jednego numeru telefonu.</p>

            <h3>C) Podczas telefonicznego dodawania Ogłoszenia</h3>
            <p>Serwis może umożliwiać publikację Ogłoszenia przez administratora podczas rozmowy telefonicznej z Użytkownikiem.</p>
            <p>W takim przypadku możemy przetwarzać dane przekazane przez Użytkownika podczas rozmowy, w szczególności:</p>
            <ul>
              <li>imię lub nazwę używaną w Ogłoszeniu,</li>
              <li>adres e-mail,</li>
              <li>numer telefonu,</li>
              <li>lokalizację,</li>
              <li>przedmiot lub zakres korepetycji,</li>
              <li>cenę,</li>
              <li>treść Ogłoszenia,</li>
              <li>inne informacje potrzebne do przygotowania Ogłoszenia.</li>
            </ul>
            <p>Administrator może przygotować Ogłoszenie również na podstawie informacji lub treści wskazanych przez Użytkownika, w tym treści jego ogłoszenia opublikowanego wcześniej w innym miejscu, pod warunkiem uzyskania zgody Użytkownika na publikację Ogłoszenia w Serwisie.</p>
            <p>Po publikacji Użytkownik otrzymuje magic link umożliwiający samodzielne zarządzanie Ogłoszeniem, jego edycję lub usunięcie.</p>

            <h3>D) Podczas korzystania z usług odpłatnych</h3>
            <p>W przypadku korzystania z płatnych Podbić możemy przetwarzać:</p>
            <ul>
              <li>identyfikatory transakcji,</li>
              <li>kwoty i statusy płatności,</li>
              <li>dane wymagane do rozliczeń i wystawienia faktury.</li>
            </ul>
            <p>Nie przechowujemy danych logowania do bankowości ani pełnych danych kart płatniczych.</p>

            <h3>E) Podczas kontaktu z nami</h3>
            <p>Możemy przetwarzać dane podane w wiadomości, w szczególności:</p>
            <ul>
              <li>adres e-mail,</li>
              <li>numer telefonu,</li>
              <li>treść wiadomości,</li>
              <li>dane potrzebne do obsługi sprawy, zgłoszenia lub reklamacji.</li>
            </ul>

            <h2>3. Skąd mamy dane?</h2>
            <p>Dane otrzymujemy przede wszystkim bezpośrednio od Użytkownika, w szczególności podczas:</p>
            <ul>
              <li>dodawania Ogłoszenia,</li>
              <li>zarządzania Ogłoszeniem,</li>
              <li>kontaktu telefonicznego,</li>
              <li>kontaktu e-mailowego,</li>
              <li>korzystania z usług odpłatnych.</li>
            </ul>
            <p>W przypadku telefonicznego dodawania Ogłoszeń dane mogą pochodzić również z informacji lub treści wskazanych przez Użytkownika, w tym z jego ogłoszenia opublikowanego wcześniej w innym miejscu.</p>
            <p>Publikacja Ogłoszenia w Serwisie następuje za zgodą Użytkownika.</p>

            <h2>4. Cele i podstawy przetwarzania danych</h2>
            <p>Dane przetwarzamy w następujących celach:</p>

            <h3>A) Prowadzenie i obsługa Serwisu</h3>
            <p>Przetwarzamy dane, aby Serwis mógł działać prawidłowo, w tym aby umożliwiać przeglądanie, publikowanie i wyszukiwanie Ogłoszeń.</p>
            <p>Podstawą przetwarzania jest konieczność świadczenia usługi drogą elektroniczną oraz nasz uzasadniony interes polegający na prowadzeniu i rozwijaniu Serwisu.</p>

            <h3>B) Publikacja i zarządzanie Ogłoszeniami</h3>
            <p>Przetwarzamy dane w celu dodania Ogłoszenia, wysyłki magic linku, edycji Ogłoszenia, usunięcia Ogłoszenia oraz obsługi Panelu Ogłoszenia.</p>
            <p>Podstawą przetwarzania jest wykonanie usługi lub podjęcie działań na żądanie Użytkownika.</p>

            <h3>C) Telefoniczne dodawanie Ogłoszeń</h3>
            <p>Przetwarzamy dane w celu przygotowania i opublikowania Ogłoszenia przez administratora Serwisu, jeżeli Użytkownik wyrazi na to zgodę.</p>
            <p>Podstawą przetwarzania jest zgoda Użytkownika oraz wykonanie usługi polegającej na publikacji Ogłoszenia.</p>

            <h3>D) Kontakt pomiędzy Użytkownikami</h3>
            <p>Przetwarzamy numer telefonu oraz dane zawarte w Ogłoszeniu, aby umożliwić kontakt pomiędzy osobami oferującymi korepetycje a osobami ich szukającymi.</p>
            <p>Podstawą przetwarzania jest wykonanie usługi publikacji Ogłoszenia oraz uzasadniony interes Użytkowników polegający na możliwości nawiązania kontaktu w sprawie korepetycji.</p>

            <h3>E) Ograniczanie duplikatów i nadużyć</h3>
            <p>Przetwarzamy dane, w tym numer telefonu, w celu ograniczania duplikatów, działań spamowych i nadużyć oraz realizacji zasady jednego aktywnego Ogłoszenia typu „Oferuję" dla jednego numeru telefonu.</p>
            <p>Podstawą przetwarzania jest nasz uzasadniony interes polegający na zapewnieniu porządku, bezpieczeństwa i prawidłowego działania Serwisu.</p>

            <h3>F) Obsługa płatności i rozliczeń</h3>
            <p>Przetwarzamy dane dotyczące płatnych Podbić, transakcji i faktur w celu obsługi płatności, rozliczeń oraz obowiązków księgowych i podatkowych.</p>
            <p>Podstawą przetwarzania jest wykonanie umowy, obowiązki prawne oraz nasz uzasadniony interes związany z dokumentowaniem transakcji.</p>

            <h3>G) Reklamacje, zgłoszenia i kontakt</h3>
            <p>Przetwarzamy dane w celu odpowiedzi na wiadomości, obsługi reklamacji, zgłoszeń naruszeń oraz innych spraw kierowanych do Serwisu.</p>
            <p>Podstawą przetwarzania jest nasz uzasadniony interes oraz, w niektórych przypadkach, obowiązki wynikające z przepisów prawa.</p>

            <h3>H) Bezpieczeństwo Serwisu</h3>
            <p>Przetwarzamy dane techniczne i logi w celu zapewnienia bezpieczeństwa Serwisu, wykrywania błędów, nadużyć i prób nieuprawnionego dostępu.</p>
            <p>Podstawą przetwarzania jest nasz uzasadniony interes polegający na ochronie Serwisu i Użytkowników.</p>

            <h3>I) Analityka i rozwój Serwisu</h3>
            <p>Możemy przetwarzać dane analityczne w celu sprawdzania, jak działa Serwis, które funkcje są używane i jak możemy ulepszać Serwis.</p>
            <p>Jeżeli korzystamy z narzędzi analitycznych wymagających zgody, dane są przetwarzane po wyrażeniu zgody przez Użytkownika.</p>

            <h2>5. Cookies i analityka</h2>
            <p>Serwis wykorzystuje pliki cookies i podobne technologie.</p>
            <p>Cookies mogą być wykorzystywane w celu:</p>
            <ul>
              <li>prawidłowego działania Serwisu,</li>
              <li>zapewnienia bezpieczeństwa,</li>
              <li>zapamiętania podstawowych ustawień,</li>
              <li>analityki ruchu,</li>
              <li>ulepszania działania Serwisu.</li>
            </ul>
            <p>Serwis może korzystać z narzędzi analitycznych, takich jak Google Analytics.</p>
            <p>Cookies niezbędne mogą być wykorzystywane w celu zapewnienia prawidłowego działania Serwisu.</p>
            <p>Cookies analityczne są wykorzystywane zgodnie z ustawieniami cookies dostępnymi w Serwisie, jeżeli taka zgoda jest wymagana.</p>
            <p>Użytkownik może zarządzać cookies poprzez ustawienia swojej przeglądarki lub ustawienia dostępne w Serwisie.</p>

            <h2>6. Komu mogą być przekazywane dane?</h2>
            <p>Dane mogą być przekazywane podmiotom wspierającym działanie Serwisu, w szczególności:</p>
            <ul>
              <li>dostawcom hostingu i infrastruktury,</li>
              <li>dostawcom systemów baz danych i backendu,</li>
              <li>operatorom płatności,</li>
              <li>dostawcom usług e-mail,</li>
              <li>dostawcom narzędzi analitycznych,</li>
              <li>podmiotom księgowym,</li>
              <li>dostawcom usług technicznych wspierających działanie Serwisu.</li>
            </ul>
            <p>Dane mogą zostać udostępnione również organom publicznym, jeżeli obowiązek taki wynika z przepisów prawa.</p>

            <h2>7. Przekazywanie danych poza EOG</h2>
            <p>W związku z korzystaniem z niektórych narzędzi technologicznych lub analitycznych dane mogą być przetwarzane poza Europejskim Obszarem Gospodarczym.</p>
            <p>W takich przypadkach stosowane są mechanizmy wymagane przez obowiązujące przepisy prawa, w szczególności odpowiednie zabezpieczenia umowne stosowane przez dostawców usług.</p>

            <h2>8. Jak długo przechowujemy dane?</h2>
            <p>Dane przechowujemy przez okres niezbędny do realizacji celów opisanych w niniejszej Polityce Prywatności.</p>
            <p>W szczególności:</p>
            <ul>
              <li>dane Ogłoszenia przechowujemy przez czas jego publikacji w Serwisie,</li>
              <li>po usunięciu Ogłoszenia część danych może być przechowywana przez czas potrzebny do obsługi technicznej, bezpieczeństwa, reklamacji, rozliczeń lub przeciwdziałania nadużyciom,</li>
              <li>dane dotyczące numeru telefonu mogą być przechowywane przez czas potrzebny do realizacji zasady jednego aktywnego Ogłoszenia typu „Oferuję" dla jednego numeru telefonu oraz 14-dniowej blokady ponownej publikacji po usunięciu Ogłoszenia,</li>
              <li>dane transakcyjne i księgowe przechowujemy przez okres wymagany przepisami prawa,</li>
              <li>dane związane z reklamacjami i zgłoszeniami przechowujemy przez okres potrzebny do obsługi sprawy oraz ewentualnej obrony lub dochodzenia roszczeń,</li>
              <li>dane techniczne i logi przechowujemy przez okres uzasadniony bezpieczeństwem Serwisu i ochroną przed nadużyciami,</li>
              <li>dane analityczne przechowujemy zgodnie z ustawieniami narzędzi analitycznych i ustawieniami zgód cookies.</li>
            </ul>
            <p>Jeżeli pojawi się spór, reklamacja, zgłoszenie naruszenia lub roszczenie, dane mogą być przechowywane dłużej, do czasu zakończenia sprawy.</p>

            <h2>9. Prawa Użytkownika</h2>
            <p>Użytkownik ma prawo do:</p>
            <ul>
              <li>dostępu do swoich danych,</li>
              <li>sprostowania danych,</li>
              <li>usunięcia danych,</li>
              <li>ograniczenia przetwarzania,</li>
              <li>przenoszenia danych,</li>
              <li>wniesienia sprzeciwu wobec przetwarzania,</li>
              <li>cofnięcia zgody, jeżeli przetwarzanie odbywa się na podstawie zgody,</li>
              <li>wniesienia skargi do Prezesa Urzędu Ochrony Danych Osobowych.</li>
            </ul>
            <p>Kontakt w sprawach dotyczących danych: lekcjo.pl@gmail.com</p>

            <h2>10. Czy podanie danych jest obowiązkowe?</h2>
            <p>Podanie danych jest dobrowolne, jednak może być niezbędne do korzystania z określonych funkcji Serwisu.</p>
            <p>W szczególności:</p>
            <ul>
              <li>podanie adresu e-mail jest potrzebne do publikacji Ogłoszenia i otrzymania magic linku,</li>
              <li>podanie numeru telefonu jest potrzebne do publikacji Ogłoszenia typu „Oferuję" i umożliwienia kontaktu,</li>
              <li>podanie treści Ogłoszenia jest potrzebne do jego publikacji,</li>
              <li>podanie danych do płatności jest potrzebne do skorzystania z płatnego Podbicia,</li>
              <li>podanie danych do faktury jest potrzebne, jeżeli Użytkownik chce otrzymać fakturę VAT.</li>
            </ul>
            <p>Brak podania danych może uniemożliwić skorzystanie z wybranych funkcji Serwisu.</p>

            <h2>11. Publiczna widoczność danych kontaktowych</h2>
            <p>Dane podane w Ogłoszeniu mogą być widoczne dla innych Użytkowników w zakresie potrzebnym do korzystania z Serwisu.</p>
            <p>W przypadku Ogłoszeń typu „Oferuję" numer telefonu może zostać udostępniony innym Użytkownikom po kliknięciu przycisku kontaktowego, takiego jak „Pokaż numer" lub „Zadzwoń / SMS".</p>
            <p>Użytkownik publikujący Ogłoszenie przyjmuje do wiadomości, że dane kontaktowe podane w Ogłoszeniu służą umożliwieniu kontaktu w sprawie korepetycji.</p>

            <h2>12. Bezpieczeństwo danych</h2>
            <p>Stosujemy środki techniczne i organizacyjne odpowiednie do charakteru Serwisu oraz skali MVP w celu ochrony danych przed utratą, nieuprawnionym dostępem lub nadużyciami.</p>
            <p>Użytkownik powinien odpowiednio zabezpieczyć swoją skrzynkę e-mail, ponieważ magic link umożliwia dostęp do zarządzania Ogłoszeniem.</p>
            <p>W przypadku podejrzenia nieuprawnionego dostępu do magic linku lub Ogłoszenia Użytkownik powinien skontaktować się z nami pod adresem: lekcjo.pl@gmail.com</p>

            <h2>13. Zmiany Polityki Prywatności</h2>
            <p>Polityka Prywatności może być aktualizowana w przypadku:</p>
            <ul>
              <li>zmian przepisów prawa,</li>
              <li>zmian technicznych,</li>
              <li>rozwoju Serwisu,</li>
              <li>zmian funkcjonalności Serwisu,</li>
              <li>zmian w zakresie wykorzystywanych narzędzi lub dostawców usług.</li>
            </ul>
            <p>Aktualna wersja dokumentu będzie zawsze dostępna w Serwisie wraz z datą obowiązywania.</p>

          </article>
        </div>

        <nav className="mt-6 flex justify-center gap-6 text-sm text-slate-500">
          <a href="/regulamin" className="hover:text-indigo-600 hover:underline">
            Regulamin
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

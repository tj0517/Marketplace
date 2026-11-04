---
id: LK-2.01
title: Zgody marketingowe i uprawnienie do podbicia za 1 zł
status: in_progress
difficulty: L
model: opus
model_approved: null
effort: high
branch: feat/lk-2.01-marketing-consent
due: null
depends_on: [LK-1.02, LK-1.04]
blocked_by_questions: []
touches_db: true
touches_prod: true
pr: null
---

## Cel

Lekcjo zbiera zgody marketingowe, żeby móc wysyłać newsletter, i nagradza zapis jednorazowym
podbiciem ogłoszenia za 1 zł. Zgodę można dać w formularzu dodawania ogłoszenia albo na nowej
stronie `/zgoda-marketingowa` (dla obecnych ogłoszeń). Sukces: każda zgoda jest zapisana z pełnym
śladem (adres, status, data, źródło, wersja treści), adres dostaje najwyżej jedno uprawnienie do
promocji, osobny mail marketingowy wychodzi z konfigurowalnego nadawcy, a link w mailu wycofuje
zgodę. Samo naliczanie 1 zł i płatność to LK-2.02.

## Zakres

- [ ] odczyt stanu: `actions/user/create-offer.ts` (zapis i mail z magic linkiem), `actions/emails.ts` i `emails/`, `lib/config.ts` (`EMAIL_CONFIG`), `lib/rate-limit.ts`, `app/offers/manage/[token]/page.tsx`; schemat `ads` i polityki z baseline (LK-1.02)
- [ ] migracja: tabela zgód (e-mail, status `active`/`withdrawn`, data udzielenia, data wycofania, źródło `form`/`consent_page`, wersja treści, losowy token wycofania) i tabela uprawnień do promocji (e-mail unikalny, status `granted`/`reserved`/`used`, daty); RLS włączone w tej samej migracji, dostęp tylko po stronie serwera, jak reszta aplikacji
- [ ] treść zgody i jej wersja jako jedna stała w kodzie (na razie placeholder, O-04)
- [ ] formularz dodawania: dobrowolny checkbox, domyślnie odznaczony; po zaznaczeniu zapis zgody (źródło „formularz”), przyznanie uprawnienia (O-05) i **osobny** mail marketingowy, niezależny od maila z magic linkiem (błąd jednego nie blokuje drugiego ani dodania ogłoszenia)
- [ ] strona `/zgoda-marketingowa`: pole e-mail, obowiązkowy checkbox, przycisk „Zapisuję się i odbieram podbicie za 1 zł”, nagłówek i opis z briefu (dosłownie); adres z ogłoszeniem → zgoda (źródło „strona zgody”), uprawnienie, mail; adres bez ogłoszenia → „nie znaleziono ogłoszenia powiązanego z tym adresem”; limit zapytań z `lib/rate-limit.ts`; walidacja wejścia zod po stronie serwera
- [ ] adres, który ma już uprawnienie (w dowolnym statusie), nie dostaje drugiego; przyznanie atomowe w bazie (unikalność), nie „sprawdź, potem wstaw”
- [ ] mail marketingowy (nowy szablon w `emails/`, wzór jak istniejące): informacja o promocji i jak z niej skorzystać (strona zarządzania → podbicie), link wycofania zgody; nadawca z nowej zmiennej (np. `RESEND_MARKETING_FROM_EMAIL`) w `EMAIL_CONFIG`, osobnej od transakcyjnej
- [ ] wycofanie: link z tokenem → status `withdrawn` i data wycofania; uprawnienie zostaje (O-06); strona potwierdzenia
- [ ] baner z linkiem do `/zgoda-marketingowa` na stronie zarządzania ogłoszeniem
- [ ] nowe zmienne w `.env.example` (jeśli istnieje po LK-1.04) albo w README

## Gotowe, gdy

- migracja tworzy obie tabele z RLS i działa na lokalnej bazie — **jak sprawdzić:** `supabase db reset` i wklejony SELECT z `pg_tables` (`rowsecurity = true`) dla obu tabel; red proof: zapytanie kluczem anon do obu tabel zwraca odmowę albo zero wierszy (wynik w raporcie)
- formularz: checkbox domyślnie odznaczony; z zaznaczonym powstaje wiersz zgody ze wszystkimi polami i uprawnienie `granted`, bez zaznaczenia nic nie powstaje — **jak sprawdzić:** zrzut Playwright formularza i dwa wklejone SELECT-y z lokalnej bazy po obu wariantach
- wychodzą dwa niezależne maile z różnych nadawców — **jak sprawdzić:** wycinek logu albo podgląd wywołań Resend w trybie testowym (dwa wywołania, dwa `from`); test z celowo nieudanym mailem marketingowym pokazuje, że ogłoszenie i mail z magic linkiem powstają mimo to
- strona zgody: oba przypadki z briefu dają właściwy wynik, a checkbox jest wymagany także po stronie serwera — **jak sprawdzić:** zrzuty obu przypadków; red proof: wysłanie formularza z pominiętym checkboxem (bezpośrednie wywołanie akcji) jest odrzucone
- red proof jednego uprawnienia: drugi zapis tego samego adresu (także dwa równoczesne wywołania) nie tworzy drugiego uprawnienia — **jak sprawdzić:** skrypt z dwoma równoczesnymi wywołaniami i wklejony `select email, count(*) from <uprawnienia> group by email having count(*) > 1` = pusty
- wycofanie działa, a zły token nic nie zmienia — **jak sprawdzić:** wklejony wiersz zgody przed i po wejściu w link (status, data); red proof: losowy token → brak zmiany

## Poza zakresem

- naliczanie 1 zł, rezerwacja, webhook P24 → LK-2.02
- kolumna „zgoda” w panelu admina → LK-2.03
- panel zgód w adminie, wysyłki masowe, listy Resend, nagłówek `List-Unsubscribe` → etap 2 klienta
- potwierdzanie adresu linkiem (double opt-in) → świadomie poza briefem
- usunięcie martwej akcji `promoteAd` → deferred

## Bramki STOP

- przed wdrożeniem migracji na prod: pokaż plik i wynik lokalnego `db reset`; **wdraża tj**
- dodanie zmiennej nadawcy marketingowego w Vercelu → tj (DNS subdomeny też po stronie tj)
- merge na `main` dopiero, gdy LK-2.02 jest gotowe do wdrożenia: mail obiecuje promocję, która działa dopiero po LK-2.02 i włączeniu `PROMOTIONS_ENABLED`
- wdrożenie na prod z treścią zgody nadal jako placeholder (O-04) → nie, bez zgody tj
- maile testowe tylko na adresy testowe (np. `@seed.test` lub skrzynka tj), nigdy na adresy z prod

## Kontekst

- `actions/user/create-offer.ts` — zapis ogłoszenia i mail z magic linkiem
- `actions/emails.ts`, `emails/welcome-email.tsx` — wzorzec wysyłki i szablonu
- `lib/config.ts` — `EMAIL_CONFIG`
- `lib/rate-limit.ts` — istniejący limit zapytań
- `app/components/add-offer-form.tsx` — formularz
- `app/offers/manage/[token]/page.tsx` — miejsce banera
- `supabase/migrations/*_baseline.sql` — schemat (LK-1.02)
- `docs/04-open-questions.md` — O-04, O-05, O-06

## Notatki z realizacji

- 2026-11-02 tj: zgoda z formularza też przyznaje uprawnienie (O-05); wycofanie zgody nie odbiera uprawnienia (O-06).
- 2026-11-02 tj: strona zgody bez potwierdzania adresu i z komunikatem „nie znaleziono…” zgodnie z briefem klienta; skutki (zapis cudzego adresu, sprawdzanie, czy adres ma ogłoszenie) przedstawione w wf-plan.
- 2026-11-04 tj: brak briefu z nagłówkiem i opisem strony /zgoda-marketingowa — tekst proponuje agent, tj zatwierdza w review; do tego czasu bez wdrożenia na prod.
- 2026-11-04 tj: link wycofania (decyzja 1, wariant B) otwiera stronę z przyciskiem „Wycofaj zgodę”; status `withdrawn` zmienia dopiero POST przycisku (server action), nigdy GET. Red proof: zwykły GET linku (jak skaner poczty) nie zmienia wiersza zgody.
- 2026-11-04 tj: ponowny zapis adresu z aktywną zgodą (decyzja 2, wariant A): bez nowego wiersza zgody i bez maila, użytkownik widzi zwykły komunikat sukcesu; w bazie częściowy indeks unikalny (najwyżej jedna zgoda `active` na znormalizowany adres). Po wycofaniu nowy zapis działa: nowy wiersz `active` + mail, ale bez drugiego uprawnienia.
- 2026-11-04 tj: „ogłoszenie powiązane z adresem” na stronie zgody (decyzja 3) = status `active` lub `expired`; `banned`, `archived`, `inactive`, `deleted` się nie liczą. Porównanie adresu bez rozróżniania wielkości liter.
- 2026-11-04 agent: naruszenie reguły O-03 — lokalny stack wystartował (`pnpm db:start`) przy `kern.memorystatus_vm_pressure_level` = 2 (sprawdzenie i start w jednym poleceniu bez przerwania). Po starcie poziom 1. Od tej pory sprawdzenie osobnym poleceniem przed każdym krokiem; przy wartości ≠ 1 pauza i raport do tj, bez restartów.

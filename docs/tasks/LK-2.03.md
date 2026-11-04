---
id: LK-2.03
title: Przedmioty i poziomy w formularzach, wyszukiwarka, kolumny w panelu admina
status: in_progress
difficulty: M
model: opus
model_approved: 2026-11-04 tj
effort: high
branch: feat/lk-2.03-subjects-search-admin
due: null
depends_on: [LK-1.01, LK-2.01]
blocked_by_questions: []
touches_db: false
touches_prod: false
pr: null
---

## Cel

Ogłoszeniodawcy mogą wybrać „Język polski” i nowe poziomy (E8, matura podstawowa i rozszerzona),
uczniowie znajdują ogłoszenia po przedmiocie, poziomie i mieście zamiast po słowach z opisu, a
admin widzi w liście ogłoszeń telefon, datę z godziną i status zgody marketingowej. Sukces:
typowe zapytania dają trafne wyniki, a stare ogłoszenia działają bez migracji.

## Zakres

- [ ] odczyt stanu: `app/components/add-offer-form.tsx`, `app/components/edit-ad-form.tsx` (zduplikowane listy), `lib/search.ts`, `lib/search.test.ts`, `actions/public/ads.ts`, `app/components/heroSearchSection.tsx`, `app/page.tsx`, `actions/admin/ads.ts`, `app/admin/page.tsx`
- [ ] jedna wspólna lista przedmiotów i poziomów dla formularza dodawania i edycji
- [ ] „Język polski” na trzeciej pozycji listy przedmiotów
- [ ] poziomy: „E8”, „Matura podstawowa”, „Matura rozszerzona”; stare ogłoszenia bez migracji
- [ ] wyszukiwarka: pole tekstowe zostaje, ale dopasowuje się tylko do przedmiotu, poziomu i miasta (bez opisu i tytułu); do tego listy wyboru „Przedmiot” i „Poziom”; kryteria łączą się (AND); miasto jako osobne kryterium; parametry w URL; przyciski „Popularne” i stare linki `?query=` nadal działają
- [ ] panel admina: kolumny telefon, data i godzina dodania, zgoda TAK/NIE (aktywna zgoda dla e-maila ogłoszenia, z tabeli z LK-2.01)

## Gotowe, gdy

- „Język polski” jest trzeci w obu formularzach, a nowe poziomy są do wyboru — **jak sprawdzić:** zrzuty Playwright obu formularzy (desktop i mobile)
- stare ogłoszenie z przedmiotem spoza listy albo bez nowych poziomów wyświetla się i daje edytować bez utraty danych — **jak sprawdzić:** na lokalnej bazie ogłoszenie z „Muzyka” i „Liceum / Technikum”; zrzut strony ogłoszenia i wklejony wiersz po zapisie edycji bez zmian
- wyszukiwarka nie dopasowuje opisu — **jak sprawdzić:** test w `lib/search.test.ts`: ogłoszenie z „matematyka” tylko w opisie nie pasuje do zapytania „matematyka”
- trafne wyniki dla zapytań z briefu — **jak sprawdzić:** testy w `lib/search.test.ts` dla: matematyka + matura rozszerzona, matematyka + Lublin, język polski (z polskimi znakami i bez); wynik `pnpm test:unit`
- listy wyboru łączą się z polem i miastem, a URL odtwarza wyszukiwanie — **jak sprawdzić:** zrzut wyników dla przedmiot = Matematyka, poziom = Matura rozszerzona, miasto = Lublin i ten sam URL otwarty ponownie
- panel admina pokazuje trzy nowe kolumny, a „zgoda” zgadza się z bazą — **jak sprawdzić:** zrzut `/admin` na lokalnej bazie i wklejony SELECT zgód dla dwóch widocznych adresów (jeden TAK, jeden NIE)

## Poza zakresem

- migracja starych ogłoszeń na nowe poziomy lub przedmioty → świadomie nie (brief)
- usuwanie „Muzyki” lub „Informatyki” z bazy albo ze starych ogłoszeń → nigdy; z formularza tylko po decyzji (bramka)
- wyszukiwanie pełnotekstowe w bazie (`searchAdsNative`, `fts`) → bez zmian
- zmiany SEO (slugi, landing pages) → etap 2 klienta
- panel zgód w adminie → etap 2 klienta

## Bramki STOP

- jeśli „Język polski” nie mieści się w układzie: zrzut i pytanie do tj, czy usunąć z formularza „Muzykę”, czy „Informatykę”; agent nie wybiera sam
- `pnpm build` tylko przy presji pamięci = 1 i zatrzymanym stacku Supabase

## Kontekst

- `app/components/add-offer-form.tsx`, `app/components/edit-ad-form.tsx` — listy przedmiotów i poziomów
- `lib/search.ts`, `lib/search.test.ts` — dopasowanie i testy
- `actions/public/ads.ts` — `filterAds`, `getAds`, `getAdsCount`
- `app/components/heroSearchSection.tsx`, `app/page.tsx` — UI wyszukiwania i parametry URL
- `actions/admin/ads.ts`, `app/admin/page.tsx` — lista ogłoszeń w panelu

## Notatki z realizacji

- 2026-11-02 tj: wyszukiwarka = pole tekstowe (tylko przedmiot, poziom, miasto) + listy wyboru „Przedmiot” i „Poziom” (D1).
- 2026-11-02 tj: zależność od LK-1.01: telefony w panelu dopiero po zamknięciu akcji admina (D2).
- 2026-11-04 tj: D1 = B (szeroko). W filtrze „Poziom” stary ogólny poziom pasuje do nowych odmian — wyłącznie: „Matura” → „Matura podstawowa” i „Matura rozszerzona”; „Liceum” → „Liceum / Technikum”. Dopasowanie per zapisana wartość, znormalizowane. Inne odpowiedniki (np. „egzamin ósmoklasisty” → E8) to pytanie do tj.
- 2026-11-04 tj: D2 = A. Zostaje „Matura podstawowa” / „Matura rozszerzona” (jak w briefie). Odczyt tj na prod: 27 aktywnych ogłoszeń ma dokładnie „Matura rozszerzona” (wpisane przez „Inne”), żadne nie ma samego „Matura” ani „Liceum”.
- 2026-11-04 tj: D3 (znalezisko tj). Filtr miasta nie pomija słów pospolitych — miasto „Online” nie może pasować do każdego ogłoszenia.
- 2026-11-04 tj: jednorazowy wyjątek od O-03, tylko w tej rundzie: przy presji pamięci 2 wolno `pnpm db:reset`, dev server na lokalnym Supabase, zrzuty Playwright, lokalne SELECT-y i `pnpm test:unit`. Nie wolno: `pnpm build`, zatrzymywać ani restartować stacku, uruchamiać niczego innego. Poziom sprawdzany osobną komendą przed każdym krokiem; przy 4 albo śmierci kontenera/dev servera — stop i raport.
- 2026-11-04 tj: w tym pliku `npm run test:unit` → `pnpm test:unit`, `npm run build` → `pnpm build` (O-01).
- 2026-11-04 tj: rozszerzenie wyjątku O-03 z tej rundy — jednorazowo `pnpm db:start` przy presji 2 (poziom sprawdzony osobną komendą tuż przed startem: 2). Dalej w ramach istniejącego wyjątku: bez buildu, bez zatrzymywania i restartu stacku.
- 2026-11-04 tj: D4 = C. Numery z seeda (`+48 000 000 0xx`) nie przechodzą `isValidPhoneNumber(…, 'PL')`, więc zapisu edycji nie dało się wykonać. Jednorazowy `UPDATE` `phone_contact` ogłoszenia `…0007` tylko na lokalnej bazie, numer poza repo (nie w seedzie). Po zapisie bez zmian `subject`, `subjects`, `education_level` identyczne; zmiana formatu telefonu oczekiwana (wpis w deferred).

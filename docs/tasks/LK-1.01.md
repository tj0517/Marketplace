---
id: LK-1.01
title: Akcje admina same sprawdzają uprawnienia
status: in_progress
difficulty: M
model: null
model_approved: null
effort: null
branch: fix/lk-1.01-admin-actions-auth
due: null
depends_on: [LK-1.04]
blocked_by_questions: []
touches_db: false
touches_prod: false
pr: null
---

## Cel

Akcje panelu admina (`actions/admin/*.ts`) działają na kluczu z pełnymi prawami do bazy i nie
sprawdzają, kto je wywołuje. Chroni je tylko blokada hasłem na adresach `/admin` w `middleware.ts`,
a akcję serwera da się wywołać przez dowolny adres aplikacji. Ich identyfikatory są w publicznym
kodzie JS, bo `app/admin/page.tsx` to komponent kliencki. Sukces: każda akcja admina bez poprawnego
hasła panelu odmawia i nic nie robi, a panel z poprawnym hasłem działa jak dziś.

## Zakres

- [ ] odczyt stanu: lista eksportowanych funkcji w `actions/admin/*.ts`, logika hasła w `middleware.ts`, sposób wywołania akcji z `app/admin/page.tsx`
- [ ] wspólna funkcja serwerowa sprawdzająca hasło panelu (te same `ADMIN_USER`/`ADMIN_PASS` i to samo porównanie odporne na pomiar czasu co w middleware, bez duplikowania logiki: middleware i akcje korzystają z jednego miejsca)
- [ ] wywołanie tej funkcji na początku **każdej** eksportowanej akcji w `actions/admin/` (dziś 10: `getAdminStats`, `sendBulkEmail`, `sendAdminEmail`, `getAdminAds`, `updateAdStatus`, `deleteAd`, `createFeaturedAd`, `toggleFeaturedAd`, `extendFeaturedAd`, `getAdminTransactions`)
- [ ] odmowa nie zdradza szczegółów (bez treści błędów z bazy i bez informacji, czy login był poprawny)
- [ ] test jednostkowy funkcji sprawdzającej

## Gotowe, gdy

- każda eksportowana funkcja w `actions/admin/` zaczyna się od sprawdzenia uprawnień — **jak sprawdzić:** `grep -nE '^export async function' actions/admin/*.ts` i dla każdej pierwsza instrukcja ciała to wywołanie funkcji sprawdzającej (lista w raporcie)
- red proof: test jednostkowy pokazuje odmowę przy braku nagłówka, złym haśle, złym loginie i złym formacie, a zgodę przy poprawnych danych — **jak sprawdzić:** nazwa testu i wynik uruchomienia `npm run test:unit` (wycinek)
- bez hasła panelu wywołanie akcji admina nie zwraca danych — dowód: curl POST / z Next-Action getAdminAds bez hasła zwraca `{}` (przed i po zmianie). Uwaga: Next 16.1.1 przekazuje akcję do /admin (action-handler.js:120-194), więc ten test nie odróżnia nowej blokady od middleware; samodzielne działanie requireAdmin nie zostało pokazane end-to-end (decyzja tj, wariant A).
- panel z poprawnym hasłem działa: lista ogłoszeń się ładuje, a zmiana statusu działa — **jak sprawdzić:** zrzut Playwright z `/admin` po zalogowaniu (`.playwright-mcp/`) i opis kroku
- `npm run lint` i `npx tsc --noEmit` bez nowych błędów względem `main` — **jak sprawdzić:** wynik obu komend przed i po (liczba błędów)

## Poza zakresem

- logowanie admina przez konta Supabase z rolą → decyzja tj 2026-11-02: później, gdy panel dostanie druga osoba
- akcje użytkowników (`actions/user/*`) i trasy `app/api/*` → osobne zadanie, jeśli audyt je wskaże
- `server-only` dla `lib/supabase/admin.ts` → LK-1.03
- zmiana hasła panelu lub zmiennych w Vercelu → bramka STOP, poza tym zadaniem

## Bramki STOP

- przed jakąkolwiek zmianą zmiennych środowiskowych (lokalnie wolno użyć własnego `.env.local`, w Vercelu nie) — pokaż, co i dlaczego, i czekaj
- akcje `sendBulkEmail`/`sendAdminEmail` testujesz tylko na odmowę; **nie wywołujesz ich z poprawnym hasłem**, bo to wysyłka prawdziwych maili przez Resend
- przed `next build` sprawdź `sysctl -n kern.memorystatus_vm_pressure_level` = 1; inaczej stop i raport

## Kontekst

- `middleware.ts` — obecna blokada hasłem i porównanie odporne na pomiar czasu
- `actions/admin/` — akcje do zabezpieczenia
- `app/admin/page.tsx` — komponent kliencki wywołujący akcje
- `lib/supabase/admin.ts` — klient z kluczem o pełnych prawach

## Notatki z realizacji

- 2026-11-02 tj: wersja minimalna (to samo hasło panelu co middleware), bez przejścia na konta Supabase (D1 w wf-plan).
- 2026-11-03 tj: najpierw LK-1.04, żeby panel dało się sprawdzić lokalnie.
- 2026-11-03 tj: kryterium e2e zastąpione (wariant A, bez strony-sondy); dowodem blokady jest test jednostkowy checkAdminAuth i odczyt diffu.
- 2026-11-03 tj: build przy presji pamięci 2 za zgodą tj (wyjątek od limitu =1).

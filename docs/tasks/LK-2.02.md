---
id: LK-2.02
title: Podbicie za 1 zł — kwota z serwera, rezerwacja, webhook z kontrolą kwoty i verify
status: done
difficulty: L
model: opus
model_approved: null
effort: high
branch: feat/lk-2.02-bump-1zl
due: null
depends_on: [LK-2.01]
blocked_by_questions: []
touches_db: true
touches_prod: true
pr: 10
---

## Cel

Właściciel adresu z uprawnieniem płaci za pierwsze podbicie 1 zł zamiast 10 zł. Kwotę zna tylko
serwer, uprawnienie jest rezerwowane przy rejestracji płatności, wraca, gdy płatność się nie uda
lub wygaśnie, i przechodzi w „wykorzystane” dopiero po potwierdzeniu płatności w P24.
Przy okazji webhook zaczyna robić to, czego dziś nie robi: sprawdzać kwotę i `sessionId` i
wywoływać `transaction/verify`. Sukces: transakcja 1 zł przechodzi w sandboxie, a potem raz na
produkcji.

## Zakres

- [ ] odczyt stanu: `app/api/payments/create/route.ts`, `app/api/webhooks/p24/route.ts`, `app/api/payments/status/[sessionId]/route.ts`, `app/api/cron/route.tsx`, `app/components/promote-ad-button.tsx`, `lib/config.ts`; definicja funkcji `complete_payment` na prod (`pg_get_functiondef` przez `supabase-prod`, wklejona) i w baseline; tabela uprawnień z LK-2.01
- [ ] rejestracja płatności: kwota 100 gr, jeśli adres ogłoszenia ma uprawnienie `granted`, inaczej `getPrice('bump')` (1000 gr); zmiana `granted` → `reserved` atomowo (warunkowy update zwracający wiersz) i powiązanie z transakcją; nic z ciała żądania nie wpływa na kwotę
- [ ] oczekiwana kwota w groszach zapisana tak, żeby webhook mógł ją porównać (dziś `transactions.amount` = `Math.round(amount/100)`, czyli całe złote)
- [ ] zwolnienie `reserved` → `granted` przy każdym niepowodzeniu rejestracji w P24 i przy wygaszeniu porzuconej transakcji w cronie
- [ ] webhook: po podpisie porównanie `sessionId`, kwoty i waluty z oczekiwanymi; wywołanie `PUT /api/v1/transaction/verify` (podpis według dokumentacji P24); dopiero po udanym verify `complete_payment` i `reserved` → `used`; idempotencja przy powtórzonym webhooku
- [ ] przycisk podbicia pokazuje kwotę, którą naliczy serwer (1 zł albo 10 zł), liczoną po stronie serwera

## Gotowe, gdy

- red proof kwoty: żądanie do `/api/payments/create` z dopisanym `amount: 1` (albo innym polem) dla adresu bez uprawnienia rejestruje 1000 gr — **jak sprawdzić:** test albo wklejone żądanie i ciało wysłane do P24 (sandbox / mock)
- red proof rezerwacji: dwie równoczesne rejestracje dla tego samego adresu z uprawnieniem → tylko jedna dostaje 100 gr — **jak sprawdzić:** skrypt i wklejone dwie kwoty
- red proof webhooka: powiadomienie z poprawnym podpisem, ale złą kwotą albo nieznanym `sessionId` nie wywołuje verify, nie kończy płatności i nie zmienia uprawnienia — **jak sprawdzić:** test z wynikiem i wklejonym stanem uprawnienia
- nieudana rejestracja i transakcja wygaszona przez cron zwalniają rezerwację — **jak sprawdzić:** test albo wklejony stan uprawnienia przed i po obu scenariuszach na lokalnej bazie
- sandbox P24: przeniesione do zadania LK-2.04 (tj, 2026-11-04 — dane sandboxa P24 zwracają 401 na `testAccess`)
- produkcja: przeniesione do zadania follow-up (tj, 2026-11-04)
- fallback: gdy w bazie nie ma tabeli/funkcji uprawnień, rejestracja nalicza 1000 gr i nie zwraca błędu; webhook i cron pomijają kroki uprawnień — **jak sprawdzić:** test z zamockowanym błędem „relation does not exist”
- spóźniona płatność: poprawne powiadomienie dla transakcji wygaszonej przez cron jest weryfikowane i kończy płatność, a wolne uprawnienie przechodzi `granted` → `used` (zajęte przez inną transakcję albo `used` zostaje bez zmian) — **jak sprawdzić:** test i wklejony stan
- przycisk podbicia pokazuje 1 zł dla adresu z uprawnieniem i 10 zł bez — **jak sprawdzić:** zrzuty ekranu z Playwrighta obu wariantów

## Poza zakresem

- zmiana ceny standardowej (zostaje 1000 gr) i nowe typy transakcji
- zwroty i anulowanie płatności w P24
- usunięcie martwej akcji `promoteAd` (`actions/user/promote-ad.ts`) → deferred
- porządek z `transactions.amount` w złotówkach poza tym, czego wymaga porównanie kwoty → deferred

## Bramki STOP

- migracja (jeśli potrzebna) na prod → wdraża tj
- włączenie `PROMOTIONS_ENABLED=true` i `P24_SANDBOX=false` na prod → tj
- płatność produkcyjna → wykonuje tj; agent tylko odczytuje wynik
- zmiana konfiguracji w panelu Przelewy24 (adres webhooka, klucze) → tj
- P24 odrzuca 1 zł (sandbox albo prod) → stop i raport, bez obejść (np. podnoszenia kwoty)
- zmiana `complete_payment`: pokaż diff względem definicji z prod/baseline przed napisaniem migracji

## Kontekst

- `app/api/payments/create/route.ts` — rejestracja w P24
- `app/api/webhooks/p24/route.ts` — webhook (dziś bez verify i bez kontroli kwoty)
- `app/api/cron/route.tsx` — wygaszanie porzuconych transakcji
- `app/components/promote-ad-button.tsx` — przycisk podbicia
- `lib/config.ts` — ceny, sandbox, `isPromotionsEnabled`
- dokumentacja P24 REST: `transaction/register`, `transaction/verify` (przez context7 albo oficjalną dokumentację)

## Notatki z realizacji

- 2026-11-02 wf-plan: webhook nie wywołuje `verify` ani nie sprawdza kwoty; płatne podbicia są wyłączone flagą `PROMOTIONS_ENABLED`.
- 2026-11-04 tj: kryterium płatności produkcyjnej przeniesione do zadania follow-up (tj je założy), razem z wdrożeniem migracji LK-2.01/LK-2.02 na prod.
- 2026-11-04 tj: gdy w bazie nie ma tabeli/funkcji uprawnień, rejestracja nalicza standardowe 1000 gr zamiast błędu (merge przed migracją nie psuje podbić na prod); ta sama tolerancja w webhooku i cronie.
- 2026-11-04 tj: dowód w sandboxie P24 przez tunel ngrok (P24 sam woła webhook).
- 2026-11-04 tj: spóźniona płatność dla transakcji wygaszonej przez cron jest weryfikowana i kończona; zużywa uprawnienie, jeśli jest wolne (`granted` → `used`); jeśli zarezerwowane przez inną transakcję albo `used` — bez zmian.
- 2026-11-04 tj (decyzja 1): zniżka tylko dla ogłoszeń korepetytorów (`ads.type = 'offer'`); `register_bump_transaction` rezerwuje uprawnienie tylko dla `offer`, ogłoszenie `search` z tym samym adresem płaci standardową kwotę, a uprawnienie zostaje nietknięte. Red proof: ogłoszenie `search` dla adresu z uprawnieniem → 1000 gr, uprawnienie dalej `granted`.
- 2026-11-04 tj (decyzja 2, wariant B — wygaszanie przy okazji): przy rejestracji (i przy liczeniu ceny na przycisku) rezerwacja trzymana przez transakcję `pending` starszą niż `TRANSACTION_TIMEOUT_HOURS` jest wygaszana jak w cronie (transakcja → `failed`, uprawnienie → `granted`), potem zwykła rezerwacja. Reguła spóźnionej płatności bez zmian. Test: stara rezerwacja zwolniona, nowa rejestracja dostaje 100 gr.
- 2026-11-04 tj (decyzja 3): plan migracji i diff crona zatwierdzone w pokazanej wersji, razem ze sprawdzeniem `merchantId`/`posId` w webhooku (osobny red proof: poprawnie podpisane powiadomienie z obcym `posId` → bez verify, bez zapisu). Migracja tylko lokalnie, po sprawdzeniu `kern.memorystatus_vm_pressure_level` = 1. `complete_payment` bez zmian.
- 2026-11-04 tj (luka do ustalenia, nie decyzja): verify udane w P24, a zapis `webhook_received_at` się nie udał → ponowienie P24 woła verify drugi raz. Ustalić w sandboxie odpowiedź P24 na powtórne verify już zweryfikowanej transakcji, wkleić ją (bez kluczy) i zapewnić, że ten przypadek nie zablokuje webhooka w 502 dla opłaconej płatności; jeśli właściwa obsługa nie wynika jasno z odpowiedzi — stop i decyzja tj.
- 2026-11-04 tj: trzeci jednorazowy wyjątek od O-03 (nie przechodzi na inne zadania): przy `memorystatus_vm_pressure_level` = 2 dozwolone `pnpm db:start` (okrojony stack z LK-1.04), `pnpm db:reset`, `pnpm db:types` (lokalnie), dowody na lokalnej bazie, `pnpm test:unit` i serwer dev. `next build` tylko przy poziomie 1. Sprawdzenie poziomu osobnym poleceniem przed każdym krokiem; przy poziomie 4 albo padnięciu kontenera / serwera dev — natychmiastowy stop i raport, bez restartów.
- 2026-11-04 tj: dodatkowe funkcje `expire_stale_bump_reservation` i `quote_bump_amount` przyjęte jako realizacja decyzji 2.
- 2026-11-04 tj: ngrok zatwierdzony z góry tylko na test sandboxa: `NEXT_PUBLIC_APP_URL` nadpisany w powłoce, nigdy w pliku; aplikacja na lokalnej bazie; tunel tylko na czas testu; raport potwierdza zamknięcie (brak procesu).
- 2026-11-04 tj (reguła): `.env.local` wskazuje na prod, więc przed każdym żądaniem do aplikacji (curl, Playwright, powiadomienie P24) pokazać, że działający serwer używa `http://127.0.0.1:54321` (env procesu albo log); host nielokalny → natychmiastowy stop.
- 2026-11-04 agent: sandbox niedostępny — `GET https://sandbox.przelewy24.pl/api/v1/testAccess` z `P24_POS_ID:P24_API_KEY` z `.env.local` → `401 {"error":"Incorrect authentication","code":401}` (format wartości poprawny; bez obejść, ngrok nieuruchamiany).
- 2026-11-04 tj: kryterium sandboxa P24 i luka powtórnego verify przeniesione do zadania LK-2.04; bez czekania na dane i bez ngrok.
- OTWARTE (→ LK-2.04), luka powtórnego verify: gdy po udanym verify nie zapisał się `webhook_received_at`, ponowione powiadomienie woła verify drugi raz, a jeśli P24 odpowie błędem, webhook zwraca 502 bez żadnego zapisu — transakcja już dokończona zostaje `completed`, a niedokończona (błąd `finalize_bump_payment`) zostaje `pending` i cron ją potem wygasza mimo opłaconej płatności; odpowiedzi P24 na powtórne verify nie ustalono.
- 2026-11-04 tj: accepted in wf-review, PR #10. All in-scope criteria proven: server-side amount (injected `amount: 1` → 1000 gr to P24), concurrent reservations (100/1000 in SQL and over HTTP), webhook mismatches W1–W4 with 0 verify calls, release on 3 registration failures and in the cron, `search` ad at 1000 gr, stale-reservation expiry, late payment, 10 zł fallback on the prod-shaped schema, button 1 zł / 10 zł (screenshots), guard-removal red proofs. Prod untouched (3 migrations, no new objects). Not proven against real P24: `transaction/verify`, repeated verify, `originAmount == amount` → LK-2.04, before merge. PR stays open with DO NOT MERGE; tj merges in LK-2.04 after the sandbox verify and the prod migrations.

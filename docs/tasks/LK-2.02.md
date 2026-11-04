---
id: LK-2.02
title: Podbicie za 1 zł — kwota z serwera, rezerwacja, webhook z kontrolą kwoty i verify
status: in_progress
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
pr: null
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
- sandbox P24: płatność 1 zł od rejestracji przez verify do `used` — **jak sprawdzić:** wklejone odpowiedzi register i verify (bez kluczy), stan transakcji i uprawnienia; jeśli P24 odrzuci 1 zł → stop i raport z komunikatem
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

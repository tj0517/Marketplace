---
id: LK-2.06
title: Mail po zgodzie z linkiem do panelu i podbiciem za 1 zł, okno płatności z linku, baner znika po odebraniu promocji
status: todo
difficulty: M
model: null
model_approved: null
effort: null
branch: null
due: null
depends_on: []
blocked_by_questions: []
touches_db: false
touches_prod: false
pr: null
---

## Cel

Po zapisie na newsletter korepetytor dostaje mail, który prowadzi go prosto do jego ogłoszenia i do
zapłaty 1 zł, bez szukania linku do zarządzania. W panelu baner „Zapisz się… za 1 zł” znika, gdy
adres odebrał już promocję. Sukces: z maila dwa kliknięcia do P24 z kwotą 1 zł, a sam link nie tworzy
żadnej płatności.

## Zakres

- [ ] odczyt stanu: `lib/marketing-consent-server.ts`, `emails/marketing-consent-email.tsx`, `actions/user/create-offer.ts` (kolejność: zapis ogłoszenia, potem zgoda), `app/offers/manage/[token]/page.tsx`, `app/components/promote-ad-button.tsx`, schemat `ads` i `promotion_entitlements`
- [ ] mail: wyszukanie najnowszego aktywnego ogłoszenia `offer` dla adresu; przycisk „Podbij za 1 zł” → `/offers/manage/{token}?podbij=1` i link do panelu `/offers/manage/{token}`; gdy ogłoszenia nie ma, dotychczasowy link do `/recover-magic-link`
- [ ] treść maila: tekst klienta dosłownie, jeśli jest w Notatkach przed startem (O-09); inaczej obecny tekst z krokami zastąpionymi przyciskami
- [ ] panel: `?podbij=1` otwiera okno płatności tylko, gdy promocja jest pokazywana; transakcja powstaje dopiero po kliknięciu „Przejdź do płatności”
- [ ] baner w panelu ukryty, gdy adres ogłoszenia ma uprawnienie w dowolnym statusie (`granted`/`reserved`/`used`)

## Gotowe, gdy

- mail ma linki do właściwego ogłoszenia — **jak sprawdzić:** test jednostkowy albo wyrenderowany HTML maila dla adresu `@seed.test` z dwoma ogłoszeniami: link ma token najnowszego aktywnego `offer`; adres bez ogłoszenia → link do `/recover-magic-link`
- otwarcie linku nie tworzy płatności — **jak sprawdzić:** red proof: zwykły GET `/offers/manage/{token}?podbij=1` (curl, jak skaner poczty), wklejony `select count(*) from transactions` i stan uprawnienia przed i po = bez zmian
- okno płatności otwiera się z linku i pokazuje 1 zł — **jak sprawdzić:** zrzut Playwright panelu z `?podbij=1` dla adresu z uprawnieniem `granted`; bez parametru okno zamknięte
- baner: widoczny bez uprawnienia, ukryty z uprawnieniem — **jak sprawdzić:** dwa zrzuty panelu dla dwóch adresów `@seed.test` i wklejony stan ich uprawnień
- `pnpm typecheck`, `pnpm test:unit` i lint zmienionych plików bez nowych błędów — **jak sprawdzić:** wklejone wyniki

## Poza zakresem

- zmiany w `app/api/payments/`, `app/api/webhooks/p24/`, `PROMOTIONS_ENABLED` (gorąca ścieżka) → nie w tym zadaniu
- automatyczne tworzenie płatności z linku w mailu → świadomie nie (skanery poczty)
- komunikat „Masz podbicie za 1 zł — podbij teraz” zamiast baneru → osobne zadanie, jeśli tj zechce
- teksty checkboxa i stron → LK-2.05

## Bramki STOP

- wysyłka maila na prawdziwy adres → nie; podgląd renderem albo `@seed.test`
- jakakolwiek zmiana w trasach płatności lub webhooku → stop i raport
- `next build` i lokalny stack tylko przy `kern.memorystatus_vm_pressure_level` = 1 (O-03); inaczej stop i raport
- stan bazy ustalasz bieżącym odczytem, nigdy z pamięci, notatek ani pliku typów

## Kontekst

- `lib/marketing-consent-server.ts` — wysyłka maila po zgodzie
- `emails/marketing-consent-email.tsx` — szablon
- `app/offers/manage/[token]/page.tsx` — baner i karta promocji
- `app/components/promote-ad-button.tsx` — okno płatności
- `supabase/migrations/20261104140000_bump_entitlement_payment.sql` — rezerwacja i statusy uprawnień
- `docs/tasks/LK-2.01.md` — decyzja o linku wycofania (GET nic nie zmienia)

## Notatki z realizacji

- 2026-11-15 tj: w mailu link do najnowszego aktywnego ogłoszenia `offer` adresu; link do panelu w mailu marketingowym zaakceptowany (to samo ryzyko co mail z magic linkiem).

---
id: LK-2.04
title: Wdrożenie zgód i podbicia za 1 zł na produkcję — migracje, merge, płatność 1 zł
status: todo
difficulty: S
model: null
model_approved: null
effort: null
branch: null
due: null
depends_on: [LK-2.01, LK-2.02]
blocked_by_questions: []
touches_db: true
touches_prod: true
pr: null
---

## Cel

Zgody marketingowe (LK-2.01) i podbicie za 1 zł (LK-2.02) zaczynają działać na produkcji we właściwej
kolejności: najpierw migracje na prod, potem kod, na końcu jedna prawdziwa płatność 1 zł. Dziś kod
LK-2.01 jest na prod bez swoich tabel, więc zgody zaznaczone w formularzu przepadają (deferred,
2026-11-04). Sukces: zgoda zapisuje się na prod, a płatność 1 zł wykonana przez tj kończy się
uprawnieniem `used` i podbitym ogłoszeniem.

## Zakres

- [ ] odczyt stanu prod przez `supabase-prod`: `list_migrations`, obecność `marketing_consents`, `promotion_entitlements` i funkcji z LK-2.01/LK-2.02; treść zgody i wersja z O-04 w kodzie
- [ ] treść zgody i jej wersja z rozstrzygniętego O-04 w `MARKETING_CONSENT` (zamiast placeholdera)
- [ ] lista kroków wdrożenia dla tj: migracje LK-2.01 i LK-2.02 (kolejność plików), zmienne nadawcy marketingowego w Vercelu, potem merge LK-2.02
- [ ] po wdrożeniu przez tj: odczyt potwierdzający migracje i obiekty na prod
- [ ] po płatności tj: odczyt transakcji i uprawnienia (bez danych osobowych)

## Gotowe, gdy

- migracje LK-2.01 i LK-2.02 zastosowane na prod — **jak sprawdzić:** wklejony `list_migrations` z prod i SELECT z `to_regclass` / `pg_proc` dla nowych tabel i funkcji
- zgoda z formularza zapisuje się na prod — **jak sprawdzić:** wklejony SELECT liczby wierszy `marketing_consents` przed i po zgodzie złożonej przez tj na jego adres testowy (bez adresu w raporcie)
- pierwsze prawdziwe `transaction/verify` (sandbox w LK-2.02 nie ruszył: 401 na kluczach) — **jak sprawdzić:** przed płatnością na prod `testAccess` na sandboksie z poprawnymi kluczami i płatność 1 zł w sandboksie przez tunel (jak w LK-2.02); jeśli sandbox nadal nie działa → decyzja tj, czy pierwsza płatność prod jest jedynym dowodem
- powtórzone verify dla już zweryfikowanej transakcji (luka z LK-2.02) — **jak sprawdzić:** wklejona odpowiedź P24 (sandbox) na drugie verify i dowód, że webhook nie utknie na 502 dla zapłaconej transakcji
- produkcja: jedna płatność 1 zł przeprowadzona przez tj kończy się `used` i podbiciem — **jak sprawdzić:** wklejony przez agenta SELECT stanu transakcji (`status`, `amount_grosze`, `webhook_received_at`) i uprawnienia (`status`, `used_at`) oraz `ads.visible_at` po płatności tj, bez danych osobowych

## Poza zakresem

- zmiany logiki płatności i zgód → LK-2.02 / LK-2.01 (błąd znaleziony tutaj: stop i raport, osobne zadanie)
- zwroty płatności testowej w P24
- zmiana ceny standardowej

## Bramki STOP

- migracje na prod → wdraża tj (`supabase db push` przez session pooler); agent tylko podaje kolejność i odczytuje wynik
- zmiana env w Vercelu (nadawca marketingowy) → tj
- merge LK-2.02 przed potwierdzonymi migracjami na prod → nie; decyzja tj
- płatność produkcyjna → wykonuje tj; agent tylko odczytuje wynik
- P24 odrzuca 1 zł na prod → stop i raport, bez obejść
- wysyłka maila marketingowego na prawdziwy adres → tylko na adres testowy tj, po jego zgodzie

## Kontekst

- `docs/tasks/LK-2.01.md`, `docs/tasks/LK-2.02.md` — notatki z realizacji, decyzje i kolejność migracji
- `docs/04-open-questions.md` — O-04 (treść i wersja zgody)
- `supabase/migrations/` — migracje LK-2.01 i LK-2.02
- `lib/marketing-consent.ts` — `MARKETING_CONSENT` (treść i wersja)
- `docs/deferred-tasks.md` — wpis o kodzie LK-2.01 na prod bez tabel

## Notatki z realizacji

- 2026-11-04 tj (wf-task LK-2.02): kryterium płatności 1 zł na produkcji wyniesione z LK-2.02 do tego zadania; LK-2.02 ma fallback 10 zł, gdy tabeli uprawnień nie ma.
- 2026-11-04 tj: test w sandboksie P24 wyniesiony z LK-2.02 (401 na kluczach sandboksa); pierwsze prawdziwe verify i powtórzone verify sprawdzane tutaj, przed płatnością na prod.
- 2026-11-04 tj: O-04 rozstrzygnięte — treść zgody i wersja `v1-2026-11-04` w `docs/04-open-questions.md`. Całość (treść, migracje, płatność) idzie przez to zadanie; migracji LK-2.01 nie wdrażać przed wejściem nowej treści na prod.

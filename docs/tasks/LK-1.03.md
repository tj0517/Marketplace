---
id: LK-1.03
title: server-only dla klucza admina i CI na PR-ach
status: in_progress
difficulty: M
model: null
model_approved: null
effort: null
branch: chore/lk-1.03-server-only-ci
due: null
depends_on: []
blocked_by_questions: []
touches_db: false
touches_prod: false
pr: null
---

## Cel

Klient bazy z kluczem o pełnych prawach (`lib/supabase/admin.ts`) nie jest zabezpieczony przed
przypadkowym importem w kodzie przeglądarki, a repo nie ma żadnego CI: typy, lint, testy i
sekrety nikt automatycznie nie sprawdza. Sukces: próba użycia klucza w kodzie klienckim
wywala build, a każdy PR do `main` przechodzi przez sprawdzenie typów, lintu, testów
jednostkowych i skan sekretów.

## Zakres

- [ ] odczyt stanu: `npm run lint` i `npx tsc --noEmit` na `main` (liczba błędów), menedżer paczek z O-01
- [ ] `server-only` w `lib/supabase/admin.ts` (nowa zależność: paczka `server-only` od Next.js)
- [ ] skrypt `typecheck` w `package.json`
- [ ] usunięcie drugiego lockfile'a zgodnie z O-01 i odświeżenie właściwego
- [ ] workflow `.github/workflows/ci.yml` na PR do `main`: instalacja z lockfile'a (pnpm), typecheck, lint **tylko plików zmienionych w PR** (`.ts`/`.tsx` z diffu względem bazy), `test:unit`, skan sekretów (gitleaks)
- [ ] README: `pnpm install` zamiast `npm install`

## Gotowe, gdy

- `lib/supabase/admin.ts` importuje `server-only` — **jak sprawdzić:** `grep -n "server-only" lib/supabase/admin.ts`
- red proof `server-only`: próbny import `createAdminClient` w komponencie z `'use client'` wywala `next build` — **jak sprawdzić:** wycinek błędu builda w raporcie; próbny import nie trafia do commita
- w repo jest jeden lockfile zgodny z O-01 — **jak sprawdzić:** `ls package-lock.json pnpm-lock.yaml`
- CI przechodzi na PR-ze tego zadania — **jak sprawdzić:** link do zielonego runu i lista kroków (typecheck, lint, test:unit, gitleaks)
- red proof skanu sekretów: gitleaks wykrywa fałszywy klucz — **jak sprawdzić:** wynik lokalnego `gitleaks detect` (albo runu CI na tymczasowym commicie) na pliku z fałszywym kluczem, wycinek w raporcie; plik nie zostaje w gałęzi
- red proof lintu: plik zmieniony w PR z celowym błędem lintu wywala krok lint, a nieruszony stary plik z błędami go nie wywala — **jak sprawdzić:** wycinek z lokalnego uruchomienia kroku albo z runu CI na tymczasowym commicie; celowy błąd nie zostaje w gałęzi
- CI nie ma `continue-on-error` ani pomijania kroków — **jak sprawdzić:** `grep -n continue-on-error .github/workflows/ci.yml` puste

## Poza zakresem

- masowa naprawa istniejących błędów lintu lub typów → nowe zadanie (patrz bramka STOP)
- testy e2e i z bazą w CI → po LK-1.04
- ochrona gałęzi `main` w GitHubie (wymagane checki) → ustawienie repo, decyzja tj
- auth akcji admina → LK-1.01

## Bramki STOP

- jeśli na `main` typecheck ma błędy: stop z ich liczbą i listą plików (2026-11-03: 0); lint ma 52 błędy — rozstrzygnięte: CI lintuje tylko pliki zmienione w PR (decyzja tj 2026-11-03), bez masowych poprawek
- przed usunięciem lockfile'a pokaż, który i dlaczego (odpowiedź z O-01)
- nowa zależność: tylko `server-only`; każda inna to decyzja tj

## Kontekst

- `lib/supabase/admin.ts` — klient z kluczem o pełnych prawach
- `package.json` — skrypty i zależności
- `lib/search.test.ts` — jedyne testy jednostkowe (Playwright jako runner)
- `docs/04-open-questions.md` — O-01

## Notatki z realizacji

- 2026-11-03 tj: O-01 → pnpm (log Vercela). Lint w CI tylko na plikach zmienionych w PR (wariant A); stare błędy lintu (52) zostają jako dług.
- 2026-11-04 tj: gitleaks znalazł w historii `CRON_SECRET` (`6b8013f`, `test-przed-oddaniem.md:182`, reguła `curl-auth-header`) → wariant A: pełny skan historii w CI, w `.gitleaksignore` tylko ten jeden fingerprint z komentarzem; gitleaks z oficjalnego obrazu kontenera przypiętego wersją i digestem, bez tokenu. Rotacja `CRON_SECRET` w Vercelu po stronie tj (zapisane w `docs/deferred-tasks.md`).

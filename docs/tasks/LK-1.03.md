---
id: LK-1.03
title: server-only dla klucza admina i CI na PR-ach
status: todo
difficulty: M
model: null
model_approved: null
effort: null
branch: null
due: null
depends_on: []
blocked_by_questions: [O-01]
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
- [ ] workflow `.github/workflows/ci.yml` na PR do `main`: instalacja z lockfile'a, typecheck, lint, `test:unit`, skan sekretów (gitleaks)

## Gotowe, gdy

- `lib/supabase/admin.ts` importuje `server-only` — **jak sprawdzić:** `grep -n "server-only" lib/supabase/admin.ts`
- red proof `server-only`: próbny import `createAdminClient` w komponencie z `'use client'` wywala `next build` — **jak sprawdzić:** wycinek błędu builda w raporcie; próbny import nie trafia do commita
- w repo jest jeden lockfile zgodny z O-01 — **jak sprawdzić:** `ls package-lock.json pnpm-lock.yaml`
- CI przechodzi na PR-ze tego zadania — **jak sprawdzić:** link do zielonego runu i lista kroków (typecheck, lint, test:unit, gitleaks)
- red proof skanu sekretów: gitleaks wykrywa fałszywy klucz — **jak sprawdzić:** wynik lokalnego `gitleaks detect` (albo runu CI na tymczasowym commicie) na pliku z fałszywym kluczem, wycinek w raporcie; plik nie zostaje w gałęzi
- CI nie ma `continue-on-error` ani pomijania kroków — **jak sprawdzić:** `grep -n continue-on-error .github/workflows/ci.yml` puste

## Poza zakresem

- masowa naprawa istniejących błędów lintu lub typów → nowe zadanie (patrz bramka STOP)
- testy e2e i z bazą w CI → po LK-1.04
- ochrona gałęzi `main` w GitHubie (wymagane checki) → ustawienie repo, decyzja tj
- auth akcji admina → LK-1.01

## Bramki STOP

- jeśli na `main` lint lub typecheck mają błędy: stop z ich liczbą i listą plików, bez masowych poprawek; tj decyduje (naprawa w tym zadaniu, osobne zadanie albo tymczasowy wyjątek)
- przed usunięciem lockfile'a pokaż, który i dlaczego (odpowiedź z O-01)
- nowa zależność: tylko `server-only`; każda inna to decyzja tj

## Kontekst

- `lib/supabase/admin.ts` — klient z kluczem o pełnych prawach
- `package.json` — skrypty i zależności
- `lib/search.test.ts` — jedyne testy jednostkowe (Playwright jako runner)
- `docs/04-open-questions.md` — O-01

## Notatki z realizacji

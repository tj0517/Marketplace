---
id: LK-1.04
title: Lokalna baza, seed, .env.example i bezpiecznik testów
status: in_progress
difficulty: M
model: null
model_approved: null
effort: null
branch: chore/lk-1.04-local-db
due: null
depends_on: [LK-1.02]
blocked_by_questions: []
touches_db: true
touches_prod: false
pr: null
---

## Cel

Projekt nie ma środowiska dev, więc jedynym bezpiecznym miejscem na testy bazy i red proofy jest
baza lokalna. Dziś jej nie ma, tak samo jak seeda, opisu zmiennych (`.env.example`) i
zabezpieczenia przed testami na produkcji. Sukces: jedna komenda odtwarza lokalną bazę z migracji
i syntetycznego seeda, a testy przerywają się, zanim dotkną bazy, która nie jest lokalna.

## Zakres

- [ ] odczyt stanu: `supabase/migrations/` i `config.toml` z LK-1.02, zmienne z README, presja pamięci (`sysctl -n kern.memorystatus_vm_pressure_level`)
- [ ] odchudzony start stacku: `supabase start -x <usługi zbędne>`; dobór usług w raporcie, komenda jako skrypt w `package.json` (np. `db:start`)
- [ ] `supabase/seed.sql`: syntetyczne ogłoszenia w każdym statusie używanym przez kod (`active`, `banned`, `deleted` i pozostałe z bazy), jedno ze znanym tokenem edycji, przykładowe transakcje; tylko dane syntetyczne (`@seed.test`)
- [ ] `.env.example`: wszystkie zmienne z README (same nazwy, bez wartości) i lokalne wartości stacku jako komentarz; poprawka README (dziś odsyła do usuniętego `.env.p24.example`)
- [ ] `playwright.config.ts` z globalnym setupem, który przerywa testy, gdy `NEXT_PUBLIC_SUPABASE_URL` nie wskazuje `localhost`/`127.0.0.1`
- [ ] regeneracja typów z lokalnej bazy (`supabase gen types --local`); zmiana w `types/supabase.ts` tylko jeśli wynika ze schematu

## Gotowe, gdy

- `db:start` i `supabase db reset` przechodzą na czystym stacku — **jak sprawdzić:** wycinek wyniku obu komend
- seed zawiera ogłoszenie w każdym statusie i znany token — **jak sprawdzić:** wklejony `select status, count(*) from ads group by status` z lokalnej bazy i token w `seed.sql`
- seed nie zawiera prawdziwych danych — **jak sprawdzić:** `grep -nE '@' supabase/seed.sql | grep -v '@seed.test'` puste
- red proof bezpiecznika: `NEXT_PUBLIC_SUPABASE_URL=https://ruxcswtcfaofvyzfvspn.supabase.co npx playwright test` przerywa przed pierwszym testem z czytelnym komunikatem — **jak sprawdzić:** wycinek wyniku
- testy przechodzą przy lokalnym adresie — **jak sprawdzić:** wynik `npm run test:unit`
- `.env.example` ma wszystkie zmienne z README i jest śledzony — **jak sprawdzić:** porównanie listy z README i `git ls-files .env.example`

## Poza zakresem

- projekt dev Supabase → ryzyko przyjęte przez tj 2026-11-02
- testy e2e na bazie w CI → nowe zadanie po LK-1.03 i LK-1.04
- poprawki schematu → nowe zadania

## Bramki STOP

- presja pamięci ≠ 1 (normal) przed `supabase start` lub buildem → stop i raport, bez ponawiania; build tylko przy zatrzymanym stacku
- żadnych danych z produkcji w seedzie ani w raporcie
- żadnego `supabase link`, `db push` ani `db reset --linked`: reset wyłącznie lokalnie

## Kontekst

- `supabase/migrations/*_baseline.sql`, `supabase/config.toml` — z LK-1.02
- `README.md` — lista zmiennych
- `lib/search.test.ts`, `package.json` — testy i skrypty
- `actions/`, `app/api/cron/route.tsx` — statusy ogłoszeń i transakcji używane w kodzie

## Notatki z realizacji

- 2026-11-02 tj: lokalny stack w wersji odchudzonej (`supabase start -x …`) z limitem pamięci (O-03).

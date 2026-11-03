---
id: LK-1.02
title: Schemat produkcji do repo (baseline)
status: todo
difficulty: M
model: null
model_approved: null
effort: null
branch: null
due: null
depends_on: []
blocked_by_questions: []
touches_db: true
touches_prod: true
pr: null
---

## Cel

W repo nie ma ani jednej migracji, więc schemat bazy istnieje tylko na produkcji
(`ruxcswtcfaofvyzfvspn`). Agent nie widzi z pliku reguł dostępu ani funkcji, a każda zmiana bazy
idzie bez śladu. Sukces: schemat produkcji leży w repo jako jedna migracja startowa, zgadza się
z produkcją, a historia migracji na prod jest z nią spójna, więc następne migracje da się
wdrażać normalnie.

## Zakres

- [ ] odczyt stanu: historia migracji na prod (`list_migrations` przez `supabase-prod`), lista tabel, polityk RLS, funkcji, triggerów i bucketów storage na prod
- [ ] `supabase init` (powstaje `supabase/config.toml`), bez uruchamiania lokalnego stacku
- [ ] przygotowanie **dokładnej komendy zrzutu** schematu do `supabase/migrations/<timestamp>_baseline.sql` (tylko schemat, bez danych); komendę uruchamia tj
- [ ] przegląd zrzutu: obecność `ads`, `transactions`, `phone_hashes`, funkcji `complete_payment`, `increment_ad_view`, `increment_contact_count` i ich polityk
- [ ] odczyt advisory bezpieczeństwa prod; znaleziska do `docs/deferred-tasks.md`, nie naprawiane
- [ ] usunięcie `supabase/.temp/` z indeksu gita (`git rm --cached -r supabase/.temp`); pliki zostają na dysku, a wpis w `.gitignore` już jest
- [ ] przygotowanie komendy oznaczenia migracji startowej jako zastosowanej na prod; uruchamia tj (bramka STOP)

## Gotowe, gdy

- istnieje dokładnie jeden plik `supabase/migrations/*_baseline.sql` i `supabase/config.toml` — **jak sprawdzić:** `ls supabase/migrations supabase/config.toml`
- zrzut nie zawiera danych — **jak sprawdzić:** `grep -ciE '^(insert into|copy )' supabase/migrations/*_baseline.sql` = 0
- liczba tabel, polityk RLS i funkcji w schemacie `public` na prod zgadza się z plikiem — **jak sprawdzić:** wklejony wynik SELECT z `information_schema.tables`, `pg_policies` i `pg_proc` (tylko `public`) przez `supabase-prod` oraz wynik `grep -ciE '^create (table|policy|(or replace )?function)'` na pliku, w tabeli obok siebie
- advisory bezpieczeństwa prod są odczytane — **jak sprawdzić:** wklejony wynik `get_advisors` (security) i odnośnik do wpisów w `docs/deferred-tasks.md`
- historia migracji na prod jest odczytana przed zmianą i po oznaczeniu przez tj zawiera baseline — **jak sprawdzić:** dwa wklejone wyniki `list_migrations`
- `supabase/.temp` nie jest śledzony — **jak sprawdzić:** `git ls-files supabase/.temp` puste

## Poza zakresem

- poprawki schematu, polityk lub funkcji, nawet oczywiste → nowe zadania z deferred
- lokalny stack, `db reset`, seed → LK-1.04
- regeneracja `types/supabase.ts` → LK-1.04 albo osobno
- naprawa znalezisk z advisory → nowe zadania

## Bramki STOP

- przed zrzutem: pokaż dokładną komendę; **uruchamia ją tj** (hasło do bazy prod nie trafia do sesji agenta — decyzja tj 2026-11-02, O-02)
- przed oznaczeniem baseline jako zastosowanego na prod (`supabase migration repair --status applied <timestamp>`): pokaż komendę i wynik `list_migrations`; **uruchamia ją tj**; to zmiana historii migracji na produkcji
- żadnego `db push`, `apply_migration` ani SQL innego niż SELECT na prod
- produkcyjne dane osobowe nie trafiają do repo ani do raportu (zrzut tylko schematu)

## Kontekst

- `package.json` — `db:types` (ref projektu)
- `lib/supabase/` — klienci bazy
- `types/supabase.ts` — wygenerowane typy (orientacyjnie; stan bazy z odczytu)
- `$WF/core/db-access.md` — zasady odczytu prod

## Notatki z realizacji

- 2026-11-02 tj: zrzut schematu robi tj jedną komendą przygotowaną przez agenta (O-02).

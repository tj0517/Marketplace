---
id: LK-1.02
title: Schemat produkcji do repo (baseline)
status: review
difficulty: M
model: null
model_approved: null
effort: null
branch: chore/lk-1.02-baseline
due: null
depends_on: []
blocked_by_questions: []
touches_db: true
touches_prod: true
pr: 2
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

- w `supabase/migrations/` są dokładnie dwa pliki: `002_baseline.sql` i odtworzona z prod `003_optimize_schema.sql`, a obok `supabase/config.toml` — **jak sprawdzić:** `ls supabase/migrations supabase/config.toml`
- zrzut nie zawiera danych ani meta-komend psql — **jak sprawdzić:** `grep -ciE '^(insert into|copy )' supabase/migrations/002_baseline.sql` = 0 i `grep -c '^\\' supabase/migrations/002_baseline.sql` = 0
- `ad_campaigns` nie ma w repo (tabela innego projektu, decyzja tj 2026-11-03) — **jak sprawdzić:** `grep -rc ad_campaigns supabase/migrations` = 0 dla każdego pliku
- liczba tabel, polityk RLS i funkcji w `public` na prod zgadza się z plikami migracji — **jak sprawdzić:** wklejony wynik SELECT przez `supabase-prod` z `information_schema.tables` (BASE TABLE), `pg_policies` i `pg_proc` (bez funkcji z rozszerzeń: `pg_depend.deptype = 'e'`) obok liczników z `grep -iE '^create (table|policy|(or replace )?function)'` na baseline (tylko `"public"`); tabele: prod = plik + 1 (`ad_campaigns`, znany i udokumentowany wyjątek)
- advisory bezpieczeństwa prod są odczytane — **jak sprawdzić:** wklejony wynik `get_advisors` (security) i odnośnik do wpisów w `docs/deferred-tasks.md`
- historia migracji na prod jest odczytana przed zmianą i po dwóch komendach tj zawiera dokładnie `002` i `003` — **jak sprawdzić:** dwa wklejone wyniki `list_migrations`
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
- 2026-11-03 odczyt prod: historia migracji nie jest pusta (`003 optimize_schema` i trzy z 2026-08-13 dla `ad_campaigns`), żadnej nie było w repo.
- 2026-11-03 tj: 4 istniejące migracje odtworzone jako pliki w repo z `supabase_migrations.schema_migrations` (treść bez zmian); baseline dostaje wersję `002` (przed `003`) i nie zawiera `ad_campaigns`, bo tę tabelę tworzą późniejsze migracje. Sprawdzone odczytem: `003` jest w całości idempotentna (IF [NOT] EXISTS, CREATE OR REPLACE z treścią identyczną z prod), a `ad_campaigns` na prod zgadza się z `20260813140128`. Na prod oznaczamy jako zastosowany tylko baseline `002`.
- 2026-11-03 tj: zmiana planu — `ad_campaigns` należy do innego projektu i nie trafia do repo. Pliki 3 migracji `ad_campaigns` usunięte z repo (zostaje `003_optimize_schema.sql`); baseline `002` bez `ad_campaigns`; kryterium liczby tabel: prod = plik + 1. Bramka 2 to dwie komendy tj w kolejności: `supabase migration repair --status reverted 20260813135218 20260813135657 20260813140128`, potem `supabase migration repair --status applied 002`; po nich `list_migrations` = dokładnie `002` i `003`. Oryginalny DDL 3 migracji tylko w raporcie, do przekazania drugiemu projektowi.
- 2026-11-03 odczyt prod `ad_campaigns` (agregaty): 83 wiersze, `max(created_at)` 2026-08-13 14:03 UTC, `max(date)` 2026-08-13 — nic nie pisze od dnia utworzenia.
- 2026-11-03 odczyt zrzutu: `anon` i `authenticated` miały `GRANT ALL` na `ad_campaigns` bez RLS (tabela otwarta przez API); wcześniejszy wniosek „brak grantów” był błędny (`information_schema.role_table_grants` nie pokazuje cudzych ról), skorygowany w deferred.
- 2026-11-03 tj: `REVOKE ALL ON public.ad_campaigns FROM anon, authenticated` przez SQL Editor, poza migracjami z decyzji (tabela nie należy do tego repo). Sprawdzone przez `supabase-prod`: `has_table_privilege` = false dla SELECT/INSERT/UPDATE/DELETE obu ról.
- 2026-11-03 tj: wykonane `supabase migration repair --status reverted 20260813135218 20260813135657 20260813140128` i `--status applied 002`; `list_migrations` po zmianie = `002 baseline`, `003 optimize_schema`.

---
id: LK-1.06
title: Zamknięcie complete_payment dla anon (pierwsza migracja na baseline)
status: in_progress
difficulty: S
model: null
model_approved: null
effort: null
branch: null
due: null
depends_on: [LK-1.02]
blocked_by_questions: []
touches_db: true
touches_prod: true
pr: null
---

## Cel

Funkcja `complete_payment` działa z pełnymi prawami (`SECURITY DEFINER`) i może ją wywołać każdy
z kluczem anon (`/rest/v1/rpc/complete_payment`). Domyka każdą transakcję, która nie jest
`completed`, także `failed`, więc ktoś, kto porzucił płatność, może dać sobie podbicie za darmo.
Sukces: funkcję wywołuje wyłącznie `service_role` (webhook P24), a zmiana weszła na prod jako
pierwsza migracja na baseline z LK-1.02, co przy okazji sprawdza całą ścieżkę migracji.

## Zakres

- [ ] odczyt stanu przez `supabase-prod`: uprawnienia do `complete_payment` (`has_function_privilege` dla `anon`, `authenticated`, `service_role`, `public`) i jej `proconfig`; definicja w `supabase/migrations/002_baseline.sql`
- [ ] migracja `supabase/migrations/<timestamp>_lock_complete_payment.sql`: `REVOKE EXECUTE` na `public.complete_payment(uuid, text)` od `public`, `anon`, `authenticated`; jawny `GRANT EXECUTE` dla `service_role`; `ALTER FUNCTION ... SET search_path = public, pg_temp`
- [ ] przygotowanie komend wdrożenia: `supabase db push --dry-run` i `supabase db push` z `--db-url` (hasło wpisuje tj, nie trafia do sesji agenta)
- [ ] po wdrożeniu przez tj: odczyt uprawnień i red proof
- [ ] wpis w `docs/deferred-tasks.md` (pozycja o funkcjach `SECURITY DEFINER`): `complete_payment` zamknięte w LK-1.06, reszta bez zmian

## Gotowe, gdy

- w repo są 3 migracje (`002`, `003`, nowa) i nowa zawiera tylko zmiany uprawnień i `search_path` dla `complete_payment` — **jak sprawdzić:** `ls supabase/migrations` i `cat` nowego pliku
- dry-run pokazuje do wdrożenia wyłącznie nową migrację — **jak sprawdzić:** wklejony wynik `supabase db push --dry-run` (uruchamia tj)
- po wdrożeniu historia na prod ma `002`, `003` i nową — **jak sprawdzić:** wklejony `list_migrations`
- `anon`, `authenticated` i `public` nie mogą wykonać funkcji, `service_role` może — **jak sprawdzić:** wklejony SELECT `has_function_privilege(<rola>, 'public.complete_payment(uuid, text)', 'EXECUTE')` dla czterech ról (false, false, false, true) i `proconfig` z `search_path`
- red proof: wywołanie przez REST kluczem anon z losowym UUID przed wdrożeniem zwraca błąd „Transaction not found” (funkcja dostępna), a po wdrożeniu odmowę uprawnień (`42501` / `permission denied`) — **jak sprawdzić:** dwa wklejone wyniki `curl` (bez wypisywania klucza); losowy UUID nie istnieje, więc wywołanie niczego nie zmienia

## Poza zakresem

- `increment_ad_view`, `increment_contact_count`: wywołania anonimowe są zamierzone (liczniki) → bez zmian, zostaje wpis w deferred
- granty `anon` na tabele `ads`, `phone_hashes`, `transactions` i polityki RLS → osobne zadanie z deferred
- `ad_campaigns` → poza repo (decyzja tj 2026-11-03)
- weryfikacja kwoty i `verify` w webhooku P24 → LK-2.02
- lokalny stack i `db reset` → LK-1.04

## Bramki STOP

- przed wdrożeniem: pokaż plik migracji i komendę `db push --dry-run`; **dry-run i `db push` uruchamia tj**
- żadnego `apply_migration`, `execute_sql` innego niż SELECT ani `migration repair` po stronie agenta
- red proof tylko z losowym, nieistniejącym UUID; nigdy z identyfikatorem prawdziwej transakcji
- klucz anon tylko ze zmiennej środowiskowej, nigdy wypisany w raporcie ani w logu

## Kontekst

- `supabase/migrations/002_baseline.sql` — definicja i granty `complete_payment`
- `app/api/webhooks/p24/route.ts` — wywołanie funkcji kluczem `service_role` (`createAdminClient`)
- `docs/deferred-tasks.md` — wpis o funkcjach `SECURITY DEFINER`

## Notatki z realizacji

- 2026-11-03 tj: zamknąć teraz małym zadaniem z migracją, a nie przez SQL Editor (prod ma się zgadzać z repo) ani dopiero w LK-2.02.

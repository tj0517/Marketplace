# CLAUDE.md — Lekcjo.pl

Lekcjo.pl to platforma ogłoszeniowa łącząca uczniów z korepetytorami. Korepetytorzy dodają
ogłoszenia, a płatne podbicia idą przez Przelewy24 (P24).

## Stack

Next.js 16 (App Router), React 19, Tailwind CSS v4 · Supabase (PostgreSQL) · Przelewy24 ·
Resend (e-mail) · Vercel (deploy, cron w `vercel.json`) · Playwright (testy) · pnpm.

## Mapa repo

- `app/` — strony i trasy (App Router); `app/components/` — komponenty UI
- `app/api/` — `cron/`, `payments/`, `webhooks/p24/`, `analytics/`, `recover-magic-link/`
- `actions/` — server actions: `admin/`, `public/`, `user/`, `emails.ts`
- `lib/` — `config.ts` (konfiguracja i flagi), `supabase/` (`server.ts`, `admin.ts`), `resend.ts`, walidacja, rate limit
- `emails/` — szablony e-maili (React Email)
- `middleware.ts` — blokada `/admin` (Basic Auth)
- `supabase/` — `config.toml`, `seed.sql`, `migrations/`
- `types/supabase.ts` — typy bazy generowane przez `pnpm db:types`
- `tests/global-setup.ts` — setup Playwrighta; testy jednostkowe leżą obok kodu w `lib/` (`*.test.ts`)
- `.github/workflows/ci.yml` — CI na PR-ach do `main`
- `docs/` — zadania, otwarte pytania, odłożone sprawy (niżej)

Zmienne środowiskowe: tabela w `README.md`, wzór w `.env.example`.

## Komendy (`package.json` → `scripts`)

```
pnpm dev           pnpm build         pnpm start
pnpm lint          pnpm typecheck
pnpm test          pnpm test:unit     pnpm test:ui
pnpm test:headed   pnpm test:debug
pnpm db:start      pnpm db:stop       pnpm db:reset      pnpm db:types
```

CI na każdym PR do `main`: `pnpm typecheck`, eslint tylko na zmienionych plikach `.ts`/`.tsx`,
`pnpm test:unit`, skan sekretów gitleaks (cała historia).

## Zakazy i reguły (nienegocjowalne)

- **Baza tylko migracją.** Każda zmiana bazy to plik w `supabase/migrations/` w tym repo; nigdy
  wprost na prod. Agent nie aplikuje migracji sam — robi to tj. Zastosowanych migracji się nie
  edytuje. Punkt wyjścia schematu: `supabase/migrations/002_baseline.sql`.
- **Klucz z pełnymi prawami tylko na serwerze.** `lib/supabase/admin.ts` (`SUPABASE_SERVICE_ROLE_KEY`)
  ma `import 'server-only'`; nie importuj go w kodzie klienckim (`'use client'`).
- **Gorąca ścieżka: płatności.** P24 (`app/api/payments/`, `app/api/webhooks/p24/`) i flaga
  `PROMOTIONS_ENABLED` (`lib/config.ts`) — zmiany tylko w ramach zadania, które je obejmuje.
- **Bez wysyłki prawdziwych maili.** Nie wywołuj wysyłki przez Resend na prawdziwe adresy.
- **Tylko pnpm** (O-01). Nigdy `npm install`, nigdy nie twórz `package-lock.json`. Nowa zależność to decyzja tj.
- **Limit pamięci** (O-03). `next build` i lokalny stack Supabase tylko gdy
  `sysctl -n kern.memorystatus_vm_pressure_level` = 1; build przy zatrzymanym stacku; inaczej stop i raport.
- **Lint tylko zmienionych plików.** Bez masowych poprawek lintu — 52 stare błędy to znany dług.
- Bez sekretów w repo; w kodzie i dokumentacji tylko nazwy zmiennych.

## Dokumentacja

- `docs/tasks/` — zadania (`INDEX.md` + `LK-x.yy.md`); plik zadania jest źródłem prawdy
- `docs/04-open-questions.md` — otwarte i rozstrzygnięte pytania (O-xx)
- `docs/deferred-tasks.md` — zauważone, nienaprawione; dopisuj tu z id zadania

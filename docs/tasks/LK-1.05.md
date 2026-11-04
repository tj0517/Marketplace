---
id: LK-1.05
title: Krótki CLAUDE.md z mapą repo i zakazami
status: in_progress
difficulty: S
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

Agent zaczyna każdą sesję w tym repo bez reguł projektu. Krótki `CLAUDE.md` daje mu mapę repo i
nienegocjowalne zakazy, więc nie musi ich zgadywać, a prompt nie musi ich powtarzać. Sukces:
plik poniżej ~8 000 znaków, zgodny z `package.json` i śledzony przez git.

## Zakres

- [ ] odczyt stanu: `.gitignore` (na `main` wyklucza `CLAUDE.md`; poprawka jest na gałęzi `chore/wf-mcp`), `package.json`, struktura `app/`, `actions/`, `lib/`
- [ ] `CLAUDE.md`: produkt w 2 zdaniach, stack, mapa katalogów, komendy z `package.json` (dosłownie), zakazy: zmiany bazy tylko migracją w repo i nigdy wprost na prod; klucz z pełnymi prawami tylko po stronie serwera; płatności P24 i flaga `PROMOTIONS_ENABLED` to gorąca ścieżka; bez wysyłki prawdziwych maili; odsyłacze do `docs/`

## Gotowe, gdy

- `CLAUDE.md` jest śledzony — **jak sprawdzić:** `git ls-files CLAUDE.md` i `git check-ignore CLAUDE.md` puste
- rozmiar poniżej 8 000 znaków — **jak sprawdzić:** `wc -c CLAUDE.md`
- każda komenda z `CLAUDE.md` istnieje w `package.json` — **jak sprawdzić:** lista komend z pliku zestawiona ze `scripts` w raporcie
- każda ścieżka z `CLAUDE.md` istnieje — **jak sprawdzić:** `ls` dla każdej, w raporcie

## Poza zakresem

- `.mcp.json` i `.claude/settings.json` → gałąź `chore/wf-mcp` (wf-init)
- opis schematu bazy → po LK-1.02 (dopisek z odsyłaczem do migracji)

## Bramki STOP

- jeśli gałąź `chore/wf-mcp` nie jest jeszcze w `main`: stop i pytanie do tj (bez niej `CLAUDE.md` jest ignorowany przez git)

## Kontekst

- `README.md` — stack, zmienne, cron
- `package.json` — komendy
- `$WF/core/tokens.md` — limit rozmiaru `CLAUDE.md`

## Notatki z realizacji

- 2026-11-02 tj: zadanie dodane w wf-plan (D2).
- 2026-11-04 tj: zakres wariant B — CLAUDE.md zawiera też reguły pnpm only (O-01), limit presji pamięci (O-03) i lint tylko zmienionych plików.

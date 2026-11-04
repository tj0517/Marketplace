# Zadania Lekcjo.pl (LK)

Widok dla ludzi. Przy rozbieżności rozstrzyga frontmatter pliku zadania.

## Etap 1: Fundament (bezpieczeństwo i środowisko)

| id | tytuł | status | trudność | zależności | pytania | due |
|---|---|---|---|---|---|---|
| LK-1.01 | Akcje admina same sprawdzają uprawnienia | done | M | LK-1.04 | — | — |
| LK-1.02 | Schemat produkcji do repo (baseline) | done | M | — | — | — |
| LK-1.03 | server-only dla klucza admina i CI na PR-ach | done | M | — | — | — |
| LK-1.04 | Lokalna baza, seed, .env.example i bezpiecznik testów | done | M | LK-1.02 | — | — |
| LK-1.05 | Krótki CLAUDE.md z mapą repo i zakazami | done | S | — | — | — |
| LK-1.06 | Zamknięcie complete_payment dla anon (pierwsza migracja na baseline) | done | S | LK-1.02 | — | — |

## Etap 2: Zmiany dla klienta (zakres 1 000 zł netto)

| id | tytuł | status | trudność | zależności | pytania | due |
|---|---|---|---|---|---|---|
| LK-2.01 | Zgody marketingowe i uprawnienie do podbicia za 1 zł | done | L | LK-1.02, LK-1.04 | — | — |
| LK-2.03 | Przedmioty i poziomy w formularzach, wyszukiwarka, kolumny w panelu admina | done | M | LK-1.01, LK-2.01 | — | — |
| LK-2.02 | Podbicie za 1 zł — kwota z serwera, rezerwacja, webhook z kontrolą kwoty i verify | done | L | LK-2.01 | — | — |


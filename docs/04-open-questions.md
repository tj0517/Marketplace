# Otwarte pytania (LK)

| id | pytanie | status | blokuje | odpowiedź |
|---|---|---|---|---|
| O-01 | Którego menedżera paczek używa build na Vercelu: npm czy pnpm? (log buildu: „Installing dependencies…”). W repo są oba lockfile'y; `pnpm-lock.yaml` nowszy (2026-06-05), `package-lock.json` z 2026-02-28; zmiana `package.json` z 2026-09-21 nie odświeżyła żadnego. | rozstrzygnięte 2026-11-03 | — | pnpm: log buildu Vercel „Detected `pnpm-lock.yaml` 9”; w LK-1.03 usunąć `package-lock.json` |
| O-02 | Kto robi zrzut schematu z prod (wymaga hasła do bazy)? | rozstrzygnięte 2026-11-02 | — | tj, jedną komendą przygotowaną przez agenta; hasło nie trafia do sesji agenta |
| O-03 | Czy lokalny stack Supabase ma działać na Macu 8 GB? | rozstrzygnięte 2026-11-02 | — | tak, odchudzony (`supabase start -x …`), z limitem presji pamięci |
| O-04 | Treść zgody marketingowej i jej wersja (poda tj/klient). | otwarte | wdrożenie LK-2.01 na prod (nie implementację) | — |
| O-05 | Czy zgoda z formularza dodawania też przyznaje uprawnienie do podbicia za 1 zł? | rozstrzygnięte 2026-11-02 | — | tak, przyznaje |
| O-06 | Czy wycofanie zgody odbiera niewykorzystane uprawnienie? | rozstrzygnięte 2026-11-02 | — | nie odbiera |

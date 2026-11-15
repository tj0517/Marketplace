---
id: LK-2.05
title: Teksty promocji — zgoda v2, checkbox z linkiem, strona /podbicie-ogloszenia, nowy układ /zgoda-marketingowa
status: done
difficulty: M
model: null
model_approved: null
effort: null
branch: feat/lk-2.05-promo-copy-v2
due: null
depends_on: []
blocked_by_questions: []
touches_db: false
touches_prod: false
pr: 16
---

## Cel

Klient przebudowuje komunikację promocji 1 zł: nowa treść zgody przy checkboxie (wersja v2), link
„podbicie ogłoszenia” do nowej strony wyjaśniającej podbicie i nowy układ strony `/zgoda-marketingowa`.
Sukces: nowe zgody zapisują się z wersją v2, korzystający widzi, co dostaje, a mechanika zgód
(LK-2.01) działa bez zmian.

## Zakres

- [ ] odczyt stanu: `lib/marketing-consent.ts`, `app/components/add-offer-form.tsx`, `app/components/marketing-consent-form.tsx`, `app/zgoda-marketingowa/page.tsx`, `app/zasady-ogloszen/page.tsx` (wzór układu), `app/sitemap.ts`
- [ ] `MARKETING_CONSENT`: wersja `v2-2026-11-15`, treść z O-07 dosłownie
- [ ] checkbox w formularzu dodawania i na stronie zgody: treść v2, fraza „podbicie ogłoszenia” jako link do `/podbicie-ogloszenia`; kliknięcie linku nie zaznacza checkboxa
- [ ] nowa strona `/podbicie-ogloszenia` w układzie `/zasady-ogloszen`, tekst klienta dosłownie (brief w Notatkach), metadane, wpis w `app/sitemap.ts`
- [ ] `/zgoda-marketingowa`: układ i tekst klienta dosłownie (brief w Notatkach): nagłówek, opis, sekcja 4 miejsc, tekst pomocniczy mniejszą czcionką nad polem e-mail, checkbox v2, przycisk; `CONSENT_PAGE_COPY` zaktualizowany
- [ ] RWD: telefon i desktop dla obu stron i formularza

## Gotowe, gdy

- nowa zgoda zapisuje się z wersją v2 — **jak sprawdzić:** zgoda z formularza i ze strony zgody na lokalnej bazie, wklejony `select source, content_version from marketing_consents order by created_at desc limit 2` = dwa wiersze `v2-2026-11-15`
- checkbox nadal dobrowolny w formularzu i wymagany na stronie zgody (po stronie serwera) — **jak sprawdzić:** red proof: bezpośrednie wywołanie akcji strony zgody bez `consent` jest odrzucone (wynik w raporcie)
- link w etykiecie nie zaznacza checkboxa — **jak sprawdzić:** Playwright: klik w „podbicie ogłoszenia” otwiera `/podbicie-ogloszenia`, a checkbox zostaje odznaczony (zrzut / `isChecked() === false`)
- teksty dosłownie jak w briefie — **jak sprawdzić:** zrzuty `/podbicie-ogloszenia` i `/zgoda-marketingowa` przy 375 px i 1280 px; brak poziomego przewijania
- `pnpm typecheck`, `pnpm test:unit` i lint zmienionych plików bez nowych błędów — **jak sprawdzić:** wklejone wyniki

## Poza zakresem

- mail po zgodzie, link do panelu, okno płatności, baner w panelu → LK-2.06
- zmiany w Polityce prywatności i Regulaminie
- zmiana zapisanych zgód v1 (zostają z wersją v1)

## Bramki STOP

- wysyłka maila marketingowego na prawdziwy adres → nie; tylko `@seed.test`
- `next build` i lokalny stack tylko przy `kern.memorystatus_vm_pressure_level` = 1 (O-03); inaczej stop i raport
- zmiana logiki zapisu zgody lub uprawnień → stop, to nie ten zakres

## Kontekst

- `lib/marketing-consent.ts` — treść i wersja zgody, `CONSENT_PAGE_COPY`
- `app/zasady-ogloszen/page.tsx` — wzór układu strony
- `docs/tasks/LK-2.01.md` — decyzje o zgodach
- `docs/04-open-questions.md` — O-07, O-08

## Notatki z realizacji

- 2026-11-15 tj: treść zgody v2 = dosłownie tekst klienta (O-07), świadomie bez danych administratora i informacji o wycofaniu w treści zgody; informacja o wycofaniu jest w tekście pomocniczym na stronie zgody i w mailu.
- 2026-11-15 tj: sformułowania o „pierwszym miejscu” dosłownie jak klient (O-08), bez dopisku o spadaniu pozycji.
- 2026-11-15 otwarte: poprawka ortografii w tekście klienta („Zapisuje się … 1zł” → „Zapisuję się … 1 zł”; „trafiasz na czele listy”) — decyzja tj przed startem; bez niej agent przepisuje dosłownie.
- 2026-11-15 brief klienta (dosłownie):

  **Checkbox (formularz dodawania, pod polityką i regulaminem; strona zgody):**

  > ☐ 🎁 ZGARNIJ LIMITOWANE PODBICIE ZA 1 ZŁ!
  >
  > Dołącz do newslettera Lekcjo.pl i odbierz swoje pierwsze podbicie ogłoszenia za 1 zł. Korzystaj z promocji, nowości i wskazówek, jak zdobywać więcej uczniów.

  „podbicie ogłoszenia” — hiperłącze do nowej strony (format jak `/zasady-ogloszen`).

  **Strona `/podbicie-ogloszenia`:**

  > 🚀 Czym jest podbicie ogłoszenia?
  >
  > Podbij ogłoszenie i wyświetlaj się jako pierwszy w 4 kluczowych miejscach Lekcjo.pl!
  >
  > 🎯 Gdzie pojawi się Twoje ogłoszenie?
  >
  > 🏠 Na samej górze strony głównej
  > Twoje ogłoszenie zostanie wyświetlone na samej górze strony głównej Lekcjo.pl - w miejscu, które odwiedzający widzą zaraz po wejściu na portal.
  >
  > 📍 Na szczycie wyników w Twoim mieście
  > Twoja oferta wskakuje na samą górę w swojej lokalizacji. Osoby szukające korepetytora w Twoim mieście zobaczą ją w pierwszej kolejności.
  >
  > 📚 W wynikach dla Twoich przedmiotów i poziomów
  > Pojawiasz się na samym szczycie wyszukiwania dla każdego wskazanego przedmiotu (np. matematyka, angielski, fizyka) oraz poziomu (od szkoły podstawowej i E8, przez liceum i maturę, po studia).
  >
  > 💻 Na czele listy korepetycji online
  > Pojawiasz się na szczycie wyników korepetycji online i docierasz do uczniów szukających lekcji zdalnych z całej Polski.
  >
  > 💡 Jedno podbicie = Twoje ogłoszenie na czele 4 kluczowych miejsc Lekcjo.pl!

  **Strona `/zgoda-marketingowa` (układ i treść):**

  > 🎁 Zgarnij pierwsze podbicie ogłoszenia za 1 zł!
  >
  > Dołącz do newslettera Lekcjo.pl i odbierz jednorazową zniżkę, podbij swoje ogłoszenie za 1 zł! 🚀
  >
  > Otrzymasz przydatne porady, jak zdobywać więcej uczniów, oraz informacje o nowościach i promocjach w Lekcjo.pl.
  >
  > 🚀 Co daje podbicie ogłoszenia?
  >
  > Podbij ogłoszenie i wyświetlaj się jako pierwszy w 4 kluczowych miejscach Lekcjo.pl!
  >
  > 🏠 Strona główna – Twoje ogłoszenie wyświetla się na samej górze strony głównej Lekcjo.pl.
  >
  > 📍 Twoje miasto – wskakujesz na 1. miejsce w swojej lokalizacji.
  >
  > 📚 Przedmioty i poziomy – pojawiasz się na szczycie wyników dla swoich przedmiotów (np. matematyka, angielski, fizyka) i poziomów (od szkoły podstawowej i E8, po liceum, maturę czy studia).
  >
  > 💻 Korepetycje online – trafiasz na czele listy dla uczniów szukających zajęć zdalnych z całej Polski.
  >
  > ⚡ Jedno podbicie = Twoje ogłoszenie na czele 4 kluczowych miejsc Lekcjo.pl!
  >
  > [Mniejszą czcionką]:
  > Wpisz adres e-mail podany przy dodawaniu ogłoszenia. Zgodę możesz wycofać w każdej chwili, korzystając z linku zawartego w wiadomości.
  >
  > [Miejsce na email]
  >
  > ☐ 🎁 ZGARNIJ LIMITOWANE PODBICIE ZA 1 ZŁ!
  >
  > Dołącz do newslettera Lekcjo.pl i odbierz swoje pierwsze podbicie ogłoszenia za 1 zł. Korzystaj z promocji, nowości i wskazówek, jak zdobywać więcej uczniów.
  >
  > [Zapisuje się i odbieram podbicie za 1zł]
- 2026-11-15 tj: ortografia w tekście klienta poprawiona — przycisk „Zapisuję się i odbieram podbicie za 1 zł”, „trafiasz na czoło listy”; reszta dosłownie.
- 2026-11-15 tj (wprost, na pytanie agenta): dowody LK-2.05 uruchamiane przy `kern.memorystatus_vm_pressure_level` = 2 — tylko w tej sesji, tylko dla tego zadania. Zajęte porty przez stack innego projektu → agent staje i pisze, tj zatrzymuje go sam.
- 2026-11-15 tj: odbiór w review, PR #16 — wszystkie kryteria udowodnione (v2 w bazie, red proof bez consent, isChecked=false po kliknięciu linku w obu miejscach + kontrola etykiety, 11 zrzutów, prod nietknięty). Zmiany poza briefem przyjęte: etykieta „Email”, dolna nawigacja na /podbicie-ogloszenia, metadane z tekstu briefu.

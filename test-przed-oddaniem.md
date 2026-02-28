# Test przedwdrożeniowy — Lekcjo.pl
**Środowisko:** https://lekcjo.pl (Vercel produkcja)
**Przed testem:** Upewnij się że P24_SANDBOX=true (testowe płatności), Resend zweryfikowany

---

## PRZYGOTOWANIE

- [ ] Otwórz https://lekcjo.pl w przeglądarce (tryb incognito)
- [ ] Przygotuj 2 różne numery telefonu do testów (możesz użyć +48 111 111 111 i +48 222 222 222)
- [ ] Przygotuj adres email do odbioru maili
- [ ] Miej pod ręką dane testowej karty P24 sandbox: `4012001038443335`, dowolna data przyszła, CVV: dowolne 3 cyfry

---

## 1. STRONA GŁÓWNA

- [ ] Strona ładuje się bez błędów
- [ ] Widać hero section z polem wyszukiwania
- [ ] Lista ogłoszeń się wyświetla (lub pusty stan jeśli brak ogłoszeń)
- [ ] Navbar widoczny, logo/nazwa "Lekcjo" poprawna
- [ ] Linki w navbarze działają (Dodaj ogłoszenie, Kontakt)
- [ ] Strona ładuje się na mobile (zmniejsz okno przeglądarki)

---

## 2. DODAWANIE OGŁOSZENIA — DARMOWE (1. ogłoszenie na numer)

**Cel:** Sprawdzić że pierwszy slot jest faktycznie darmowy.

- [ ] Kliknij "Dodaj ogłoszenie"
- [ ] Wybierz typ: **Oferuję korepetycje**
- [ ] Wypełnij formularz:
  - Tytuł: `Test korepetycje z matematyki`
  - Przedmiot: wybierz dowolny
  - Lokalizacja: `Warszawa`
  - Opis: `Opis testowy ogłoszenia`
  - Zakres: zaznacz np. `szkoła średnia` + `matura`
  - Cena: `80` zł / `60 min`
  - Płeć: dowolna
  - Email: twój email testowy
  - Telefon: `+48 111 111 111` (numer 1 — nowy, nigdy nieużywany)
  - Akceptuj regulamin
- [ ] Kliknij "Dodaj ogłoszenie"
- [ ] **Oczekiwany wynik:** Formularz pokazuje opcję DARMOWEJ aktywacji (cena 0 zł), NIE płatność
- [ ] Kliknij "Aktywuj darmowo"
- [ ] **Oczekiwany wynik:** Ogłoszenie aktywowane, pojawia się potwierdzenie

**Weryfikacja email:**
- [ ] Sprawdź skrzynkę — powinieneś dostać email powitalny z magic linkiem
- [ ] Email nadawcy to `noreply@lekcjo.pl` (nie `onboarding@resend.dev`)
- [ ] Email zawiera link do zarządzania ogłoszeniem
- [ ] Kliknij magic link — otwiera się panel zarządzania

---

## 3. OGŁOSZENIE WIDOCZNE NA LIŚCIE

- [ ] Wróć na stronę główną
- [ ] Ogłoszenie `Test korepetycje z matematyki` widoczne na liście
- [ ] Kliknij ogłoszenie — otwiera się strona szczegółów
- [ ] URL wygląda jak `/offers/[uuid-lub-slug]`
- [ ] Widać: tytuł, opis, lokalizacja, cena, przedmiot, zakres, płeć
- [ ] Licznik wyświetleń działa (odśwież stronę — licznik rośnie)

---

## 4. UJAWNIANIE NUMERU TELEFONU

- [ ] Na stronie ogłoszenia kliknij "Pokaż numer" / "Skontaktuj się"
- [ ] Numer telefonu się ujawnia
- [ ] Kliknij jeszcze kilka razy — numer nadal widoczny (nie ma błędu)
- [ ] **Test rate limit:** Kliknij "Pokaż numer" 11 razy z rzędu w ciągu minuty
- [ ] **Oczekiwany wynik:** Po 10. kliknięciu pojawia się komunikat o limicie

---

## 5. PANEL ZARZĄDZANIA OGŁOSZENIEM (MAGIC LINK)

Wejdź przez magic link z emaila (krok 2).

- [ ] Widać status ogłoszenia: **Aktywne**
- [ ] Widać datę wygaśnięcia (ok. 30 dni od teraz)
- [ ] Widać licznik wyświetleń
- [ ] Widać podgląd treści ogłoszenia

**Edycja:**
- [ ] Kliknij "Edytuj"
- [ ] Zmień tytuł na `Test korepetycje z matematyki — EDYTOWANE`
- [ ] Zapisz
- [ ] **Oczekiwany wynik:** Tytuł zaktualizowany, zmiany widoczne na liście
- [ ] Sprawdź że NIE można zmienić numeru telefonu (pole jest zablokowane lub niewidoczne)

---

## 6. PODBICIE OGŁOSZENIA (płatność P24)

- [ ] W panelu zarządzania kliknij "Podbij ogłoszenie" (10 zł)
- [ ] **Oczekiwany wynik:** Przekierowanie na stronę płatności P24 sandbox
- [ ] URL zaczyna się od `https://sandbox.przelewy24.pl`
- [ ] Zapłać kartą testową: `4012001038443335`
- [ ] **Oczekiwany wynik:** Przekierowanie na `https://lekcjo.pl/payment/success` (NIE localhost!)
- [ ] Strona success pokazuje: "Płatność zakończona!" (po kilku sekundach)
- [ ] Sprawdź email — powinien przyjść email potwierdzający podbicie
- [ ] Wróć na listę ogłoszeń — ogłoszenie powinno być na górze

---

## 7. DODAWANIE OGŁOSZENIA — PŁATNE (2. ogłoszenie na ten sam numer)

**Cel:** Sprawdzić że drugi slot wymaga płatności.

- [ ] Dodaj nowe ogłoszenie (typ: Oferuję) z **tym samym numerem telefonu** (`+48 111 111 111`)
- [ ] **Oczekiwany wynik:** Formularz pokazuje opcję płatnej aktywacji (10 zł), NIE darmowej
- [ ] Zapłać kartą testową
- [ ] **Oczekiwany wynik:** Po płatności ogłoszenie aktywowane, email powitalny

---

## 8. OGŁOSZENIE TYPU "SZUKAM"

- [ ] Dodaj ogłoszenie typ: **Szukam korepetytora**
- [ ] Wypełnij formularz (bez numeru telefonu — to pole informacyjne)
- [ ] **Oczekiwany wynik:** Brak płatności, ogłoszenie dodane od razu
- [ ] Sprawdź że ogłoszenie "Szukam" pojawia się w osobnej sekcji/zakładce od "Oferuję"
- [ ] Sprawdź że NIE ma przycisku "Podbij" dla ogłoszenia "Szukam"

---

## 9. WYSZUKIWANIE I SORTOWANIE

- [ ] Wpisz w search: `matematyka` — powinny pojawić się ogłoszenia z matematyki
- [ ] Wpisz: `Warszawa` — ogłoszenia z Warszawy
- [ ] Wpisz: `matura` — ogłoszenia z zakresem matura
- [ ] Wyczyść search — wraca pełna lista
- [ ] Sprawdź sortowanie: ogłoszenie które właśnie podbito powinno być na górze

---

## 10. ODZYSKIWANIE MAGIC LINKA

- [ ] Wejdź na `/recover-magic-link`
- [ ] Wpisz email i numer telefonu ogłoszenia z kroku 2
- [ ] Kliknij "Wyślij link"
- [ ] **Oczekiwany wynik:** Email z magic linkiem przychodzi
- [ ] Kliknij link — otwiera się panel zarządzania

**Test błędnych danych:**
- [ ] Wpisz poprawny email ale zły numer — **oczekiwany wynik:** błąd (nie znaleziono)
- [ ] Wpisz zły email i poprawny numer — **oczekiwany wynik:** błąd

---

## 11. PRZEDŁUŻENIE OGŁOSZENIA (po wygaśnięciu)

> Ten test wymaga albo poczekania 30 dni, albo ręcznej zmiany statusu w panelu admina.

- [ ] W panelu admina zmień status ogłoszenia na `expired`
- [ ] Wejdź przez magic link — widać status: **Wygasłe**
- [ ] Przycisk "Podbij" powinien być niedostępny
- [ ] Kliknij "Przedłuż ogłoszenie" (10 zł)
- [ ] Zapłać kartą testową
- [ ] **Oczekiwany wynik:** Status zmieniony na aktywne, data wygaśnięcia +30 dni od teraz
- [ ] **Oczekiwany wynik:** Ogłoszenie pojawia się NA GÓRZE listy (visible_at = teraz)
- [ ] Email potwierdzający przedłużenie przychodzi

---

## 12. USUNIĘCIE OGŁOSZENIA

- [ ] W panelu zarządzania kliknij "Usuń ogłoszenie"
- [ ] Potwierdź usunięcie
- [ ] **Oczekiwany wynik:** Ogłoszenie znika z listy publicznej
- [ ] **Oczekiwany wynik:** Magic link już nie otwiera panelu (lub pokazuje błąd)

---

## 13. CRON JOB

- [ ] Wywołaj ręcznie:
```
curl -H "Authorization: Bearer kXuUpmv24dXV708tfRpx" https://lekcjo.pl/api/cron
```
- [ ] **Oczekiwany wynik:** JSON z podsumowaniem: `expiringSoonEmailsSent`, `expiredEmailsSent`, `abandonedTransactionsMarked`
- [ ] Bez tokenu → **oczekiwany wynik:** 401
- [ ] Ze złym tokenem → **oczekiwany wynik:** 401

---

## 14. PANEL ADMINISTRACYJNY

- [ ] Wejdź na `https://lekcjo.pl/admin`
- [ ] Pojawia się okno logowania Basic Auth
- [ ] Zaloguj się: `ADMIN` / `xLrZG8y8WEIXDlakqRxmI8ytyJxg90aK`
- [ ] Błędne hasło → odmowa dostępu

**Zakładka Ogłoszenia:**
- [ ] Lista ogłoszeń widoczna (wszystkie poza deleted)
- [ ] Zmień status ogłoszenia na `expired` — działa
- [ ] Zmień status z powrotem na `active` — działa
- [ ] Usuń ogłoszenie — znika z listy

**Zakładka Transakcje:**
- [ ] Lista transakcji widoczna
- [ ] Widać typ (activation/extension/bump), kwotę, status, datę

**Zakładka Statystyki:**
- [ ] Widać: liczbę ogłoszeń, liczbę płatności, przychód

**Zakładka Email (bulk):**
- [ ] Wybierz segment: `active`
- [ ] Wpisz temat i treść testową
- [ ] Wyślij do 1 ogłoszenia testowego
- [ ] Sprawdź że email dochodzi

---

## 15. STRONY PRAWNE I DODATKOWE

- [ ] `/regulamin` — strona się ładuje, treść po polsku, dane firmy widoczne
- [ ] `/polityka-prywatnosci` — strona się ładuje, RODO, dane processorów
- [ ] `/kontakt` — formularz kontaktowy działa (wyślij wiadomość testową)
- [ ] `/robots.txt` — `/api/`, `/admin/` są w Disallow
- [ ] `/sitemap.xml` — XML z listą stron

---

## 16. BEZPIECZEŃSTWO (szybkie sprawdzenie)

- [ ] Wejdź na `/admin` bez logowania → pojawia się okno auth
- [ ] Wejdź na `/api/cron` bez tokenu → 401
- [ ] Wejdź na `/offers/manage/randomtoken123` → błąd lub redirect (nie crash)
- [ ] Wejdź na `/offers/manage/../../../../etc/passwd` → 404 lub redirect (nie crash)
- [ ] Sprawdź nagłówki: DevTools → Network → dowolny request → Response Headers → widać `X-Frame-Options: DENY`, `Strict-Transport-Security`

---

## 17. WERYFIKACJA EMAILI — PODSUMOWANIE

Podczas testu powinny przyjść następujące emaile:

| # | Trigger | Typ emaila | Nadawca |
|---|---------|-----------|---------|
| 1 | Aktywacja darmowa | Powitalny z magic linkiem | noreply@lekcjo.pl |
| 2 | Aktywacja płatna (webhook) | Powitalny z magic linkiem | noreply@lekcjo.pl |
| 3 | Podbicie (bump) | Potwierdzenie podbicia | noreply@lekcjo.pl |
| 4 | Przedłużenie | Potwierdzenie przedłużenia | noreply@lekcjo.pl |
| 5 | Odzyskiwanie | Magic link recovery | noreply@lekcjo.pl |
| 6 | Cron (5 dni przed) | Ostrzeżenie o wygaśnięciu | noreply@lekcjo.pl |
| 7 | Cron (po wygaśnięciu) | Informacja o wygaśnięciu | noreply@lekcjo.pl |

---

## WYNIK TESTU

| Obszar | Status | Uwagi |
|--------|--------|-------|
| Strona główna + search | | |
| Dodawanie ogłoszenia (darmowe) | | |
| Dodawanie ogłoszenia (płatne) | | |
| Magic link + panel zarządzania | | |
| Podbicie (bump) — płatność | | |
| Przedłużenie — płatność | | |
| Ogłoszenie "Szukam" | | |
| Odzyskiwanie magic linka | | |
| Cron job | | |
| Panel admina | | |
| Emaile | | |
| Strony prawne | | |
| Bezpieczeństwo | | |

---

## PO ZAKOŃCZENIU TESTÓW

- [ ] Zmień `P24_SANDBOX=false` w Vercel + wgraj live credentials P24
- [ ] Redeploy na Vercelu
- [ ] Zrób 1 testową płatność live (np. 10 gr lub zwrot)
- [ ] Gotowe do oddania klientowi ✓

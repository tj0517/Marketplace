# Problemy do naprawienia przed uruchomieniem — Lekcjo.pl

Data audytu: 2026-02-18

---

## 🔴 Krytyczne (blokujące launch)

### 1. Regulamin i Polityka Prywatności — brak treści
**Pliki:** `app/regulamin/page.tsx`, `app/polityka-prywatnosci/page.tsx`

Obie strony zawierają wyłącznie placeholdery `[Treść do uzupełnienia przez klienta]`.
Uruchomienie płatnego serwisu bez prawidłowego Regulaminu i Polityki Prywatności (RODO) naraża na konsekwencje prawne.

**Do zrobienia:**
- Wypełnić treść Regulaminu (§1–§8)
- Wypełnić treść Polityki Prywatności (pkt 1–8)
- W `regulamin/page.tsx` zamienić `[DATA]` na prawdziwą datę ostatniej aktualizacji

---

### 2. `fetchAllAds` pokazuje nieaktywne ogłoszenia
**Plik:** `actions/public/ads.ts` (linia ~27)

Obecny filtr: `.neq('status', 'deleted')` — pobiera ogłoszenia o statusie `inactive`, `expired`, `pending`.

**Poprawka:** Zamienić na `.eq('status', 'active')` aby publiczny listing pokazywał tylko opłacone, aktywne ogłoszenia.

---

### 3. `revealContact` — brak zabezpieczeń
**Plik:** `actions/public/reveal-contact.ts`

Server action zwraca numer telefonu każdemu kto podda prawidłowy UUID. Brak:
- Rate limitingu
- Captcha
- Jakiejkolwiek autoryzacji

**Ryzyko:** Bot może wyskrobać wszystkie numery telefonów z bazy.

**Możliwe rozwiązania:**
- Dodać rate limit (np. Upstash `@upstash/ratelimit`)
- Dodać honeypot lub captchę na frontendzie
- Logować IP i blokować po X zapytaniach

---

### 4. Brak security headers w `next.config.ts`
**Plik:** `next.config.ts`

Plik jest całkowicie pusty. Brakuje nagłówków bezpieczeństwa:

```ts
const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "X-XSS-Protection", value: "1; mode=block" },
        ],
      },
    ];
  },
};
```

---

### 5. Słabe hasło admina
**Plik:** `.env.local`

`ADMIN_PASS=TYMON` — jednowyrazowe hasło jest łatwe do złamania. Zmienić na losowy ciąg 20+ znaków na produkcji.

---

### 6. Brak migracji Supabase w repozytorium
**Folder:** `supabase/`

Zawiera tylko `.temp/`. Schemat bazy danych istnieje wyłącznie w dashboardzie Supabase — brak wersjonowania.

**Do zrobienia:**
```bash
supabase db dump --file supabase/schema.sql
```
Lub skonfigurować `supabase init` + `supabase db pull` i commitować migracje.

---

## 🟡 Ważne (powinno być przed launch)

### 7. Stopka — hardkodowane teksty
**Plik:** `app/page.tsx` (linie 43–44, 63)

- Brand name `Korepetycje` hardkodowany zamiast użycia `APP_CONFIG.name`
- Linia 63: `"Stworzone z TJ."` — wygląda na tekst deweloperski, nie produkcyjny

---

### 8. `not-found.tsx` — dwa przyciski linkują do `/`
**Plik:** `app/not-found.tsx` (linie 25–34)

Oba przyciski („Wróć do strony głównej" i „Przeglądaj ogłoszenia") kierują na `/`.
Drugi powinien linkować do sekcji z ogłoszeniami lub mieć inną akcję.

---

### 9. Brak `robots.txt` i `sitemap.xml`
Brak pliku `robots.txt` i mapy strony. Dla SEO warto dodać:
- `app/robots.ts` (Next.js dynamic robots)
- `app/sitemap.ts` (Next.js dynamic sitemap)

---

### 10. Brak Open Graph i Twitter meta tags
**Plik:** `app/layout.tsx`

Brak tagów OG — udostępnianie linku na social media nie pokaże ładnego podglądu.
Dodać `openGraph` i `twitter` do obiektu `metadata`.

---

## 🟢 Drobne (nice-to-have)

### 11. Brak globalnego error boundary
Nie ma pliku `app/error.tsx`. Nieobsłużone błędy pokażą domyślną stronę Next.js.

### 12. `npm audit`
Warto uruchomić `npm audit` i naprawić znalezione podatności przed deplojmentem.

### 13. `console.error` w `reveal-contact.ts`
Linia 21 — produkcyjne server actions nie powinny logować błędów na konsolę bez zarządzania logami.

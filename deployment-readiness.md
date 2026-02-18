# Deploy na testy — Lekcjo.pl (krok po kroku)

## 1. Przygotowanie repozytorium

```bash
# Upewnij się że wszystko jest commitowane
git add .
git commit -m "pre-deploy: security headers, rate limit fix, legal pages"
git push origin main
```

## 2. Podpięcie do Vercel

1. Wejdź na [vercel.com](https://vercel.com) → **New Project**
2. Zaimportuj repo z GitHuba
3. Framework: **Next.js** (wykryje automatycznie)
4. Root Directory: `.` (lub `app` jeśli repo ma parent folder)
5. **Nie klikaj Deploy jeszcze** — najpierw env vars

## 3. Ustawienie zmiennych środowiskowych w Vercel

Wejdź w **Settings → Environment Variables** i dodaj:

```
NEXT_PUBLIC_APP_URL=https://lekcjo.pl  (lub Vercel preview URL na testy)
NEXT_PUBLIC_SUPABASE_URL=<twoja wartość z .env.local>
NEXT_PUBLIC_SUPABASE_ANON_KEY=<twoja wartość z .env.local>
SUPABASE_SERVICE_ROLE_KEY=<twoja wartość z .env.local>

ADMIN_USER=admin
ADMIN_PASS=<wygeneruj: openssl rand -base64 24>

PHONE_HASH_SECRET=<wygeneruj: openssl rand -base64 32>
CRON_SECRET=<wygeneruj: openssl rand -base64 24>

RESEND_API_KEY=<twoja wartość z .env.local>
RESEND_FROM_EMAIL=onboarding@resend.dev  (na testy, potem zmienisz na @lekcjo.pl)

PAYMENT_PROVIDER=p24
P24_MERCHANT_ID=<twoja wartość z .env.local>
P24_POS_ID=<twoja wartość z .env.local>
P24_CRC=<twoja wartość z .env.local>
P24_API_KEY=<twoja wartość z .env.local>
P24_SANDBOX=true    ← ZOSTAWIAMY SANDBOX NA TESTY
```

## 4. Deploy

Kliknij **Deploy** w Vercel. Poczekaj na build (~2-3 min).

## 5. Podpięcie domeny (opcjonalnie na testy)

1. Vercel → Settings → Domains → dodaj `lekcjo.pl`
2. U rejestratora domeny ustaw DNS:
   - **A record:** `76.76.21.21`
   - **CNAME:** `cname.vercel-dns.com` (dla www)
3. SSL włączy się automatycznie

> Na testy możesz też użyć domeny Vercel (np. `lekcjo-pl.vercel.app`)

## 6. Zarejestruj webhook URL w P24

1. Zaloguj się do [sandbox.przelewy24.pl](https://sandbox.przelewy24.pl)
2. Konfiguracja → URL powiadomień
3. Ustaw: `https://twoja-domena.vercel.app/api/webhooks/p24`

## 7. Smoke test na produkcji

```
[ ] Strona główna się ładuje
[ ] Dodaj ogłoszenie "Szukam" (darmowe, szybki test)
[ ] Dodaj ogłoszenie "Oferuję" (sprawdź czy pierwsze jest darmowe)
[ ] Sprawdź magic link email (czy przyszedł)
[ ] Kliknij "Pokaż numer" (test revealContact)
[ ] Spróbuj płatność sandbox (przedłużenie lub podbicie)
[ ] Sprawdź /admin (czy Basic Auth działa)
[ ] Sprawdź /regulamin i /polityka-prywatnosci
[ ] Sprawdź /robots.txt i /sitemap.xml
[ ] Trigger crona: curl -H "Authorization: Bearer <CRON_SECRET>" https://twoja-domena/api/cron
```

## 8. Przejście na live (po testach)

Zmień w Vercel env vars:
```
P24_SANDBOX=false
P24_MERCHANT_ID=<live>
P24_CRC=<live>
P24_API_KEY=<live>
```
Zarejestruj webhook na `secure.przelewy24.pl` → **Redeploy**.

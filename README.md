# Lekcjo.pl — Marketplace korepetycji

Platforma ogłoszeniowa łącząca uczniów z korepetytorami. Zbudowana na Next.js 16, Supabase i Przelewy24.

## Stack

- **Frontend:** Next.js 16 (App Router), React 19, Tailwind CSS v4
- **Backend:** Next.js API Routes (server actions)
- **Baza danych:** Supabase (PostgreSQL)
- **Płatności:** Przelewy24 (P24)
- **Email:** Resend
- **Deploy:** Vercel

## Uruchomienie lokalne

```bash
npm install
cp .env.p24.example .env.local   # uzupełnij zmienne środowiskowe
npm run dev
```

## Zmienne środowiskowe

| Zmienna | Opis |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | URL projektu Supabase |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Klucz anon Supabase |
| `SUPABASE_SERVICE_ROLE_KEY` | Klucz service role Supabase |
| `NEXT_PUBLIC_APP_URL` | URL aplikacji (np. `https://lekcjo.pl`) |
| `P24_MERCHANT_ID` | ID Sprzedawcy z panelu Przelewy24 |
| `P24_POS_ID` | ID Punktu Sprzedaży (zazwyczaj = MERCHANT_ID) |
| `P24_API_KEY` | Klucz API z panelu Przelewy24 |
| `P24_CRC` | Klucz CRC z panelu Przelewy24 |
| `P24_SANDBOX` | `true` dla środowiska testowego |
| `RESEND_API_KEY` | Klucz API Resend |
| `RESEND_FROM_EMAIL` | Adres nadawcy emaili |
| `CRON_SECRET` | Token autoryzacji dla `/api/cron` |
| `ADMIN_USER` | Login do panelu `/admin` |
| `ADMIN_PASS` | Hasło do panelu `/admin` |

## Webhook P24

W panelu Przelewy24 ustaw:
- **URL statusu:** `https://lekcjo.pl/api/webhooks/p24`
- **URL powrotu:** `https://lekcjo.pl/payment/success`

## Cron job

Endpoint `/api/cron` obsługuje:
- Wysyłkę emaili o zbliżającym się wygaśnięciu ogłoszenia
- Wygaszanie przeterminowanych ogłoszeń
- Oznaczanie porzuconych transakcji jako `failed`

Wywołanie:
```bash
curl -H "Authorization: Bearer <CRON_SECRET>" https://lekcjo.pl/api/cron
```

Zalecana konfiguracja cronjoba: co 24h (np. przez Vercel Cron lub zewnętrzny scheduler).

## Panel administracyjny

Dostępny pod `/admin`, zabezpieczony HTTP Basic Auth (`ADMIN_USER` / `ADMIN_PASS`).

## Deploy

1. Wdróż na Vercel
2. Ustaw zmienne środowiskowe w Vercel → Settings → Environment Variables
3. Ustaw `P24_SANDBOX=false` i live credentials P24
4. Zarejestruj webhook w panelu Przelewy24
5. Skonfiguruj Vercel Cron dla `/api/cron`

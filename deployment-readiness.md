# Deploy na testy — Lekcjo.pl (krok po kroku)


## 7. Smoke test na produkcji

```
[ x] Strona główna się ładuje
[ x] Dodaj ogłoszenie "Szukam" (darmowe, szybki test)
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

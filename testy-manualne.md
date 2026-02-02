# Scenariusze Testów Manualnych - Lekcjo.pl

## Spis treści
1. [Dodawanie ogłoszeń](#1-dodawanie-ogłoszeń)
2. [Cykl życia ogłoszenia](#2-cykl-życia-ogłoszenia)
3. [Płatności](#3-płatności)
4. [Magic Link](#4-magic-link)
5. [Wyszukiwanie](#5-wyszukiwanie)
6. [Bezpieczeństwo - próby oszustwa](#6-bezpieczeństwo---próby-oszustwa)


recovery nie działa
zmiana edycji lokalizacji 
zmiana wyboru poziomu
brak dodawania hasha do zlecenia z ponownym numerem płatnym  
brak storny manaage po deleted 
dodanie stałej wysokości opisu 


## 3. Płatności

### TC-3.1: Happy Path - Płatność za aktywację
**Kroki:**
1. Dodaj drugie ogłoszenie (ten sam numer telefonu)
2. Na stronie podsumowania kliknij "Przejdź do płatności"
3. Dokończ płatność w P24 (karta testowa)
4. Poczekaj na webhook

**Oczekiwany rezultat:**
- Przekierowanie do strony sukcesu
- Ogłoszenie aktywne
- Email potwierdzający wysłany

**Weryfikacja bazy danych:**
```sql
SELECT status FROM ads WHERE id = '{id}';
-- status = 'active'

SELECT status FROM transactions WHERE ad_id = '{id}';
-- status = 'completed'
```

---

### TC-3.2: Nieudana płatność
**Kroki:**
1. Rozpocznij płatność
2. Anuluj w panelu P24 lub użyj karty która odrzuca

**Oczekiwany rezultat:**
- Przekierowanie do strony błędu
- Ogłoszenie pozostaje nieaktywne

**Weryfikacja bazy danych:**
```sql
SELECT status FROM ads WHERE id = '{id}';
-- status = 'inactive'

SELECT status FROM transactions WHERE ad_id = '{id}';
-- status = 'failed' lub 'cancelled'
```

---

### TC-3.3: Webhook retry
**Kroki:**
1. Zablokuj endpoint webhook
2. Wykonaj płatność
3. Odblokuj endpoint
4. Poczekaj na retry P24

**Oczekiwany rezultat:**
- Transakcja przetworzona po retry
- Ogłoszenie aktywowane

---

## 4. Magic Link

### TC-4.1: Odzyskiwanie magic link
**Kroki:**
1. Wejdź na `/recover-magic-link`
2. Wpisz email i numer telefonu powiązany z ogłoszeniem
3. Wyślij formularz

**Oczekiwany rezultat:**
- Email z magic linkiem wysłany
- Link działa i prowadzi do panelu zarządzania

---

### TC-4.2: Odzyskiwanie - błędne dane
**Kroki:**
1. Wpisz nieprawidłowy email lub numer
2. Wyślij formularz

**Oczekiwany rezultat:**
- Ogólny komunikat błędu (ze względów bezpieczeństwa)
- Brak szczegółów o braku dopasowania

---


## Testy bezpieczeństwa - szczegółowe kroki



### TC-6.7: Próba podwójnego wykorzystania webhooka (Replay Attack)

**Cel:** Sprawdzić czy system blokuje ponowne przetworzenie tego samego webhooka.

**Kroki szczegółowe:**
1. Wykonaj prawdziwą płatność (P24 sandbox)
2. W Vercel Logs znajdź request do `/api/p24/webhook`
3. Skopiuj body webhooka (JSON)
4. Wyślij ponownie:
```bash
curl -X POST https://twoja-domena.vercel.app/api/p24/webhook \
  -H "Content-Type: application/json" \
  -d '{"sessionId":"SKOPIOWANY_SESSION_ID","amount":1000,...}'
```

**Co sprawdzić w kodzie:**
- Plik: `app/api/p24/webhook/route.ts`
- Szukaj: czy jest sprawdzenie unikalności `sessionId` lub `p24_session_id`
- Powinno być:
```typescript
// Sprawdzenie czy transakcja już istnieje
const { data: existingTx } = await supabase
    .from('transactions')
    .select('*')
    .eq('p24_session_id', sessionId)
    .eq('status', 'completed')
    .single();

if (existingTx) {
    return Response.json({ error: 'Already processed' });
}
```

**Weryfikacja:**
```sql
SELECT COUNT(*) FROM transactions WHERE p24_session_id = 'SESSION_ID';
-- Powinno być: 1 (nie 2 lub więcej)
```

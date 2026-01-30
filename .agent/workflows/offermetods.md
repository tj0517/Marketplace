---
description: Plan implementacji dwóch metod DB dla płatności P24 - przedłużenie i promowanie ogłoszenia
---

# Plan Implementacji Metod Bazodanowych

## 1. Płatność za Przedłużenie Ogłoszenia

### Opis
Obsługa typu transakcji P24, która nie tworzy nowego ogłoszenia, ale aktualizuje datę wygaśnięcia (`expires_at`) istniejącego ogłoszenia o +30 dni.

### Kroki Implementacji

#### 1.1 Rozszerzenie Schematu Transakcji
- Dodać pole `transaction_type` do tabeli transakcji (jeśli nie istnieje)
- Wartości: `'new_ad'`, `'extension'`, `'promotion'`
- Dodać pole `related_ad_id` dla transakcji typu `extension`

#### 1.2 Nowa Funkcja w `lib/` lub `actions/`
```
Nazwa: extendAdExpiration(adId: string, userId: string)
```
- Walidacja: sprawdzenie czy ogłoszenie należy do użytkownika
- Walidacja: sprawdzenie czy ogłoszenie istnieje i jest aktywne
- Obliczenie nowej daty: `new Date(current_expires_at + 30 dni)` lub `new Date(now + 30 dni)` jeśli już wygasło
- Update w Supabase: `UPDATE ads SET expires_at = new_date WHERE id = adId`

#### 1.3 Webhook P24 / Callback
- Rozszerzyć obsługę callbacka P24 o rozpoznanie typu transakcji
- Jeśli `transaction_type === 'extension'`:
  - Wywołać `extendAdExpiration()` zamiast tworzenia nowego ogłoszenia
  - Zapisać transakcję w bazie z odpowiednim typem

#### 1.4 Frontend
- Dodać przycisk "Przedłuż ogłoszenie" w panelu użytkownika przy listingu ogłoszeń
- Przekierowanie do płatności P24 z parametrem `type=extension&adId=xxx`

---

## 2. Promowanie Ogłoszenia (Bump to Top)

### Opis
Aktualizacja daty ogłoszenia na bieżącą (`NOW()`), co spowoduje wyświetlenie go jako pierwsze w listingu (zakładając sortowanie po dacie malejąco).

### Kroki Implementacji

#### 2.1 Określenie Pola do Aktualizacji
- Opcja A: Użyć istniejącego pola `created_at` (nie zalecane - tracimy oryginalną datę)
- **Opcja B (zalecana)**: Dodać nowe pole `promoted_at` lub `bumped_at` (TIMESTAMP)
- Zmienić sortowanie w query na: `ORDER BY COALESCE(promoted_at, created_at) DESC`

#### 2.2 Nowa Funkcja
```
Nazwa: promoteAd(adId: string, userId: string)
```
- Walidacja: sprawdzenie czy ogłoszenie należy do użytkownika
- Walidacja: sprawdzenie czy ogłoszenie jest aktywne (nie wygasłe)
- Update: `UPDATE ads SET promoted_at = NOW() WHERE id = adId`

#### 2.3 Modyfikacja Query Listingu
- Zmienić `fetchAllAds()` w `lib/ads.ts`:
```sql
ORDER BY COALESCE(promoted_at, created_at) DESC
```

#### 2.4 Webhook P24 / Callback
- Dodać obsługę `transaction_type === 'promotion'`
- Po potwierdzeniu płatności wywołać `promoteAd()`

#### 2.5 Frontend
- Dodać przycisk "Promuj ogłoszenie" / "Wyróżnij" w panelu użytkownika
- Przekierowanie do płatności P24 z parametrem `type=promotion&adId=xxx`

---

## Schemat Bazy Danych (Proponowane Zmiany)

### Tabela `ads` - nowe pole:
| Kolumna | Typ | Opis |
|---------|-----|------|
| `promoted_at` | TIMESTAMP | Data ostatniego promowania (null = nigdy) |

### Tabela `transactions` - nowe/zmodyfikowane pola:
| Kolumna | Typ | Opis |
|---------|-----|------|
| `transaction_type` | TEXT | `'new_ad'`, `'extension'`, `'promotion'` |
| `related_ad_id` | UUID | ID istniejącego ogłoszenia (dla extension/promotion) |

---

## Priorytet Implementacji

1. **Najpierw**: Migracja bazy danych (nowe pola)
2. **Potem**: Backend functions (`extendAdExpiration`, `promoteAd`)
3. **Następnie**: Rozszerzenie webhook/callback P24
4. **Na końcu**: Frontend (przyciski, przekierowania)

---

## Testy

- [ ] Test przedłużenia ogłoszenia - weryfikacja nowej daty `expires_at`
- [ ] Test promowania - weryfikacja kolejności w listingu
- [ ] Test walidacji - próba operacji na cudzym ogłoszeniu
- [ ] Test P24 callback - poprawne rozpoznanie typu transakcji

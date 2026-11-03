# Deferred (noticed, not touched)

Rzeczy zauważone po drodze, które nie weszły do zadania. Każda pozycja: data, skąd, co, propozycja.

- 2026-11-02 (wf-init): `/api/cron` poza `NODE_ENV=production` przepuszcza wywołania bez `CRON_SECRET` (`app/api/cron/route.tsx:14`). Na prod jest bezpiecznie, ale podgląd na Vercelu z innym `NODE_ENV` lub bez sekretu byłby otwarty. Propozycja: sprawdzić przy LK-1.04 albo osobne zadanie S.
- 2026-11-02 (wf-init): prawie cała aplikacja (17 plików) używa klucza z pełnymi prawami, więc reguły dostępu w bazie w praktyce nie chronią danych. Propozycja: ocenić po LK-1.02, gdy polityki będą w repo.
- 2026-11-02 (wf-plan): martwa akcja `promoteAd` (`actions/user/promote-ad.ts`) daje podbicie bez płatności (transakcja `manual`, `completed`); nic jej dziś nie importuje. Propozycja: usunąć w osobnym zadaniu S.
- 2026-11-02 (wf-plan): `transactions.amount` przechowuje całe złote (`Math.round(amount/100)`), a P24 operuje groszami. Propozycja: ujednolicić po LK-2.02.
- 2026-11-02 (wf-plan): webhook P24 do LK-2.02 nie wywoływał `transaction/verify`; podbicia sprzed wyłączenia promocji mogły zostać przyznane bez rozliczenia w P24. Propozycja: tj sprawdza w panelu P24 status starych transakcji.

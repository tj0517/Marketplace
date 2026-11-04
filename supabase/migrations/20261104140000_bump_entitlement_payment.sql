-- LK-2.02: podbicie za 1 zł z uprawnienia (promotion_entitlements z LK-2.01).
-- Kwota oczekiwana w groszach na transakcji (webhook porównuje ją z powiadomieniem P24),
-- rezerwacja uprawnienia przy rejestracji, zwolnienie przy błędzie / wygaśnięciu, zużycie po verify.
-- Funkcje SECURITY INVOKER, tylko dla service_role. complete_payment bez zmian.

ALTER TABLE public.transactions
    ADD COLUMN amount_grosze integer CHECK (amount_grosze > 0),
    ADD COLUMN currency text,
    ADD COLUMN entitlement_id uuid REFERENCES public.promotion_entitlements(id);

COMMENT ON COLUMN public.transactions.amount_grosze IS 'Kwota oczekiwana od P24 w groszach (LK-2.02); NULL dla transakcji sprzed LK-2.02';
COMMENT ON COLUMN public.transactions.entitlement_id IS 'Uprawnienie, z którego transakcja dostała zniżkę (trwałe, także po zwolnieniu rezerwacji)';

ALTER TABLE public.promotion_entitlements
    ADD COLUMN transaction_id uuid REFERENCES public.transactions(id),
    ADD CONSTRAINT promotion_entitlements_holder_check
        CHECK ((status = 'granted') = (transaction_id IS NULL));

COMMENT ON COLUMN public.promotion_entitlements.transaction_id IS 'Transakcja, która trzyma rezerwację albo zużyła uprawnienie';

-- Wygaszanie przy okazji (decyzja tj 2026-11-04, wariant B): rezerwacja trzymana przez transakcję
-- pending starszą niż p_stale_before → transakcja failed, uprawnienie granted (jak w cronie).
CREATE FUNCTION public.expire_stale_bump_reservation(p_email text, p_stale_before timestamptz)
RETURNS boolean
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public, pg_temp
AS $$
DECLARE
    v_tx_id uuid;
BEGIN
    UPDATE public.transactions t
    SET status = 'failed', error_message = 'Timeout - no webhook received'
    FROM public.promotion_entitlements e
    WHERE e.email = lower(btrim(p_email))
      AND e.status = 'reserved'
      AND e.transaction_id = t.id
      AND t.status = 'pending'
      AND t.created_at < p_stale_before
    RETURNING t.id INTO v_tx_id;

    IF v_tx_id IS NULL THEN
        RETURN false;
    END IF;

    UPDATE public.promotion_entitlements
    SET status = 'granted', reserved_at = NULL, transaction_id = NULL
    WHERE transaction_id = v_tx_id AND status = 'reserved';

    RETURN true;
END;
$$;

-- Rejestracja podbicia: wstawia transakcję pending i atomowo rezerwuje uprawnienie (granted → reserved).
-- Adres bierze z ogłoszenia; zniżka tylko dla ogłoszeń offer (decyzja tj 2026-11-04).
-- Przy równoczesnych wywołaniach drugie czeka na blokadę wiersza uprawnienia i dostaje kwotę standardową.
CREATE FUNCTION public.register_bump_transaction(
    p_ad_id uuid,
    p_standard_amount integer,
    p_entitled_amount integer,
    p_currency text,
    p_stale_before timestamptz
)
RETURNS TABLE (transaction_id uuid, amount_grosze integer, entitled boolean)
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public, pg_temp
AS $$
DECLARE
    v_email text;
    v_ad_type public.ad_type;
    v_tx_id uuid;
    v_entitlement_id uuid;
    v_amount integer := p_standard_amount;
BEGIN
    SELECT lower(btrim(a.email)), a.type INTO v_email, v_ad_type
    FROM public.ads a WHERE a.id = p_ad_id;

    IF v_email IS NULL THEN
        RAISE EXCEPTION 'Ad not found: %', p_ad_id;
    END IF;

    INSERT INTO public.transactions (ad_id, type, amount, amount_grosze, currency, status, payment_provider)
    VALUES (p_ad_id, 'bump', round(p_standard_amount / 100.0), p_standard_amount, p_currency, 'pending', 'p24')
    RETURNING id INTO v_tx_id;

    IF v_ad_type = 'offer' THEN
        PERFORM public.expire_stale_bump_reservation(v_email, p_stale_before);

        UPDATE public.promotion_entitlements
        SET status = 'reserved', reserved_at = now(), transaction_id = v_tx_id
        WHERE email = v_email AND status = 'granted'
        RETURNING id INTO v_entitlement_id;

        IF v_entitlement_id IS NOT NULL THEN
            v_amount := p_entitled_amount;
            UPDATE public.transactions
            SET amount = round(p_entitled_amount / 100.0), amount_grosze = p_entitled_amount,
                entitlement_id = v_entitlement_id
            WHERE id = v_tx_id;
        END IF;
    END IF;

    RETURN QUERY SELECT v_tx_id, v_amount, v_entitlement_id IS NOT NULL;
END;
$$;

-- Cena na przycisku podbicia: ta sama reguła co przy rejestracji (z wygaszaniem przy okazji), bez rezerwacji.
CREATE FUNCTION public.quote_bump_amount(
    p_ad_id uuid,
    p_standard_amount integer,
    p_entitled_amount integer,
    p_stale_before timestamptz
)
RETURNS integer
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public, pg_temp
AS $$
DECLARE
    v_email text;
    v_ad_type public.ad_type;
BEGIN
    SELECT lower(btrim(a.email)), a.type INTO v_email, v_ad_type
    FROM public.ads a WHERE a.id = p_ad_id;

    IF v_email IS NULL OR v_ad_type <> 'offer' THEN
        RETURN p_standard_amount;
    END IF;

    PERFORM public.expire_stale_bump_reservation(v_email, p_stale_before);

    IF EXISTS (SELECT 1 FROM public.promotion_entitlements WHERE email = v_email AND status = 'granted') THEN
        RETURN p_entitled_amount;
    END IF;
    RETURN p_standard_amount;
END;
$$;

-- Zwolnienie rezerwacji (reserved → granted) trzymanych przez transakcje failed.
-- Z id: jedna transakcja (błąd rejestracji w P24); bez id: wszystkie (cron).
CREATE FUNCTION public.release_bump_reservations(p_transaction_id uuid DEFAULT NULL)
RETURNS integer
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public, pg_temp
AS $$
DECLARE
    v_count integer;
BEGIN
    UPDATE public.promotion_entitlements e
    SET status = 'granted', reserved_at = NULL, transaction_id = NULL
    FROM public.transactions t
    WHERE e.status = 'reserved'
      AND e.transaction_id = t.id
      AND t.status = 'failed'
      AND (p_transaction_id IS NULL OR t.id = p_transaction_id);

    GET DIAGNOSTICS v_count = ROW_COUNT;
    RETURN v_count;
END;
$$;

-- Po udanym verify: complete_payment, potem zużycie uprawnienia tej transakcji (→ used).
-- Spóźniona płatność (decyzja tj 2026-11-04): uprawnienie wolne (granted) też jest zużywane;
-- zarezerwowane przez inną transakcję albo już used zostaje bez zmian.
CREATE FUNCTION public.finalize_bump_payment(p_transaction_id uuid, p_payment_id text DEFAULT NULL)
RETURNS boolean
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public, pg_temp
AS $$
DECLARE
    v_completed boolean;
BEGIN
    v_completed := public.complete_payment(p_transaction_id, p_payment_id);

    UPDATE public.promotion_entitlements e
    SET status = 'used', used_at = now(), reserved_at = COALESCE(e.reserved_at, now()),
        transaction_id = p_transaction_id
    FROM public.transactions t
    WHERE t.id = p_transaction_id
      AND e.id = t.entitlement_id
      AND (e.status = 'granted' OR (e.status = 'reserved' AND e.transaction_id = p_transaction_id));

    RETURN v_completed;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.expire_stale_bump_reservation(text, timestamptz) FROM public, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.register_bump_transaction(uuid, integer, integer, text, timestamptz) FROM public, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.quote_bump_amount(uuid, integer, integer, timestamptz) FROM public, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.release_bump_reservations(uuid) FROM public, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.finalize_bump_payment(uuid, text) FROM public, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.expire_stale_bump_reservation(text, timestamptz) TO service_role;
GRANT EXECUTE ON FUNCTION public.register_bump_transaction(uuid, integer, integer, text, timestamptz) TO service_role;
GRANT EXECUTE ON FUNCTION public.quote_bump_amount(uuid, integer, integer, timestamptz) TO service_role;
GRANT EXECUTE ON FUNCTION public.release_bump_reservations(uuid) TO service_role;
GRANT EXECUTE ON FUNCTION public.finalize_bump_payment(uuid, text) TO service_role;

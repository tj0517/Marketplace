-- LK-2.01: zgody marketingowe i uprawnienie do podbicia za 1 zł.
-- Dostęp tylko po stronie serwera (service_role); RLS bez polityk, granty anon/authenticated odebrane.
-- Adresy zapisywane znormalizowane: lower(btrim(email)).

CREATE TABLE public.marketing_consents (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    email text NOT NULL CHECK (email = lower(btrim(email)) AND email <> ''),
    status text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'withdrawn')),
    granted_at timestamptz NOT NULL DEFAULT now(),
    withdrawn_at timestamptz,
    source text NOT NULL CHECK (source IN ('form', 'consent_page')),
    content_version text NOT NULL CHECK (content_version <> ''),
    withdrawal_token uuid NOT NULL UNIQUE DEFAULT gen_random_uuid(),
    CHECK ((status = 'withdrawn') = (withdrawn_at IS NOT NULL))
);

-- Najwyżej jedna aktywna zgoda na adres (decyzja tj 2026-11-04); historia wycofanych zostaje.
CREATE UNIQUE INDEX marketing_consents_one_active_per_email
    ON public.marketing_consents (email) WHERE status = 'active';

CREATE TABLE public.promotion_entitlements (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    email text NOT NULL UNIQUE CHECK (email = lower(btrim(email)) AND email <> ''),
    status text NOT NULL DEFAULT 'granted' CHECK (status IN ('granted', 'reserved', 'used')),
    granted_at timestamptz NOT NULL DEFAULT now(),
    reserved_at timestamptz,
    used_at timestamptz
);

ALTER TABLE public.marketing_consents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.promotion_entitlements ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON TABLE public.marketing_consents FROM public, anon, authenticated;
REVOKE ALL ON TABLE public.promotion_entitlements FROM public, anon, authenticated;
GRANT ALL ON TABLE public.marketing_consents TO service_role;
GRANT ALL ON TABLE public.promotion_entitlements TO service_role;

-- Atomowy zapis zgody i przyznanie uprawnienia. Współbieżność rozstrzygają indeksy unikalne
-- (ON CONFLICT DO NOTHING), nie „sprawdź, potem wstaw”.
-- consent_created = false, gdy adres ma już aktywną zgodę (wtedy bez maila).
CREATE FUNCTION public.grant_marketing_consent(p_email text, p_source text, p_content_version text)
RETURNS TABLE (consent_created boolean, withdrawal_token uuid, entitlement_granted boolean)
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public, pg_temp
AS $$
DECLARE
    v_email text := lower(btrim(p_email));
    v_token uuid;
    v_entitlement_id uuid;
BEGIN
    INSERT INTO public.marketing_consents (email, source, content_version)
    VALUES (v_email, p_source, p_content_version)
    ON CONFLICT (email) WHERE status = 'active' DO NOTHING
    RETURNING marketing_consents.withdrawal_token INTO v_token;

    INSERT INTO public.promotion_entitlements (email)
    VALUES (v_email)
    ON CONFLICT (email) DO NOTHING
    RETURNING id INTO v_entitlement_id;

    RETURN QUERY SELECT v_token IS NOT NULL, v_token, v_entitlement_id IS NOT NULL;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.grant_marketing_consent(text, text, text) FROM public, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.grant_marketing_consent(text, text, text) TO service_role;

-- Strona zgody: czy adres ma ogłoszenie aktywne albo wygasłe (decyzja tj 2026-11-04);
-- porównanie bez rozróżniania wielkości liter.
CREATE FUNCTION public.has_ad_for_email(p_email text)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY INVOKER
SET search_path = public, pg_temp
AS $$
    SELECT EXISTS (
        SELECT 1 FROM public.ads
        WHERE lower(btrim(email)) = lower(btrim(p_email))
          AND status IN ('active', 'expired')
    );
$$;

REVOKE EXECUTE ON FUNCTION public.has_ad_for_email(text) FROM public, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.has_ad_for_email(text) TO service_role;

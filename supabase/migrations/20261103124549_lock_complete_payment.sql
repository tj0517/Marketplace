-- LK-1.06: complete_payment (SECURITY DEFINER) wywołuje tylko webhook P24 kluczem service_role.
-- Odbiera EXECUTE rolom public, anon i authenticated (nadane w 002_baseline) i przypina search_path.
REVOKE EXECUTE ON FUNCTION public.complete_payment(uuid, text) FROM public, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.complete_payment(uuid, text) TO service_role;
ALTER FUNCTION public.complete_payment(uuid, text) SET search_path = public, pg_temp;

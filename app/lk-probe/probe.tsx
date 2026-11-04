'use client';

// TEMP LK-1.03: red proof server-only — ten import musi wywalić build. Do revertu.
import { createAdminClient } from '@/lib/supabase/admin';

export function Probe() {
    return <p>{typeof createAdminClient}</p>;
}

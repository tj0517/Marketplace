import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { handleP24Notification } from '@/lib/bump-payment';
import { getP24Credentials } from '@/lib/p24-server';

// Podpis → schemat → merchant/pos → transakcja, kwota, waluta → verify → zapis (lib/bump-payment.ts).
export async function POST(request: NextRequest) {
    try {
        const body = await request.json().catch(() => null);
        const result = await handleP24Notification(createAdminClient(), body, { p24: getP24Credentials() });
        return NextResponse.json(result.body, { status: result.status });
    } catch (error) {
        console.error('[P24 Webhook] Unexpected error:', error);
        return NextResponse.json({ error: 'Internal error' }, { status: 500 });
    }
}

export async function GET() {
    return NextResponse.json({ status: 'P24 webhook endpoint active' });
}

import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { getBaseUrl, isPromotionsEnabled } from '@/lib/config';
import { registerBumpPayment } from '@/lib/bump-payment';
import { getP24Credentials } from '@/lib/p24-server';

export async function POST(request: NextRequest) {
    try {
        if (!isPromotionsEnabled()) {
            return NextResponse.json({ error: 'Płatne promocje są tymczasowo niedostępne.' }, { status: 503 });
        }

        // Kwota nie pochodzi z żądania (LK-2.02) — liczy ją register_bump_transaction.
        const { ad_id, type, management_token } = await request.json();

        if (type !== 'bump') {
            return NextResponse.json({ error: 'Invalid transaction type' }, { status: 400 });
        }

        if (!ad_id || !management_token) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        const supabase = createAdminClient();

        const { data: ad, error: adError } = await supabase
            .from('ads')
            .select('id, email, title, status')
            .eq('id', ad_id)
            .eq('management_token', management_token)
            .single();

        if (adError || !ad) {
            return NextResponse.json({ error: 'Ad not found or access denied' }, { status: 404 });
        }

        const result = await registerBumpPayment(supabase, {
            ad,
            baseUrl: getBaseUrl(),
            p24: getP24Credentials(),
        });
        return NextResponse.json(result.body, { status: result.status });

    } catch (error) {
        console.error('[Payment] Unexpected error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

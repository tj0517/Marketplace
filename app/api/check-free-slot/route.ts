import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { normalizeAndHashPhone } from '@/actions/user/hash_phone';

const STANDARD_PRICE = 10;

export async function POST(request: NextRequest) {
    let phone: string | undefined;

    try {
        const body = await request.json();
        phone = body.phone;
    } catch {
        return NextResponse.json({ isFree: false, price: STANDARD_PRICE }, { status: 400 });
    }

    if (!phone) {
        return NextResponse.json({ isFree: false, price: STANDARD_PRICE });
    }

    const { hash, isValid } = normalizeAndHashPhone(phone);

    if (!isValid) {
        return NextResponse.json({ isFree: false, price: STANDARD_PRICE });
    }

    const supabase = createAdminClient();

    const { data: phoneRecord, error: phoneQueryError } = await supabase
        .from('phone_hashes')
        .select('free_used_at')
        .eq('phone_hash', hash)
        .single();

    if (phoneQueryError && phoneQueryError.code !== 'PGRST116') {
        console.error('Phone query error:', phoneQueryError);
        return NextResponse.json({ isFree: false, price: 10 }, { status: 500 });
    }

    const isFree = phoneRecord === null || phoneRecord.free_used_at === null;

    return NextResponse.json(
        { isFree, price: isFree ? 0 : STANDARD_PRICE },
        {
            headers: {
                'Cache-Control': 'private, max-age=600',
            },
        }
    );
}

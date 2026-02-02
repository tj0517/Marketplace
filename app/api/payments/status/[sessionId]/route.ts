import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

// Basic UUID validation to prevent enumeration attacks
const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ sessionId: string }> }
) {
    try {
        const { sessionId } = await params;

        if (!sessionId) {
            return NextResponse.json({ error: 'Missing sessionId' }, { status: 400 });
        }

        // Validate sessionId format (UUID)
        if (!UUID_REGEX.test(sessionId)) {
            return NextResponse.json({ status: 'unknown' }, { status: 400 });
        }

        const supabase = createAdminClient();

        const { data, error } = await supabase
            .from('transactions')
            .select('status, type, ad_id')
            .eq('id', sessionId)
            .single();

        if (error || !data) {
            return NextResponse.json({ status: 'unknown' });
        }

        return NextResponse.json({
            status: data.status,
            type: data.type,
            adId: data.ad_id,
        });

    } catch (error) {
        console.error('[Payment Status] Error:', error);
        return NextResponse.json({ status: 'error' }, { status: 500 });
    }
}

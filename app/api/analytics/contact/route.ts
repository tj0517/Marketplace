import { createAdminClient } from '@/lib/supabase/admin';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
    try {
        const { adId } = await request.json();

        if (!adId) {
            return NextResponse.json({ error: 'Missing adId' }, { status: 400 });
        }

        const supabase = createAdminClient();

        // @ts-ignore - RPC function defined in database
        const { error } = await supabase.rpc('increment_contact_count', {
            ad_id: adId
        });

        if (error) {
            console.error('Failed to increment contact count:', error);
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Contact analytics error:', error);
        return NextResponse.json({ error: 'Internal error' }, { status: 500 });
    }
}

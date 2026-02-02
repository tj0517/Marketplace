import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { getBaseUrl, getPrice, PAYMENT_CONFIG, APP_CONFIG } from '@/lib/config';
import crypto from 'crypto';

const P24_MERCHANT_ID = process.env.P24_MERCHANT_ID;
const P24_POS_ID = process.env.P24_POS_ID;
const P24_CRC = process.env.P24_CRC;
const P24_API_KEY = process.env.P24_API_KEY;

type TransactionType = 'activation' | 'extension' | 'bump';

export async function POST(request: NextRequest) {
    try {
        const { ad_id, type, management_token } = await request.json();

        if (!['activation', 'extension', 'bump'].includes(type)) {
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

        const amount = getPrice(type as TransactionType);
        const baseUrl = getBaseUrl();

        const { data: tx, error: txError } = await supabase
            .from('transactions')
            .insert({
                ad_id,
                type,
                amount: amount / 100,
                status: 'pending',
                payment_provider: 'p24',
            })
            .select()
            .single();

        if (txError || !tx) {
            console.error('Failed to create transaction:', txError);
            return NextResponse.json({ error: 'Failed to create transaction' }, { status: 500 });
        }

        if (!P24_MERCHANT_ID || !P24_POS_ID || !P24_CRC || !P24_API_KEY) {
            console.warn('[P24] Credentials not configured - returning test mode response');

            return NextResponse.json({
                testMode: true,
                message: 'P24 credentials not configured. Transaction created but payment skipped.',
                transactionId: tx.id,
                redirectUrl: `${baseUrl}/payment/test?session=${tx.id}&token=${management_token}`,
            });
        }

        const sessionId = tx.id;
        const safeTitle = ad.title || 'Ogłoszenie';
        const description = `${APP_CONFIG.name} - ${type} - ${safeTitle.substring(0, 30)}`;

        const signData = {
            sessionId,
            merchantId: parseInt(P24_MERCHANT_ID),
            amount,
            currency: PAYMENT_CONFIG.currency,
            crc: P24_CRC,
        };

        const signString = JSON.stringify(signData)
            .replace(/\\u[\dA-F]{4}/gi, function (match) {
                return String.fromCharCode(parseInt(match.replace(/\\u/g, ''), 16));
            })
            .replace(/\\\//g, '/');

        const sign = crypto
            .createHash('sha384')
            .update(signString)
            .digest('hex');

        const p24RequestBody = {
            merchantId: parseInt(P24_MERCHANT_ID),
            posId: parseInt(P24_POS_ID),
            sessionId,
            amount,
            currency: PAYMENT_CONFIG.currency,
            description,
            email: ad.email,
            country: PAYMENT_CONFIG.country,
            language: PAYMENT_CONFIG.language,
            urlReturn: `${baseUrl}/payment/success?session=${sessionId}`,
            urlStatus: `${baseUrl}/api/webhooks/p24`,
            sign,
        };

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 30000);

        let p24Response;
        try {
            p24Response = await fetch(`${PAYMENT_CONFIG.apiUrl}/api/v1/transaction/register`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Basic ${Buffer.from(`${P24_POS_ID}:${P24_API_KEY}`).toString('base64')}`,
                },
                body: JSON.stringify(p24RequestBody),
                signal: controller.signal,
            });
        } catch (fetchError) {
            clearTimeout(timeoutId);
            if (fetchError instanceof Error && fetchError.name === 'AbortError') {
                console.error('[P24] Request timeout');
                await supabase
                    .from('transactions')
                    .update({ status: 'failed', error_message: 'P24 request timeout' })
                    .eq('id', tx.id);
                return NextResponse.json({ error: 'Payment service timeout' }, { status: 504 });
            }
            throw fetchError;
        }
        clearTimeout(timeoutId);

        if (!p24Response.ok) {
            const errorText = await p24Response.text();
            console.error('[P24] API request failed:', p24Response.status, errorText);
            await supabase
                .from('transactions')
                .update({
                    status: 'failed',
                    error_message: `P24 API error: ${p24Response.status}`
                })
                .eq('id', tx.id);
            return NextResponse.json({ error: 'Payment service error' }, { status: 502 });
        }

        const p24Result = await p24Response.json();

        if (p24Result.data?.token) {
            const { error: updateError } = await supabase
                .from('transactions')
                .update({ payment_session_id: p24Result.data.token })
                .eq('id', tx.id);

            if (updateError) {
                console.error('[P24] Failed to save token to database:', updateError);
            }

            return NextResponse.json({
                redirectUrl: `${PAYMENT_CONFIG.apiUrl}/trnRequest/${p24Result.data.token}`,
                transactionId: tx.id,
            });
        }

        console.error('[P24] Registration failed:', p24Result);

        const errorMessage = p24Result.error
            ? (typeof p24Result.error === 'string' ? p24Result.error : JSON.stringify(p24Result.error))
            : 'P24 registration failed';
        await supabase
            .from('transactions')
            .update({
                status: 'failed',
                error_message: errorMessage
            })
            .eq('id', tx.id);

        return NextResponse.json({
            error: 'Payment initialization failed',
            details: p24Result.error
        }, { status: 500 });

    } catch (error) {
        console.error('[P24] Unexpected error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

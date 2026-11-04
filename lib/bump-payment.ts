import crypto from 'crypto';
import { z } from 'zod';
import type { SupabaseClient } from '@supabase/supabase-js';
import { AD_CONFIG, APP_CONFIG, PAYMENT_CONFIG, getPrice } from '@/lib/config';

// LK-2.02: podbicie z uprawnieniem za 1 zł. Logika płatności bez importu klucza service_role —
// klienta bazy, fetch i dane P24 dostaje z zewnątrz (trasy w app/api/), dzięki czemu da się ją testować.

type Db = SupabaseClient;
type DbError = { code?: string; message?: string } | null;

export interface P24Credentials {
    merchantId: number;
    posId: number;
    apiKey: string;
    crc: string;
    apiUrl: string;
}

export interface Result {
    status: number;
    body: Record<string, unknown>;
}

/** Brak tabeli, kolumny albo funkcji z migracji LK-2.01/LK-2.02 (prod przed wdrożeniem). */
const MISSING_SCHEMA_CODES = new Set(['42P01', '42703', '42883', 'PGRST202', 'PGRST204', 'PGRST205']);

export function isMissingSchemaError(error: DbError): boolean {
    return !!error?.code && MISSING_SCHEMA_CODES.has(error.code);
}

/** JSON do podpisu P24 (odpowiednik JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES) */
export function p24JsonStringify(obj: Record<string, unknown>): string {
    return JSON.stringify(obj)
        .replace(/\\u[\dA-F]{4}/gi, function (match) {
            return String.fromCharCode(parseInt(match.replace(/\\u/g, ''), 16));
        })
        .replace(/\\\//g, '/');
}

export function p24Sign(obj: Record<string, unknown>): string {
    return crypto.createHash('sha384').update(p24JsonStringify(obj)).digest('hex');
}

function staleBefore(now: Date): string {
    return new Date(now.getTime() - AD_CONFIG.transactionTimeoutMs).toISOString();
}

// =============================================================================
// Kwota i rezerwacja
// =============================================================================

export interface BumpReservation {
    transactionId: string;
    amountGrosze: number;
    entitled: boolean;
}

/**
 * Wstawia transakcję pending z kwotą liczoną w bazie: 100 gr przy wolnym uprawnieniu adresu
 * ogłoszenia offer (rezerwacja atomowa), inaczej getPrice('bump'). Bez migracji: 1000 gr, jak przed LK-2.02.
 */
export async function reserveBump(db: Db, adId: string, now = new Date()): Promise<BumpReservation | null> {
    const standard = getPrice('bump');
    const { data, error } = await db
        .rpc('register_bump_transaction', {
            p_ad_id: adId,
            p_standard_amount: standard,
            p_entitled_amount: PAYMENT_CONFIG.prices.bumpEntitled,
            p_currency: PAYMENT_CONFIG.currency,
            p_stale_before: staleBefore(now),
        })
        .single<{ transaction_id: string; amount_grosze: number; entitled: boolean }>();

    if (!error && data) {
        return { transactionId: data.transaction_id, amountGrosze: data.amount_grosze, entitled: data.entitled };
    }
    if (!isMissingSchemaError(error)) {
        console.error('[Payment] register_bump_transaction failed:', error?.code);
        return null;
    }

    const { data: tx, error: txError } = await db
        .from('transactions')
        .insert({ ad_id: adId, type: 'bump', amount: Math.round(standard / 100), status: 'pending', payment_provider: 'p24' })
        .select('id')
        .single<{ id: string }>();

    if (txError || !tx) {
        console.error('[Payment] Failed to create transaction:', txError?.code);
        return null;
    }
    return { transactionId: tx.id, amountGrosze: standard, entitled: false };
}

/** Cena na przycisku podbicia — ta sama reguła co reserveBump, bez rezerwacji. */
export async function quoteBumpAmount(db: Db, adId: string, now = new Date()): Promise<number> {
    const standard = getPrice('bump');
    const { data, error } = await db.rpc('quote_bump_amount', {
        p_ad_id: adId,
        p_standard_amount: standard,
        p_entitled_amount: PAYMENT_CONFIG.prices.bumpEntitled,
        p_stale_before: staleBefore(now),
    });
    if (error || typeof data !== 'number') {
        if (!isMissingSchemaError(error)) console.error('[Payment] quote_bump_amount failed:', error?.code);
        return standard;
    }
    return data;
}

/** reserved → granted dla rezerwacji trzymanych przez transakcje failed (jednej albo wszystkich). */
export async function releaseBumpReservations(db: Db, transactionId?: string): Promise<number> {
    const { data, error } = await db.rpc('release_bump_reservations', transactionId ? { p_transaction_id: transactionId } : {});
    if (error) {
        if (!isMissingSchemaError(error)) console.error('[Payment] release_bump_reservations failed:', error.code);
        return 0;
    }
    return typeof data === 'number' ? data : 0;
}

async function failTransaction(db: Db, transactionId: string, message: string) {
    await db.from('transactions').update({ status: 'failed', error_message: message }).eq('id', transactionId);
    await releaseBumpReservations(db, transactionId);
}

// =============================================================================
// Rejestracja w P24
// =============================================================================

export interface RegisterInput {
    ad: { id: string; email: string; title: string | null };
    baseUrl: string;
    p24: P24Credentials | null;
    fetchImpl?: typeof fetch;
    timeoutMs?: number;
    now?: Date;
}

/**
 * Rejestracja podbicia. Kwota pochodzi wyłącznie z reserveBump; każde niepowodzenie po rezerwacji
 * oznacza transakcję failed i zwalnia rezerwację.
 */
export async function registerBumpPayment(db: Db, input: RegisterInput): Promise<Result> {
    const reservation = await reserveBump(db, input.ad.id, input.now);
    if (!reservation) {
        return { status: 500, body: { error: 'Failed to create transaction' } };
    }

    try {
        return await createP24Session(db, input, reservation);
    } catch (error) {
        console.error('[Payment] Unexpected error after reservation:', error);
        await failTransaction(db, reservation.transactionId, 'Unexpected error');
        return { status: 500, body: { error: 'Internal server error' } };
    }
}

async function createP24Session(db: Db, input: RegisterInput, reservation: BumpReservation): Promise<Result> {
    const { p24, ad, baseUrl } = input;
    const { transactionId: sessionId, amountGrosze: amount } = reservation;

    if (!p24) {
        console.error('[P24] Credentials not configured');
        await failTransaction(db, sessionId, 'P24 credentials not configured');
        return { status: 503, body: { error: 'Payment system not configured' } };
    }

    const safeTitle = ad.title || 'Ogłoszenie';
    const description = `${APP_CONFIG.name} - bump - ${safeTitle.substring(0, 30)}`;

    const sign = p24Sign({
        sessionId,
        merchantId: p24.merchantId,
        amount,
        currency: PAYMENT_CONFIG.currency,
        crc: p24.crc,
    });

    const p24RequestBody = {
        merchantId: p24.merchantId,
        posId: p24.posId,
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
    const timeoutId = setTimeout(() => controller.abort(), input.timeoutMs ?? 30000);
    const fetchImpl = input.fetchImpl ?? fetch;

    let p24Response: Response;
    try {
        p24Response = await fetchImpl(`${p24.apiUrl}/api/v1/transaction/register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Basic ${Buffer.from(`${p24.posId}:${p24.apiKey}`).toString('base64')}`,
            },
            body: JSON.stringify(p24RequestBody),
            signal: controller.signal,
        });
    } catch (fetchError) {
        if (fetchError instanceof Error && fetchError.name === 'AbortError') {
            console.error('[P24] Request timeout');
            await failTransaction(db, sessionId, 'P24 request timeout');
            return { status: 504, body: { error: 'Payment service timeout' } };
        }
        throw fetchError;
    } finally {
        clearTimeout(timeoutId);
    }

    if (!p24Response.ok) {
        const errorText = await p24Response.text();
        console.error('[P24] API request failed:', p24Response.status, errorText);
        await failTransaction(db, sessionId, `P24 API error: ${p24Response.status}`);
        return { status: 502, body: { error: 'Payment service error' } };
    }

    const p24Result = await p24Response.json();

    if (p24Result.data?.token) {
        const { error: updateError } = await db
            .from('transactions')
            .update({ payment_session_id: p24Result.data.token })
            .eq('id', sessionId);

        if (updateError) {
            console.error('[P24] Failed to save token to database:', updateError);
        }

        return {
            status: 200,
            body: { redirectUrl: `${p24.apiUrl}/trnRequest/${p24Result.data.token}`, transactionId: sessionId },
        };
    }

    console.error('[P24] Registration failed:', p24Result);

    const errorMessage = p24Result.error
        ? (typeof p24Result.error === 'string' ? p24Result.error : JSON.stringify(p24Result.error))
        : 'P24 registration failed';
    await failTransaction(db, sessionId, errorMessage);

    return { status: 500, body: { error: 'Payment initialization failed', details: p24Result.error } };
}

// =============================================================================
// Powiadomienie P24 (urlStatus)
// =============================================================================

export const p24NotificationSchema = z.object({
    merchantId: z.number().int(),
    posId: z.number().int(),
    sessionId: z.string().uuid(),
    amount: z.number().int().positive(),
    originAmount: z.number().int(),
    currency: z.string().length(3),
    orderId: z.number().int(),
    methodId: z.number().int(),
    statement: z.string(),
    sign: z.string(),
});

export type P24Notification = z.infer<typeof p24NotificationSchema>;

function notificationSign(n: Record<string, unknown>, crc: string): string {
    return p24Sign({
        merchantId: n.merchantId,
        posId: n.posId,
        sessionId: n.sessionId,
        amount: n.amount,
        originAmount: n.originAmount,
        currency: n.currency,
        orderId: n.orderId,
        methodId: n.methodId,
        statement: n.statement,
        crc,
    });
}

export function isValidNotificationSign(body: Record<string, unknown>, crc: string): boolean {
    if (typeof body.sign !== 'string') return false;
    const expected = Buffer.from(notificationSign(body, crc));
    const given = Buffer.from(body.sign);
    return expected.length === given.length && crypto.timingSafeEqual(expected, given);
}

interface TransactionRow {
    id: string;
    amount: number;
    amount_grosze?: number | null;
    currency?: string | null;
    status: string;
    webhook_received_at: string | null;
}

/** Oczekiwana kwota w groszach; transakcje bez amount_grosze (sprzed LK-2.02 / bez migracji) mają amount w złotych. */
export function expectedAmountGrosze(tx: Pick<TransactionRow, 'amount' | 'amount_grosze'>): number {
    return tx.amount_grosze ?? tx.amount * 100;
}

export async function verifyP24Transaction(
    n: P24Notification,
    expectedAmount: number,
    p24: P24Credentials,
    fetchImpl: typeof fetch = fetch,
): Promise<{ ok: boolean; status: number; body: unknown }> {
    const sign = p24Sign({ sessionId: n.sessionId, orderId: n.orderId, amount: expectedAmount, currency: n.currency, crc: p24.crc });
    const response = await fetchImpl(`${p24.apiUrl}/api/v1/transaction/verify`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Basic ${Buffer.from(`${p24.posId}:${p24.apiKey}`).toString('base64')}`,
        },
        body: JSON.stringify({
            merchantId: p24.merchantId,
            posId: p24.posId,
            sessionId: n.sessionId,
            amount: expectedAmount,
            currency: n.currency,
            orderId: n.orderId,
            sign,
        }),
    });
    const body = await response.json().catch(() => null);
    const ok = response.ok && (body as { data?: { status?: string } } | null)?.data?.status === 'success';
    return { ok, status: response.status, body };
}

export interface NotificationDeps {
    p24: P24Credentials | null;
    fetchImpl?: typeof fetch;
}

/**
 * Kolejność (LK-2.02): podpis → schemat → nasz merchantId/posId → znana transakcja, kwota i waluta
 * → verify w P24 → dopiero potem zapis (webhook_received_at = zweryfikowano, finalize_bump_payment).
 * Do udanego verify nic nie trafia do bazy.
 */
export async function handleP24Notification(db: Db, raw: unknown, deps: NotificationDeps): Promise<Result> {
    const { p24 } = deps;
    if (!p24) {
        console.error('[P24 Webhook] P24 not configured');
        return { status: 500, body: { error: 'Server configuration error' } };
    }

    if (!raw || typeof raw !== 'object' || !isValidNotificationSign(raw as Record<string, unknown>, p24.crc)) {
        console.error('[P24 Webhook] Invalid signature');
        return { status: 401, body: { error: 'Invalid signature' } };
    }

    const parsed = p24NotificationSchema.safeParse(raw);
    if (!parsed.success) {
        console.error('[P24 Webhook] Invalid payload');
        return { status: 400, body: { error: 'Invalid payload' } };
    }
    const n = parsed.data;

    if (n.merchantId !== p24.merchantId || n.posId !== p24.posId) {
        console.error('[P24 Webhook] Foreign merchant/pos for session:', n.sessionId);
        return { status: 400, body: { error: 'Merchant mismatch' } };
    }

    const { data: tx, error: txError } = await db
        .from('transactions')
        .select('*')
        .eq('id', n.sessionId)
        .maybeSingle<TransactionRow>();

    if (txError) {
        console.error('[P24 Webhook] Transaction lookup failed:', txError.code);
        return { status: 500, body: { error: 'Database error' } };
    }
    if (!tx) {
        console.error('[P24 Webhook] Unknown session:', n.sessionId);
        return { status: 400, body: { error: 'Unknown transaction' } };
    }

    const expectedAmount = expectedAmountGrosze(tx);
    const expectedCurrency = tx.currency ?? PAYMENT_CONFIG.currency;
    if (n.amount !== expectedAmount || n.originAmount !== expectedAmount || n.currency !== expectedCurrency) {
        console.error('[P24 Webhook] Amount/currency mismatch for session:', n.sessionId);
        return { status: 400, body: { error: 'Amount mismatch' } };
    }

    // Powtórzone powiadomienie po udanym verify: bez drugiego verify, dokończenie jest idempotentne.
    if (!tx.webhook_received_at) {
        const verify = await verifyP24Transaction(n, expectedAmount, p24, deps.fetchImpl);
        if (!verify.ok) {
            console.error('[P24 Webhook] Verify failed for session:', n.sessionId, verify.status);
            return { status: 502, body: { error: 'Verification failed' } };
        }

        const { error: markError } = await db
            .from('transactions')
            .update({ webhook_received_at: new Date().toISOString() })
            .eq('id', n.sessionId);
        if (markError) {
            console.error('[P24 Webhook] Failed to mark verified:', markError.code);
        }
    }

    const finalize = await db.rpc('finalize_bump_payment', { p_transaction_id: n.sessionId, p_payment_id: n.orderId.toString() });
    if (finalize.error) {
        if (!isMissingSchemaError(finalize.error)) {
            console.error('[P24 Webhook] finalize_bump_payment failed:', finalize.error.code);
            return { status: 500, body: { error: 'Database error' } };
        }
        const { error } = await db.rpc('complete_payment', { p_transaction_id: n.sessionId, p_payment_id: n.orderId.toString() });
        if (error) {
            console.error('[P24 Webhook] RPC error:', error.code);
            return { status: 500, body: { error: 'Database error' } };
        }
    }

    return { status: 200, body: { status: 'ok' } };
}

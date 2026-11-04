import { test, expect } from '@playwright/test';
import type { SupabaseClient } from '@supabase/supabase-js';
import {
    handleP24Notification,
    isMissingSchemaError,
    p24Sign,
    quoteBumpAmount,
    registerBumpPayment,
    releaseBumpReservations,
    reserveBump,
    type P24Credentials,
} from './bump-payment';

// Fałszywy klient bazy: zapisuje każde wywołanie, odpowiedzi ustawia test.
type Call = { kind: 'rpc' | 'insert' | 'update' | 'select'; name: string; args?: unknown };
type DbReply = { data: unknown; error: { code?: string } | null };

function fakeDb(opts: { rpc?: Record<string, DbReply>; tx?: Record<string, unknown> | null; insertId?: string } = {}) {
    const calls: Call[] = [];
    const chain = (reply: () => DbReply) => {
        const c: Record<string, unknown> = {};
        for (const m of ['eq', 'select', 'in', 'lt']) c[m] = () => c;
        c.single = async () => reply();
        c.maybeSingle = async () => reply();
        c.then = (res: (v: DbReply) => unknown, rej: (e: unknown) => unknown) => Promise.resolve(reply()).then(res, rej);
        return c;
    };
    const db = {
        rpc(name: string, args: unknown) {
            calls.push({ kind: 'rpc', name, args });
            return chain(() => opts.rpc?.[name] ?? { data: null, error: null });
        },
        from(table: string) {
            return {
                insert(args: unknown) {
                    calls.push({ kind: 'insert', name: table, args });
                    return chain(() => ({ data: { id: opts.insertId ?? 'legacy-tx' }, error: null }));
                },
                update(args: unknown) {
                    calls.push({ kind: 'update', name: table, args });
                    return chain(() => ({ data: null, error: null }));
                },
                select(args: unknown) {
                    calls.push({ kind: 'select', name: table, args });
                    return chain(() => ({ data: opts.tx ?? null, error: null }));
                },
            };
        },
    };
    return { db: db as unknown as SupabaseClient, calls };
}

function fakeFetch(handler: (url: string, init: RequestInit) => Response | Promise<Response>) {
    const requests: { url: string; body: Record<string, unknown> }[] = [];
    const impl = (async (url: string, init: RequestInit) => {
        requests.push({ url, body: init.body ? JSON.parse(init.body as string) : {} });
        return handler(url, init);
    }) as unknown as typeof fetch;
    return { impl, requests };
}

const json = (body: unknown, status = 200) => new Response(JSON.stringify(body), { status });

const P24: P24Credentials = { merchantId: 111, posId: 111, apiKey: 'test-key', crc: 'test-crc', apiUrl: 'https://p24.test' };
const SESSION = '0f8fad5b-d9cb-469f-a165-70867728950e';
const AD = { id: 'ad-1', email: 'tutor@seed.test', title: 'Matematyka' };
const MISSING_FN = { data: null, error: { code: 'PGRST202' } };

function notification(overrides: Record<string, unknown> = {}) {
    const n: Record<string, unknown> = {
        merchantId: 111, posId: 111, sessionId: SESSION, amount: 100, originAmount: 100,
        currency: 'PLN', orderId: 987654, methodId: 25, statement: 'p24-test', ...overrides,
    };
    n.sign = p24Sign({
        merchantId: n.merchantId, posId: n.posId, sessionId: n.sessionId, amount: n.amount,
        originAmount: n.originAmount, currency: n.currency, orderId: n.orderId, methodId: n.methodId,
        statement: n.statement, crc: P24.crc,
    });
    return n;
}

const pendingTx = (overrides: Record<string, unknown> = {}) => ({
    id: SESSION, amount: 1, amount_grosze: 100, currency: 'PLN', status: 'pending', webhook_received_at: null, ...overrides,
});

const writes = (calls: Call[]) => calls.filter(c => c.kind !== 'select');

test.describe('isMissingSchemaError', () => {
    test('treats missing relation/function/column as schema absent', () => {
        for (const code of ['42P01', '42883', '42703', 'PGRST202', 'PGRST205']) expect(isMissingSchemaError({ code })).toBe(true);
        expect(isMissingSchemaError({ code: '23505' })).toBe(false);
        expect(isMissingSchemaError(null)).toBe(false);
    });
});

test.describe('reserveBump / quote — fallback without entitlement schema', () => {
    test('relation does not exist → legacy insert at 1000 gr, no error', async () => {
        const { db, calls } = fakeDb({ rpc: { register_bump_transaction: { data: null, error: { code: '42P01' } } } });
        const r = await reserveBump(db, AD.id);
        expect(r).toEqual({ transactionId: 'legacy-tx', amountGrosze: 1000, entitled: false });
        expect(calls.find(c => c.kind === 'insert')?.args).toMatchObject({ amount: 10, status: 'pending' });
    });

    test('function missing → quote is the standard 1000 gr', async () => {
        const { db } = fakeDb({ rpc: { quote_bump_amount: MISSING_FN } });
        expect(await quoteBumpAmount(db, AD.id)).toBe(1000);
    });

    test('function missing → release is skipped (0)', async () => {
        const { db } = fakeDb({ rpc: { release_bump_reservations: MISSING_FN } });
        expect(await releaseBumpReservations(db)).toBe(0);
    });

    test('other DB error does not silently fall back to a legacy insert', async () => {
        const { db, calls } = fakeDb({ rpc: { register_bump_transaction: { data: null, error: { code: '23505' } } } });
        expect(await reserveBump(db, AD.id)).toBeNull();
        expect(calls.some(c => c.kind === 'insert')).toBe(false);
    });

    test('rpc receives only server-side amounts (config), never request input', async () => {
        const { db, calls } = fakeDb({ rpc: { register_bump_transaction: { data: { transaction_id: SESSION, amount_grosze: 1000, entitled: false }, error: null } } });
        await reserveBump(db, AD.id);
        expect(calls[0].args).toMatchObject({ p_ad_id: AD.id, p_standard_amount: 1000, p_entitled_amount: 100, p_currency: 'PLN' });
    });
});

test.describe('registerBumpPayment — amount and release on every failure path', () => {
    const reserved = (amount: number) => ({ register_bump_transaction: { data: { transaction_id: SESSION, amount_grosze: amount, entitled: amount === 100 }, error: null } });

    test('amount sent to P24 (and in its sign) is the one the DB decided', async () => {
        const { db } = fakeDb({ rpc: reserved(1000) });
        const f = fakeFetch(() => json({ data: { token: 'tok' } }));
        const r = await registerBumpPayment(db, { ad: AD, baseUrl: 'http://x', p24: P24, fetchImpl: f.impl });
        expect(r.status).toBe(200);
        expect(f.requests[0].body.amount).toBe(1000);
        expect(f.requests[0].body.sign).toBe(p24Sign({ sessionId: SESSION, merchantId: 111, amount: 1000, currency: 'PLN', crc: P24.crc }));
    });

    const failures: [string, P24Credentials | null, (url: string, init: RequestInit) => Response | Promise<Response>, number][] = [
        ['not configured', null, () => json({}), 503],
        ['non-2xx', P24, () => json({ error: 'bad' }, 400), 502],
        ['no token', P24, () => json({ data: {} }), 500],
        ['unexpected exception', P24, () => { throw new Error('boom'); }, 500],
        ['timeout', P24, (_u, init) => new Promise((_, rej) => init.signal?.addEventListener('abort', () => rej(Object.assign(new Error('aborted'), { name: 'AbortError' })))), 504],
    ];

    for (const [name, p24, handler, status] of failures) {
        test(`${name} → transaction failed, then reservation released`, async () => {
            const { db, calls } = fakeDb({ rpc: reserved(100) });
            const f = fakeFetch(handler);
            const r = await registerBumpPayment(db, { ad: AD, baseUrl: 'http://x', p24, fetchImpl: f.impl, timeoutMs: 20 });
            expect(r.status).toBe(status);
            const failIdx = calls.findIndex(c => c.kind === 'update' && (c.args as { status?: string }).status === 'failed');
            const releaseIdx = calls.findIndex(c => c.kind === 'rpc' && c.name === 'release_bump_reservations');
            expect(failIdx).toBeGreaterThan(-1);
            expect(releaseIdx).toBeGreaterThan(failIdx);
            expect(calls[releaseIdx].args).toEqual({ p_transaction_id: SESSION });
        });
    }
});

test.describe('handleP24Notification — order: sign → schema → merchant → tx/amount → verify → write', () => {
    const verifyOk = () => fakeFetch(() => json({ data: { status: 'success' }, responseCode: 0 }));

    async function run(body: unknown, tx: Record<string, unknown> | null, f = verifyOk()) {
        const { db, calls } = fakeDb({ tx, rpc: { finalize_bump_payment: { data: true, error: null } } });
        const r = await handleP24Notification(db, body, { p24: P24, fetchImpl: f.impl });
        return { r, calls, verifyCalls: f.requests.length };
    }

    test('bad signature → 401, no DB access, no verify', async () => {
        const { r, calls, verifyCalls } = await run({ ...notification(), amount: 5 }, pendingTx());
        expect(r.status).toBe(401);
        expect(calls).toEqual([]);
        expect(verifyCalls).toBe(0);
    });

    test('valid sign, wrong amount → 400, no verify, no write', async () => {
        const { r, calls, verifyCalls } = await run(notification({ amount: 1, originAmount: 1 }), pendingTx());
        expect(r).toMatchObject({ status: 400, body: { error: 'Amount mismatch' } });
        expect(verifyCalls).toBe(0);
        expect(writes(calls)).toEqual([]);
    });

    test('valid sign, wrong currency → 400, no verify, no write', async () => {
        const { r, calls, verifyCalls } = await run(notification({ currency: 'EUR' }), pendingTx());
        expect(r.status).toBe(400);
        expect(verifyCalls).toBe(0);
        expect(writes(calls)).toEqual([]);
    });

    test('valid sign, unknown sessionId → 400, no verify, no write', async () => {
        const { r, calls, verifyCalls } = await run(notification(), null);
        expect(r).toMatchObject({ status: 400, body: { error: 'Unknown transaction' } });
        expect(verifyCalls).toBe(0);
        expect(writes(calls)).toEqual([]);
    });

    test('valid sign, foreign posId → 400, no DB access, no verify', async () => {
        const { r, calls, verifyCalls } = await run(notification({ posId: 222 }), pendingTx());
        expect(r).toMatchObject({ status: 400, body: { error: 'Merchant mismatch' } });
        expect(calls).toEqual([]);
        expect(verifyCalls).toBe(0);
    });

    test('valid sign, malformed payload → 400 before DB', async () => {
        const { r, calls } = await run(notification({ sessionId: 'not-a-uuid' }), pendingTx());
        expect(r.status).toBe(400);
        expect(calls).toEqual([]);
    });

    test('verify rejected → 502, no write', async () => {
        const f = fakeFetch(() => json({ error: 'Invalid sign' }, 400));
        const { r, calls } = await run(notification(), pendingTx(), f);
        expect(r.status).toBe(502);
        expect(writes(calls)).toEqual([]);
    });

    test('happy path: verify with expected amount and sign, then mark, then finalize', async () => {
        const f = verifyOk();
        const { r, calls } = await run(notification(), pendingTx(), f);
        expect(r.status).toBe(200);
        expect(f.requests[0].url).toBe('https://p24.test/api/v1/transaction/verify');
        expect(f.requests[0].body).toMatchObject({ sessionId: SESSION, amount: 100, currency: 'PLN', orderId: 987654 });
        expect(f.requests[0].body.sign).toBe(p24Sign({ sessionId: SESSION, orderId: 987654, amount: 100, currency: 'PLN', crc: P24.crc }));
        expect(writes(calls).map(c => c.name)).toEqual(['transactions', 'finalize_bump_payment']);
    });

    test('repeated notification after verify → no second verify, finalize again (idempotent in DB)', async () => {
        const { r, calls, verifyCalls } = await run(notification(), pendingTx({ status: 'completed', webhook_received_at: '2026-11-04T10:00:00Z' }));
        expect(r.status).toBe(200);
        expect(verifyCalls).toBe(0);
        expect(writes(calls).map(c => c.name)).toEqual(['finalize_bump_payment']);
    });

    test('late payment for a cron-failed transaction is still verified and finalized', async () => {
        const { r, calls, verifyCalls } = await run(notification(), pendingTx({ status: 'failed' }));
        expect(r.status).toBe(200);
        expect(verifyCalls).toBe(1);
        expect(calls.some(c => c.name === 'finalize_bump_payment')).toBe(true);
    });

    test('legacy transaction (amount in złoty, no migration) expects amount*100', async () => {
        const { r } = await run(notification({ amount: 1000, originAmount: 1000 }), { id: SESSION, amount: 10, status: 'pending', webhook_received_at: null });
        expect(r.status).toBe(200);
    });

    test('finalize function missing → falls back to complete_payment', async () => {
        const { db, calls } = fakeDb({ tx: pendingTx(), rpc: { finalize_bump_payment: MISSING_FN } });
        const r = await handleP24Notification(db, notification(), { p24: P24, fetchImpl: verifyOk().impl });
        expect(r.status).toBe(200);
        expect(calls.filter(c => c.kind === 'rpc').map(c => c.name)).toEqual(['finalize_bump_payment', 'complete_payment']);
    });
});

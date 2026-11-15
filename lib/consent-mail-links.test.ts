import { test, expect } from '@playwright/test';
import type { SupabaseClient } from '@supabase/supabase-js';
import {
    buildConsentMailLinks,
    escapeLikePattern,
    findNewestActiveOfferToken,
    hasPromotionEntitlement,
} from './consent-mail-links';

// Fałszywy klient bazy z tabelą w pamięci: obsługuje filtry, których używa moduł (ilike, eq, order, limit).
type Row = Record<string, unknown>;

function likeToRegExp(pattern: string): RegExp {
    let re = '';
    for (let i = 0; i < pattern.length; i++) {
        const c = pattern[i];
        if (c === '\\') re += pattern[++i].replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        else if (c === '%') re += '.*';
        else if (c === '_') re += '.';
        else re += c.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    }
    return new RegExp(`^${re}$`, 'i');
}

function fakeDb(tables: Record<string, Row[]>, opts: { error?: { code: string } } = {}) {
    const writes: string[] = [];
    const db = {
        from(table: string) {
            let rows = [...(tables[table] ?? [])];
            const q: Record<string, unknown> = {};
            q.select = () => q;
            q.ilike = (col: string, pattern: string) => { rows = rows.filter((r) => likeToRegExp(pattern).test(String(r[col]))); return q; };
            q.eq = (col: string, val: unknown) => { rows = rows.filter((r) => r[col] === val); return q; };
            q.order = (col: string, o: { ascending: boolean }) => {
                rows.sort((a, b) => (String(a[col]) < String(b[col]) ? -1 : 1) * (o.ascending ? 1 : -1));
                return q;
            };
            q.limit = (n: number) => { rows = rows.slice(0, n); return q; };
            q.maybeSingle = async () => (opts.error ? { data: null, error: opts.error } : { data: rows[0] ?? null, error: null });
            for (const w of ['insert', 'update', 'upsert', 'delete']) q[w] = () => { writes.push(`${w}:${table}`); return q; };
            return q;
        },
        rpc(name: string) {
            writes.push(`rpc:${name}`);
            return { maybeSingle: async () => ({ data: null, error: null }) };
        },
    };
    return { db: db as unknown as SupabaseClient, writes };
}

const ADS: Row[] = [
    { email: 'Two.Ads@seed.test', type: 'offer', status: 'active', created_at: '2026-11-01T10:00:00Z', management_token: 'tok-older' },
    { email: 'two.ads@seed.test', type: 'offer', status: 'active', created_at: '2026-11-10T10:00:00Z', management_token: 'tok-newest' },
    { email: 'two.ads@seed.test', type: 'offer', status: 'expired', created_at: '2026-11-12T10:00:00Z', management_token: 'tok-expired' },
    { email: 'two.ads@seed.test', type: 'search', status: 'active', created_at: '2026-11-13T10:00:00Z', management_token: 'tok-search' },
    { email: 'search.only@seed.test', type: 'search', status: 'active', created_at: '2026-11-13T10:00:00Z', management_token: 'tok-s' },
    { email: 'axb@seed.test', type: 'offer', status: 'active', created_at: '2026-11-13T10:00:00Z', management_token: 'tok-other-person' },
];

test.describe('findNewestActiveOfferToken', () => {
    test('picks the newest active offer, case-insensitive, ignoring expired and search ads', async () => {
        const { db, writes } = fakeDb({ ads: ADS });
        expect(await findNewestActiveOfferToken(db, '  TWO.ADS@seed.test ')).toBe('tok-newest');
        expect(writes).toEqual([]);
    });

    test('no active offer for the address → null', async () => {
        const { db } = fakeDb({ ads: ADS });
        expect(await findNewestActiveOfferToken(db, 'search.only@seed.test')).toBeNull();
        expect(await findNewestActiveOfferToken(db, 'nobody@seed.test')).toBeNull();
    });

    test('underscore in the address is literal, not a wildcard (no token for someone else)', async () => {
        const { db } = fakeDb({ ads: ADS });
        expect(await findNewestActiveOfferToken(db, 'a_b@seed.test')).toBeNull();
    });

    test('lookup error → null (mail falls back to /recover-magic-link)', async () => {
        const { db } = fakeDb({ ads: ADS }, { error: { code: '57014' } });
        expect(await findNewestActiveOfferToken(db, 'two.ads@seed.test')).toBeNull();
    });
});

test('escapeLikePattern escapes %, _ and backslash', () => {
    expect(escapeLikePattern('a_b%c\\d@seed.test')).toBe('a\\_b\\%c\\\\d@seed.test');
});

test.describe('hasPromotionEntitlement', () => {
    const ENT: Row[] = [
        { email: 'granted@seed.test', status: 'granted' },
        { email: 'reserved@seed.test', status: 'reserved' },
        { email: 'used@seed.test', status: 'used' },
    ];

    test('any status hides the banner; no row shows it', async () => {
        const { db, writes } = fakeDb({ promotion_entitlements: ENT });
        expect(await hasPromotionEntitlement(db, 'Granted@seed.test')).toBe(true);
        expect(await hasPromotionEntitlement(db, 'reserved@seed.test')).toBe(true);
        expect(await hasPromotionEntitlement(db, 'used@seed.test')).toBe(true);
        expect(await hasPromotionEntitlement(db, 'none@seed.test')).toBe(false);
        expect(writes).toEqual([]);
    });

    test('lookup error → banner shown (as before LK-2.06)', async () => {
        const { db } = fakeDb({ promotion_entitlements: ENT }, { error: { code: '42P01' } });
        expect(await hasPromotionEntitlement(db, 'granted@seed.test')).toBe(false);
    });
});

// Render szablonu nie da się zrobić tutaj (runner Playwrighta przerabia JSX w plikach .tsx);
// wyrenderowany HTML dla lokalnej bazy jest w raporcie LK-2.06.
test.describe('buildConsentMailLinks', () => {
    const base = 'https://lekcjo.test';

    test('address with two active offers → bump and panel links carry the newest token', async () => {
        const { db } = fakeDb({ ads: ADS });
        const links = buildConsentMailLinks(base, await findNewestActiveOfferToken(db, 'two.ads@seed.test'));
        expect(links).toEqual({
            bumpLink: `${base}/offers/manage/tok-newest?podbij=1`,
            panelLink: `${base}/offers/manage/tok-newest`,
            recoverLink: `${base}/recover-magic-link`,
        });
    });

    test('address without an active offer → only /recover-magic-link', async () => {
        const { db } = fakeDb({ ads: ADS });
        const links = buildConsentMailLinks(base, await findNewestActiveOfferToken(db, 'search.only@seed.test'));
        expect(links).toEqual({ bumpLink: null, panelLink: null, recoverLink: `${base}/recover-magic-link` });
    });
});

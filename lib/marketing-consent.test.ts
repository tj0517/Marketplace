import { test, expect } from '@playwright/test';
import { consentPageSchema, isConsentChecked, maskEmail, normalizeEmail, withdrawalSchema, MARKETING_CONSENT } from './marketing-consent';

test.describe('consentPageSchema', () => {
    test('accepts email with checked consent', () => {
        expect(consentPageSchema.safeParse({ email: ' Active@Seed.test ', consent: 'on' }).success).toBe(true);
    });

    test('rejects missing consent (checkbox omitted)', () => {
        expect(consentPageSchema.safeParse({ email: 'active@seed.test', consent: null }).success).toBe(false);
    });

    test('rejects consent with value other than on', () => {
        expect(consentPageSchema.safeParse({ email: 'active@seed.test', consent: 'false' }).success).toBe(false);
    });

    test('rejects invalid email', () => {
        expect(consentPageSchema.safeParse({ email: 'nope', consent: 'on' }).success).toBe(false);
    });
});

test.describe('withdrawalSchema', () => {
    test('accepts a uuid token', () => {
        expect(withdrawalSchema.safeParse({ token: crypto.randomUUID() }).success).toBe(true);
    });

    test('rejects non-uuid input', () => {
        expect(withdrawalSchema.safeParse({ token: "' or 1=1 --" }).success).toBe(false);
        expect(withdrawalSchema.safeParse({ token: null }).success).toBe(false);
    });
});

test('isConsentChecked: only "on" counts', () => {
    expect(isConsentChecked('on')).toBe(true);
    expect(isConsentChecked(null)).toBe(false);
    expect(isConsentChecked('')).toBe(false);
});

test('normalizeEmail trims and lowercases', () => {
    expect(normalizeEmail('  Jan.Kowalski@Example.PL ')).toBe('jan.kowalski@example.pl');
});

test('maskEmail keeps seed addresses, masks the rest', () => {
    expect(maskEmail('Active@seed.test')).toBe('active@seed.test');
    expect(maskEmail('jan.kowalski@example.pl')).toBe('j***@example.pl');
    expect(maskEmail('broken')).toBe('***');
});

test('consent version is set', () => {
    expect(MARKETING_CONSENT.version.length).toBeGreaterThan(0);
});

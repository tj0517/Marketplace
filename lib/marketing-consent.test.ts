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

test('consent v2: version and client text verbatim (O-07)', () => {
    expect(MARKETING_CONSENT.version).toBe('v2-2026-11-15');
    expect(MARKETING_CONSENT.text).toBe(
        '🎁 ZGARNIJ LIMITOWANE PODBICIE ZA 1 ZŁ! Dołącz do newslettera Lekcjo.pl i odbierz swoje pierwsze podbicie ogłoszenia za 1 zł. Korzystaj z promocji, nowości i wskazówek, jak zdobywać więcej uczniów.'
    );
});

test('consent v2: parts rebuild the full text, link phrase is "podbicie ogłoszenia"', () => {
    const { heading, bodyBeforeLink, linkText, bodyAfterLink, linkHref } = MARKETING_CONSENT;
    expect(`${heading} ${bodyBeforeLink}${linkText}${bodyAfterLink}`).toBe(MARKETING_CONSENT.text);
    expect(linkText).toBe('podbicie ogłoszenia');
    expect(linkHref).toBe('/podbicie-ogloszenia');
});

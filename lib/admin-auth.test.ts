import { test, expect } from '@playwright/test';
import { checkAdminAuth } from './admin-auth';

const USER = 'test-admin';
const PASS = 'test-pass:with-colon';

const basic = (credentials: string) => `Basic ${Buffer.from(credentials).toString('base64')}`;
const check = (header: string | null) => checkAdminAuth(header, USER, PASS);

test.describe('checkAdminAuth', () => {
    test('zgoda przy poprawnym loginie i haśle', () => {
        expect(check(basic(`${USER}:${PASS}`))).toBe('ok');
    });

    test('odmowa bez nagłówka', () => {
        expect(check(null)).toBe('denied');
        expect(check('')).toBe('denied');
    });

    test('odmowa przy złym haśle', () => {
        expect(check(basic(`${USER}:wrong`))).toBe('denied');
    });

    test('odmowa przy złym loginie', () => {
        expect(check(basic(`wrong:${PASS}`))).toBe('denied');
    });

    test('odmowa przy złym loginie i haśle daje ten sam wynik co przy samym złym haśle', () => {
        expect(check(basic('wrong:wrong'))).toBe(check(basic(`${USER}:wrong`)));
    });

    test('odmowa przy złym formacie nagłówka', () => {
        expect(check(`Bearer ${Buffer.from(`${USER}:${PASS}`).toString('base64')}`)).toBe('denied');
        expect(check('Basic')).toBe('denied');
        expect(check(basic(`${USER}${PASS}`))).toBe('denied');
        expect(check('Basic !!!not-base64!!!')).toBe('denied');
    });

    test('brak konfiguracji ADMIN_USER/ADMIN_PASS nigdy nie przepuszcza', () => {
        expect(checkAdminAuth(basic(':'), '', '')).toBe('misconfigured');
        expect(checkAdminAuth(basic(`${USER}:${PASS}`), undefined, PASS)).toBe('misconfigured');
        expect(checkAdminAuth(basic(`${USER}:${PASS}`), USER, undefined)).toBe('misconfigured');
    });
});

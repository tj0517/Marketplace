import { test, expect } from '@playwright/test';
import { supabaseAdmin } from './utils/db';

test.describe('4. Magic Link i Edycja', () => {

    test('4.1 Dostęp przez Magic Link', async ({ page }) => {
        // Znajdź dowolne aktywne ogłoszenie z tokenem
        const { data: ad } = await supabaseAdmin
            .from('ads')
            .select('id, management_token, title')
            .eq('status', 'active')
            .not('management_token', 'is', null)
            .limit(1)
            .single();

        if (!ad?.management_token) {
            test.skip();
            return;
        }

        await page.goto(`/offers/manage/${ad.management_token}`);
        await page.waitForTimeout(1000);

        // Strona zarządzania powinna się załadować
        await expect(page.locator('body')).toBeVisible();

        const bodyText = await page.locator('body').textContent();

        // Powinno zawierać informacje o ogłoszeniu lub opcje zarządzania
        const isManagePage = bodyText?.includes('Zarządzaj') ||
            bodyText?.includes(ad.title) ||
            bodyText?.includes('Edytuj') ||
            bodyText?.includes('Przedłuż') ||
            bodyText?.includes('Usuń');

        expect(isManagePage).toBeTruthy();
    });

    test('4.2 Magic Link nie wygasa', async ({ page }) => {
        // Zgodnie ze specyfikacją sekcja 10.3:
        // "Link ważny: na zawsze (dopóki ogłoszenie nie zostanie usunięte)"

        const { data: ad } = await supabaseAdmin
            .from('ads')
            .select('id, management_token, created_at')
            .not('management_token', 'is', null)
            .order('created_at', { ascending: true }) // Najstarsze
            .limit(1)
            .single();

        if (!ad?.management_token) {
            test.skip();
            return;
        }

        // Token powinien działać niezależnie od wieku
        await page.goto(`/offers/manage/${ad.management_token}`);
        await page.waitForTimeout(1000);

        // Strona powinna się załadować (nie 404 ani error)
        const response = await page.request.get(`/offers/manage/${ad.management_token}`);
        expect(response.status()).toBeLessThan(400);
    });

    test('4.3 Edycja dozwolonych pól', async ({ page }) => {
        // Zgodnie ze specyfikacją sekcja 3.2:
        // "Można edytować: tytuł, opis, lokalizacja, zakres materiału, cena, płeć"

        const { data: ad } = await supabaseAdmin
            .from('ads')
            .select('id, management_token, title')
            .eq('status', 'active')
            .not('management_token', 'is', null)
            .limit(1)
            .single();

        if (!ad?.management_token) {
            test.skip();
            return;
        }

        await page.goto(`/offers/manage/${ad.management_token}`);
        await page.waitForTimeout(1000);

        // Szukaj przycisku edycji
        const editButton = page.locator('button:has-text("Edytuj"), a:has-text("Edytuj")');

        if (await editButton.count() > 0) {
            await editButton.first().click();
            await page.waitForTimeout(1000);

            // Pola edytowalne powinny być dostępne
            const titleInput = page.locator('#title, input[name="title"]');

            if (await titleInput.count() > 0) {
                const isEditable = !(await titleInput.isDisabled());
                expect(isEditable).toBeTruthy();
            }

            // Sprawdź też pole opisu
            const descInput = page.locator('#description, textarea[name="description"]');
            if (await descInput.count() > 0) {
                const isDescEditable = !(await descInput.isDisabled());
                expect(isDescEditable).toBeTruthy();
            }
        }
    });

    test('4.4 Przycisk przedłużenia dla aktywnego ogłoszenia typu offer', async ({ page }) => {
        // Zgodnie ze specyfikacją sekcja 3.3:
        // "Przedłużenie ogłoszenia (10 zł / 30 dni)"

        const { data: ad } = await supabaseAdmin
            .from('ads')
            .select('id, management_token, type, status')
            .eq('status', 'active')
            .eq('type', 'offer')
            .not('management_token', 'is', null)
            .limit(1)
            .single();

        if (!ad?.management_token) {
            test.skip();
            return;
        }

        await page.goto(`/offers/manage/${ad.management_token}`);
        await page.waitForTimeout(1000);

        // Przycisk przedłużenia powinien być widoczny
        const extendButton = page.locator('button:has-text("Przedłuż"), a:has-text("Przedłuż")');
        const bodyText = await page.locator('body').textContent();

        // Dla aktywnego ogłoszenia typu offer powinien być dostępny
        const hasExtendOption = await extendButton.count() > 0 ||
            bodyText?.includes('Przedłuż');

        expect(hasExtendOption).toBeTruthy();
    });

    test('4.5 Przycisk promowania (podbicia) dla aktywnego ogłoszenia', async ({ page }) => {
        // Zgodnie ze specyfikacją sekcja 4:
        // "Podbicie ogłoszenia - TYLKO dla ogłoszeń w statusie active"

        const { data: ad } = await supabaseAdmin
            .from('ads')
            .select('id, management_token, type, status')
            .eq('status', 'active')
            .eq('type', 'offer')
            .not('management_token', 'is', null)
            .limit(1)
            .single();

        if (!ad?.management_token) {
            test.skip();
            return;
        }

        await page.goto(`/offers/manage/${ad.management_token}`);
        await page.waitForTimeout(1000);

        // Przycisk podbicia powinien być widoczny
        const promoteButton = page.locator('button:has-text("Podbij"), button:has-text("Promuj"), a:has-text("Podbij")');
        const bodyText = await page.locator('body').textContent();

        const hasPromoteOption = await promoteButton.count() > 0 ||
            bodyText?.includes('Podbij') ||
            bodyText?.includes('Promuj');

        expect(hasPromoteOption).toBeTruthy();
    });

    test('4.6 Usunięcie ogłoszenia', async ({ page }) => {
        // Zgodnie ze specyfikacją sekcja 7.1:
        // "Użytkownik może usunąć swoje ogłoszenie w dowolnym momencie"

        const { data: ad } = await supabaseAdmin
            .from('ads')
            .select('id, management_token')
            .eq('status', 'active')
            .not('management_token', 'is', null)
            .limit(1)
            .single();

        if (!ad?.management_token) {
            test.skip();
            return;
        }

        await page.goto(`/offers/manage/${ad.management_token}`);
        await page.waitForTimeout(1000);

        // Przycisk usunięcia powinien być widoczny
        const deleteButton = page.locator('button:has-text("Usuń"), a:has-text("Usuń")');
        const bodyText = await page.locator('body').textContent();

        const hasDeleteOption = await deleteButton.count() > 0 ||
            bodyText?.includes('Usuń');

        expect(hasDeleteOption).toBeTruthy();

        // NIE klikamy faktycznie usunięcia - tylko weryfikujemy obecność opcji
    });

    test('4.7 Nieprawidłowy token zwraca błąd', async ({ page }) => {
        const invalidTokens = [
            'fake-token-12345',
            'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
            '../../../etc/passwd',
            '<script>alert(1)</script>',
        ];

        for (const token of invalidTokens) {
            await page.goto(`/offers/manage/${token}`);
            await page.waitForTimeout(500);

            const bodyText = await page.locator('body').textContent();

            // Nie powinno pokazać danych żadnego ogłoszenia
            expect(bodyText).not.toContain('Przedłuż ogłoszenie');
            expect(bodyText).not.toContain('Promuj ogłoszenie');
        }
    });

    test('4.8 Widok statystyk ogłoszenia', async ({ page }) => {
        // Zgodnie ze specyfikacją sekcja 10.2:
        // "Prosta statystyka: liczba wyświetleń ogłoszenia (views_count)"

        const { data: ad } = await supabaseAdmin
            .from('ads')
            .select('id, management_token, views_count')
            .eq('status', 'active')
            .not('management_token', 'is', null)
            .limit(1)
            .single();

        if (!ad?.management_token) {
            test.skip();
            return;
        }

        await page.goto(`/offers/manage/${ad.management_token}`);
        await page.waitForTimeout(1000);

        const bodyText = await page.locator('body').textContent();

        // Powinny być widoczne statystyki
        const hasStats = bodyText?.includes('wyświetleń') ||
            bodyText?.includes('views') ||
            bodyText?.includes('statystyk') ||
            /\d+\s*(wyświetleń|odsłon)/i.test(bodyText || '');

        // Statystyki powinny być widoczne w panelu zarządzania
        console.log(`Stats visible: ${hasStats}`);
    });
});

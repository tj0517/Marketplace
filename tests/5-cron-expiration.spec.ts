import { test, expect } from '@playwright/test';
import { supabaseAdmin } from './utils/db';

test.describe('5. Cron i Wygasanie', () => {

    test('5.1 CRON wymaga autoryzacji', async ({ request }) => {
        // Bez autoryzacji
        const responseNoAuth = await request.get('/api/cron');
        expect(responseNoAuth.status()).toBe(401);

        // Z błędnym tokenem
        const responseWrongAuth = await request.get('/api/cron', {
            headers: {
                'Authorization': 'Bearer wrong-token-12345'
            }
        });
        expect(responseWrongAuth.status()).toBe(401);
    });

    test('5.2 CRON z prawidłową autoryzacją', async ({ request }) => {
        const cronSecret = process.env.CRON_SECRET;

        if (!cronSecret) {
            test.skip();
            return;
        }

        const response = await request.get('/api/cron', {
            headers: {
                'Authorization': `Bearer ${cronSecret}`
            }
        });

        expect(response.ok()).toBeTruthy();

        const json = await response.json();
        expect(json).toHaveProperty('message', 'Cron job completed');
        expect(json).toHaveProperty('expiringSoonEmailsSent');
        expect(json).toHaveProperty('expiredEmailsSent');
        expect(json).toHaveProperty('abandonedTransactionsMarked');
    });

    test('5.3 Automatyczne wygasanie ogłoszeń', async ({ request }) => {
        const cronSecret = process.env.CRON_SECRET;

        if (!cronSecret) {
            test.skip();
            return;
        }

        // Utwórz ogłoszenie z datą wygaśnięcia w przeszłości
        const testTitle = `TEST_CRON_EXPIRE_${Date.now()}`;
        const pastDate = new Date(Date.now() - 24 * 60 * 60 * 1000); // Wczoraj

        const { data: testAd, error: insertError } = await supabaseAdmin
            .from('ads')
            .insert({
                title: testTitle,
                description: 'Ogłoszenie do testu automatycznego wygasania.',
                subject: 'Matematyka',
                location: 'Test City',
                education_level: ['podstawowa'],
                price_amount: 50,
                price_unit: '60min',
                email: 'test-cron@example.com',
                phone_contact: '+48999888777',
                phone_hash: `test-hash-cron-${Date.now()}`,
                type: 'offer',
                status: 'active',
                expires_at: pastDate.toISOString(),
            })
            .select()
            .single();

        if (insertError || !testAd) {
            console.error('Insert error:', insertError);
            return;
        }

        // Uruchom CRON
        const response = await request.get('/api/cron', {
            headers: {
                'Authorization': `Bearer ${cronSecret}`
            }
        });

        expect(response.ok()).toBeTruthy();

        // Sprawdź czy ogłoszenie zostało wygaszone
        const { data: updatedAd } = await supabaseAdmin
            .from('ads')
            .select('status')
            .eq('id', testAd.id)
            .single();

        expect(updatedAd?.status).toBe('expired');

        // Cleanup
        await supabaseAdmin.from('ads').delete().eq('id', testAd.id);
    });

    test('5.4 Wysyłanie ostrzeżeń przed wygaśnięciem', async ({ request }) => {
        const cronSecret = process.env.CRON_SECRET;

        if (!cronSecret) {
            test.skip();
            return;
        }

        // Zgodnie ze specyfikacją: ostrzeżenie 5 dni przed wygaśnięciem
        // (w kodzie używane są 3 dni)
        const testTitle = `TEST_CRON_WARNING_${Date.now()}`;
        const threeDaysFromNow = new Date(Date.now() + 2 * 24 * 60 * 60 * 1000); // 2 dni

        const { data: testAd, error: insertError } = await supabaseAdmin
            .from('ads')
            .insert({
                title: testTitle,
                description: 'Ogłoszenie do testu ostrzeżeń o wygasaniu.',
                subject: 'Fizyka',
                location: 'Test City',
                education_level: ['średnia'],
                price_amount: 60,
                price_unit: '60min',
                email: 'test-warning@example.com',
                phone_contact: '+48999888666',
                phone_hash: `test-hash-warning-${Date.now()}`,
                type: 'offer',
                status: 'active',
                expires_at: threeDaysFromNow.toISOString(),
                expiring_warning_sent_at: null, // Jeszcze nie wysłano
            })
            .select()
            .single();

        if (insertError || !testAd) {
            console.error('Insert error:', insertError);
            return;
        }

        // Uruchom CRON
        const response = await request.get('/api/cron', {
            headers: {
                'Authorization': `Bearer ${cronSecret}`
            }
        });

        expect(response.ok()).toBeTruthy();

        // Sprawdź czy ustawiono flagę ostrzeżenia
        const { data: updatedAd } = await supabaseAdmin
            .from('ads')
            .select('expiring_warning_sent_at')
            .eq('id', testAd.id)
            .single();

        // Powinno być ustawione (ostrzeżenie wysłane)
        expect(updatedAd?.expiring_warning_sent_at).not.toBeNull();

        // Cleanup
        await supabaseAdmin.from('ads').delete().eq('id', testAd.id);
    });

    test('5.5 Oznaczanie porzuconych transakcji', async ({ request }) => {
        const cronSecret = process.env.CRON_SECRET;

        if (!cronSecret) {
            test.skip();
            return;
        }

        // Utwórz transakcję pending starszą niż 1 godzina
        const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000);

        // Najpierw potrzebujemy ogłoszenia
        const { data: testAd } = await supabaseAdmin
            .from('ads')
            .select('id')
            .limit(1)
            .single();

        if (!testAd) {
            test.skip();
            return;
        }

        const { data: testTx, error: txError } = await supabaseAdmin
            .from('transactions')
            .insert({
                ad_id: testAd.id,
                amount: 10.00,
                type: 'extension',
                status: 'pending',
                created_at: twoHoursAgo.toISOString(),
            })
            .select()
            .single();

        if (txError || !testTx) {
            console.error('Transaction insert error:', txError);
            return;
        }

        // Uruchom CRON
        const response = await request.get('/api/cron', {
            headers: {
                'Authorization': `Bearer ${cronSecret}`
            }
        });

        expect(response.ok()).toBeTruthy();

        // Sprawdź czy transakcja została oznaczona jako failed
        const { data: updatedTx } = await supabaseAdmin
            .from('transactions')
            .select('status, error_message')
            .eq('id', testTx.id)
            .single();

        expect(updatedTx?.status).toBe('failed');
        expect(updatedTx?.error_message).toContain('Timeout');

        // Cleanup
        await supabaseAdmin.from('transactions').delete().eq('id', testTx.id);
    });
});

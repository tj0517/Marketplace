// Bezpiecznik testów (LK-1.04): testy wolno uruchamiać tylko na lokalnym Supabase.
// Fail closed: brak, nieparsowalny lub nielokalny NEXT_PUBLIC_SUPABASE_URL przerywa uruchomienie.
const LOCAL_HOSTS = new Set(['localhost', '127.0.0.1']);

export default function globalSetup() {
    const raw = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const hint = 'Uruchom lokalny stack (`npm run db:start`) i ustaw NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321.';

    if (!raw) {
        throw new Error(`[test guard] NEXT_PUBLIC_SUPABASE_URL nie jest ustawiony — przerywam testy. ${hint}`);
    }

    let host: string;
    try {
        host = new URL(raw).hostname;
    } catch {
        throw new Error(`[test guard] NEXT_PUBLIC_SUPABASE_URL nie jest poprawnym URL-em — przerywam testy. ${hint}`);
    }

    if (!LOCAL_HOSTS.has(host)) {
        throw new Error(`[test guard] NEXT_PUBLIC_SUPABASE_URL wskazuje na "${host}", a nie na localhost/127.0.0.1 — przerywam testy, żeby nie dotknąć produkcji. ${hint}`);
    }
}

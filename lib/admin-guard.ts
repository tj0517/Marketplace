import { headers } from 'next/headers';
import { checkAdminAuth } from './admin-auth';

// Celowo bez 'use server': to nie jest akcja, tylko strażnik wywoływany na początku każdej akcji admina.
// Middleware chroni tylko adresy `/admin`, a akcję serwera da się wywołać przez dowolny adres.
// Przeglądarka po zalogowaniu na `/admin` dołącza nagłówek Authorization do POST-ów akcji z panelu.
export async function requireAdmin(): Promise<void> {
  const result = checkAdminAuth((await headers()).get('authorization'));

  if (result === 'misconfigured') {
    console.error('ADMIN_USER or ADMIN_PASS not configured');
  }

  if (result !== 'ok') {
    throw new Error('Unauthorized');
  }
}

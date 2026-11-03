// Jedno miejsce sprawdzania hasła panelu admina (HTTP Basic Auth, ADMIN_USER / ADMIN_PASS).
// Używają go middleware (`/admin`) i każda akcja w `actions/admin/` (przez `requireAdmin`).
// Bez importów z Next.js, żeby działało w middleware i w testach jednostkowych.

export type AdminAuthResult = 'ok' | 'denied' | 'misconfigured';

function timingSafeEqual(a: string, b: string): boolean {
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);

  if (bufA.length !== bufB.length) {
    return false;
  }

  let result = 0;
  for (let i = 0; i < bufA.length; i++) {
    result |= bufA[i] ^ bufB[i];
  }
  return result === 0;
}

export function checkAdminAuth(
  authHeader: string | null | undefined,
  expectedUser: string | undefined = process.env.ADMIN_USER,
  expectedPass: string | undefined = process.env.ADMIN_PASS,
): AdminAuthResult {
  if (!expectedUser || !expectedPass) {
    return 'misconfigured';
  }

  if (!authHeader) {
    return 'denied';
  }

  try {
    const [scheme, credentials] = authHeader.split(' ');
    if (scheme !== 'Basic' || !credentials) {
      return 'denied';
    }

    const decoded = Buffer.from(credentials, 'base64').toString();
    const colonIndex = decoded.indexOf(':');
    if (colonIndex === -1) {
      return 'denied';
    }

    const user = decoded.substring(0, colonIndex);
    const pass = decoded.substring(colonIndex + 1);

    // Oba porównania zawsze, żeby czas odpowiedzi nie zdradzał, czy login był poprawny.
    const userMatch = timingSafeEqual(user, expectedUser);
    const passMatch = timingSafeEqual(pass, expectedPass);

    return userMatch && passMatch ? 'ok' : 'denied';
  } catch {
    return 'denied';
  }
}

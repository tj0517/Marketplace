import { NextRequest, NextResponse } from 'next/server';

function timingSafeEqual(a: string, b: string): boolean {
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);

  if (bufA.length !== bufB.length) {
    return false;
  }

  try {
    let result = 0;
    for (let i = 0; i < bufA.length; i++) {
      result |= bufA[i] ^ bufB[i];
    }
    return result === 0;
  } catch (e) {
    return false;
  }
}

export function middleware(request: NextRequest) {
  if (request.nextUrl.pathname.startsWith('/admin')) {
    const authHeader = request.headers.get('authorization');

    if (!authHeader) {
      return new NextResponse('Authentication required', {
        status: 401,
        headers: { 'WWW-Authenticate': 'Basic realm="Admin Panel"' },
      });
    }

    try {
      const [scheme, credentials] = authHeader.split(' ');

      if (scheme !== 'Basic' || !credentials) {
        return new NextResponse('Invalid authentication scheme', {
          status: 401,
          headers: { 'WWW-Authenticate': 'Basic realm="Admin Panel"' }
        });
      }

      const decoded = Buffer.from(credentials, 'base64').toString();
      const colonIndex = decoded.indexOf(':');
      if (colonIndex === -1) {
        return new NextResponse('Invalid credentials format', {
          status: 401,
          headers: { 'WWW-Authenticate': 'Basic realm="Admin Panel"' }
        });
      }
      const user = decoded.substring(0, colonIndex);
      const pass = decoded.substring(colonIndex + 1);

      const expectedUser = process.env.ADMIN_USER;
      const expectedPass = process.env.ADMIN_PASS;

      if (!expectedUser || !expectedPass) {
        console.error('ADMIN_USER or ADMIN_PASS not configured');
        return new NextResponse('Server configuration error', { status: 500 });
      }

      const userMatch = timingSafeEqual(user, expectedUser);
      const passMatch = timingSafeEqual(pass, expectedPass);

      if (!userMatch || !passMatch) {
        return new NextResponse('Invalid credentials', {
          status: 401,
          headers: { 'WWW-Authenticate': 'Basic realm="Admin Panel"' },
        });
      }
    } catch {
      return new NextResponse('Invalid authentication format', {
        status: 401,
        headers: { 'WWW-Authenticate': 'Basic realm="Admin Panel"' }
      });
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: '/admin/:path*',
};

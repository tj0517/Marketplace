import { NextRequest, NextResponse } from 'next/server';
import { checkAdminAuth } from '@/lib/admin-auth';

export function middleware(request: NextRequest) {
  if (request.nextUrl.pathname.startsWith('/admin')) {
    const result = checkAdminAuth(request.headers.get('authorization'));

    if (result === 'misconfigured') {
      console.error('ADMIN_USER or ADMIN_PASS not configured');
      return new NextResponse('Server configuration error', { status: 500 });
    }

    if (result !== 'ok') {
      return new NextResponse('Authentication required', {
        status: 401,
        headers: { 'WWW-Authenticate': 'Basic realm="Admin Panel"' },
      });
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: '/admin/:path*',
};

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifyToken } from './lib/auth';

const PUBLIC_PATHS = ['/welcome', '/login', '/register', '/api/auth'];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isPublic = PUBLIC_PATHS.some((path) => pathname.startsWith(path)) || pathname.startsWith('/_next');

  const token = request.cookies.get('auth_token')?.value;
  const payload = token ? verifyToken(token) : null;

  if (!payload && !isPublic) {
    const url = new URL('/welcome', request.url);
    return NextResponse.redirect(url);
  }

  if (payload && (pathname === '/welcome' || pathname === '/login' || pathname === '/register')) {
    const url = new URL('/dashboard', request.url);
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)']
};

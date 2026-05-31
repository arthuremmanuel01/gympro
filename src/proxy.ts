import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const PUBLIC_PATHS = ['/', '/auth/login', '/auth/register'];

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (
    PUBLIC_PATHS.some((p) => pathname === p) ||
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.includes('.')
  ) {
    return NextResponse.next();
  }

  const authCookie = request.cookies.get('gympro-auth-role');

  if (!authCookie?.value) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  const role = authCookie.value as string;

  if (pathname.startsWith('/aluno') && role !== 'aluno') {
    return NextResponse.redirect(new URL(`/${role}/dashboard`, request.url));
  }
  if (pathname.startsWith('/professor') && role !== 'professor') {
    return NextResponse.redirect(new URL(`/${role}/dashboard`, request.url));
  }
  if (pathname.startsWith('/gerencia') && role !== 'gerencia') {
    return NextResponse.redirect(new URL(`/${role}/dashboard`, request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Ana domain
const MAIN_DOMAIN = process.env.NEXT_PUBLIC_DOMAIN || 'repodocs.dev';

export async function middleware(request: NextRequest) {
  const host = request.headers.get('host') || '';
  const pathname = request.nextUrl.pathname;
  
  // localhost için atla
  if (host.includes('localhost') || host.includes('127.0.0.1')) {
    return NextResponse.next();
  }
  
  // Ana domain - normal routing
  if (host === MAIN_DOMAIN || host === `www.${MAIN_DOMAIN}`) {
    return NextResponse.next();
  }
  
  // API, static dosyalar ve auth için atla
  if (
    pathname.startsWith('/api') ||
    pathname.startsWith('/_next') ||
    pathname.startsWith('/login') ||
    pathname.startsWith('/dashboard') ||
    pathname.includes('.')
  ) {
    return NextResponse.next();
  }
  
  // Subdomain kontrolü (proje.repodocs.dev)
  if (host.endsWith(`.${MAIN_DOMAIN}`)) {
    const subdomain = host.replace(`.${MAIN_DOMAIN}`, '');
    
    // www subdomain'i atla
    if (subdomain === 'www') {
      return NextResponse.next();
    }
    
    // Subdomain'i proje slug olarak kullan
    const version = 'main';
    const newPath = pathname === '/' 
      ? `/docs/${subdomain}/${version}`
      : `/docs/${subdomain}/${version}${pathname}`;
    
    return NextResponse.rewrite(new URL(newPath, request.url));
  }
  
  // Custom domain - header ile işaretle, page'de handle et
  // Edge Runtime'da DB sorgusu yapma, sadece header ekle
  const response = NextResponse.rewrite(new URL(`/custom-domain${pathname}`, request.url));
  response.headers.set('x-custom-domain', host);
  return response;
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\..*|api/auth).*)',
  ],
  // Disable Edge Runtime to avoid fetch issues
  runtime: 'nodejs',
};

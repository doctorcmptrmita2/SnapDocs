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
  
  // Custom domain kontrolü
  // Edge'de DB erişimi için internal API kullan
  try {
    const baseUrl = request.nextUrl.origin;
    const lookupRes = await fetch(`${baseUrl}/api/domain-lookup?domain=${encodeURIComponent(host)}`, {
      headers: {
        'x-internal-request': 'true',
      },
    });
    
    if (lookupRes.ok) {
      const data = await lookupRes.json();
      
      if (data.project) {
        const { slug, branch } = data.project;
        const newPath = pathname === '/' 
          ? `/docs/${slug}/${branch}`
          : `/docs/${slug}/${branch}${pathname}`;
        
        return NextResponse.rewrite(new URL(newPath, request.url));
      }
    }
  } catch (error) {
    console.error('Custom domain lookup error:', error);
  }
  
  // Domain bulunamadı - 404 veya ana sayfaya yönlendir
  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (public folder)
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\..*|api/auth).*)',
  ],
};

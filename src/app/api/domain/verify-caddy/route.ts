/**
 * Caddy Domain Verification Endpoint
 * 
 * GET /api/domain/verify-caddy?domain=example.com
 * 
 * Caddy calls this endpoint before issuing SSL certificate.
 * Returns 200 if domain is valid, 404 if not.
 * 
 * This prevents abuse - only domains registered in our database get SSL.
 */

import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

const MAIN_DOMAIN = process.env.NEXT_PUBLIC_DOMAIN || 'repodocs.dev';

export async function GET(request: NextRequest) {
  try {
    const domain = request.nextUrl.searchParams.get('domain');
    
    if (!domain) {
      return NextResponse.json({ error: 'Domain required' }, { status: 400 });
    }

    // Allow main domain and its subdomains
    if (domain === MAIN_DOMAIN || domain.endsWith(`.${MAIN_DOMAIN}`)) {
      return NextResponse.json({ valid: true });
    }

    // Check if custom domain exists in database
    const project = await db.project.findFirst({
      where: { customDomain: domain },
      select: { id: true, slug: true },
    });

    if (project) {
      console.log(`Caddy verify: Domain ${domain} is valid (project: ${project.slug})`);
      return NextResponse.json({ valid: true });
    }

    console.log(`Caddy verify: Domain ${domain} is NOT valid`);
    return NextResponse.json({ error: 'Domain not found' }, { status: 404 });
  } catch (error) {
    console.error('Caddy verify error:', error);
    return NextResponse.json({ error: 'Verification failed' }, { status: 500 });
  }
}

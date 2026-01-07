/**
 * Domain Verification API
 * 
 * POST /api/projects/[slug]/domain/verify
 * Checks if DNS is correctly configured
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import dns from 'dns/promises';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';

const MAIN_DOMAIN = process.env.NEXT_PUBLIC_DOMAIN || 'repodocs.dev';

async function verifyDNS(domain: string): Promise<{ verified: boolean; error?: string }> {
  try {
    // Try CNAME lookup first
    try {
      const cnameRecords = await dns.resolveCname(domain);
      if (cnameRecords.some(record => 
        record === MAIN_DOMAIN || 
        record.endsWith(`.${MAIN_DOMAIN}`)
      )) {
        return { verified: true };
      }
    } catch {
      // CNAME not found, try A record
    }

    // Try A record lookup (for apex domains)
    try {
      const aRecords = await dns.resolve4(domain);
      // Get our server's IP
      const ourIPs = await dns.resolve4(MAIN_DOMAIN);
      
      if (aRecords.some(ip => ourIPs.includes(ip))) {
        return { verified: true };
      }
    } catch {
      // A record not found
    }

    return { 
      verified: false, 
      error: `DNS not pointing to ${MAIN_DOMAIN}` 
    };
  } catch (error) {
    console.error('DNS verification error:', error);
    return { 
      verified: false, 
      error: 'DNS lookup failed. Domain may not exist or DNS not propagated yet.' 
    };
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { slug } = await params;

    // Find project
    const project = await db.project.findFirst({
      where: { 
        slug,
        userId: session.user.id,
      },
    });

    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    if (!project.customDomain) {
      return NextResponse.json({ error: 'No custom domain configured' }, { status: 400 });
    }

    // Verify DNS
    const result = await verifyDNS(project.customDomain);

    return NextResponse.json({
      verified: result.verified,
      domain: project.customDomain,
      error: result.error,
    });
  } catch (error) {
    console.error('Domain verification error:', error);
    return NextResponse.json({ error: 'Verification failed' }, { status: 500 });
  }
}

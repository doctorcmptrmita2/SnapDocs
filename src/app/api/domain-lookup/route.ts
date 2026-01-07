/**
 * Domain Lookup API (Internal)
 * 
 * GET /api/domain-lookup?domain=docs.example.com
 * Used by middleware to resolve custom domains to projects
 */

import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// Simple in-memory cache for domain lookups (5 minute TTL)
const domainCache = new Map<string, { project: { slug: string; branch: string } | null; expires: number }>();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

export async function GET(request: NextRequest) {
  // Only allow internal requests
  const isInternal = request.headers.get('x-internal-request') === 'true';
  if (!isInternal) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const { searchParams } = new URL(request.url);
  const domain = searchParams.get('domain');

  if (!domain) {
    return NextResponse.json({ error: 'Domain required' }, { status: 400 });
  }

  // Check cache first
  const cached = domainCache.get(domain);
  if (cached && cached.expires > Date.now()) {
    return NextResponse.json({ project: cached.project });
  }

  try {
    // Lookup project by custom domain
    const project = await db.project.findFirst({
      where: { customDomain: domain },
      select: { slug: true, branch: true },
    });

    // Cache result
    domainCache.set(domain, {
      project: project ? { slug: project.slug, branch: project.branch } : null,
      expires: Date.now() + CACHE_TTL,
    });

    return NextResponse.json({ project });
  } catch (error) {
    console.error('Domain lookup error:', error);
    return NextResponse.json({ error: 'Lookup failed' }, { status: 500 });
  }
}

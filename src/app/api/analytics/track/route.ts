/**
 * Analytics Tracking API
 * 
 * POST /api/analytics/track - Track a page view
 */

import { NextRequest, NextResponse } from 'next/server';
import { trackPageView } from '@/lib/analytics';
import { db } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const { projectSlug, path, version } = await request.json();

    if (!projectSlug || !path) {
      return NextResponse.json(
        { error: 'projectSlug and path are required' },
        { status: 400 }
      );
    }

    // Find project
    const project = await db.project.findUnique({
      where: { slug: projectSlug },
      select: { id: true },
    });

    if (!project) {
      return NextResponse.json(
        { error: 'Project not found' },
        { status: 404 }
      );
    }

    // Get request metadata
    const referrer = request.headers.get('referer') || undefined;
    const userAgent = request.headers.get('user-agent') || undefined;
    const country = request.headers.get('cf-ipcountry') || // Cloudflare
                    request.headers.get('x-vercel-ip-country') || // Vercel
                    undefined;

    // Track the view
    await trackPageView({
      projectId: project.id,
      path,
      version,
      referrer,
      userAgent,
      country,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Analytics track error:', error);
    return NextResponse.json(
      { error: 'Failed to track page view' },
      { status: 500 }
    );
  }
}

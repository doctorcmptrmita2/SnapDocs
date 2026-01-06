import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

interface RouteParams {
  params: Promise<{ domain: string }>;
}

// GET /api/domain/[domain] - Lookup project by custom domain
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { domain } = await params;
    
    const project = await db.project.findFirst({
      where: { customDomain: domain },
      select: {
        slug: true,
        branch: true,
        name: true,
      },
    });

    if (!project) {
      return NextResponse.json({ error: 'Domain not found' }, { status: 404 });
    }

    return NextResponse.json(project);
  } catch (error) {
    console.error('Domain lookup error:', error);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}

/**
 * Custom Domain API
 * 
 * POST /api/projects/[slug]/domain - Save custom domain
 * DELETE /api/projects/[slug]/domain - Remove custom domain
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';

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
    const { domain } = await request.json();

    if (!domain) {
      return NextResponse.json({ error: 'Domain is required' }, { status: 400 });
    }

    // Clean and validate domain
    const cleanDomain = domain.trim().toLowerCase()
      .replace(/^https?:\/\//, '')
      .replace(/\/$/, '');

    const domainRegex = /^([a-z0-9]+(-[a-z0-9]+)*\.)+[a-z]{2,}$/;
    if (!domainRegex.test(cleanDomain)) {
      return NextResponse.json({ error: 'Invalid domain format' }, { status: 400 });
    }

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

    // Check if domain is already in use
    const existingProject = await db.project.findFirst({
      where: {
        customDomain: cleanDomain,
        NOT: { id: project.id },
      },
    });

    if (existingProject) {
      return NextResponse.json({ error: 'Domain is already in use' }, { status: 409 });
    }

    // Update project
    await db.project.update({
      where: { id: project.id },
      data: { customDomain: cleanDomain },
    });

    return NextResponse.json({ 
      success: true, 
      domain: cleanDomain 
    });
  } catch (error) {
    console.error('Domain save error:', error);
    return NextResponse.json({ error: 'Failed to save domain' }, { status: 500 });
  }
}

export async function DELETE(
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

    // Remove custom domain
    await db.project.update({
      where: { id: project.id },
      data: { customDomain: null },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Domain remove error:', error);
    return NextResponse.json({ error: 'Failed to remove domain' }, { status: 500 });
  }
}

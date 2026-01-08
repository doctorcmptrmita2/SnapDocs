/**
 * Custom Domain API
 * 
 * POST /api/projects/[slug]/domain - Save custom domain
 * DELETE /api/projects/[slug]/domain - Remove custom domain
 * 
 * When Easypanel integration is enabled, domains are automatically
 * added/removed from Easypanel as well.
 * 
 * When Nginx automation is enabled, SSL certificates are automatically
 * created and Nginx is reloaded.
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';
import { easypanel, isEasypanelEnabled } from '@/lib/easypanel/client';
import { nginx, isNginxEnabled } from '@/lib/nginx/client';

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

    // Add domain to Easypanel if configured
    let easypanelResult: { success: boolean; error?: string } = { success: true };
    if (isEasypanelEnabled()) {
      easypanelResult = await easypanel.addDomain(cleanDomain);
      if (!easypanelResult.success) {
        console.warn('Failed to add domain to Easypanel:', easypanelResult.error);
        // Don't fail the request, just log the warning
        // Domain is saved in DB, user can manually add to Easypanel
      }
    }

    // Add domain to Nginx if configured
    let nginxResult: { success: boolean; error?: string; message?: string } = { success: true };
    if (isNginxEnabled()) {
      nginxResult = await nginx.addDomain(cleanDomain);
      if (!nginxResult.success) {
        console.warn('Failed to add domain to Nginx:', nginxResult.error);
        // Don't fail the request, just log the warning
        // Domain is saved in DB, user can manually configure Nginx
      }
    }

    return NextResponse.json({ 
      success: true, 
      domain: cleanDomain,
      easypanel: {
        enabled: isEasypanelEnabled(),
        success: easypanelResult.success,
        error: easypanelResult.error,
      },
      nginx: {
        enabled: isNginxEnabled(),
        success: nginxResult.success,
        error: nginxResult.error,
        message: nginxResult.message,
      }
    });
  } catch (error) {
    console.error('Domain save error:', error);
    return NextResponse.json({ error: 'Failed to save domain' }, { status: 500 });
  }
}

export async function DELETE(
  _request: NextRequest,
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

    // Get current domain before removing
    const currentDomain = project.customDomain;

    // Remove custom domain from DB
    await db.project.update({
      where: { id: project.id },
      data: { customDomain: null },
    });

    // Remove domain from Easypanel if configured
    let easypanelResult: { success: boolean; error?: string } = { success: true };
    if (isEasypanelEnabled() && currentDomain) {
      easypanelResult = await easypanel.removeDomain(currentDomain);
      if (!easypanelResult.success) {
        console.warn('Failed to remove domain from Easypanel:', easypanelResult.error);
      }
    }

    // Remove domain from Nginx if configured
    let nginxResult: { success: boolean; error?: string; message?: string } = { success: true };
    if (isNginxEnabled() && currentDomain) {
      nginxResult = await nginx.removeDomain(currentDomain);
      if (!nginxResult.success) {
        console.warn('Failed to remove domain from Nginx:', nginxResult.error);
      }
    }

    return NextResponse.json({ 
      success: true,
      easypanel: {
        enabled: isEasypanelEnabled(),
        success: easypanelResult.success,
        error: easypanelResult.error,
      },
      nginx: {
        enabled: isNginxEnabled(),
        success: nginxResult.success,
        error: nginxResult.error,
        message: nginxResult.message,
      }
    });
  } catch (error) {
    console.error('Domain remove error:', error);
    return NextResponse.json({ error: 'Failed to remove domain' }, { status: 500 });
  }
}

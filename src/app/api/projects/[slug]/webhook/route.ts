/**
 * Webhook Management API
 * 
 * POST /api/projects/[slug]/webhook - Setup webhook
 * DELETE /api/projects/[slug]/webhook - Remove webhook
 * GET /api/projects/[slug]/webhook - Get webhook status
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import crypto from 'crypto';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';
import { createGitHubClient } from '@/lib/github/client';

function generateWebhookSecret(): string {
  return crypto.randomBytes(32).toString('hex');
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user || !session.accessToken) {
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

    // Check if webhook already exists
    if (project.webhookId) {
      return NextResponse.json({ 
        error: 'Webhook already configured',
        webhookId: project.webhookId 
      }, { status: 409 });
    }

    // Generate webhook secret
    const webhookSecret = generateWebhookSecret();
    
    // Build webhook URL
    const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';
    const webhookUrl = `${baseUrl}/api/webhook/github`;

    // Create webhook on GitHub
    const github = createGitHubClient(session.accessToken, project.repoFullName);
    
    let webhookId: number;
    try {
      webhookId = await github.createWebhook(webhookUrl, webhookSecret);
    } catch (error: unknown) {
      const err = error as { status?: number; message?: string };
      if (err.status === 404) {
        return NextResponse.json({ 
          error: 'Repository not found or no admin access' 
        }, { status: 404 });
      }
      if (err.status === 422) {
        // Webhook might already exist
        return NextResponse.json({ 
          error: 'Webhook already exists on GitHub. Remove it first or use existing.' 
        }, { status: 422 });
      }
      throw error;
    }

    // Save webhook info to database
    await db.project.update({
      where: { id: project.id },
      data: { 
        webhookId,
        webhookSecret,
      },
    });

    return NextResponse.json({ 
      success: true, 
      webhookId,
      message: 'Webhook configured. Docs will auto-sync on push.' 
    });
  } catch (error) {
    console.error('Webhook setup error:', error);
    return NextResponse.json({ error: 'Failed to setup webhook' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user || !session.accessToken) {
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

    if (!project.webhookId) {
      return NextResponse.json({ error: 'No webhook configured' }, { status: 400 });
    }

    // Delete webhook from GitHub
    const github = createGitHubClient(session.accessToken, project.repoFullName);
    
    try {
      await github.deleteWebhook(project.webhookId);
    } catch (error: unknown) {
      const err = error as { status?: number };
      // Ignore 404 - webhook might already be deleted
      if (err.status !== 404) {
        throw error;
      }
    }

    // Remove webhook info from database
    await db.project.update({
      where: { id: project.id },
      data: { 
        webhookId: null,
        webhookSecret: null,
      },
    });

    return NextResponse.json({ 
      success: true, 
      message: 'Webhook removed' 
    });
  } catch (error) {
    console.error('Webhook delete error:', error);
    return NextResponse.json({ error: 'Failed to remove webhook' }, { status: 500 });
  }
}

export async function GET(
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
      select: {
        webhookId: true,
        updatedAt: true,
      },
    });

    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    return NextResponse.json({ 
      configured: !!project.webhookId,
      webhookId: project.webhookId,
      lastSync: project.updatedAt,
    });
  } catch (error) {
    console.error('Webhook status error:', error);
    return NextResponse.json({ error: 'Failed to get status' }, { status: 500 });
  }
}

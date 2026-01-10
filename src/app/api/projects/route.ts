/**
 * Projects API
 * 
 * POST /api/projects - Create new project
 * GET /api/projects - List user's projects
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { z } from 'zod';
import crypto from 'crypto';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';
import { createGitHubClient } from '@/lib/github/client';
import { parseMarkdown } from '@/lib/parser';
import { buildNavigation } from '@/lib/github/nav-builder';
import { cacheProject } from '@/lib/cache';
import type { ParsedDoc } from '@/types';

const createProjectSchema = z.object({
  repoUrl: z.string().url(),
  name: z.string().min(1).max(100),
  slug: z.string().min(1).max(50).regex(/^[a-z0-9-]+$/),
  branch: z.string().default('main'),
  docsPath: z.string().default('/docs'),
});

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user || !session.accessToken) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const data = createProjectSchema.parse(body);

    // Extract owner/repo from URL
    const match = data.repoUrl.match(/github\.com\/([^/]+)\/([^/]+)/);
    if (!match) {
      return NextResponse.json({ error: 'Invalid GitHub URL' }, { status: 400 });
    }
    const repoFullName = `${match[1]}/${match[2].replace(/\.git$/, '')}`;

    // Check if slug is taken
    const existing = await db.project.findUnique({
      where: { slug: data.slug },
    });
    if (existing) {
      return NextResponse.json({ error: 'Slug already taken' }, { status: 400 });
    }

    // Verify repo access
    const github = createGitHubClient(session.accessToken, repoFullName);
    const repo = await github.getRepo();

    // Generate webhook secret
    const webhookSecret = crypto.randomBytes(32).toString('hex');

    // Create project
    const project = await db.project.create({
      data: {
        name: data.name,
        slug: data.slug,
        repoFullName,
        branch: data.branch,
        docsPath: data.docsPath,
        isPrivate: repo.private,
        webhookSecret,
        userId: session.user.id,
      },
    });

    // Setup webhook (optional - can fail silently)
    try {
      const webhookUrl = `${process.env.NEXTAUTH_URL}/api/webhook/github`;
      const webhookId = await github.createWebhook(webhookUrl, webhookSecret);
      await db.project.update({
        where: { id: project.id },
        data: { webhookId },
      });
    } catch (e) {
      console.warn('Failed to create webhook:', e);
      // Continue without webhook - user can manually refresh
    }

    // Initial docs fetch and cache
    try {
      const files = await github.getAllMarkdownFiles(data.docsPath, data.branch);
      const docs: Record<string, ParsedDoc> = {};
      
      // Clean docsPath - remove leading/trailing slashes
      const cleanDocsPath = data.docsPath.replace(/^\/|\/$/g, '');
      
      for (const file of files) {
        // Remove docsPath prefix and .md extension to get clean slug
        let slug = file.path;
        
        // Remove docsPath prefix (handle both with and without leading slash)
        if (slug.startsWith(cleanDocsPath + '/')) {
          slug = slug.slice(cleanDocsPath.length + 1);
        } else if (slug.startsWith('/' + cleanDocsPath + '/')) {
          slug = slug.slice(cleanDocsPath.length + 2);
        } else if (slug.startsWith(cleanDocsPath)) {
          slug = slug.slice(cleanDocsPath.length);
        }
        
        // Remove leading slash and .md/.mdx extension
        slug = slug.replace(/^\//, '').replace(/\.mdx?$/, '');
        
        const parsed = await parseMarkdown(file.content, slug);
        docs[slug] = parsed;
      }

      const nav = buildNavigation(docs, data.docsPath);
      await cacheProject(project.slug, data.branch, nav, docs);
    } catch (e) {
      console.warn('Failed to fetch initial docs:', e);
      // Continue - docs will be fetched on first visit
    }

    return NextResponse.json({ slug: project.slug });
  } catch (error) {
    console.error('Create project error:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors[0].message }, { status: 400 });
    }
    
    return NextResponse.json({ error: 'Failed to create project' }, { status: 500 });
  }
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const projects = await db.project.findMany({
      where: { userId: session.user.id },
      orderBy: { updatedAt: 'desc' },
    });

    return NextResponse.json(projects);
  } catch (error) {
    console.error('List projects error:', error);
    return NextResponse.json({ error: 'Failed to list projects' }, { status: 500 });
  }
}

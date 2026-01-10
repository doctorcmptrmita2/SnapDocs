/**
 * GitHub Webhook Handler
 * 
 * Triggered on push events to refresh cached docs.
 * This is the core of our "Push-to-Update" architecture.
 * 
 * Flow:
 * 1. Verify webhook signature
 * 2. Find project by repo name
 * 3. Fetch updated files from GitHub
 * 4. Parse and cache new content
 */

import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { db } from '@/lib/db';
import { createGitHubClient } from '@/lib/github/client';
import { parseMarkdown } from '@/lib/parser';
import { buildNavigation } from '@/lib/github/nav-builder';
import { cacheProject, invalidateProjectCache } from '@/lib/cache';
import type { WebhookPayload, ParsedDoc } from '@/types';

export async function POST(request: NextRequest) {
  try {
    // 1. Get raw body for signature verification
    const rawBody = await request.text();
    const signature = request.headers.get('x-hub-signature-256');
    
    if (!signature) {
      return NextResponse.json({ error: 'Missing signature' }, { status: 401 });
    }

    // 2. Parse payload
    const payload: WebhookPayload = JSON.parse(rawBody);
    const repoFullName = payload.repository.full_name;
    
    // 3. Find project
    const project = await db.project.findFirst({
      where: { repoFullName },
      include: { user: { include: { accounts: true } } },
    });

    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    // 4. Verify signature
    if (project.webhookSecret) {
      const expectedSignature = `sha256=${crypto
        .createHmac('sha256', project.webhookSecret)
        .update(rawBody)
        .digest('hex')}`;
      
      if (!crypto.timingSafeEqual(
        Buffer.from(signature),
        Buffer.from(expectedSignature)
      )) {
        return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
      }
    }

    // 5. Get access token
    const githubAccount = project.user.accounts.find(a => a.provider === 'github');
    if (!githubAccount?.access_token) {
      console.error('Webhook error: No GitHub token found for user', project.userId);
      return NextResponse.json({ error: 'No GitHub token' }, { status: 401 });
    }

    // 6. Determine which version to update
    const ref = payload.ref; // refs/heads/main or refs/tags/v1.0.0
    const version = ref.replace('refs/heads/', '').replace('refs/tags/', '');
    
    // Only process if it's the main branch or a tag
    if (!ref.includes(project.branch) && !ref.startsWith('refs/tags/')) {
      return NextResponse.json({ message: 'Skipped non-default branch' });
    }

    // 7. Fetch and parse docs
    try {
      const github = createGitHubClient(githubAccount.access_token, repoFullName);
      const files = await github.getAllMarkdownFiles(project.docsPath, version);
    
      // 8. Parse all markdown files
      const docs: Record<string, ParsedDoc> = {};
      
      // Clean docsPath - remove leading/trailing slashes
      const cleanDocsPath = project.docsPath.replace(/^\/|\/$/g, '');
      
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

      // 9. Build navigation
      const nav = buildNavigation(docs, project.docsPath);

      // 10. Invalidate old cache and store new
      await invalidateProjectCache(project.slug, version);
      await cacheProject(project.slug, version, nav, docs);

      // 11. Update project timestamp
      await db.project.update({
        where: { id: project.id },
        data: { updatedAt: new Date() },
      });

      return NextResponse.json({
        success: true,
        message: `Updated ${Object.keys(docs).length} docs for ${project.slug}@${version}`,
      });
    } catch (githubError: unknown) {
      const err = githubError as { status?: number; message?: string };
      console.error('Webhook error:', {
        status: err.status,
        message: err.message,
        project: project.slug,
        repo: repoFullName,
      });
      
      // Return 200 to prevent GitHub from retrying
      // Log the error for debugging
      return NextResponse.json({
        error: 'GitHub API error',
        message: err.message || 'Failed to fetch docs',
        status: err.status,
      }, { status: 200 });
    }
  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    );
  }
}

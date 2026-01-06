/**
 * Manual Cache Refresh API
 * 
 * POST /api/projects/[slug]/refresh
 * Fetches docs from GitHub and updates cache
 * 
 * Query params:
 * - version: specific version to refresh (default: project.branch)
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';
import { createGitHubClient } from '@/lib/github/client';
import { parseMarkdown } from '@/lib/parser';
import { buildNavigation } from '@/lib/github/nav-builder';
import { cacheProject, invalidateProjectCache } from '@/lib/cache';
import type { ParsedDoc } from '@/types';

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
    const { searchParams } = new URL(request.url);
    const version = searchParams.get('version');

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

    // Use specified version or default branch
    const targetVersion = version || project.branch;

    // Fetch docs from GitHub
    const github = createGitHubClient(session.accessToken, project.repoFullName);
    
    let files;
    try {
      files = await github.getAllMarkdownFiles(project.docsPath, targetVersion);
    } catch (error) {
      console.error('GitHub fetch error:', error);
      return NextResponse.json({ 
        error: `Failed to fetch from GitHub. Make sure ${project.docsPath} exists in version "${targetVersion}".` 
      }, { status: 400 });
    }

    if (files.length === 0) {
      return NextResponse.json({ 
        error: `No markdown files found in ${project.docsPath} for version "${targetVersion}"` 
      }, { status: 400 });
    }

    // Parse all markdown files
    const docs: Record<string, ParsedDoc> = {};
    
    for (const file of files) {
      // Remove docsPath prefix and .md extension to get clean slug
      let fileSlug = file.path;
      
      // Remove leading slash from docsPath if present
      const cleanDocsPath = project.docsPath.replace(/^\//, '');
      
      // Remove docsPath prefix
      if (fileSlug.startsWith(cleanDocsPath + '/')) {
        fileSlug = fileSlug.slice(cleanDocsPath.length + 1);
      } else if (fileSlug.startsWith(cleanDocsPath)) {
        fileSlug = fileSlug.slice(cleanDocsPath.length);
      }
      
      // Remove leading slash and .md/.mdx extension
      fileSlug = fileSlug.replace(/^\//, '').replace(/\.mdx?$/, '');
      
      try {
        const parsed = await parseMarkdown(file.content, fileSlug);
        docs[fileSlug] = parsed;
      } catch (error) {
        console.error(`Failed to parse ${file.path}:`, error);
      }
    }

    // Build navigation
    const nav = buildNavigation(docs, project.docsPath);

    // Update cache
    await invalidateProjectCache(project.slug, targetVersion);
    await cacheProject(project.slug, targetVersion, nav, docs);

    // Update project timestamp
    await db.project.update({
      where: { id: project.id },
      data: { updatedAt: new Date() },
    });

    // Return JSON response for API calls, redirect for form submissions
    const acceptHeader = request.headers.get('accept');
    if (acceptHeader?.includes('application/json')) {
      return NextResponse.json({ 
        success: true, 
        version: targetVersion,
        docsCount: Object.keys(docs).length 
      });
    }

    // Redirect back to docs
    return NextResponse.redirect(
      new URL(`/docs/${project.slug}/${targetVersion}`, request.url)
    );
  } catch (error) {
    console.error('Refresh error:', error);
    return NextResponse.json({ error: 'Refresh failed' }, { status: 500 });
  }
}

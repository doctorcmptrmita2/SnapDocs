/**
 * Versions API
 * 
 * GET /api/projects/[slug]/versions - Get all versions (branches + tags)
 * POST /api/projects/[slug]/versions/sync - Sync versions from GitHub
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';
import { createGitHubClient } from '@/lib/github/client';
import { cacheVersions, getCachedVersions } from '@/lib/cache';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;

    // First check cache
    const cached = await getCachedVersions(slug);
    if (cached) {
      return NextResponse.json(cached);
    }

    // Get from database
    const project = await db.project.findUnique({
      where: { slug },
      include: { versions: true },
    });

    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    // If no versions in DB, return default branch
    if (project.versions.length === 0) {
      const defaultVersion = {
        branches: [project.branch],
        tags: [],
        default: project.branch,
      };
      return NextResponse.json(defaultVersion);
    }

    const versions = {
      branches: project.versions.filter(v => v.type === 'BRANCH').map(v => v.ref),
      tags: project.versions.filter(v => v.type === 'TAG').map(v => v.ref),
      default: project.versions.find(v => v.isDefault)?.ref || project.branch,
    };

    // Cache for quick access
    await cacheVersions(slug, versions);

    return NextResponse.json(versions);
  } catch (error) {
    console.error('Get versions error:', error);
    return NextResponse.json({ error: 'Failed to get versions' }, { status: 500 });
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Not logged in' }, { status: 401 });
    }
    
    if (!session.accessToken) {
      return NextResponse.json({ 
        error: 'GitHub access token not found. Please re-login to grant permissions.' 
      }, { status: 401 });
    }

    const { slug } = await params;

    const project = await db.project.findFirst({
      where: { 
        slug,
        userId: session.user.id,
      },
    });

    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    // Fetch from GitHub
    const github = createGitHubClient(session.accessToken, project.repoFullName);
    
    let branches: string[];
    let tags: string[];
    
    try {
      [branches, tags] = await Promise.all([
        github.getBranches(),
        github.getTags(),
      ]);
    } catch (githubError) {
      console.error('GitHub API error:', githubError);
      return NextResponse.json({ 
        error: `GitHub API error: ${githubError instanceof Error ? githubError.message : 'Unknown error'}` 
      }, { status: 400 });
    }

    // Update database - delete old versions and create new ones
    await db.version.deleteMany({
      where: { projectId: project.id },
    });

    const versionData = [
      ...branches.map(ref => ({
        name: ref,
        type: 'BRANCH' as const,
        ref,
        isDefault: ref === project.branch,
        projectId: project.id,
      })),
      ...tags.map(ref => ({
        name: ref,
        type: 'TAG' as const,
        ref,
        isDefault: false,
        projectId: project.id,
      })),
    ];

    if (versionData.length > 0) {
      await db.version.createMany({
        data: versionData,
      });
    }

    const versions = {
      branches,
      tags,
      default: project.branch,
    };

    // Update cache
    await cacheVersions(slug, versions);

    return NextResponse.json(versions);
  } catch (error) {
    console.error('Sync versions error:', error);
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : 'Failed to sync versions' 
    }, { status: 500 });
  }
}

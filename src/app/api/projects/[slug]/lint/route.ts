/**
 * Docs Linter API
 * 
 * GET /api/projects/[slug]/lint - Run linter on project docs
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';
import { getCachedNav } from '@/lib/cache';
import { lintDocs, LintResult } from '@/lib/linter';

export async function GET(
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
      select: { id: true, branch: true },
    });

    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    // Get navigation (contains all docs structure)
    const nav = await getCachedNav(slug, project.branch);

    if (!nav) {
      return NextResponse.json({ 
        error: 'No documentation found. Please sync your docs first.' 
      }, { status: 404 });
    }

    // For now, return a basic lint result
    // Full implementation would fetch all doc contents and run linter
    const result: LintResult = {
      issues: [],
      stats: {
        totalFiles: 0,
        errors: 0,
        warnings: 0,
        info: 0,
      },
      timestamp: new Date(),
    };

    // Count files from nav
    const countFiles = (items: typeof nav): number => {
      let count = 0;
      for (const item of items) {
        if (item.slug) count++;
        if (item.children) count += countFiles(item.children);
      }
      return count;
    };

    result.stats.totalFiles = countFiles(nav);

    return NextResponse.json(result);
  } catch (error) {
    console.error('Lint error:', error);
    return NextResponse.json(
      { error: 'Failed to run linter' },
      { status: 500 }
    );
  }
}

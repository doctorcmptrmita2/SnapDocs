import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';
import { invalidateProjectCache, invalidateVersionsCache } from '@/lib/cache';

interface RouteParams {
  params: Promise<{ slug: string }>;
}

// DELETE /api/projects/[slug] - Delete a project
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { slug } = await params;

    // Find project and verify ownership
    const project = await db.project.findFirst({
      where: {
        slug,
        userId: session.user.id,
      },
    });

    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    // Clear cache for this project (main branch at minimum)
    try {
      await invalidateProjectCache(slug, project.branch);
      await invalidateVersionsCache(slug);
    } catch (e) {
      console.warn('Failed to clear cache:', e);
    }

    // Delete project from database
    await db.project.delete({
      where: { id: project.id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete project error:', error);
    return NextResponse.json(
      { error: 'Failed to delete project' },
      { status: 500 }
    );
  }
}

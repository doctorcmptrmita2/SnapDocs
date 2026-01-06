/**
 * Search API
 * 
 * GET /api/search?q=query&project=slug&version=main
 * Searches through cached docs
 */

import { NextRequest, NextResponse } from 'next/server';
import { getCachedProject } from '@/lib/cache';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const query = searchParams.get('q')?.toLowerCase().trim();
  const project = searchParams.get('project');
  const version = searchParams.get('version') || 'main';

  if (!query || query.length < 2) {
    return NextResponse.json({ results: [] });
  }

  if (!project) {
    return NextResponse.json({ error: 'Project required' }, { status: 400 });
  }

  try {
    const cached = await getCachedProject(project, version);
    
    if (!cached) {
      return NextResponse.json({ results: [] });
    }

    const results: Array<{
      title: string;
      description?: string;
      slug: string;
      path: string;
      snippet: string;
    }> = [];

    // Search through all docs
    for (const [slug, doc] of Object.entries(cached.docs)) {
      const titleMatch = doc.title.toLowerCase().includes(query);
      const descMatch = doc.description?.toLowerCase().includes(query);
      
      // Strip HTML and search content
      const plainContent = doc.content
        .replace(/<[^>]*>/g, ' ')
        .replace(/\s+/g, ' ')
        .toLowerCase();
      const contentMatch = plainContent.includes(query);

      if (titleMatch || descMatch || contentMatch) {
        // Extract snippet around match
        let snippet = '';
        if (contentMatch) {
          const index = plainContent.indexOf(query);
          const start = Math.max(0, index - 50);
          const end = Math.min(plainContent.length, index + query.length + 100);
          snippet = (start > 0 ? '...' : '') + 
                   plainContent.slice(start, end).trim() + 
                   (end < plainContent.length ? '...' : '');
        } else if (doc.description) {
          snippet = doc.description.slice(0, 150);
        }

        results.push({
          title: doc.title,
          description: doc.description,
          slug,
          path: `/docs/${project}/${version}/${slug}`,
          snippet,
        });
      }
    }

    // Sort by relevance (title matches first)
    results.sort((a, b) => {
      const aTitle = a.title.toLowerCase().includes(query);
      const bTitle = b.title.toLowerCase().includes(query);
      if (aTitle && !bTitle) return -1;
      if (!aTitle && bTitle) return 1;
      return 0;
    });

    return NextResponse.json({ results: results.slice(0, 10) });
  } catch (error) {
    console.error('Search error:', error);
    return NextResponse.json({ error: 'Search failed' }, { status: 500 });
  }
}

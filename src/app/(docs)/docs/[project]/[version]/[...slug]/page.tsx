/**
 * Documentation Page
 * 
 * Renders a single doc page from cache.
 * Zero GitHub API calls - everything from Edge KV.
 * 
 * Route: /docs/[project]/[version]/[...slug]
 * Example: /docs/my-project/main/getting-started
 */

import { notFound } from 'next/navigation';
import { Sidebar } from '@/components/docs/Sidebar';
import { TableOfContents } from '@/components/docs/TableOfContents';
import { getCachedDoc, getCachedNav } from '@/lib/cache';

interface PageProps {
  params: Promise<{
    project: string;
    version: string;
    slug: string[];
  }>;
}

export default async function DocPage({ params }: PageProps) {
  const { project, version, slug } = await params;
  const docSlug = slug.join('/');

  // Fetch from Edge cache - no GitHub API call
  const [doc, nav] = await Promise.all([
    getCachedDoc(project, version, docSlug),
    getCachedNav(project, version),
  ]);

  if (!doc || !nav) {
    notFound();
  }

  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <Sidebar nav={nav} projectSlug={project} version={version} />

      {/* Main Content */}
      <main className="flex-1 min-w-0">
        <article className="max-w-3xl mx-auto px-8 py-12">
          <h1 className="text-4xl font-bold text-slate-900 mb-4">
            {doc.title}
          </h1>
          
          {doc.description && (
            <p className="text-xl text-slate-500 mb-8">
              {doc.description}
            </p>
          )}

          <div
            className="prose prose-slate max-w-none"
            dangerouslySetInnerHTML={{ __html: doc.content }}
          />
        </article>
      </main>

      {/* Table of Contents */}
      <TableOfContents headings={doc.headings} />
    </div>
  );
}

// Generate metadata for SEO
export async function generateMetadata({ params }: PageProps) {
  const { project, version, slug } = await params;
  const docSlug = slug.join('/');
  const doc = await getCachedDoc(project, version, docSlug);

  if (!doc) {
    return { title: 'Not Found' };
  }

  return {
    title: doc.title,
    description: doc.description,
    openGraph: {
      title: doc.title,
      description: doc.description,
      type: 'article',
    },
  };
}

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
import { ProseContent } from '@/components/docs/ProseContent';
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
    <div className="flex">
      {/* Sidebar */}
      <Sidebar nav={nav} projectSlug={project} version={version} />

      {/* Main Content */}
      <main className="flex-1 min-w-0 py-8 px-8 lg:px-12">
        <article className="max-w-3xl">
          <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100 mb-3">
            {doc.title}
          </h1>
          
          {doc.description && (
            <p className="text-lg text-slate-500 dark:text-slate-400 mb-6">
              {doc.description}
            </p>
          )}

          <ProseContent html={doc.content} />
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

/**
 * Documentation Page
 * 
 * Renders a single doc page from cache.
 * Zero GitHub API calls - everything from Edge KV.
 * 
 * Route: /docs/[project]/[version]/[...slug]
 * Example: /docs/my-project/main/getting-started
 */

import { notFound, redirect } from 'next/navigation';
import { Sidebar } from '@/components/docs/Sidebar';
import { TableOfContents } from '@/components/docs/TableOfContents';
import { ProseContent } from '@/components/docs/ProseContent';
import { Breadcrumb } from '@/components/docs/Breadcrumb';
import { PrevNextNav } from '@/components/docs/PrevNextNav';
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

  // Redirect /index to root (index.md is the homepage)
  if (docSlug === 'index') {
    redirect(`/docs/${project}/${version}`);
  }

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
      {/* Sidebar - hidden on mobile */}
      <div className="hidden lg:block">
        <Sidebar nav={nav} projectSlug={project} version={version} />
      </div>

      {/* Main Content */}
      <main className="flex-1 min-w-0 py-8 px-4 sm:px-8 lg:px-12">
        <article className="max-w-3xl">
          <Breadcrumb 
            projectSlug={project} 
            version={version} 
            docSlug={docSlug}
            docTitle={doc.title}
          />
          
          <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100 mb-3">
            {doc.title}
          </h1>
          
          {doc.description && (
            <p className="text-lg text-slate-500 dark:text-slate-400 mb-6">
              {doc.description}
            </p>
          )}

          <ProseContent html={doc.content} />
          
          <PrevNextNav 
            nav={nav} 
            currentSlug={docSlug}
            projectSlug={project}
            version={version}
          />
        </article>
      </main>

      {/* Table of Contents - hidden on mobile */}
      <div className="hidden xl:block">
        <TableOfContents headings={doc.headings} />
      </div>
    </div>
  );
}

// Generate metadata for SEO
export async function generateMetadata({ params }: PageProps) {
  const { project, version, slug } = await params;
  const docSlug = slug.join('/');
  const doc = await getCachedDoc(project, version, docSlug);
  const baseUrl = process.env.NEXTAUTH_URL || 'https://repodocs.dev';

  if (!doc) {
    return { title: 'Not Found' };
  }

  const title = doc.title;
  const description = doc.description || `Documentation page: ${doc.title}`;

  return {
    title,
    description,
    openGraph: {
      title: `${title} | RepoDocs`,
      description,
      type: 'article',
      url: `${baseUrl}/docs/${project}/${version}/${docSlug}`,
      siteName: 'RepoDocs',
    },
    twitter: {
      card: 'summary_large_image',
      title: `${title} | RepoDocs`,
      description,
    },
    alternates: {
      canonical: `${baseUrl}/docs/${project}/${version}/${docSlug}`,
    },
  };
}

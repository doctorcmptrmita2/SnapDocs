/**
 * Custom Domain Handler
 * 
 * Handles requests from custom domains (e.g., docs.agentwall.io)
 * Looks up the domain in DB and renders the appropriate docs
 */

import { headers } from 'next/headers';
import { notFound, redirect } from 'next/navigation';
import { db } from '@/lib/db';
import { getCachedNav, getCachedDoc } from '@/lib/cache';
import { findDefaultDoc } from '@/lib/github/nav-builder';
import { Sidebar } from '@/components/docs/Sidebar';
import { TableOfContents } from '@/components/docs/TableOfContents';
import { ProseContent } from '@/components/docs/ProseContent';
import { Breadcrumb } from '@/components/docs/Breadcrumb';
import { PrevNextNav } from '@/components/docs/PrevNextNav';

interface PageProps {
  params: Promise<{ slug?: string[] }>;
}

export default async function CustomDomainPage({ params }: PageProps) {
  const headersList = await headers();
  const customDomain = headersList.get('x-custom-domain');
  
  if (!customDomain) {
    notFound();
  }

  // Lookup project by custom domain
  const project = await db.project.findFirst({
    where: { customDomain },
    select: { slug: true, branch: true, name: true },
  });

  if (!project) {
    notFound();
  }

  const { slug: slugArray } = await params;
  const docSlug = slugArray?.join('/') || 'index';
  const version = project.branch;

  // Get nav and doc from cache
  const [nav, doc] = await Promise.all([
    getCachedNav(project.slug, version),
    getCachedDoc(project.slug, version, docSlug),
  ]);

  // If no nav, docs not synced yet
  if (!nav) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Documentation Not Ready</h1>
          <p className="text-slate-500">Please sync your docs from the dashboard.</p>
        </div>
      </div>
    );
  }

  // If requesting root and no index, redirect to first doc
  if (docSlug === 'index' && !doc) {
    const defaultDoc = findDefaultDoc(nav);
    if (defaultDoc) {
      redirect(`/${defaultDoc}`);
    }
  }

  if (!doc) {
    notFound();
  }

  return (
    <div className="flex">
      {/* Sidebar */}
      <div className="hidden lg:block">
        <Sidebar 
          nav={nav} 
          projectSlug={project.slug} 
          version={version}
          customDomain={customDomain}
        />
      </div>

      {/* Main Content */}
      <main className="flex-1 min-w-0 py-8 px-4 sm:px-8 lg:px-12">
        <article className="max-w-3xl">
          {docSlug !== 'index' && (
            <Breadcrumb 
              projectSlug={project.slug} 
              version={version} 
              docSlug={docSlug}
              docTitle={doc.title}
              customDomain={customDomain}
            />
          )}
          
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
            projectSlug={project.slug}
            version={version}
            customDomain={customDomain}
          />
        </article>
      </main>

      {/* Table of Contents */}
      <div className="hidden xl:block">
        <TableOfContents headings={doc.headings} />
      </div>
    </div>
  );
}

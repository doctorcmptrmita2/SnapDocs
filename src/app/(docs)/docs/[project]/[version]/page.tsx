/**
 * Documentation Index Page
 * 
 * Shows the default doc or a welcome page if no docs cached yet.
 * Route: /docs/[project]/[version]
 */

import { redirect, notFound } from 'next/navigation';
import Link from 'next/link';
import { FileText, RefreshCw } from 'lucide-react';
import { getCachedNav, getCachedProject } from '@/lib/cache';
import { findDefaultDoc } from '@/lib/github/nav-builder';
import { db } from '@/lib/db';

interface PageProps {
  params: Promise<{
    project: string;
    version: string;
  }>;
}

export default async function DocsIndexPage({ params }: PageProps) {
  const { project, version } = await params;

  // Check if project exists in DB
  const dbProject = await db.project.findUnique({
    where: { slug: project },
  });

  if (!dbProject) {
    notFound();
  }

  // Try to get cached navigation
  const nav = await getCachedNav(project, version);

  // If we have nav, redirect to first doc
  if (nav && nav.length > 0) {
    const defaultDoc = findDefaultDoc(nav);
    if (defaultDoc) {
      redirect(`/docs/${project}/${version}/${defaultDoc}`);
    }
  }

  // No cached docs yet - show setup page
  return (
    <div className="flex min-h-screen">
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="max-w-md text-center">
          <div className="w-16 h-16 bg-brand-50 rounded-full flex items-center justify-center mx-auto mb-6">
            <FileText className="w-8 h-8 text-brand-500" />
          </div>
          
          <h1 className="text-2xl font-bold mb-3">
            Documentation Not Ready Yet
          </h1>
          
          <p className="text-slate-500 mb-6">
            We haven't synced the docs from your repository yet. 
            This usually happens automatically when you push to GitHub.
          </p>

          <div className="space-y-3">
            <div className="bg-slate-50 rounded-lg p-4 text-left text-sm">
              <p className="font-medium mb-2">Repository:</p>
              <code className="text-brand-600">{dbProject.repoFullName}</code>
              <p className="font-medium mt-3 mb-2">Docs Path:</p>
              <code className="text-brand-600">{dbProject.docsPath}</code>
            </div>

            <p className="text-sm text-slate-500">
              Make sure you have markdown files in <code className="bg-slate-100 px-1 rounded">{dbProject.docsPath}</code> folder.
            </p>

            <Link
              href={`/dashboard/${project}/settings`}
              className="inline-flex items-center gap-2 bg-brand-500 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-brand-600 transition"
            >
              <RefreshCw className="w-4 h-4" />
              Go to Settings
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

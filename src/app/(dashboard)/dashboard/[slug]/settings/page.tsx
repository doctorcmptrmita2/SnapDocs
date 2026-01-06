import { getServerSession } from 'next-auth';
import { redirect, notFound } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, ExternalLink, Trash2, Github } from 'lucide-react';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';
import { Logo } from '@/components/ui/Logo';
import { UserMenu } from '@/components/dashboard/UserMenu';
import { RefreshButton } from '@/components/dashboard/RefreshButton';
import { SyncVersionsButton } from '@/components/dashboard/SyncVersionsButton';

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default async function ProjectSettingsPage({ params }: PageProps) {
  const session = await getServerSession(authOptions);
  
  if (!session?.user) {
    redirect('/login');
  }

  const { slug } = await params;

  const project = await db.project.findFirst({
    where: { 
      slug,
      userId: session.user.id 
    },
  });

  if (!project) {
    notFound();
  }

  const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';
  const docsUrl = project.customDomain 
    ? `https://${project.customDomain}` 
    : `${baseUrl}/docs/${project.slug}/${project.branch}`;

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="w-full px-6 lg:px-8 py-3 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <Logo size="sm" />
            <nav className="hidden sm:flex items-center gap-1 text-sm">
              <Link href="/dashboard" className="text-slate-500 hover:text-slate-700 transition">
                Projects
              </Link>
              <span className="text-slate-300">/</span>
              <span className="text-slate-900 font-medium">{project.name}</span>
            </nav>
          </div>
          <UserMenu user={session.user} />
        </div>
      </header>

      <main className="w-full px-6 lg:px-8 py-8">
        {/* Back Link - Mobile */}
        <Link
          href="/dashboard"
          className="sm:hidden text-slate-500 hover:text-slate-700 text-sm flex items-center gap-1 mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Projects
        </Link>

        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">{project.name}</h1>
            <p className="text-slate-500 text-sm mt-1">{project.repoFullName}</p>
          </div>
          <a
            href={docsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-brand-500 text-white px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-brand-600 transition flex items-center gap-2 shadow-sm w-fit"
          >
            View Docs <ExternalLink className="w-4 h-4" />
          </a>
        </div>

        {/* Settings Grid */}
        <div className="grid gap-6 lg:grid-cols-2">
          {/* General Settings */}
          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <h2 className="font-semibold text-lg mb-4">General Settings</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  Project Name
                </label>
                <input
                  type="text"
                  defaultValue={project.name}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-slate-50 text-slate-500"
                  disabled
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  Documentation URL
                </label>
                <div className="flex items-center">
                  <span className="px-3 py-2 bg-slate-100 border border-r-0 border-slate-200 rounded-l-lg text-sm text-slate-500">
                    {baseUrl}/docs/
                  </span>
                  <input
                    type="text"
                    defaultValue={project.slug}
                    className="flex-1 px-3 py-2 border border-slate-200 rounded-r-lg bg-slate-50 text-slate-500"
                    disabled
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Repository */}
          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <h2 className="font-semibold text-lg mb-4">Repository</h2>
            <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-slate-900 rounded-lg flex items-center justify-center">
                  <Github className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="font-medium text-slate-900">{project.repoFullName}</p>
                  <p className="text-sm text-slate-500">
                    Branch: {project.branch} · Path: {project.docsPath}
                  </p>
                </div>
              </div>
              <a
                href={`https://github.com/${project.repoFullName}`}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-200 rounded-lg transition"
              >
                <ExternalLink className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Cache & Sync */}
          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <h2 className="font-semibold text-lg mb-2">Cache & Sync</h2>
            <p className="text-slate-500 text-sm mb-4">
              Docs are automatically synced when you push to GitHub. 
              Use manual refresh if webhook isn't working.
            </p>
            <RefreshButton projectSlug={project.slug} />
          </div>

          {/* Versions */}
          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <h2 className="font-semibold text-lg mb-2">Versions</h2>
            <p className="text-slate-500 text-sm mb-4">
              Sync branches and tags from GitHub to enable version switching.
            </p>
            <SyncVersionsButton projectSlug={project.slug} />
          </div>

          {/* Danger Zone */}
          <div className="bg-white rounded-xl border border-red-200 p-6 lg:col-span-2">
            <h2 className="font-semibold text-lg text-red-600 mb-2">Danger Zone</h2>
            <p className="text-slate-500 text-sm mb-4">
              Deleting this project will remove all cached documentation. 
              This action cannot be undone.
            </p>
            <button
              className="bg-red-50 text-red-600 px-4 py-2 rounded-lg text-sm font-medium hover:bg-red-100 transition flex items-center gap-2"
            >
              <Trash2 className="w-4 h-4" />
              Delete Project
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}

import { getServerSession } from 'next-auth';
import { redirect, notFound } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, ExternalLink, Trash2, RefreshCw } from 'lucide-react';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';

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

  const docsUrl = project.customDomain 
    ? `https://${project.customDomain}` 
    : `http://localhost:3000/docs/${project.slug}/main`;

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <Link
            href="/dashboard"
            className="text-slate-500 hover:text-slate-700 text-sm flex items-center gap-1"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </Link>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold">{project.name}</h1>
            <p className="text-slate-500 mt-1">{project.repoFullName}</p>
          </div>
          <a
            href={docsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-brand-500 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-brand-600 transition flex items-center gap-2"
          >
            View Docs <ExternalLink className="w-4 h-4" />
          </a>
        </div>

        {/* Settings Cards */}
        <div className="space-y-6">
          {/* General Settings */}
          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <h2 className="font-semibold text-lg mb-4">General Settings</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Project Name
                </label>
                <input
                  type="text"
                  defaultValue={project.name}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                  disabled
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  URL Slug
                </label>
                <div className="flex items-center gap-2">
                  <span className="text-slate-500 text-sm">localhost:3000/docs/</span>
                  <input
                    type="text"
                    defaultValue={project.slug}
                    className="flex-1 px-3 py-2 border border-slate-300 rounded-lg bg-slate-50"
                    disabled
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Repository Settings */}
          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <h2 className="font-semibold text-lg mb-4">Repository</h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                <div>
                  <p className="font-medium">{project.repoFullName}</p>
                  <p className="text-sm text-slate-500">
                    Branch: {project.branch} · Path: {project.docsPath}
                  </p>
                </div>
                <a
                  href={`https://github.com/${project.repoFullName}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-slate-500 hover:text-slate-700"
                >
                  <ExternalLink className="w-4 h-4" />
                </a>
              </div>
            </div>
          </div>

          {/* Cache & Sync */}
          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <h2 className="font-semibold text-lg mb-4">Cache & Sync</h2>
            <p className="text-slate-500 text-sm mb-4">
              Docs are automatically synced when you push to GitHub. 
              Use manual refresh if webhook isn't working.
            </p>
            <form action={`/api/projects/${project.slug}/refresh`} method="POST">
              <button
                type="submit"
                className="bg-slate-100 text-slate-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-slate-200 transition flex items-center gap-2"
              >
                <RefreshCw className="w-4 h-4" />
                Refresh Cache
              </button>
            </form>
          </div>

          {/* Danger Zone */}
          <div className="bg-white rounded-xl border border-red-200 p-6">
            <h2 className="font-semibold text-lg text-red-600 mb-4">Danger Zone</h2>
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

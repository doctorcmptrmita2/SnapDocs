import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { Plus, ExternalLink, Settings } from 'lucide-react';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  
  if (!session?.user) {
    redirect('/login');
  }

  const projects = await db.project.findMany({
    where: { userId: session.user.id },
    orderBy: { updatedAt: 'desc' },
  });

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-xl font-bold">Dashboard</h1>
          <div className="flex items-center gap-4">
            <span className="text-sm text-slate-500">{session.user.email}</span>
            <img
              src={session.user.image || ''}
              alt=""
              className="w-8 h-8 rounded-full"
            />
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold">Your Projects</h2>
          <Link
            href="/dashboard/new"
            className="bg-brand-500 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-brand-600 transition flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            New Project
          </Link>
        </div>

        {projects.length === 0 ? (
          <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Plus className="w-8 h-8 text-slate-400" />
            </div>
            <h3 className="font-semibold text-lg mb-2">No projects yet</h3>
            <p className="text-slate-500 mb-6">
              Connect a GitHub repository to get started
            </p>
            <Link
              href="/dashboard/new"
              className="bg-brand-500 text-white px-6 py-2 rounded-lg text-sm font-medium hover:bg-brand-600 transition inline-flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Create your first project
            </Link>
          </div>
        ) : (
          <div className="grid gap-4">
            {projects.map((project) => (
              <div
                key={project.id}
                className="bg-white rounded-xl border border-slate-200 p-6 hover:shadow-md transition"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-semibold text-lg">{project.name}</h3>
                    <p className="text-slate-500 text-sm mt-1">
                      {project.repoFullName} · {project.branch}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <a
                      href={`https://${project.customDomain || `${project.slug}.snapdoc.dev`}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </a>
                    <Link
                      href={`/dashboard/${project.slug}/settings`}
                      className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition"
                    >
                      <Settings className="w-4 h-4" />
                    </Link>
                  </div>
                </div>
                <div className="flex items-center gap-4 mt-4 text-sm">
                  <span className="text-slate-500">
                    {project.customDomain || `${project.slug}.snapdoc.dev`}
                  </span>
                  {project.isPrivate && (
                    <span className="bg-amber-100 text-amber-700 px-2 py-0.5 rounded text-xs">
                      Private
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

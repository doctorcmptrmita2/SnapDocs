import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { Plus, ExternalLink, Settings, FileText, Clock, GitBranch } from 'lucide-react';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';
import { Logo } from '@/components/ui/Logo';
import { UserMenu } from '@/components/dashboard/UserMenu';

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  
  if (!session?.user) {
    redirect('/login');
  }

  const projects = await db.project.findMany({
    where: { userId: session.user.id },
    orderBy: { updatedAt: 'desc' },
  });

  const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="w-full px-6 lg:px-8 py-3 flex items-center justify-between">
          <Logo size="sm" />
          <UserMenu user={session.user} />
        </div>
      </header>

      {/* Content */}
      <main className="w-full px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Projects</h1>
            <p className="text-slate-500 text-sm mt-1">Manage your documentation sites</p>
          </div>
          <Link
            href="/dashboard/new"
            className="bg-brand-500 text-white px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-brand-600 transition flex items-center gap-2 shadow-sm w-fit"
          >
            <Plus className="w-4 h-4" />
            New Project
          </Link>
        </div>

        {projects.length === 0 ? (
          /* Empty State */
          <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center max-w-lg mx-auto">
            <div className="w-16 h-16 bg-brand-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <FileText className="w-8 h-8 text-brand-500" />
            </div>
            <h3 className="font-semibold text-lg mb-2">No projects yet</h3>
            <p className="text-slate-500 mb-6 max-w-sm mx-auto">
              Connect a GitHub repository to create your first documentation site
            </p>
            <Link
              href="/dashboard/new"
              className="bg-brand-500 text-white px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-brand-600 transition inline-flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Create your first project
            </Link>
          </div>
        ) : (
          /* Projects Grid */
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {projects.map((project) => (
              <ProjectCard key={project.id} project={project} baseUrl={baseUrl} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

function ProjectCard({ project, baseUrl }: { 
  project: {
    id: string;
    name: string;
    slug: string;
    repoFullName: string;
    branch: string;
    isPrivate: boolean;
    customDomain: string | null;
    updatedAt: Date;
  };
  baseUrl: string;
}) {
  const docsUrl = project.customDomain 
    ? `https://${project.customDomain}` 
    : `${baseUrl}/docs/${project.slug}/${project.branch}`;

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5 hover:shadow-md hover:border-slate-300 transition group">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-brand-400 to-brand-600 rounded-lg flex items-center justify-center text-white font-bold text-sm">
            {project.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <h3 className="font-semibold text-slate-900">{project.name}</h3>
            <p className="text-xs text-slate-500">{project.repoFullName}</p>
          </div>
        </div>
        {project.isPrivate && (
          <span className="bg-amber-50 text-amber-600 px-2 py-0.5 rounded text-xs font-medium">
            Private
          </span>
        )}
      </div>

      <div className="flex items-center gap-4 text-xs text-slate-500 mb-4">
        <div className="flex items-center gap-1">
          <GitBranch className="w-3.5 h-3.5" />
          {project.branch}
        </div>
        <div className="flex items-center gap-1">
          <Clock className="w-3.5 h-3.5" />
          {formatRelativeTime(project.updatedAt)}
        </div>
      </div>

      <div className="flex items-center gap-2 pt-3 border-t border-slate-100">
        <a
          href={docsUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex-1 bg-slate-50 text-slate-700 py-2 rounded-lg text-sm font-medium hover:bg-slate-100 transition flex items-center justify-center gap-1.5"
        >
          <ExternalLink className="w-3.5 h-3.5" />
          View Docs
        </a>
        <Link
          href={`/dashboard/${project.slug}/settings`}
          className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition"
        >
          <Settings className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
}

function formatRelativeTime(date: Date): string {
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 7) return `${days}d ago`;
  return date.toLocaleDateString();
}

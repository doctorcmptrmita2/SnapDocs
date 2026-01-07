import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import { authOptions } from '@/lib/auth';
import { Logo } from '@/components/ui/Logo';
import { UserMenu } from '@/components/dashboard/UserMenu';
import { NewProjectForm } from '@/components/dashboard/NewProjectForm';

export default async function NewProjectPage() {
  const session = await getServerSession(authOptions);
  
  if (!session?.user) {
    redirect('/login');
  }

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950">
      {/* Header */}
      <header className="border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center justify-between h-14 px-6">
          <div className="flex items-center gap-3">
            <Logo size="sm" href="/dashboard" />
            <ChevronRight className="w-4 h-4 text-slate-300 dark:text-slate-700" />
            <Link href="/dashboard" className="text-sm text-slate-500 hover:text-slate-900 dark:hover:text-white transition">
              Projects
            </Link>
            <ChevronRight className="w-4 h-4 text-slate-300 dark:text-slate-700" />
            <span className="text-sm font-medium text-slate-900 dark:text-white">New Project</span>
          </div>
          <UserMenu user={session.user} />
        </div>
      </header>

      {/* Content */}
      <main className="max-w-3xl mx-auto px-6 py-12">
        <div className="mb-10">
          <h1 className="text-2xl font-semibold text-slate-900 dark:text-white">Create New Project</h1>
          <p className="text-slate-500 mt-1">
            Connect a GitHub repository to generate documentation
          </p>
        </div>

        <div className="border border-slate-200 dark:border-slate-800 rounded-xl p-6">
          <NewProjectForm />
        </div>
      </main>
    </div>
  );
}

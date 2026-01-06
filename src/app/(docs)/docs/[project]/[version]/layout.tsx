import Link from 'next/link';
import { ExternalLink } from 'lucide-react';
import { Logo } from '@/components/ui/Logo';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import { SearchDialog } from '@/components/docs/SearchDialog';
import { MobileSidebar } from '@/components/docs/MobileSidebar';
import { getCachedNav } from '@/lib/cache';

interface LayoutProps {
  children: React.ReactNode;
  params: Promise<{
    project: string;
    version: string;
  }>;
}

export default async function DocsLayout({ children, params }: LayoutProps) {
  const { project, version } = await params;
  const nav = await getCachedNav(project, version) || [];

  return (
    <div className="min-h-screen bg-white dark:bg-slate-900">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/95 dark:bg-slate-900/95 backdrop-blur border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-2 sm:gap-4">
            {/* Mobile menu */}
            <MobileSidebar nav={nav} projectSlug={project} version={version} />
            
            <Logo size="sm" href="/" />
            
            <span className="text-slate-300 dark:text-slate-600 hidden sm:block">/</span>
            
            <span className="font-medium text-slate-700 dark:text-slate-300 hidden sm:block">{project}</span>
            
            {/* Version Selector */}
            <select
              defaultValue={version}
              className="text-sm bg-slate-100 dark:bg-slate-800 border-0 rounded-md px-2 py-1.5 text-slate-600 dark:text-slate-300 font-medium cursor-pointer hover:bg-slate-200 dark:hover:bg-slate-700 transition"
            >
              <option value={version}>{version}</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <SearchDialog projectSlug={project} version={version} />
            
            <ThemeToggle />
            
            <a
              href={`https://github.com`}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition hidden sm:block"
            >
              <ExternalLink className="w-4 h-4" />
            </a>
          </div>
        </div>
      </header>

      {/* Content */}
      {children}
    </div>
  );
}

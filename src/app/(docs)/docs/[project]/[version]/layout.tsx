import Link from 'next/link';
import { Zap, ExternalLink } from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
  params: Promise<{
    project: string;
    version: string;
  }>;
}

export default async function DocsLayout({ children, params }: LayoutProps) {
  const { project, version } = await params;

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white border-b border-slate-200">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-4">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-7 h-7 bg-brand-500 rounded-lg flex items-center justify-center">
                <Zap className="w-4 h-4 text-white" />
              </div>
              <span className="font-bold">SnapDoc</span>
            </Link>
            
            <span className="text-slate-300">/</span>
            
            <span className="font-medium text-slate-700">{project}</span>
            
            {/* Version Selector */}
            <select
              defaultValue={version}
              className="text-sm bg-slate-100 border-0 rounded-md px-2 py-1 text-slate-600"
            >
              <option value={version}>{version}</option>
            </select>
          </div>

          <div className="flex items-center gap-4">
            {/* Search placeholder */}
            <div className="hidden md:block">
              <input
                type="search"
                placeholder="Search docs..."
                className="w-64 px-3 py-1.5 text-sm bg-slate-100 border-0 rounded-lg focus:ring-2 focus:ring-brand-500"
              />
            </div>
            
            <a
              href={`https://github.com`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-slate-500 hover:text-slate-700"
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

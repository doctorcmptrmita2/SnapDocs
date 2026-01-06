'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ChevronRight, FileText, Folder } from 'lucide-react';
import { cn } from '@/lib/utils';
import { VersionSelector } from './VersionSelector';
import type { NavItem } from '@/types';

interface SidebarProps {
  nav: NavItem[];
  projectSlug: string;
  version: string;
}

export function Sidebar({ nav, projectSlug, version }: SidebarProps) {
  return (
    <aside className="w-56 flex-shrink-0 border-r border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900">
      <nav className="sticky top-[57px] h-[calc(100vh-57px)] overflow-y-auto p-4">
        {/* Version Selector */}
        <div className="mb-4 pb-4 border-b border-slate-200 dark:border-slate-700">
          <VersionSelector projectSlug={projectSlug} currentVersion={version} />
        </div>
        
        <NavList items={nav} projectSlug={projectSlug} version={version} depth={0} />
      </nav>
    </aside>
  );
}

function NavList({
  items,
  projectSlug,
  version,
  depth,
}: {
  items: NavItem[];
  projectSlug: string;
  version: string;
  depth: number;
}) {
  return (
    <ul className={cn('space-y-1', depth > 0 && 'ml-4 mt-1')}>
      {items.map((item) => (
        <NavItemComponent
          key={item.path}
          item={item}
          projectSlug={projectSlug}
          version={version}
          depth={depth}
        />
      ))}
    </ul>
  );
}

function NavItemComponent({
  item,
  projectSlug,
  version,
  depth,
}: {
  item: NavItem;
  projectSlug: string;
  version: string;
  depth: number;
}) {
  const pathname = usePathname();
  const href = `/docs/${projectSlug}/${version}/${item.path}`;
  const isActive = pathname === href || pathname.startsWith(href + '/');
  const hasChildren = item.children && item.children.length > 0;

  if (hasChildren) {
    return (
      <li>
        <div className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-slate-700 dark:text-slate-300">
          <Folder className="w-4 h-4 text-slate-400" />
          {item.title}
        </div>
        <NavList
          items={item.children!}
          projectSlug={projectSlug}
          version={version}
          depth={depth + 1}
        />
      </li>
    );
  }

  return (
    <li>
      <Link
        href={href}
        className={cn(
          'flex items-center gap-2 px-3 py-2 text-sm rounded-lg transition',
          isActive
            ? 'bg-brand-50 dark:bg-brand-900/30 text-brand-700 dark:text-brand-400 font-medium'
            : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-200'
        )}
      >
        <FileText className="w-4 h-4" />
        {item.title}
        {isActive && <ChevronRight className="w-4 h-4 ml-auto" />}
      </Link>
    </li>
  );
}

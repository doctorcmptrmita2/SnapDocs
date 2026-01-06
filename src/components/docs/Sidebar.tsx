'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ChevronRight, FileText, Folder } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { NavItem } from '@/types';

interface SidebarProps {
  nav: NavItem[];
  projectSlug: string;
  version: string;
}

export function Sidebar({ nav, projectSlug, version }: SidebarProps) {
  return (
    <nav className="w-64 border-r border-slate-200 bg-white h-screen overflow-y-auto sticky top-0">
      <div className="p-4">
        <NavList items={nav} projectSlug={projectSlug} version={version} depth={0} />
      </div>
    </nav>
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
        <div className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-slate-700">
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
            ? 'bg-brand-50 text-brand-700 font-medium'
            : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
        )}
      >
        <FileText className="w-4 h-4" />
        {item.title}
        {isActive && <ChevronRight className="w-4 h-4 ml-auto" />}
      </Link>
    </li>
  );
}

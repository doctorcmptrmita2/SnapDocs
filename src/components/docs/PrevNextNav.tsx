'use client';

import Link from 'next/link';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import type { NavItem } from '@/types';

interface PrevNextNavProps {
  nav: NavItem[];
  currentSlug: string;
  projectSlug: string;
  version: string;
}

export function PrevNextNav({ nav, currentSlug, projectSlug, version }: PrevNextNavProps) {
  // Flatten nav to get ordered list
  const flatNav = flattenNav(nav);
  const currentIndex = flatNav.findIndex(item => item.path === currentSlug);
  
  const prev = currentIndex > 0 ? flatNav[currentIndex - 1] : null;
  const next = currentIndex < flatNav.length - 1 ? flatNav[currentIndex + 1] : null;

  if (!prev && !next) return null;

  return (
    <nav className="flex items-center justify-between mt-12 pt-6 border-t border-slate-200 dark:border-slate-800">
      {prev ? (
        <Link
          href={`/docs/${projectSlug}/${version}/${prev.path}`}
          className="group flex items-center gap-2 text-slate-600 dark:text-slate-400 hover:text-brand-600 dark:hover:text-brand-400 transition"
        >
          <ChevronLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
          <div className="text-right">
            <div className="text-xs text-slate-400 dark:text-slate-500 mb-0.5">Previous</div>
            <div className="font-medium">{prev.title}</div>
          </div>
        </Link>
      ) : (
        <div />
      )}
      
      {next ? (
        <Link
          href={`/docs/${projectSlug}/${version}/${next.path}`}
          className="group flex items-center gap-2 text-slate-600 dark:text-slate-400 hover:text-brand-600 dark:hover:text-brand-400 transition text-right"
        >
          <div>
            <div className="text-xs text-slate-400 dark:text-slate-500 mb-0.5">Next</div>
            <div className="font-medium">{next.title}</div>
          </div>
          <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
        </Link>
      ) : (
        <div />
      )}
    </nav>
  );
}

function flattenNav(nav: NavItem[]): NavItem[] {
  const flat: NavItem[] = [];
  
  function traverse(items: NavItem[]) {
    for (const item of items) {
      // Only add items that have a path (not folders)
      if (!item.children || item.children.length === 0) {
        flat.push(item);
      }
      if (item.children) {
        traverse(item.children);
      }
    }
  }
  
  traverse(nav);
  return flat;
}

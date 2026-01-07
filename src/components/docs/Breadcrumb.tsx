'use client';

import Link from 'next/link';
import { ChevronRight, Home } from 'lucide-react';

interface BreadcrumbProps {
  projectSlug: string;
  version: string;
  docSlug: string;
  docTitle: string;
  customDomain?: string;
}

export function Breadcrumb({ projectSlug, version, docSlug, docTitle, customDomain }: BreadcrumbProps) {
  const parts = docSlug.split('/').filter(Boolean);
  const baseHref = customDomain ? '' : `/docs/${projectSlug}/${version}`;
  
  // Build breadcrumb items
  const items: Array<{ label: string; href?: string }> = [];
  
  if (!customDomain) {
    items.push({ label: projectSlug, href: baseHref });
  }

  // Add intermediate folders
  if (parts.length > 1) {
    for (let i = 0; i < parts.length - 1; i++) {
      const path = parts.slice(0, i + 1).join('/');
      items.push({
        label: formatLabel(parts[i]),
        href: `${baseHref}/${path}`,
      });
    }
  }

  // Add current page (no link)
  items.push({ label: docTitle });

  return (
    <nav className="flex items-center gap-1 text-sm text-slate-500 dark:text-slate-400 mb-4 flex-wrap">
      <Link 
        href={customDomain ? '/' : baseHref}
        className="hover:text-slate-700 dark:hover:text-slate-300 transition"
      >
        <Home className="w-4 h-4" />
      </Link>
      
      {items.map((item, index) => (
        <span key={index} className="flex items-center gap-1">
          <ChevronRight className="w-4 h-4 text-slate-300 dark:text-slate-600" />
          {item.href ? (
            <Link 
              href={item.href}
              className="hover:text-slate-700 dark:hover:text-slate-300 transition"
            >
              {item.label}
            </Link>
          ) : (
            <span className="text-slate-700 dark:text-slate-300 font-medium">
              {item.label}
            </span>
          )}
        </span>
      ))}
    </nav>
  );
}

function formatLabel(slug: string): string {
  return slug
    .replace(/[-_]/g, ' ')
    .replace(/\b\w/g, c => c.toUpperCase());
}

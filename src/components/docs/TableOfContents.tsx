'use client';

import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';
import type { DocHeading } from '@/types';

interface TableOfContentsProps {
  headings: DocHeading[];
}

export function TableOfContents({ headings }: TableOfContentsProps) {
  const [activeId, setActiveId] = useState<string>('');

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
          }
        });
      },
      { rootMargin: '-80px 0px -80% 0px' }
    );

    headings.forEach((heading) => {
      const element = document.getElementById(heading.id);
      if (element) observer.observe(element);
    });

    return () => observer.disconnect();
  }, [headings]);

  if (headings.length === 0) return null;

  return (
    <nav className="w-56 hidden xl:block flex-shrink-0">
      <div className="sticky top-[73px] p-4">
        <h4 className="text-sm font-semibold text-slate-900 dark:text-slate-100 mb-3">
          On this page
        </h4>
        <ul className="space-y-2 text-sm">
          {headings
            .filter((h) => h.level <= 3)
            .map((heading) => (
              <li
                key={heading.id}
                style={{ paddingLeft: `${(heading.level - 1) * 12}px` }}
              >
                <a
                  href={`#${heading.id}`}
                  className={cn(
                    'block py-1 transition',
                    activeId === heading.id
                      ? 'text-brand-600 dark:text-brand-400 font-medium'
                      : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                  )}
                >
                  {heading.text}
                </a>
              </li>
            ))}
        </ul>
      </div>
    </nav>
  );
}

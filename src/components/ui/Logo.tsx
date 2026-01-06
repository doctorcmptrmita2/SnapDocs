'use client';

import Link from 'next/link';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
  href?: string;
}

export function Logo({ size = 'md', showText = true, href = '/' }: LogoProps) {
  const sizes = {
    sm: { icon: 'w-7 h-7', text: 'text-lg', doc: 'w-3 h-4' },
    md: { icon: 'w-9 h-9', text: 'text-xl', doc: 'w-4 h-5' },
    lg: { icon: 'w-12 h-12', text: 'text-2xl', doc: 'w-5 h-6' },
  };

  const s = sizes[size];

  const LogoContent = (
    <div className="flex items-center gap-2">
      {/* Logo Icon - Document with code brackets */}
      <div className={`${s.icon} relative`}>
        <svg viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* Document shape */}
          <rect x="4" y="2" width="28" height="32" rx="4" className="fill-brand-500" />
          {/* Folded corner */}
          <path d="M24 2L32 10H28C25.7909 10 24 8.20914 24 6V2Z" className="fill-brand-400" />
          {/* Code brackets < /> */}
          <path 
            d="M14 15L10 19L14 23M22 15L26 19L22 23M19 13L17 25" 
            stroke="white" 
            strokeWidth="2" 
            strokeLinecap="round" 
            strokeLinejoin="round"
          />
        </svg>
      </div>
      
      {showText && (
        <span className={`font-bold ${s.text} text-slate-900 dark:text-white`}>
          Repo<span className="text-brand-500">Docs</span>
        </span>
      )}
    </div>
  );

  if (href) {
    return <Link href={href}>{LogoContent}</Link>;
  }

  return LogoContent;
}

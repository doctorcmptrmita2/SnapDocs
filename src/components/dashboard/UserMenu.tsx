'use client';

import { useState, useRef, useEffect } from 'react';
import { signOut } from 'next-auth/react';
import { LogOut, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';

interface UserMenuProps {
  user: {
    name?: string | null;
    email?: string | null;
    image?: string | null;
  };
}

export function UserMenu({ user }: UserMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg px-2 py-1.5 transition"
      >
        <img
          src={user.image || ''}
          alt={user.name || ''}
          className="w-7 h-7 rounded-full"
        />
        <span className="text-sm text-slate-700 dark:text-slate-300 hidden sm:block">{user.name}</span>
        <ChevronDown className={cn('w-4 h-4 text-slate-400 transition', isOpen && 'rotate-180')} />
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-1 w-48 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg shadow-lg z-50 overflow-hidden">
          <div className="p-3 border-b border-slate-100 dark:border-slate-800">
            <p className="text-sm font-medium text-slate-900 dark:text-white truncate">{user.name}</p>
            <p className="text-xs text-slate-500 truncate">{user.email}</p>
          </div>
          <div className="p-1">
            <button
              onClick={() => signOut({ callbackUrl: '/' })}
              className="w-full flex items-center gap-2 px-3 py-2 text-sm text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md transition"
            >
              <LogOut className="w-4 h-4" />
              Sign out
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { ChevronDown, GitBranch, Tag, Check, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface VersionSelectorProps {
  projectSlug: string;
  currentVersion: string;
}

interface VersionsData {
  branches: string[];
  tags: string[];
  default: string;
}

export function VersionSelector({ projectSlug, currentVersion }: VersionSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [versions, setVersions] = useState<VersionsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [switching, setSwitching] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    async function fetchVersions() {
      try {
        const res = await fetch(`/api/projects/${projectSlug}/versions`);
        if (res.ok) {
          const data = await res.json();
          setVersions(data);
        }
      } catch (error) {
        console.error('Failed to fetch versions:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchVersions();
  }, [projectSlug]);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleVersionChange = async (newVersion: string) => {
    if (newVersion === currentVersion) {
      setIsOpen(false);
      return;
    }

    setSwitching(newVersion);

    try {
      // Try to refresh docs for this version (will use cache if available)
      const res = await fetch(`/api/projects/${projectSlug}/refresh?version=${encodeURIComponent(newVersion)}`, {
        method: 'POST',
        headers: { 'Accept': 'application/json' },
      });

      if (!res.ok) {
        const data = await res.json();
        console.error('Failed to load version:', data.error);
        // Still navigate - might show "not ready" page
      }
    } catch (error) {
      console.error('Failed to load version:', error);
    }

    // Replace version in current path
    const newPath = pathname.replace(
      `/docs/${projectSlug}/${currentVersion}`,
      `/docs/${projectSlug}/${newVersion}`
    );
    
    router.push(newPath);
    router.refresh();
    setIsOpen(false);
    setSwitching(null);
  };

  if (loading) {
    return (
      <div className="h-9 w-28 bg-slate-100 dark:bg-slate-800 rounded-lg animate-pulse" />
    );
  }

  if (!versions) {
    return (
      <div className="px-3 py-2 text-sm text-slate-500 bg-slate-100 dark:bg-slate-800 rounded-lg">
        {currentVersion}
      </div>
    );
  }

  const isTag = versions.tags.includes(currentVersion);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        disabled={!!switching}
        className={cn(
          'flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-lg transition',
          'bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700',
          'text-slate-700 dark:text-slate-300',
          switching && 'opacity-50 cursor-not-allowed'
        )}
      >
        {switching ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : isTag ? (
          <Tag className="w-4 h-4 text-amber-500" />
        ) : (
          <GitBranch className="w-4 h-4 text-brand-500" />
        )}
        <span className="max-w-[100px] truncate">{switching || currentVersion}</span>
        <ChevronDown className={cn('w-4 h-4 transition-transform', isOpen && 'rotate-180')} />
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-1 w-56 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg shadow-lg z-50 overflow-hidden">
          {/* Branches */}
          {versions.branches.length > 0 && (
            <div>
              <div className="px-3 py-2 text-xs font-semibold text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-800/50">
                Branches
              </div>
              {versions.branches.map((branch) => (
                <VersionItem
                  key={branch}
                  version={branch}
                  isActive={branch === currentVersion}
                  isDefault={branch === versions.default}
                  isLoading={switching === branch}
                  icon={<GitBranch className="w-4 h-4 text-brand-500" />}
                  onClick={() => handleVersionChange(branch)}
                />
              ))}
            </div>
          )}

          {/* Tags */}
          {versions.tags.length > 0 && (
            <div>
              <div className="px-3 py-2 text-xs font-semibold text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-200 dark:border-slate-700">
                Tags
              </div>
              {versions.tags.map((tag) => (
                <VersionItem
                  key={tag}
                  version={tag}
                  isActive={tag === currentVersion}
                  isDefault={false}
                  isLoading={switching === tag}
                  icon={<Tag className="w-4 h-4 text-amber-500" />}
                  onClick={() => handleVersionChange(tag)}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function VersionItem({
  version,
  isActive,
  isDefault,
  isLoading,
  icon,
  onClick,
}: {
  version: string;
  isActive: boolean;
  isDefault: boolean;
  isLoading: boolean;
  icon: React.ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      disabled={isLoading}
      className={cn(
        'w-full flex items-center gap-2 px-3 py-2 text-sm transition',
        isActive
          ? 'bg-brand-50 dark:bg-brand-900/30 text-brand-700 dark:text-brand-400'
          : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800',
        isLoading && 'opacity-50'
      )}
    >
      {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : icon}
      <span className="flex-1 text-left truncate">{version}</span>
      {isDefault && (
        <span className="text-xs px-1.5 py-0.5 bg-slate-200 dark:bg-slate-700 rounded text-slate-500 dark:text-slate-400">
          default
        </span>
      )}
      {isActive && !isLoading && <Check className="w-4 h-4" />}
    </button>
  );
}

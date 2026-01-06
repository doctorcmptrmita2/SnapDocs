'use client';

import { useState } from 'react';
import { RefreshCw, Check, AlertCircle, GitBranch, Tag } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SyncVersionsButtonProps {
  projectSlug: string;
}

interface VersionsData {
  branches: string[];
  tags: string[];
  default: string;
}

export function SyncVersionsButton({ projectSlug }: SyncVersionsButtonProps) {
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [versions, setVersions] = useState<VersionsData | null>(null);
  const [error, setError] = useState('');

  const handleSync = async () => {
    setStatus('loading');
    setError('');

    try {
      const res = await fetch(`/api/projects/${projectSlug}/versions`, {
        method: 'POST',
      });

      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.error || 'Sync failed');
      }

      setVersions(data);
      setStatus('success');
    } catch (err) {
      setStatus('error');
      setError(err instanceof Error ? err.message : 'Sync failed');
    }
  };

  return (
    <div className="flex flex-col items-end gap-3">
      <div className="flex items-center gap-3">
        {status === 'error' && (
          <span className="text-sm text-red-600 flex items-center gap-1">
            <AlertCircle className="w-3.5 h-3.5" />
            {error}
          </span>
        )}
        <button
          onClick={handleSync}
          disabled={status === 'loading'}
          className={cn(
            'inline-flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-lg transition',
            'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300',
            'hover:bg-slate-200 dark:hover:bg-slate-700',
            'disabled:opacity-50 disabled:cursor-not-allowed'
          )}
        >
          <RefreshCw className={cn('w-3.5 h-3.5', status === 'loading' && 'animate-spin')} />
          {status === 'loading' ? 'Syncing...' : 'Sync'}
        </button>
      </div>

      {status === 'success' && versions && (
        <div className="text-right">
          <p className="text-sm text-green-600 flex items-center gap-1 justify-end mb-2">
            <Check className="w-3.5 h-3.5" />
            Synced
          </p>
          <div className="flex flex-wrap gap-1.5 justify-end">
            {versions.branches.map((b) => (
              <span key={b} className="inline-flex items-center gap-1 px-2 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs text-slate-600 dark:text-slate-400">
                <GitBranch className="w-3 h-3" />
                {b}
              </span>
            ))}
            {versions.tags.map((t) => (
              <span key={t} className="inline-flex items-center gap-1 px-2 py-0.5 bg-amber-100 dark:bg-amber-900/30 rounded text-xs text-amber-700 dark:text-amber-400">
                <Tag className="w-3 h-3" />
                {t}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

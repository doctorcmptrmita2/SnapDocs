'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { RefreshCw, Check, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface RefreshButtonProps {
  projectSlug: string;
}

export function RefreshButton({ projectSlug }: RefreshButtonProps) {
  const router = useRouter();
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [error, setError] = useState('');

  const handleRefresh = async () => {
    setStatus('loading');
    setError('');

    try {
      const res = await fetch(`/api/projects/${projectSlug}/refresh`, {
        method: 'POST',
        headers: { 'Accept': 'application/json' },
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Refresh failed');
      }

      setStatus('success');
      setTimeout(() => {
        setStatus('idle');
        router.refresh();
      }, 2000);
    } catch (err) {
      setStatus('error');
      setError(err instanceof Error ? err.message : 'Something went wrong');
      setTimeout(() => setStatus('idle'), 3000);
    }
  };

  return (
    <div className="flex items-center gap-3">
      {status === 'error' && (
        <span className="text-sm text-red-600 flex items-center gap-1">
          <AlertCircle className="w-3.5 h-3.5" />
          {error}
        </span>
      )}
      {status === 'success' && (
        <span className="text-sm text-green-600 flex items-center gap-1">
          <Check className="w-3.5 h-3.5" />
          Synced
        </span>
      )}
      <button
        onClick={handleRefresh}
        disabled={status === 'loading'}
        className={cn(
          'inline-flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-lg transition',
          'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300',
          'hover:bg-slate-200 dark:hover:bg-slate-700',
          'disabled:opacity-50 disabled:cursor-not-allowed'
        )}
      >
        <RefreshCw className={cn('w-3.5 h-3.5', status === 'loading' && 'animate-spin')} />
        {status === 'loading' ? 'Syncing...' : 'Refresh'}
      </button>
    </div>
  );
}

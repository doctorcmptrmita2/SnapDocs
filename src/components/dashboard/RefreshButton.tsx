'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { RefreshCw, Check, AlertCircle } from 'lucide-react';

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
      });

      if (res.redirected) {
        setStatus('success');
        setTimeout(() => {
          router.push(res.url);
        }, 1000);
        return;
      }

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Refresh failed');
      }

      setStatus('success');
      router.refresh();
    } catch (err) {
      setStatus('error');
      setError(err instanceof Error ? err.message : 'Something went wrong');
    }
  };

  return (
    <div>
      <button
        onClick={handleRefresh}
        disabled={status === 'loading'}
        className="bg-slate-100 text-slate-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-slate-200 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
      >
        {status === 'loading' ? (
          <>
            <RefreshCw className="w-4 h-4 animate-spin" />
            Refreshing...
          </>
        ) : status === 'success' ? (
          <>
            <Check className="w-4 h-4 text-green-600" />
            Done! Redirecting...
          </>
        ) : (
          <>
            <RefreshCw className="w-4 h-4" />
            Refresh Cache
          </>
        )}
      </button>
      
      {status === 'error' && (
        <div className="mt-3 flex items-start gap-2 text-red-600 text-sm">
          <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
}

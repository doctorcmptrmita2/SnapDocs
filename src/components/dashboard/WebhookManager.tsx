'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Webhook, Check, AlertCircle, Loader2, Trash2, Zap } from 'lucide-react';
import { cn } from '@/lib/utils';

interface WebhookManagerProps {
  projectSlug: string;
  webhookId: number | null;
  lastSync: Date | null;
}

type Status = 'idle' | 'loading' | 'success' | 'error';

export function WebhookManager({ projectSlug, webhookId, lastSync }: WebhookManagerProps) {
  const router = useRouter();
  const [status, setStatus] = useState<Status>('idle');
  const [error, setError] = useState('');
  const [isConfigured, setIsConfigured] = useState(!!webhookId);

  const handleSetup = async () => {
    setStatus('loading');
    setError('');

    try {
      const res = await fetch(`/api/projects/${projectSlug}/webhook`, {
        method: 'POST',
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to setup webhook');
      }

      setIsConfigured(true);
      setStatus('success');
      setTimeout(() => setStatus('idle'), 2000);
      router.refresh();
    } catch (err) {
      setStatus('error');
      setError(err instanceof Error ? err.message : 'Something went wrong');
    }
  };

  const handleRemove = async () => {
    if (!confirm('Remove auto-sync webhook? You can set it up again later.')) return;

    setStatus('loading');
    setError('');

    try {
      const res = await fetch(`/api/projects/${projectSlug}/webhook`, {
        method: 'DELETE',
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to remove webhook');
      }

      setIsConfigured(false);
      setStatus('success');
      setTimeout(() => setStatus('idle'), 2000);
      router.refresh();
    } catch (err) {
      setStatus('error');
      setError(err instanceof Error ? err.message : 'Something went wrong');
    }
  };

  const formatDate = (date: Date | null) => {
    if (!date) return 'Never';
    return new Date(date).toLocaleString();
  };

  return (
    <div className="space-y-4">
      {/* Status */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className={cn(
            'w-10 h-10 rounded-lg flex items-center justify-center',
            isConfigured 
              ? 'bg-green-100 dark:bg-green-900/30' 
              : 'bg-slate-100 dark:bg-slate-800'
          )}>
            {isConfigured ? (
              <Zap className="w-5 h-5 text-green-600 dark:text-green-400" />
            ) : (
              <Webhook className="w-5 h-5 text-slate-400" />
            )}
          </div>
          <div>
            <p className="font-medium text-slate-900 dark:text-white">
              {isConfigured ? 'Auto-sync enabled' : 'Auto-sync disabled'}
            </p>
            <p className="text-sm text-slate-500">
              {isConfigured 
                ? `Last sync: ${formatDate(lastSync)}` 
                : 'Push to GitHub to auto-update docs'}
            </p>
          </div>
        </div>

        {isConfigured ? (
          <button
            onClick={handleRemove}
            disabled={status === 'loading'}
            className={cn(
              'inline-flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-lg transition',
              'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400',
              'hover:bg-red-100 hover:text-red-600 dark:hover:bg-red-900/30 dark:hover:text-red-400',
              'disabled:opacity-50 disabled:cursor-not-allowed'
            )}
          >
            {status === 'loading' ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Trash2 className="w-4 h-4" />
            )}
            Remove
          </button>
        ) : (
          <button
            onClick={handleSetup}
            disabled={status === 'loading'}
            className={cn(
              'inline-flex items-center gap-1.5 px-4 py-2 text-sm rounded-lg transition',
              'bg-slate-900 dark:bg-white text-white dark:text-slate-900',
              'hover:bg-slate-800 dark:hover:bg-slate-100',
              'disabled:opacity-50 disabled:cursor-not-allowed'
            )}
          >
            {status === 'loading' ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Zap className="w-4 h-4" />
            )}
            Enable Auto-sync
          </button>
        )}
      </div>

      {/* Messages */}
      {error && (
        <p className="text-sm text-red-600 flex items-center gap-1.5">
          <AlertCircle className="w-4 h-4" />
          {error}
        </p>
      )}

      {status === 'success' && (
        <p className="text-sm text-green-600 flex items-center gap-1.5">
          <Check className="w-4 h-4" />
          {isConfigured ? 'Webhook configured!' : 'Webhook removed'}
        </p>
      )}

      {/* Info */}
      {!isConfigured && (
        <div className="p-3 bg-blue-50 dark:bg-blue-950/30 rounded-lg border border-blue-100 dark:border-blue-900/50">
          <p className="text-sm text-blue-800 dark:text-blue-200">
            <strong>How it works:</strong> When you push changes to your docs folder, 
            GitHub will notify us and we&apos;ll automatically update your documentation.
          </p>
        </div>
      )}

      {isConfigured && (
        <div className="p-3 bg-green-50 dark:bg-green-950/30 rounded-lg border border-green-100 dark:border-green-900/50">
          <p className="text-sm text-green-800 dark:text-green-200">
            <strong>Active:</strong> Your docs will automatically update when you push 
            changes to the <code className="px-1 py-0.5 bg-green-100 dark:bg-green-900/50 rounded">main</code> branch.
          </p>
        </div>
      )}
    </div>
  );
}

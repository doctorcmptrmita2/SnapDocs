'use client';

import { useState } from 'react';
import { RefreshCw, GitBranch, Tag, Check } from 'lucide-react';
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
  const [loading, setLoading] = useState(false);
  const [versions, setVersions] = useState<VersionsData | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSync = async () => {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`/api/projects/${projectSlug}/versions`, {
        method: 'POST',
      });

      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.error || `HTTP ${res.status}: Failed to sync versions`);
      }

      setVersions(data);
    } catch (err) {
      console.error('Sync error:', err);
      setError(err instanceof Error ? err.message : 'Failed to sync versions');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <button
        onClick={handleSync}
        disabled={loading}
        className={cn(
          'flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition',
          'bg-slate-100 text-slate-700 hover:bg-slate-200',
          loading && 'opacity-50 cursor-not-allowed'
        )}
      >
        <RefreshCw className={cn('w-4 h-4', loading && 'animate-spin')} />
        {loading ? 'Syncing...' : 'Sync Versions from GitHub'}
      </button>

      {error && (
        <div className="p-3 bg-red-50 text-red-600 text-sm rounded-lg">
          {error}
        </div>
      )}

      {versions && (
        <div className="p-4 bg-slate-50 rounded-lg space-y-3">
          <div className="flex items-center gap-2 text-sm text-green-600">
            <Check className="w-4 h-4" />
            Versions synced successfully
          </div>
          
          {versions.branches.length > 0 && (
            <div>
              <div className="flex items-center gap-2 text-xs font-medium text-slate-500 mb-2">
                <GitBranch className="w-3 h-3" />
                Branches ({versions.branches.length})
              </div>
              <div className="flex flex-wrap gap-2">
                {versions.branches.map((branch) => (
                  <span
                    key={branch}
                    className={cn(
                      'px-2 py-1 text-xs rounded-full',
                      branch === versions.default
                        ? 'bg-brand-100 text-brand-700'
                        : 'bg-slate-200 text-slate-600'
                    )}
                  >
                    {branch}
                    {branch === versions.default && ' (default)'}
                  </span>
                ))}
              </div>
            </div>
          )}

          {versions.tags.length > 0 && (
            <div>
              <div className="flex items-center gap-2 text-xs font-medium text-slate-500 mb-2">
                <Tag className="w-3 h-3" />
                Tags ({versions.tags.length})
              </div>
              <div className="flex flex-wrap gap-2">
                {versions.tags.map((tag) => (
                  <span
                    key={tag}
                    className="px-2 py-1 text-xs bg-amber-100 text-amber-700 rounded-full"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

'use client';

import { useState, useEffect } from 'react';
import { AlertTriangle, CheckCircle, Info, XCircle, RefreshCw } from 'lucide-react';

interface LintIssue {
  type: 'error' | 'warning' | 'info';
  code: string;
  message: string;
  file: string;
}

interface LintResult {
  issues: LintIssue[];
  stats: {
    totalFiles: number;
    errors: number;
    warnings: number;
    info: number;
  };
  timestamp: string;
}

interface LintCardProps {
  projectSlug: string;
}

export function LintCard({ projectSlug }: LintCardProps) {
  const [data, setData] = useState<LintResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchLint = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/projects/${projectSlug}/lint`);
      if (!res.ok) throw new Error('Failed to run linter');
      const json = await res.json();
      setData(json);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLint();
  }, [projectSlug]);

  const getIcon = (type: string) => {
    switch (type) {
      case 'error':
        return <XCircle className="w-4 h-4 text-red-500" />;
      case 'warning':
        return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
      default:
        return <Info className="w-4 h-4 text-blue-500" />;
    }
  };

  if (loading) {
    return (
      <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-6">
        <div className="animate-pulse">
          <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-1/4 mb-4"></div>
          <div className="h-8 bg-slate-200 dark:bg-slate-700 rounded w-1/2"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-6">
        <div className="flex items-center gap-2 text-slate-500">
          <AlertTriangle className="w-5 h-5" />
          <span>Docs Linter</span>
        </div>
        <p className="text-sm text-red-500 mt-2">{error}</p>
      </div>
    );
  }

  const hasIssues = data && (data.stats.errors > 0 || data.stats.warnings > 0);

  return (
    <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          {hasIssues ? (
            <AlertTriangle className="w-5 h-5 text-yellow-500" />
          ) : (
            <CheckCircle className="w-5 h-5 text-green-500" />
          )}
          <h3 className="font-semibold text-slate-900 dark:text-slate-100">Docs Linter</h3>
        </div>
        <button
          onClick={fetchLint}
          className="p-1 hover:bg-slate-100 dark:hover:bg-slate-700 rounded"
          title="Re-run linter"
        >
          <RefreshCw className="w-4 h-4 text-slate-400" />
        </button>
      </div>

      {/* Stats */}
      <div className="flex items-center gap-4 mb-4 text-sm">
        <span className="text-slate-500 dark:text-slate-400">
          {data?.stats.totalFiles || 0} files
        </span>
        {data?.stats.errors ? (
          <span className="text-red-500">{data.stats.errors} errors</span>
        ) : null}
        {data?.stats.warnings ? (
          <span className="text-yellow-500">{data.stats.warnings} warnings</span>
        ) : null}
      </div>

      {/* Status */}
      {!hasIssues ? (
        <div className="flex items-center gap-2 text-green-600 dark:text-green-400 text-sm">
          <CheckCircle className="w-4 h-4" />
          <span>No issues found</span>
        </div>
      ) : (
        <ul className="space-y-2 max-h-48 overflow-y-auto">
          {data?.issues.slice(0, 10).map((issue, i) => (
            <li key={i} className="flex items-start gap-2 text-sm">
              {getIcon(issue.type)}
              <div>
                <span className="text-slate-600 dark:text-slate-300">{issue.message}</span>
                <span className="text-slate-400 dark:text-slate-500 ml-2">
                  in {issue.file}
                </span>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Globe, Check, AlertCircle, Loader2, X, ExternalLink, Server } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CustomDomainFormProps {
  projectSlug: string;
  currentDomain: string | null;
  isVerified?: boolean;
}

type Status = 'idle' | 'saving' | 'verifying' | 'success' | 'error';
type VerifyStatus = 'pending' | 'verified' | 'failed';

interface EasypanelStatus {
  enabled: boolean;
  success: boolean;
  error?: string;
}

export function CustomDomainForm({ projectSlug, currentDomain, isVerified = false }: CustomDomainFormProps) {
  const router = useRouter();
  const [domain, setDomain] = useState(currentDomain || '');
  const [status, setStatus] = useState<Status>('idle');
  const [verifyStatus, setVerifyStatus] = useState<VerifyStatus>(isVerified ? 'verified' : 'pending');
  const [error, setError] = useState('');
  const [showInstructions, setShowInstructions] = useState(!!currentDomain);
  const [easypanelStatus, setEasypanelStatus] = useState<EasypanelStatus | null>(null);

  const mainDomain = process.env.NEXT_PUBLIC_DOMAIN || 'repodocs.dev';

  const handleSave = async () => {
    const cleanDomain = domain.trim().toLowerCase().replace(/^https?:\/\//, '').replace(/\/$/, '');
    
    if (!cleanDomain) {
      setError('Please enter a domain');
      return;
    }

    // Basic validation
    const domainRegex = /^([a-z0-9]+(-[a-z0-9]+)*\.)+[a-z]{2,}$/;
    if (!domainRegex.test(cleanDomain)) {
      setError('Invalid domain format');
      return;
    }

    setStatus('saving');
    setError('');

    try {
      const res = await fetch(`/api/projects/${projectSlug}/domain`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ domain: cleanDomain }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to save domain');
      }

      setDomain(cleanDomain);
      setStatus('success');
      setVerifyStatus('pending');
      setShowInstructions(true);
      
      // Set Easypanel status if available
      if (data.easypanel) {
        setEasypanelStatus(data.easypanel);
      }
      
      setTimeout(() => setStatus('idle'), 2000);
      router.refresh();
    } catch (err) {
      setStatus('error');
      setError(err instanceof Error ? err.message : 'Something went wrong');
    }
  };

  const handleVerify = async () => {
    if (!domain) return;

    setStatus('verifying');
    setError('');

    try {
      const res = await fetch(`/api/projects/${projectSlug}/domain/verify`, {
        method: 'POST',
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Verification failed');
      }

      if (data.verified) {
        setVerifyStatus('verified');
        setStatus('success');
        setTimeout(() => setStatus('idle'), 2000);
      } else {
        setVerifyStatus('failed');
        setStatus('error');
        setError('DNS not configured correctly. Please check your settings.');
      }
      router.refresh();
    } catch (err) {
      setStatus('error');
      setVerifyStatus('failed');
      setError(err instanceof Error ? err.message : 'Verification failed');
    }
  };

  const handleRemove = async () => {
    if (!confirm('Remove custom domain?')) return;

    setStatus('saving');
    setError('');

    try {
      const res = await fetch(`/api/projects/${projectSlug}/domain`, {
        method: 'DELETE',
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to remove domain');
      }

      setDomain('');
      setVerifyStatus('pending');
      setShowInstructions(false);
      setEasypanelStatus(null);
      setStatus('idle');
      router.refresh();
    } catch (err) {
      setStatus('error');
      setError(err instanceof Error ? err.message : 'Something went wrong');
    }
  };

  return (
    <div className="space-y-4">
      {/* Domain Input */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={domain}
            onChange={(e) => setDomain(e.target.value)}
            placeholder="docs.example.com"
            className={cn(
              'w-full pl-10 pr-4 py-2 text-sm rounded-lg border transition',
              'bg-white dark:bg-slate-900',
              'border-slate-200 dark:border-slate-700',
              'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent',
              'placeholder:text-slate-400'
            )}
          />
        </div>
        {currentDomain ? (
          <div className="flex gap-2">
            <button
              onClick={handleVerify}
              disabled={status === 'verifying' || status === 'saving'}
              className={cn(
                'px-3 py-2 text-sm rounded-lg transition',
                'bg-blue-600 text-white hover:bg-blue-700',
                'disabled:opacity-50 disabled:cursor-not-allowed'
              )}
            >
              {status === 'verifying' ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                'Verify'
              )}
            </button>
            <button
              onClick={handleRemove}
              disabled={status === 'saving'}
              className={cn(
                'px-3 py-2 text-sm rounded-lg transition',
                'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400',
                'hover:bg-slate-200 dark:hover:bg-slate-700',
                'disabled:opacity-50 disabled:cursor-not-allowed'
              )}
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <button
            onClick={handleSave}
            disabled={status === 'saving' || !domain.trim()}
            className={cn(
              'px-4 py-2 text-sm rounded-lg transition',
              'bg-slate-900 dark:bg-white text-white dark:text-slate-900',
              'hover:bg-slate-800 dark:hover:bg-slate-100',
              'disabled:opacity-50 disabled:cursor-not-allowed'
            )}
          >
            {status === 'saving' ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              'Save'
            )}
          </button>
        )}
      </div>

      {/* Status Messages */}
      {error && (
        <p className="text-sm text-red-600 flex items-center gap-1.5">
          <AlertCircle className="w-4 h-4" />
          {error}
        </p>
      )}

      {status === 'success' && (
        <p className="text-sm text-green-600 flex items-center gap-1.5">
          <Check className="w-4 h-4" />
          {verifyStatus === 'verified' ? 'Domain verified!' : 'Domain saved!'}
        </p>
      )}

      {/* Easypanel Status */}
      {easypanelStatus && easypanelStatus.enabled && (
        <div className={cn(
          'flex items-center gap-2 text-sm',
          easypanelStatus.success ? 'text-green-600' : 'text-amber-600'
        )}>
          <Server className="w-4 h-4" />
          {easypanelStatus.success ? (
            <span>Domain added to Easypanel</span>
          ) : (
            <span>
              Easypanel: {easypanelStatus.error || 'Manual setup required'}
            </span>
          )}
        </div>
      )}

      {/* Verification Status */}
      {currentDomain && (
        <div className={cn(
          'flex items-center gap-2 text-sm',
          verifyStatus === 'verified' ? 'text-green-600' : 'text-amber-600'
        )}>
          {verifyStatus === 'verified' ? (
            <>
              <Check className="w-4 h-4" />
              <span>DNS verified</span>
              <a
                href={`https://${currentDomain}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline flex items-center gap-1"
              >
                Visit <ExternalLink className="w-3 h-3" />
              </a>
            </>
          ) : (
            <>
              <AlertCircle className="w-4 h-4" />
              <span>DNS not verified</span>
              <button
                onClick={() => setShowInstructions(!showInstructions)}
                className="text-blue-600 hover:underline"
              >
                {showInstructions ? 'Hide' : 'Show'} instructions
              </button>
            </>
          )}
        </div>
      )}

      {/* DNS Instructions */}
      {showInstructions && currentDomain && (
        <div className="p-4 bg-slate-50 dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800">
          <p className="text-sm font-medium text-slate-900 dark:text-white mb-3">
            Configure your DNS
          </p>
          <div className="space-y-2 text-sm">
            <p className="text-slate-600 dark:text-slate-400">
              Add a CNAME record pointing to <code className="px-1.5 py-0.5 bg-slate-200 dark:bg-slate-800 rounded">{mainDomain}</code>
            </p>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="text-slate-500 text-xs uppercase">
                    <th className="pb-2 pr-4">Type</th>
                    <th className="pb-2 pr-4">Name</th>
                    <th className="pb-2">Value</th>
                  </tr>
                </thead>
                <tbody className="font-mono text-slate-900 dark:text-white">
                  <tr>
                    <td className="py-1 pr-4">CNAME</td>
                    <td className="py-1 pr-4">{currentDomain.split('.')[0]}</td>
                    <td className="py-1">{mainDomain}</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <p className="text-slate-500 text-xs mt-3">
              DNS changes can take up to 48 hours to propagate.
            </p>
          </div>
          
          {/* Easypanel Manual Setup Instructions */}
          {easypanelStatus && !easypanelStatus.success && (
            <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-700">
              <p className="text-sm font-medium text-slate-900 dark:text-white mb-2">
                <Server className="w-4 h-4 inline mr-1" />
                Easypanel Setup Required
              </p>
              <ol className="text-sm text-slate-600 dark:text-slate-400 space-y-1 list-decimal list-inside">
                <li>Go to Easypanel Dashboard</li>
                <li>Navigate to: repodocs → app → Domains</li>
                <li>Click "Add Domain"</li>
                <li>Enter: <code className="px-1.5 py-0.5 bg-slate-200 dark:bg-slate-800 rounded">{currentDomain}</code></li>
                <li>Enable HTTPS (Let's Encrypt)</li>
                <li>Click "Add"</li>
              </ol>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

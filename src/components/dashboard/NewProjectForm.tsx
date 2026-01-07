'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Github, Loader2 } from 'lucide-react';

export function NewProjectForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [formData, setFormData] = useState({
    repoUrl: '',
    name: '',
    slug: '',
    branch: 'main',
    docsPath: '/docs',
  });

  const handleRepoUrlChange = (url: string) => {
    setFormData(prev => ({ ...prev, repoUrl: url }));
    
    // Auto-fill name and slug from repo URL
    const match = url.match(/github\.com\/([^/]+)\/([^/]+)/);
    if (match) {
      const repoName = match[2].replace(/\.git$/, '');
      setFormData(prev => ({
        ...prev,
        repoUrl: url,
        name: repoName,
        slug: repoName.toLowerCase().replace(/[^a-z0-9]/g, '-'),
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to create project');
      }

      const { slug } = await res.json();
      router.push(`/dashboard/${slug}/settings`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Repository URL */}
      <div>
        <label className="block text-sm font-medium text-slate-900 dark:text-white mb-2">
          GitHub Repository URL
        </label>
        <div className="relative">
          <Github className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input
            type="url"
            value={formData.repoUrl}
            onChange={(e) => handleRepoUrlChange(e.target.value)}
            placeholder="https://github.com/owner/repo"
            className="w-full pl-10 pr-4 py-3 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            required
          />
        </div>
      </div>

      {/* Project Name */}
      <div>
        <label className="block text-sm font-medium text-slate-900 dark:text-white mb-2">
          Project Name
        </label>
        <input
          type="text"
          value={formData.name}
          onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
          placeholder="My Documentation"
          className="w-full px-4 py-3 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          required
        />
      </div>

      {/* Slug */}
      <div>
        <label className="block text-sm font-medium text-slate-900 dark:text-white mb-2">
          URL Slug
        </label>
        <div className="flex items-center gap-2">
          <span className="text-slate-500 text-sm">repodocs.dev/</span>
          <input
            type="text"
            value={formData.slug}
            onChange={(e) => setFormData(prev => ({ 
              ...prev, 
              slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '') 
            }))}
            placeholder="my-docs"
            className="flex-1 px-4 py-3 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            required
          />
        </div>
      </div>

      {/* Branch & Docs Path */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-slate-900 dark:text-white mb-2">
            Branch
          </label>
          <input
            type="text"
            value={formData.branch}
            onChange={(e) => setFormData(prev => ({ ...prev, branch: e.target.value }))}
            placeholder="main"
            className="w-full px-4 py-3 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-900 dark:text-white mb-2">
            Docs Path
          </label>
          <input
            type="text"
            value={formData.docsPath}
            onChange={(e) => setFormData(prev => ({ ...prev, docsPath: e.target.value }))}
            placeholder="/docs"
            className="w-full px-4 py-3 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="bg-red-50 dark:bg-red-950/30 text-red-700 dark:text-red-400 px-4 py-3 rounded-lg text-sm border border-red-200 dark:border-red-900/50">
          {error}
        </div>
      )}

      {/* Submit */}
      <button
        type="submit"
        disabled={loading}
        className="w-full bg-slate-900 dark:bg-white text-white dark:text-slate-900 py-3 rounded-lg font-medium hover:bg-slate-800 dark:hover:bg-slate-100 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        {loading ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            Creating...
          </>
        ) : (
          'Create Project'
        )}
      </button>
    </form>
  );
}

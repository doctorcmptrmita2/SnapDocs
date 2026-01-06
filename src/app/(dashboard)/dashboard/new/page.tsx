'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Github, Loader2 } from 'lucide-react';

export default function NewProjectPage() {
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
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white border-b border-slate-200">
        <div className="max-w-2xl mx-auto px-4 py-4">
          <Link
            href="/dashboard"
            className="text-slate-500 hover:text-slate-700 text-sm flex items-center gap-1"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </Link>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-2">Create New Project</h1>
        <p className="text-slate-500 mb-8">
          Connect a GitHub repository to generate documentation
        </p>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Repository URL */}
          <div>
            <label className="block text-sm font-medium mb-2">
              GitHub Repository URL
            </label>
            <div className="relative">
              <Github className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="url"
                value={formData.repoUrl}
                onChange={(e) => handleRepoUrlChange(e.target.value)}
                placeholder="https://github.com/owner/repo"
                className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
                required
              />
            </div>
          </div>

          {/* Project Name */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Project Name
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              placeholder="My Documentation"
              className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
              required
            />
          </div>

          {/* Slug */}
          <div>
            <label className="block text-sm font-medium mb-2">
              URL Slug
            </label>
            <div className="flex items-center">
              <span className="text-slate-500 text-sm mr-2">snapdoc.dev/</span>
              <input
                type="text"
                value={formData.slug}
                onChange={(e) => setFormData(prev => ({ 
                  ...prev, 
                  slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '') 
                }))}
                placeholder="my-docs"
                className="flex-1 px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
                required
              />
            </div>
          </div>

          {/* Branch & Docs Path */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                Branch
              </label>
              <input
                type="text"
                value={formData.branch}
                onChange={(e) => setFormData(prev => ({ ...prev, branch: e.target.value }))}
                placeholder="main"
                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">
                Docs Path
              </label>
              <input
                type="text"
                value={formData.docsPath}
                onChange={(e) => setFormData(prev => ({ ...prev, docsPath: e.target.value }))}
                placeholder="/docs"
                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
              />
            </div>
          </div>

          {/* Error */}
          {error && (
            <div className="bg-red-50 text-red-700 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-brand-500 text-white py-3 rounded-lg font-medium hover:bg-brand-600 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
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
      </main>
    </div>
  );
}

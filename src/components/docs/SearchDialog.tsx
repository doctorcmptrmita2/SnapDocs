'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Search, X, FileText, Loader2 } from 'lucide-react';

interface SearchResult {
  title: string;
  description?: string;
  slug: string;
  path: string;
  snippet: string;
}

interface SearchDialogProps {
  projectSlug: string;
  version: string;
}

export function SearchDialog({ projectSlug, version }: SearchDialogProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  // Keyboard shortcut to open
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setOpen(true);
      }
      if (e.key === 'Escape') {
        setOpen(false);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Focus input when opened
  useEffect(() => {
    if (open) {
      inputRef.current?.focus();
    } else {
      setQuery('');
      setResults([]);
      setSelectedIndex(0);
    }
  }, [open]);

  // Search with debounce
  useEffect(() => {
    if (query.length < 2) {
      setResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await fetch(
          `/api/search?q=${encodeURIComponent(query)}&project=${projectSlug}&version=${version}`
        );
        const data = await res.json();
        setResults(data.results || []);
        setSelectedIndex(0);
      } catch (error) {
        console.error('Search error:', error);
      } finally {
        setLoading(false);
      }
    }, 200);

    return () => clearTimeout(timer);
  }, [query, projectSlug, version]);

  // Keyboard navigation
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(i => Math.min(i + 1, results.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(i => Math.max(i - 1, 0));
    } else if (e.key === 'Enter' && results[selectedIndex]) {
      e.preventDefault();
      router.push(results[selectedIndex].path);
      setOpen(false);
    }
  }, [results, selectedIndex, router]);

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="hidden md:flex items-center gap-2 bg-slate-100 dark:bg-slate-800 rounded-lg px-3 py-1.5 text-sm text-slate-500 dark:text-slate-400 w-64 cursor-pointer hover:bg-slate-200 dark:hover:bg-slate-700 transition"
      >
        <Search className="w-4 h-4" />
        <span>Search docs...</span>
        <kbd className="ml-auto bg-white dark:bg-slate-700 px-1.5 py-0.5 rounded text-xs text-slate-400 border border-slate-200 dark:border-slate-600">⌘K</kbd>
      </button>
    );
  }

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/50 z-50"
        onClick={() => setOpen(false)}
      />
      
      {/* Dialog */}
      <div className="fixed top-[20%] left-1/2 -translate-x-1/2 w-full max-w-xl z-50 p-4">
        <div className="bg-white dark:bg-slate-900 rounded-xl shadow-2xl border border-slate-200 dark:border-slate-700 overflow-hidden">
          {/* Search Input */}
          <div className="flex items-center gap-3 px-4 py-3 border-b border-slate-200 dark:border-slate-700">
            <Search className="w-5 h-5 text-slate-400" />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Search documentation..."
              className="flex-1 bg-transparent outline-none text-slate-900 dark:text-slate-100 placeholder:text-slate-400"
            />
            {loading && <Loader2 className="w-4 h-4 text-slate-400 animate-spin" />}
            <button
              onClick={() => setOpen(false)}
              className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded"
            >
              <X className="w-4 h-4 text-slate-400" />
            </button>
          </div>

          {/* Results */}
          <div className="max-h-80 overflow-y-auto">
            {results.length === 0 && query.length >= 2 && !loading && (
              <div className="px-4 py-8 text-center text-slate-500">
                No results found for "{query}"
              </div>
            )}
            
            {results.length === 0 && query.length < 2 && (
              <div className="px-4 py-8 text-center text-slate-500">
                Type at least 2 characters to search
              </div>
            )}

            {results.map((result, index) => (
              <button
                key={result.slug}
                onClick={() => {
                  router.push(result.path);
                  setOpen(false);
                }}
                className={`w-full px-4 py-3 text-left flex items-start gap-3 transition ${
                  index === selectedIndex 
                    ? 'bg-brand-50 dark:bg-brand-900/30' 
                    : 'hover:bg-slate-50 dark:hover:bg-slate-800'
                }`}
              >
                <FileText className="w-5 h-5 text-slate-400 mt-0.5 flex-shrink-0" />
                <div className="min-w-0">
                  <div className="font-medium text-slate-900 dark:text-slate-100">
                    {result.title}
                  </div>
                  {result.snippet && (
                    <div className="text-sm text-slate-500 dark:text-slate-400 truncate mt-0.5">
                      {result.snippet}
                    </div>
                  )}
                </div>
              </button>
            ))}
          </div>

          {/* Footer */}
          <div className="px-4 py-2 border-t border-slate-200 dark:border-slate-700 flex items-center gap-4 text-xs text-slate-400">
            <span><kbd className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded">↑↓</kbd> Navigate</span>
            <span><kbd className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded">↵</kbd> Open</span>
            <span><kbd className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded">Esc</kbd> Close</span>
          </div>
        </div>
      </div>
    </>
  );
}

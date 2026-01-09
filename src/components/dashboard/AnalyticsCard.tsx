'use client';

import { useState, useEffect } from 'react';
import { BarChart3, TrendingUp, Eye, Users } from 'lucide-react';

interface AnalyticsData {
  totalViews: number;
  totalVisitors: number;
  topPages: { path: string; views: number }[];
  dailyStats: { date: string; views: number; visitors: number }[];
  trending: { path: string; views: number }[];
}

interface AnalyticsCardProps {
  projectSlug: string;
}

export function AnalyticsCard({ projectSlug }: AnalyticsCardProps) {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchAnalytics() {
      try {
        const res = await fetch(`/api/projects/${projectSlug}/analytics`);
        if (!res.ok) throw new Error('Failed to fetch analytics');
        const json = await res.json();
        setData(json);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    }

    fetchAnalytics();
  }, [projectSlug]);

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

  if (error || !data) {
    return (
      <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-6">
        <div className="flex items-center gap-2 text-slate-500">
          <BarChart3 className="w-5 h-5" />
          <span>Analytics</span>
        </div>
        <p className="text-sm text-slate-400 mt-2">No data available yet</p>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-6">
      <div className="flex items-center gap-2 mb-4">
        <BarChart3 className="w-5 h-5 text-blue-500" />
        <h3 className="font-semibold text-slate-900 dark:text-slate-100">Analytics</h3>
        <span className="text-xs text-slate-400 ml-auto">Last 30 days</span>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-slate-50 dark:bg-slate-700/50 rounded-lg p-3">
          <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 text-sm">
            <Eye className="w-4 h-4" />
            <span>Views</span>
          </div>
          <p className="text-2xl font-bold text-slate-900 dark:text-slate-100 mt-1">
            {data.totalViews.toLocaleString()}
          </p>
        </div>
        <div className="bg-slate-50 dark:bg-slate-700/50 rounded-lg p-3">
          <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 text-sm">
            <Users className="w-4 h-4" />
            <span>Visitors</span>
          </div>
          <p className="text-2xl font-bold text-slate-900 dark:text-slate-100 mt-1">
            {data.totalVisitors.toLocaleString()}
          </p>
        </div>
      </div>

      {/* Top Pages */}
      {data.topPages.length > 0 && (
        <div>
          <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400 mb-2">
            <TrendingUp className="w-4 h-4" />
            <span>Top Pages</span>
          </div>
          <ul className="space-y-2">
            {data.topPages.slice(0, 5).map((page, i) => (
              <li key={i} className="flex items-center justify-between text-sm">
                <span className="text-slate-600 dark:text-slate-300 truncate max-w-[200px]">
                  {page.path}
                </span>
                <span className="text-slate-400 dark:text-slate-500">
                  {page.views}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

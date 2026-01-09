/**
 * Analytics Module
 * 
 * Tracks page views and provides statistics for documentation projects
 */

import { db } from '@/lib/db';

interface TrackPageViewParams {
  projectId: string;
  path: string;
  version?: string;
  referrer?: string;
  userAgent?: string;
  country?: string;
}

interface PageStats {
  path: string;
  views: number;
}

interface DailyStatsData {
  date: string;
  views: number;
  visitors: number;
}

interface AnalyticsSummary {
  totalViews: number;
  totalVisitors: number;
  topPages: PageStats[];
  dailyStats: DailyStatsData[];
  lastUpdated: Date;
}

/**
 * Track a page view
 */
export async function trackPageView(params: TrackPageViewParams): Promise<void> {
  try {
    await db.pageView.create({
      data: {
        projectId: params.projectId,
        path: params.path,
        version: params.version,
        referrer: params.referrer,
        userAgent: params.userAgent,
        country: params.country,
      },
    });

    // Update daily stats
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    await db.dailyStats.upsert({
      where: {
        projectId_date: {
          projectId: params.projectId,
          date: today,
        },
      },
      update: {
        views: { increment: 1 },
      },
      create: {
        projectId: params.projectId,
        date: today,
        views: 1,
        visitors: 1,
      },
    });
  } catch (error) {
    console.error('Failed to track page view:', error);
  }
}

/**
 * Get analytics summary for a project
 */
export async function getAnalyticsSummary(
  projectId: string,
  days: number = 30
): Promise<AnalyticsSummary> {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);
  startDate.setHours(0, 0, 0, 0);

  // Get total views
  const totalViews = await db.pageView.count({
    where: {
      projectId,
      createdAt: { gte: startDate },
    },
  });

  // Get unique visitors (approximate by counting unique user agents per day)
  const dailyStatsRaw = await db.dailyStats.findMany({
    where: {
      projectId,
      date: { gte: startDate },
    },
    orderBy: { date: 'asc' },
  });

  const totalVisitors = dailyStatsRaw.reduce((sum, d) => sum + d.visitors, 0);

  // Get top pages
  const topPagesRaw = await db.pageView.groupBy({
    by: ['path'],
    where: {
      projectId,
      createdAt: { gte: startDate },
    },
    _count: { path: true },
    orderBy: { _count: { path: 'desc' } },
    take: 10,
  });

  const topPages: PageStats[] = topPagesRaw.map(p => ({
    path: p.path,
    views: p._count.path,
  }));

  // Format daily stats
  const dailyStats: DailyStatsData[] = dailyStatsRaw.map(d => ({
    date: d.date.toISOString().split('T')[0],
    views: d.views,
    visitors: d.visitors,
  }));

  return {
    totalViews,
    totalVisitors,
    topPages,
    dailyStats,
    lastUpdated: new Date(),
  };
}

/**
 * Get page view count for a specific path
 */
export async function getPageViews(
  projectId: string,
  path: string,
  days: number = 30
): Promise<number> {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  return db.pageView.count({
    where: {
      projectId,
      path,
      createdAt: { gte: startDate },
    },
  });
}

/**
 * Get trending pages (most growth in views)
 */
export async function getTrendingPages(
  projectId: string,
  limit: number = 5
): Promise<PageStats[]> {
  const now = new Date();
  const thisWeekStart = new Date(now);
  thisWeekStart.setDate(thisWeekStart.getDate() - 7);
  
  const lastWeekStart = new Date(thisWeekStart);
  lastWeekStart.setDate(lastWeekStart.getDate() - 7);

  // Get this week's views
  const thisWeek = await db.pageView.groupBy({
    by: ['path'],
    where: {
      projectId,
      createdAt: { gte: thisWeekStart },
    },
    _count: { path: true },
  });

  // Get last week's views
  const lastWeek = await db.pageView.groupBy({
    by: ['path'],
    where: {
      projectId,
      createdAt: { gte: lastWeekStart, lt: thisWeekStart },
    },
    _count: { path: true },
  });

  const lastWeekMap = new Map(lastWeek.map(p => [p.path, p._count.path]));

  // Calculate growth
  const trending = thisWeek
    .map(p => ({
      path: p.path,
      views: p._count.path,
      growth: p._count.path - (lastWeekMap.get(p.path) || 0),
    }))
    .sort((a, b) => b.growth - a.growth)
    .slice(0, limit);

  return trending.map(t => ({ path: t.path, views: t.views }));
}

/**
 * Clean up old analytics data (older than 90 days)
 */
export async function cleanupOldAnalytics(): Promise<number> {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - 90);

  const result = await db.pageView.deleteMany({
    where: {
      createdAt: { lt: cutoffDate },
    },
  });

  return result.count;
}

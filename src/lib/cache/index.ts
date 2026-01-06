/**
 * Redis Cache Layer (Self-Hosted)
 * 
 * Uses ioredis for standard Redis connection.
 * All doc content is cached here after webhook processing.
 * 
 * Cache Strategy:
 * - Write: On GitHub webhook (push event)
 * - Read: On every page visit (<10ms response)
 * - Invalidate: On webhook or manual refresh
 */

import Redis from 'ioredis';
import type { ParsedDoc, NavItem, CachedProject, VersionsCache } from '@/types';
import { getProjectCacheKey, getDocCacheKey, getNavCacheKey, getVersionsCacheKey } from '@/lib/utils';

// Singleton Redis client
let redis: Redis | null = null;

function getRedis(): Redis {
  if (!redis) {
    const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';
    
    // Parse Redis URL - handle both formats:
    // redis://password@host:port
    // redis://username:password@host:port
    let host = 'localhost';
    let port = 6379;
    let password: string | undefined;
    
    try {
      const url = new URL(redisUrl);
      host = url.hostname;
      port = parseInt(url.port) || 6379;
      // Password can be in url.password or if username is 'default', use password
      password = url.password || undefined;
    } catch {
      console.error('Failed to parse REDIS_URL, using defaults');
    }
    
    console.log(`Connecting to Redis at ${host}:${port} with password: ${password ? 'yes' : 'no'}`);
    
    redis = new Redis({
      host,
      port,
      password,
      maxRetriesPerRequest: 3,
      lazyConnect: true,
    });
    
    redis.on('error', (err) => {
      console.error('Redis connection error:', err.message);
    });
    
    redis.on('connect', () => {
      console.log('Redis connected successfully');
    });
  }
  return redis;
}

// Cache TTL: 7 days (webhook will refresh before this)
const CACHE_TTL = 60 * 60 * 24 * 7;

/**
 * Cache entire project data (nav + all docs)
 */
export async function cacheProject(
  projectSlug: string,
  version: string,
  nav: NavItem[],
  docs: Record<string, ParsedDoc>
): Promise<void> {
  const client = getRedis();
  const key = getProjectCacheKey(projectSlug, version);
  
  const cached: CachedProject = {
    projectId: projectSlug,
    version,
    nav,
    docs,
    updatedAt: new Date().toISOString(),
  };

  const pipeline = client.pipeline();
  
  // Cache full project
  pipeline.setex(key, CACHE_TTL, JSON.stringify(cached));
  
  // Cache nav separately for quick access
  pipeline.setex(getNavCacheKey(projectSlug, version), CACHE_TTL, JSON.stringify(nav));
  
  // Cache individual docs for granular access
  for (const [slug, doc] of Object.entries(docs)) {
    pipeline.setex(getDocCacheKey(projectSlug, version, slug), CACHE_TTL, JSON.stringify(doc));
  }

  await pipeline.exec();
}

/**
 * Get cached project data
 */
export async function getCachedProject(
  projectSlug: string,
  version: string
): Promise<CachedProject | null> {
  const client = getRedis();
  const key = getProjectCacheKey(projectSlug, version);
  const data = await client.get(key);
  return data ? JSON.parse(data) : null;
}

/**
 * Get cached navigation
 */
export async function getCachedNav(
  projectSlug: string,
  version: string
): Promise<NavItem[] | null> {
  const client = getRedis();
  const key = getNavCacheKey(projectSlug, version);
  const data = await client.get(key);
  return data ? JSON.parse(data) : null;
}

/**
 * Get single cached document
 */
export async function getCachedDoc(
  projectSlug: string,
  version: string,
  docSlug: string
): Promise<ParsedDoc | null> {
  const client = getRedis();
  const key = getDocCacheKey(projectSlug, version, docSlug);
  const data = await client.get(key);
  return data ? JSON.parse(data) : null;
}

/**
 * Invalidate all cache for a project version
 */
export async function invalidateProjectCache(
  projectSlug: string,
  version: string
): Promise<void> {
  const client = getRedis();
  
  // Get project to find all doc keys
  const project = await getCachedProject(projectSlug, version);
  
  const keysToDelete = [
    getProjectCacheKey(projectSlug, version),
    getNavCacheKey(projectSlug, version),
  ];
  
  if (project) {
    // Add all doc cache keys
    for (const slug of Object.keys(project.docs)) {
      keysToDelete.push(getDocCacheKey(projectSlug, version, slug));
    }
  }
  
  if (keysToDelete.length > 0) {
    await client.del(...keysToDelete);
  }
}

/**
 * Check if project is cached
 */
export async function isProjectCached(
  projectSlug: string,
  version: string
): Promise<boolean> {
  const client = getRedis();
  const key = getProjectCacheKey(projectSlug, version);
  return (await client.exists(key)) === 1;
}

/**
 * Get cache stats for dashboard
 */
export async function getCacheStats(projectSlug: string): Promise<{
  versions: string[];
  totalDocs: number;
  lastUpdated: string | null;
}> {
  const mainProject = await getCachedProject(projectSlug, 'main');
  
  return {
    versions: mainProject ? [mainProject.version] : [],
    totalDocs: mainProject ? Object.keys(mainProject.docs).length : 0,
    lastUpdated: mainProject?.updatedAt || null,
  };
}

/**
 * Health check for Redis connection
 */
export async function checkRedisHealth(): Promise<boolean> {
  try {
    const client = getRedis();
    const pong = await client.ping();
    return pong === 'PONG';
  } catch {
    return false;
  }
}


// Versions cache TTL: 1 hour (shorter since versions change less frequently but should be fresh)
const VERSIONS_CACHE_TTL = 60 * 60;

/**
 * Cache project versions (branches + tags)
 */
export async function cacheVersions(
  projectSlug: string,
  versions: VersionsCache
): Promise<void> {
  const client = getRedis();
  const key = getVersionsCacheKey(projectSlug);
  await client.setex(key, VERSIONS_CACHE_TTL, JSON.stringify(versions));
}

/**
 * Get cached versions
 */
export async function getCachedVersions(
  projectSlug: string
): Promise<VersionsCache | null> {
  const client = getRedis();
  const key = getVersionsCacheKey(projectSlug);
  const data = await client.get(key);
  return data ? JSON.parse(data) : null;
}

/**
 * Invalidate versions cache
 */
export async function invalidateVersionsCache(
  projectSlug: string
): Promise<void> {
  const client = getRedis();
  const key = getVersionsCacheKey(projectSlug);
  await client.del(key);
}

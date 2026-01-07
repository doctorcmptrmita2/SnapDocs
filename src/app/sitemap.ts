import { MetadataRoute } from 'next';
import { db } from '@/lib/db';
import { getCachedNav } from '@/lib/cache';

// Force dynamic rendering - don't generate at build time
export const dynamic = 'force-dynamic';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXTAUTH_URL || 'https://repodocs.dev';
  
  // Static pages
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 1,
    },
  ];

  // Get all public projects
  const projects = await db.project.findMany({
    where: { isPrivate: false },
    select: { 
      slug: true, 
      branch: true, 
      updatedAt: true,
      customDomain: true,
    },
  });

  // Generate sitemap entries for each project
  const projectPages: MetadataRoute.Sitemap = [];

  for (const project of projects) {
    const projectUrl = project.customDomain 
      ? `https://${project.customDomain}`
      : `${baseUrl}/docs/${project.slug}/${project.branch}`;

    // Project root
    projectPages.push({
      url: projectUrl,
      lastModified: project.updatedAt,
      changeFrequency: 'daily',
      priority: 0.8,
    });

    // Try to get navigation to list all doc pages
    try {
      const nav = await getCachedNav(project.slug, project.branch);
      
      if (nav) {
        const addNavItems = (items: typeof nav) => {
          for (const item of items) {
            if (item.slug) {
              const pagePath = item.slug === 'index' ? '' : `/${item.slug}`;
              const pageUrl = project.customDomain
                ? `https://${project.customDomain}${pagePath}`
                : `${baseUrl}/docs/${project.slug}/${project.branch}${pagePath}`;
              
              projectPages.push({
                url: pageUrl,
                lastModified: project.updatedAt,
                changeFrequency: 'weekly',
                priority: 0.6,
              });
            }
            if (item.children) {
              addNavItems(item.children);
            }
          }
        };
        addNavItems(nav);
      }
    } catch {
      // Skip if nav not cached
    }
  }

  return [...staticPages, ...projectPages];
}

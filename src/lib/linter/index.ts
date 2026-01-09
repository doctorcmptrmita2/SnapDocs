/**
 * Docs Linter
 * 
 * Analyzes documentation for common issues:
 * - Broken internal links
 * - Missing frontmatter
 * - Orphan pages (not linked from anywhere)
 * - Empty documents
 */

import { NavItem } from '@/types';

export interface LintIssue {
  type: 'error' | 'warning' | 'info';
  code: string;
  message: string;
  file: string;
  line?: number;
}

export interface LintResult {
  issues: LintIssue[];
  stats: {
    totalFiles: number;
    errors: number;
    warnings: number;
    info: number;
  };
  timestamp: Date;
}

interface DocContent {
  slug: string;
  content: string;
  title?: string;
  description?: string;
}

/**
 * Extract all internal links from markdown content
 */
function extractInternalLinks(content: string): string[] {
  const linkRegex = /\[([^\]]*)\]\(([^)]+)\)/g;
  const links: string[] = [];
  let match;

  while ((match = linkRegex.exec(content)) !== null) {
    const url = match[2];
    // Only internal links (not http/https/mailto)
    if (!url.startsWith('http') && !url.startsWith('mailto:') && !url.startsWith('#')) {
      // Remove anchor and query params
      const cleanUrl = url.split('#')[0].split('?')[0];
      if (cleanUrl) {
        links.push(cleanUrl);
      }
    }
  }

  return links;
}

/**
 * Get all document slugs from navigation
 */
function getAllSlugsFromNav(nav: NavItem[], prefix = ''): string[] {
  const slugs: string[] = [];

  for (const item of nav) {
    if (item.slug) {
      slugs.push(item.slug);
    }
    if (item.children) {
      slugs.push(...getAllSlugsFromNav(item.children, item.slug || prefix));
    }
  }

  return slugs;
}

/**
 * Check for broken internal links
 */
function checkBrokenLinks(docs: DocContent[], validSlugs: Set<string>): LintIssue[] {
  const issues: LintIssue[] = [];

  for (const doc of docs) {
    const links = extractInternalLinks(doc.content);

    for (const link of links) {
      // Normalize link path
      const normalizedLink = link
        .replace(/^\.\//, '')
        .replace(/^\//, '')
        .replace(/\.md$/, '')
        .replace(/\/index$/, '');

      // Check if link target exists
      if (!validSlugs.has(normalizedLink) && !validSlugs.has(`${doc.slug}/${normalizedLink}`)) {
        issues.push({
          type: 'error',
          code: 'BROKEN_LINK',
          message: `Broken link: "${link}" - target not found`,
          file: doc.slug,
        });
      }
    }
  }

  return issues;
}

/**
 * Check for missing frontmatter
 */
function checkMissingFrontmatter(docs: DocContent[]): LintIssue[] {
  const issues: LintIssue[] = [];

  for (const doc of docs) {
    if (!doc.title) {
      issues.push({
        type: 'warning',
        code: 'MISSING_TITLE',
        message: 'Document is missing a title',
        file: doc.slug,
      });
    }

    if (!doc.description) {
      issues.push({
        type: 'info',
        code: 'MISSING_DESCRIPTION',
        message: 'Document is missing a description (recommended for SEO)',
        file: doc.slug,
      });
    }
  }

  return issues;
}

/**
 * Check for empty documents
 */
function checkEmptyDocs(docs: DocContent[]): LintIssue[] {
  const issues: LintIssue[] = [];

  for (const doc of docs) {
    const contentWithoutFrontmatter = doc.content
      .replace(/^---[\s\S]*?---/, '')
      .trim();

    if (contentWithoutFrontmatter.length < 50) {
      issues.push({
        type: 'warning',
        code: 'EMPTY_DOC',
        message: 'Document appears to be empty or has very little content',
        file: doc.slug,
      });
    }
  }

  return issues;
}

/**
 * Check for orphan pages (not linked from anywhere)
 */
function checkOrphanPages(docs: DocContent[], nav: NavItem[]): LintIssue[] {
  const issues: LintIssue[] = [];
  const navSlugs = new Set(getAllSlugsFromNav(nav));

  // Collect all linked pages
  const linkedPages = new Set<string>();
  for (const doc of docs) {
    const links = extractInternalLinks(doc.content);
    for (const link of links) {
      const normalizedLink = link
        .replace(/^\.\//, '')
        .replace(/^\//, '')
        .replace(/\.md$/, '')
        .replace(/\/index$/, '');
      linkedPages.add(normalizedLink);
    }
  }

  // Check each doc
  for (const doc of docs) {
    // Skip index/readme files
    if (doc.slug === 'index' || doc.slug === 'README' || doc.slug.endsWith('/index')) {
      continue;
    }

    // Check if page is in nav or linked from somewhere
    if (!navSlugs.has(doc.slug) && !linkedPages.has(doc.slug)) {
      issues.push({
        type: 'warning',
        code: 'ORPHAN_PAGE',
        message: 'Page is not linked from navigation or other documents',
        file: doc.slug,
      });
    }
  }

  return issues;
}

/**
 * Run all linting checks on documentation
 */
export function lintDocs(docs: DocContent[], nav: NavItem[]): LintResult {
  const validSlugs = new Set(docs.map(d => d.slug));
  const allIssues: LintIssue[] = [];

  // Run all checks
  allIssues.push(...checkBrokenLinks(docs, validSlugs));
  allIssues.push(...checkMissingFrontmatter(docs));
  allIssues.push(...checkEmptyDocs(docs));
  allIssues.push(...checkOrphanPages(docs, nav));

  // Calculate stats
  const stats = {
    totalFiles: docs.length,
    errors: allIssues.filter(i => i.type === 'error').length,
    warnings: allIssues.filter(i => i.type === 'warning').length,
    info: allIssues.filter(i => i.type === 'info').length,
  };

  return {
    issues: allIssues,
    stats,
    timestamp: new Date(),
  };
}

/**
 * Get lint summary for display
 */
export function getLintSummary(result: LintResult): string {
  const { stats } = result;
  
  if (stats.errors === 0 && stats.warnings === 0) {
    return '✅ No issues found';
  }

  const parts: string[] = [];
  if (stats.errors > 0) parts.push(`${stats.errors} error${stats.errors > 1 ? 's' : ''}`);
  if (stats.warnings > 0) parts.push(`${stats.warnings} warning${stats.warnings > 1 ? 's' : ''}`);
  
  return `⚠️ ${parts.join(', ')}`;
}

/**
 * SnapDoc Parser - The Core Engine
 * 
 * Markdown → HTML pipeline with:
 * - gray-matter: Frontmatter extraction
 * - remark/rehype: Markdown processing
 * - shiki: Syntax highlighting (150+ languages)
 * - rehype-sanitize: XSS protection
 * 
 * Cost consideration: Shiki initialization is expensive (~50ms)
 * We cache the highlighter instance globally.
 */

import { unified } from 'unified';
import remarkParse from 'remark-parse';
import remarkGfm from 'remark-gfm';
import remarkRehype from 'remark-rehype';
import rehypeStringify from 'rehype-stringify';
import rehypeSanitize, { defaultSchema } from 'rehype-sanitize';
import rehypeSlug from 'rehype-slug';
import rehypeAutolinkHeadings from 'rehype-autolink-headings';
import matter from 'gray-matter';
import { createHighlighter, type Highlighter } from 'shiki';
import type { ParsedDoc, DocFrontmatter, DocHeading } from '@/types';

// Global highlighter cache - Shiki init is expensive
let highlighterPromise: Promise<Highlighter> | null = null;

async function getHighlighter(): Promise<Highlighter> {
  if (!highlighterPromise) {
    highlighterPromise = createHighlighter({
      themes: ['github-dark', 'github-light'],
      langs: [
        'javascript', 'typescript', 'jsx', 'tsx',
        'python', 'rust', 'go', 'java', 'c', 'cpp',
        'html', 'css', 'json', 'yaml', 'toml',
        'bash', 'shell', 'sql', 'graphql',
        'markdown', 'mdx', 'diff',
      ],
    });
  }
  return highlighterPromise;
}

// Custom sanitize schema - allow code highlighting classes
const sanitizeSchema = {
  ...defaultSchema,
  attributes: {
    ...defaultSchema.attributes,
    code: [...(defaultSchema.attributes?.code || []), 'className', 'style'],
    span: [...(defaultSchema.attributes?.span || []), 'className', 'style'],
    pre: [...(defaultSchema.attributes?.pre || []), 'className', 'style'],
  },
};

/**
 * Parse raw Markdown content into structured document
 * 
 * @param rawContent - Raw markdown string (from GitHub)
 * @param slug - Document slug for identification
 * @returns ParsedDoc with HTML content and metadata
 */
export async function parseMarkdown(
  rawContent: string,
  slug: string
): Promise<ParsedDoc> {
  // 1. Extract frontmatter
  const { data: frontmatter, content: markdownContent } = matter(rawContent);
  
  // 2. Process code blocks with Shiki
  const contentWithHighlighting = await highlightCodeBlocks(markdownContent);
  
  // 3. Build unified pipeline
  const processor = unified()
    .use(remarkParse)
    .use(remarkGfm) // Tables, strikethrough, etc.
    .use(remarkRehype, { allowDangerousHtml: true })
    .use(rehypeSanitize, sanitizeSchema) // XSS protection
    .use(rehypeSlug) // Add IDs to headings
    .use(rehypeAutolinkHeadings, { behavior: 'wrap' })
    .use(rehypeStringify, { allowDangerousHtml: true });

  const result = await processor.process(contentWithHighlighting);
  const html = String(result);

  // 4. Extract headings for TOC
  const headings = extractHeadings(markdownContent);

  // 5. Build title from frontmatter or first heading
  const title = (frontmatter as DocFrontmatter).title 
    || headings[0]?.text 
    || formatSlugAsTitle(slug);

  return {
    slug,
    title,
    description: (frontmatter as DocFrontmatter).description,
    content: html,
    frontmatter: frontmatter as DocFrontmatter,
    headings,
  };
}

/**
 * Highlight code blocks using Shiki
 * Replaces ```lang blocks with highlighted HTML
 */
async function highlightCodeBlocks(markdown: string): Promise<string> {
  const highlighter = await getHighlighter();
  
  // Match code blocks: ```lang\ncode\n```
  const codeBlockRegex = /```(\w+)?\n([\s\S]*?)```/g;
  
  let result = markdown;
  let match;
  
  while ((match = codeBlockRegex.exec(markdown)) !== null) {
    const [fullMatch, lang = 'text', code] = match;
    
    try {
      const highlighted = highlighter.codeToHtml(code.trim(), {
        lang: lang || 'text',
        theme: 'github-dark',
      });
      result = result.replace(fullMatch, highlighted);
    } catch {
      // Fallback for unsupported languages
      const escaped = escapeHtml(code.trim());
      result = result.replace(
        fullMatch,
        `<pre class="shiki"><code>${escaped}</code></pre>`
      );
    }
  }
  
  return result;
}

/**
 * Extract headings from markdown for Table of Contents
 */
function extractHeadings(markdown: string): DocHeading[] {
  const headingRegex = /^(#{1,6})\s+(.+)$/gm;
  const headings: DocHeading[] = [];
  let match;

  while ((match = headingRegex.exec(markdown)) !== null) {
    const level = match[1].length;
    const text = match[2].trim();
    const id = slugifyHeading(text);
    
    headings.push({ id, text, level });
  }

  return headings;
}

/**
 * Convert heading text to URL-safe slug
 */
function slugifyHeading(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
}

/**
 * Format slug as readable title
 */
function formatSlugAsTitle(slug: string): string {
  return slug
    .split(/[-_]/)
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

/**
 * Escape HTML entities
 */
function escapeHtml(text: string): string {
  const map: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;',
  };
  return text.replace(/[&<>"']/g, char => map[char]);
}

/**
 * Validate frontmatter for required fields
 * Returns list of issues for lint report
 */
export function validateFrontmatter(
  frontmatter: DocFrontmatter,
  filePath: string
): string[] {
  const issues: string[] = [];
  
  if (!frontmatter.title) {
    issues.push(`Missing 'title' in frontmatter: ${filePath}`);
  }
  
  if (!frontmatter.description) {
    issues.push(`Missing 'description' in frontmatter: ${filePath}`);
  }
  
  return issues;
}

/**
 * Extract all links from markdown for broken link detection
 */
export function extractLinks(markdown: string): string[] {
  const linkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;
  const links: string[] = [];
  let match;

  while ((match = linkRegex.exec(markdown)) !== null) {
    links.push(match[2]);
  }

  return links;
}

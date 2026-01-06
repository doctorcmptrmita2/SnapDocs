import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
}

export function getFileExtension(filename: string): string {
  return filename.slice(((filename.lastIndexOf('.') - 1) >>> 0) + 2);
}

export function isMarkdownFile(filename: string): boolean {
  const ext = getFileExtension(filename).toLowerCase();
  return ['md', 'mdx'].includes(ext);
}

export function removeExtension(filename: string): string {
  return filename.replace(/\.[^/.]+$/, '');
}

export function formatDate(date: string | Date): string {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(new Date(date));
}

// Cache key generators
export function getProjectCacheKey(projectSlug: string, version: string): string {
  return `project:${projectSlug}:${version}`;
}

export function getDocCacheKey(projectSlug: string, version: string, docSlug: string): string {
  return `doc:${projectSlug}:${version}:${docSlug}`;
}

export function getNavCacheKey(projectSlug: string, version: string): string {
  return `nav:${projectSlug}:${version}`;
}

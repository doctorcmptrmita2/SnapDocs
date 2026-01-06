/**
 * Navigation Builder
 * 
 * Converts flat file list to hierarchical navigation tree.
 * Respects frontmatter 'order' field for sorting.
 */

import type { NavItem, ParsedDoc } from '@/types';
import { removeExtension } from '@/lib/utils';

interface FileNode {
  name: string;
  path: string;
  isDir: boolean;
  children: FileNode[];
  doc?: ParsedDoc;
}

/**
 * Build navigation tree from parsed docs
 */
export function buildNavigation(
  docs: Record<string, ParsedDoc>,
  basePath: string
): NavItem[] {
  // Build file tree structure
  const root: FileNode = { name: '', path: '', isDir: true, children: [] };

  for (const [slug, doc] of Object.entries(docs)) {
    const relativePath = slug.replace(basePath.replace(/^\//, ''), '').replace(/^\//, '');
    const parts = relativePath.split('/').filter(Boolean);
    
    let current = root;
    
    for (let i = 0; i < parts.length; i++) {
      const part = parts[i];
      const isLast = i === parts.length - 1;
      
      let child = current.children.find(c => c.name === part);
      
      if (!child) {
        child = {
          name: part,
          path: parts.slice(0, i + 1).join('/'),
          isDir: !isLast,
          children: [],
        };
        current.children.push(child);
      }
      
      if (isLast) {
        child.doc = doc;
        child.isDir = false;
      }
      
      current = child;
    }
  }

  // Convert to NavItem format
  return convertToNavItems(root.children, docs);
}

function convertToNavItems(
  nodes: FileNode[],
  docs: Record<string, ParsedDoc>
): NavItem[] {
  return nodes
    .map(node => {
      const navItem: NavItem = {
        title: node.doc?.title || formatTitle(node.name),
        slug: removeExtension(node.name),
        path: node.path,
        order: node.doc?.frontmatter.order ?? 999,
        icon: node.doc?.frontmatter.icon as string | undefined,
      };

      if (node.isDir && node.children.length > 0) {
        navItem.children = convertToNavItems(node.children, docs);
      }

      return navItem;
    })
    .sort((a, b) => {
      // Sort by order first, then alphabetically
      if (a.order !== b.order) return a.order - b.order;
      return a.title.localeCompare(b.title);
    });
}

function formatTitle(filename: string): string {
  return removeExtension(filename)
    .replace(/[-_]/g, ' ')
    .replace(/\b\w/g, c => c.toUpperCase());
}

/**
 * Find default doc (index.md or first doc)
 */
export function findDefaultDoc(nav: NavItem[]): string | null {
  // Look for index first
  for (const item of nav) {
    if (item.slug === 'index' || item.slug === 'readme') {
      return item.path;
    }
    if (item.children) {
      const found = findDefaultDoc(item.children);
      if (found) return found;
    }
  }
  
  // Return first doc
  if (nav.length > 0) {
    return nav[0].children?.[0]?.path || nav[0].path;
  }
  
  return null;
}

/**
 * Flatten nav for search
 */
export function flattenNav(nav: NavItem[]): NavItem[] {
  const flat: NavItem[] = [];
  
  function traverse(items: NavItem[]) {
    for (const item of items) {
      flat.push(item);
      if (item.children) {
        traverse(item.children);
      }
    }
  }
  
  traverse(nav);
  return flat;
}

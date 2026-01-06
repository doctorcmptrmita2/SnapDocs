// Parsed Markdown Document
export interface ParsedDoc {
  slug: string;
  title: string;
  description?: string;
  content: string; // HTML
  frontmatter: DocFrontmatter;
  headings: DocHeading[];
  lastModified?: string;
}

export interface DocFrontmatter {
  title?: string;
  description?: string;
  order?: number;
  icon?: string;
  [key: string]: unknown;
}

export interface DocHeading {
  id: string;
  text: string;
  level: number;
}

// Navigation Tree
export interface NavItem {
  title: string;
  slug: string;
  path: string;
  order: number;
  icon?: string;
  children?: NavItem[];
}

// GitHub Types
export interface GitHubFile {
  name: string;
  path: string;
  sha: string;
  size: number;
  type: 'file' | 'dir';
  download_url: string | null;
}

export interface GitHubContent {
  path: string;
  content: string; // base64 encoded
  sha: string;
}

// Cache Types
export interface CachedProject {
  projectId: string;
  version: string;
  nav: NavItem[];
  docs: Record<string, ParsedDoc>;
  updatedAt: string;
}

// Webhook Payload
export interface WebhookPayload {
  ref: string;
  repository: {
    full_name: string;
  };
  commits?: Array<{
    added: string[];
    modified: string[];
    removed: string[];
  }>;
}

// API Response Types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

// Lint Report
export interface LintIssue {
  type: 'error' | 'warning';
  message: string;
  file: string;
  line?: number;
}

export interface LintReport {
  projectId: string;
  issues: LintIssue[];
  brokenLinks: string[];
  missingFrontmatter: string[];
  createdAt: string;
}

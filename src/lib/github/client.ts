/**
 * GitHub API Client
 * 
 * Handles all GitHub API interactions with:
 * - Rate limit awareness
 * - Error handling
 * - Token management
 * 
 * IMPORTANT: This client should only be called during webhook events
 * or initial project setup. Never on user page visits!
 */

import { Octokit } from 'octokit';
import type { GitHubFile, GitHubContent } from '@/types';

export class GitHubClient {
  private octokit: Octokit;
  private owner: string;
  private repo: string;

  constructor(accessToken: string, repoFullName: string) {
    this.octokit = new Octokit({ auth: accessToken });
    const [owner, repo] = repoFullName.split('/');
    this.owner = owner;
    this.repo = repo;
  }

  /**
   * Get repository info
   */
  async getRepo() {
    const { data } = await this.octokit.rest.repos.get({
      owner: this.owner,
      repo: this.repo,
    });
    return data;
  }

  /**
   * List all branches
   */
  async getBranches(): Promise<string[]> {
    const { data } = await this.octokit.rest.repos.listBranches({
      owner: this.owner,
      repo: this.repo,
      per_page: 100,
    });
    return data.map(b => b.name);
  }

  /**
   * List all tags (for versioning)
   */
  async getTags(): Promise<string[]> {
    const { data } = await this.octokit.rest.repos.listTags({
      owner: this.owner,
      repo: this.repo,
      per_page: 100,
    });
    return data.map(t => t.name);
  }

  /**
   * Get directory contents
   */
  async getDirectoryContents(
    path: string,
    ref: string = 'main'
  ): Promise<GitHubFile[]> {
    try {
      const { data } = await this.octokit.rest.repos.getContent({
        owner: this.owner,
        repo: this.repo,
        path,
        ref,
      });

      if (!Array.isArray(data)) {
        throw new Error(`Path ${path} is not a directory`);
      }

      return data.map(item => ({
        name: item.name,
        path: item.path,
        sha: item.sha,
        size: item.size || 0,
        type: item.type as 'file' | 'dir',
        download_url: item.download_url,
      }));
    } catch (error: unknown) {
      if ((error as { status?: number }).status === 404) {
        return [];
      }
      throw error;
    }
  }

  /**
   * Get file content (base64 decoded)
   */
  async getFileContent(path: string, ref: string = 'main'): Promise<string> {
    const { data } = await this.octokit.rest.repos.getContent({
      owner: this.owner,
      repo: this.repo,
      path,
      ref,
    });

    if (Array.isArray(data) || data.type !== 'file') {
      throw new Error(`Path ${path} is not a file`);
    }

    // Decode base64 content
    const content = Buffer.from(data.content, 'base64').toString('utf-8');
    return content;
  }

  /**
   * Recursively get all markdown files in a directory
   */
  async getAllMarkdownFiles(
    basePath: string,
    ref: string = 'main'
  ): Promise<Array<{ path: string; content: string }>> {
    const files: Array<{ path: string; content: string }> = [];
    
    async function traverse(this: GitHubClient, currentPath: string) {
      const contents = await this.getDirectoryContents(currentPath, ref);
      
      for (const item of contents) {
        if (item.type === 'dir') {
          await traverse.call(this, item.path);
        } else if (item.name.endsWith('.md') || item.name.endsWith('.mdx')) {
          const content = await this.getFileContent(item.path, ref);
          files.push({ path: item.path, content });
        }
      }
    }

    await traverse.call(this, basePath);
    return files;
  }

  /**
   * Setup webhook for push events
   */
  async createWebhook(webhookUrl: string, secret: string): Promise<number> {
    const { data } = await this.octokit.rest.repos.createWebhook({
      owner: this.owner,
      repo: this.repo,
      config: {
        url: webhookUrl,
        content_type: 'json',
        secret,
      },
      events: ['push'],
      active: true,
    });
    return data.id;
  }

  /**
   * Delete webhook
   */
  async deleteWebhook(hookId: number): Promise<void> {
    await this.octokit.rest.repos.deleteWebhook({
      owner: this.owner,
      repo: this.repo,
      hook_id: hookId,
    });
  }

  /**
   * Check rate limit status
   */
  async getRateLimit() {
    const { data } = await this.octokit.rest.rateLimit.get();
    return {
      remaining: data.rate.remaining,
      limit: data.rate.limit,
      reset: new Date(data.rate.reset * 1000),
    };
  }
}

/**
 * Create GitHub client from user session
 */
export function createGitHubClient(
  accessToken: string,
  repoFullName: string
): GitHubClient {
  return new GitHubClient(accessToken, repoFullName);
}

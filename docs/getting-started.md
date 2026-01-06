---
title: Getting Started
description: Create your first RepoDocs project in under a minute
order: 2
---

# Getting Started

This guide will help you set up your first documentation site with RepoDocs.

## Prerequisites

- A GitHub account
- A repository with markdown files

## Step 1: Sign In

Click the **"Get Started"** button on the homepage and sign in with your GitHub account.

```
https://repodocs.dev/login
```

We'll request access to your repositories to fetch documentation files.

## Step 2: Create a Project

1. Click **"New Project"** in the dashboard
2. Paste your GitHub repository URL
3. Configure the docs path (default: `/docs`)
4. Click **"Create Project"**

## Step 3: View Your Docs

Your documentation is now live! Access it at:

```
https://repodocs.dev/docs/your-project/main
```

## Folder Structure

RepoDocs automatically generates navigation from your folder structure:

```
docs/
├── index.md          → Homepage
├── getting-started.md → /getting-started
├── guides/
│   ├── installation.md → /guides/installation
│   └── configuration.md → /guides/configuration
└── api/
    └── reference.md   → /api/reference
```

## Frontmatter

Use YAML frontmatter to customize each page:

```yaml
---
title: Page Title
description: SEO description
order: 1
icon: book
---
```

| Field | Description |
|-------|-------------|
| `title` | Page title (used in sidebar & SEO) |
| `description` | Meta description for SEO |
| `order` | Sort order in navigation (lower = first) |
| `icon` | Icon name for sidebar |

## Next Steps

- [Configuration](/docs/repodocs/main/configuration) - Advanced settings
- [Markdown Guide](/docs/repodocs/main/guides/markdown) - Supported syntax

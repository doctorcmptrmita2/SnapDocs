---
title: API Reference
description: SnapDoc REST API documentation
order: 2
---

# API Reference

SnapDoc provides a REST API for programmatic access.

## Authentication

All API requests require authentication via session cookie or API key.

```bash
curl -H "Authorization: Bearer YOUR_API_KEY" \
  https://snapdoc.dev/api/projects
```

## Endpoints

### Projects

#### List Projects

```http
GET /api/projects
```

Response:

```json
[
  {
    "id": "clx123...",
    "name": "My Docs",
    "slug": "my-docs",
    "repoFullName": "user/repo",
    "branch": "main",
    "docsPath": "/docs"
  }
]
```

#### Create Project

```http
POST /api/projects
Content-Type: application/json

{
  "repoUrl": "https://github.com/user/repo",
  "name": "My Docs",
  "slug": "my-docs",
  "branch": "main",
  "docsPath": "/docs"
}
```

Response:

```json
{
  "slug": "my-docs"
}
```

### Cache

#### Refresh Cache

```http
POST /api/projects/{slug}/refresh
```

Fetches latest docs from GitHub and updates cache.

Response: Redirects to docs page.

### Webhook

#### GitHub Webhook

```http
POST /api/webhook/github
X-Hub-Signature-256: sha256=...
Content-Type: application/json

{
  "ref": "refs/heads/main",
  "repository": {
    "full_name": "user/repo"
  }
}
```

Automatically triggered by GitHub on push events.

## Error Responses

```json
{
  "error": "Error message here"
}
```

| Status | Description |
|--------|-------------|
| 400 | Bad request - invalid input |
| 401 | Unauthorized - not logged in |
| 404 | Not found - resource doesn't exist |
| 500 | Server error |

## Rate Limits

| Plan | Requests/hour |
|------|---------------|
| Hobby | 100 |
| Pro | 1,000 |
| Team | 10,000 |

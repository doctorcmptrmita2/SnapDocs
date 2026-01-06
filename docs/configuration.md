---
title: Configuration
description: Configure your SnapDoc project settings
order: 3
---

# Configuration

SnapDoc is designed to work with zero configuration, but you can customize various settings.

## Project Settings

Access settings from your dashboard: **Dashboard → Project → Settings**

### General

| Setting | Description | Default |
|---------|-------------|---------|
| Project Name | Display name | Repository name |
| URL Slug | URL path | Repository name |
| Branch | Git branch to use | `main` |
| Docs Path | Folder containing docs | `/docs` |

### Custom Domain

Connect your own domain:

1. Add your domain in settings
2. Create a CNAME record pointing to `snapdoc.dev`
3. Wait for DNS propagation (up to 24h)
4. SSL certificate is auto-provisioned

```dns
docs.example.com  CNAME  snapdoc.dev
```

## Environment Variables

For self-hosted deployments:

```env
# Database
DATABASE_URL="postgresql://user:pass@localhost:5432/snapdoc"

# Redis Cache
REDIS_URL="redis://localhost:6379"

# Authentication
NEXTAUTH_URL="https://your-domain.com"
NEXTAUTH_SECRET="your-secret-key"

# GitHub OAuth
GITHUB_CLIENT_ID="your-client-id"
GITHUB_CLIENT_SECRET="your-client-secret"
```

## Docker Deployment

```yaml
# docker-compose.yml
services:
  postgres:
    image: postgres:16-alpine
    environment:
      POSTGRES_DB: snapdoc
      
  redis:
    image: redis:7-alpine
    
  app:
    build: .
    ports:
      - "3000:3000"
    depends_on:
      - postgres
      - redis
```

Start with:

```bash
docker-compose up -d
```

## Webhook Configuration

SnapDoc automatically creates a webhook when you add a project. If you need to set it up manually:

1. Go to your repo → Settings → Webhooks
2. Add webhook URL: `https://your-domain/api/webhook/github`
3. Content type: `application/json`
4. Secret: Use the same as `GITHUB_WEBHOOK_SECRET`
5. Events: Select "Push events"

---
title: Deployment
description: Deploy SnapDoc to your own server or cloud
order: 4
---

# Deployment

SnapDoc can be deployed anywhere that runs Node.js and Docker.

## Self-Hosted (Recommended)

### Requirements

- Docker & Docker Compose
- 1GB RAM minimum
- PostgreSQL 16+
- Redis 7+

### Quick Deploy

```bash
# Clone the repository
git clone https://github.com/doctorcmptrmita2/SnapDocs.git
cd SnapDocs

# Copy environment file
cp .env.example .env

# Edit .env with your values
nano .env

# Start services
docker-compose up -d

# Run database migrations
docker-compose exec app npx prisma db push

# Your app is live at http://localhost:3000
```

### Production Checklist

- [ ] Set strong `NEXTAUTH_SECRET`
- [ ] Configure GitHub OAuth with production URLs
- [ ] Set up reverse proxy (nginx/caddy)
- [ ] Enable SSL/TLS
- [ ] Configure backups for PostgreSQL
- [ ] Set up monitoring

## Cloud Platforms

### Vercel

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Set environment variables in Vercel dashboard
```

Required services:
- Vercel Postgres or Neon
- Vercel KV or Upstash Redis

### Railway

```bash
# Install Railway CLI
npm i -g @railway/cli

# Login and deploy
railway login
railway init
railway up
```

Railway auto-provisions PostgreSQL and Redis.

### DigitalOcean App Platform

1. Connect your GitHub repo
2. Select "Docker" as build type
3. Add PostgreSQL and Redis as managed services
4. Deploy

## Reverse Proxy

### Nginx

```nginx
server {
    listen 80;
    server_name docs.example.com;
    
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### Caddy

```caddyfile
docs.example.com {
    reverse_proxy localhost:3000
}
```

Caddy automatically handles SSL certificates.

## Health Checks

```bash
# Check app health
curl http://localhost:3000/api/health

# Check Redis
redis-cli ping

# Check PostgreSQL
psql -U snapdoc -c "SELECT 1"
```

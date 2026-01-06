# SnapDoc.dev v2.0

> Git to Docs in 30 Seconds

The most reliable & high-performance bridge between Git and Docs.

## Quick Start

```bash
# Install dependencies
npm install

# Setup environment
cp .env.example .env
# Fill in your credentials

# Generate Prisma client
npm run db:generate

# Push database schema
npm run db:push

# Start development
npm run dev
```

## Architecture

```
Push → Webhook → Parse → Edge Cache → Serve (10ms)
```

- **Zero runtime GitHub calls** - All content cached at edge
- **Webhook-based updates** - Push triggers cache refresh
- **Shiki syntax highlighting** - 150+ languages
- **XSS protection** - rehype-sanitize

## Tech Stack

- Next.js 14 (App Router)
- Prisma + PostgreSQL (Neon)
- Vercel KV (Redis)
- GitHub OAuth
- Tailwind CSS

## Environment Variables

See `.env.example` for required variables.

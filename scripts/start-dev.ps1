# SnapDoc Development Startup Script (Windows)
# Starts PostgreSQL + Redis via Docker, then runs Next.js dev server

Write-Host "🚀 Starting SnapDoc development environment..." -ForegroundColor Cyan

# Start database services
Write-Host "📦 Starting PostgreSQL and Redis..." -ForegroundColor Yellow
docker-compose up -d postgres redis

# Wait for services to be healthy
Write-Host "⏳ Waiting for services to be ready..." -ForegroundColor Yellow
Start-Sleep -Seconds 5

# Run Prisma migrations
Write-Host "🔄 Running database migrations..." -ForegroundColor Yellow
npx prisma db push

# Start Next.js dev server
Write-Host "✨ Starting Next.js development server..." -ForegroundColor Green
npm run dev

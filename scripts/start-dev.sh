#!/bin/bash

# SnapDoc Development Startup Script
# Starts PostgreSQL + Redis via Docker, then runs Next.js dev server

echo "🚀 Starting SnapDoc development environment..."

# Start database services
echo "📦 Starting PostgreSQL and Redis..."
docker-compose up -d postgres redis

# Wait for services to be healthy
echo "⏳ Waiting for services to be ready..."
sleep 5

# Run Prisma migrations
echo "🔄 Running database migrations..."
npx prisma db push

# Start Next.js dev server
echo "✨ Starting Next.js development server..."
npm run dev

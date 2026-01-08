#!/bin/bash

# Post-Deploy Hook
# This script runs after deployment to initialize services
# Called by: Easypanel or CI/CD pipeline

set -e

echo "🚀 Post-Deploy Initialization"
echo "=============================="

# Run database migrations
echo "📊 Running database migrations..."
if command -v npx &> /dev/null; then
    npx prisma db push --skip-generate || echo "⚠️  Prisma migration skipped (may already be done)"
else
    echo "⚠️  npx not found, skipping database migration"
fi

echo "✅ Post-deploy initialization complete"

# Check Nginx automation
if [ "$NGINX_ENABLED" = "true" ]; then
    echo ""
    echo "⚠️  Nginx automation is enabled"
    echo "📝 To complete setup, run on the host server:"
    echo "   sudo bash scripts/init-nginx.sh"
fi

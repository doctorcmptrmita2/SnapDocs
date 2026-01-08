#!/bin/bash

# Post-Deploy Hook
# This script runs after deployment to initialize services
# Called by: Easypanel or CI/CD pipeline

set -e

echo "🚀 Post-Deploy Initialization"
echo "=============================="

# Run database migrations
echo "📊 Running database migrations..."
npx prisma db push --skip-generate

echo "✅ Database migrations complete"

# Check Nginx automation
if [ "$NGINX_ENABLED" = "true" ]; then
    echo ""
    echo "⚠️  Nginx automation is enabled"
    echo "📝 To complete setup, run on the host server:"
    echo "   sudo bash scripts/init-nginx.sh"
    echo ""
    echo "   Then create SSL certificate:"
    echo "   sudo certbot certonly --manual --preferred-challenges=dns \\"
    echo "     -d \"*.${NGINX_MAIN_DOMAIN}\" -d \"${NGINX_MAIN_DOMAIN}\" \\"
    echo "     -m ${CERTBOT_EMAIL}"
fi

echo ""
echo "✅ Post-deploy initialization complete!"

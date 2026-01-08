#!/bin/sh

# Docker Entrypoint Script
# Runs initialization tasks before starting the Next.js app

set -e

echo "🚀 Starting RepoDocs..."

# Check if Nginx automation is enabled
if [ "$NGINX_ENABLED" = "true" ]; then
    echo "📋 Nginx automation is enabled"
    echo "⚠️  Note: Nginx setup must be done manually on the host server"
    echo "    Run: sudo bash scripts/setup-nginx.sh"
fi

# Start the Next.js application
echo "▶️  Starting Next.js server..."
exec node server.js

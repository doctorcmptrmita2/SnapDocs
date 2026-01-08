#!/bin/bash

# Nginx Initialization Script
# This script is called once during deployment to set up Nginx automation
# It should be run on the host server (not in Docker container)

set -e

echo "🔧 Nginx Automation Initialization"
echo "=================================="

# Check if running as root
if [[ $EUID -ne 0 ]]; then
   echo "⚠️  This script must be run as root"
   echo "   Run: sudo bash scripts/init-nginx.sh"
   exit 1
fi

# Check if Nginx is installed
if ! command -v nginx &> /dev/null; then
    echo "📦 Installing Nginx..."
    apt-get update
    apt-get install -y nginx
fi

# Check if Certbot is installed
if ! command -v certbot &> /dev/null; then
    echo "📦 Installing Certbot..."
    apt-get install -y certbot python3-certbot-nginx
fi

# Get configuration from environment
MAIN_DOMAIN="${NGINX_MAIN_DOMAIN:-yourdomain.com}"
CERTBOT_EMAIL="${CERTBOT_EMAIL:-admin@yourdomain.com}"

echo "✅ Nginx and Certbot are installed"
echo ""
echo "📋 Configuration:"
echo "   Main Domain: $MAIN_DOMAIN"
echo "   Email: $CERTBOT_EMAIL"
echo ""

# Check if wildcard certificate already exists
if certbot certificates 2>/dev/null | grep -q "$MAIN_DOMAIN"; then
    echo "✅ SSL certificate already exists for $MAIN_DOMAIN"
else
    echo "⚠️  SSL certificate not found"
    echo "   Run: sudo certbot certonly --manual --preferred-challenges=dns -d \"*.$MAIN_DOMAIN\" -d \"$MAIN_DOMAIN\""
fi

# Enable Nginx
echo "▶️  Enabling Nginx..."
systemctl enable nginx
systemctl start nginx

echo ""
echo "✅ Nginx initialization complete!"
echo ""
echo "📝 Next steps:"
echo "   1. Create wildcard SSL certificate:"
echo "      sudo certbot certonly --manual --preferred-challenges=dns \\"
echo "        -d \"*.$MAIN_DOMAIN\" -d \"$MAIN_DOMAIN\" \\"
echo "        -m $CERTBOT_EMAIL"
echo ""
echo "   2. Configure Nginx (see docs/NGINX_SETUP.md)"
echo ""
echo "   3. Reload Nginx:"
echo "      sudo systemctl reload nginx"

#!/bin/bash

# Nginx + Let's Encrypt Setup Script
# This script sets up automatic SSL certificate management and Nginx configuration
# for custom domains

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}=== Nginx + Let's Encrypt Setup ===${NC}\n"

# Check if running as root
if [[ $EUID -ne 0 ]]; then
   echo -e "${RED}This script must be run as root${NC}"
   exit 1
fi

# Get configuration from user
read -p "Enter your main domain (e.g., yourdomain.com): " MAIN_DOMAIN
read -p "Enter your email for Let's Encrypt: " CERTBOT_EMAIL
read -p "Enter your server IP address: " SERVER_IP

# Validate inputs
if [[ -z "$MAIN_DOMAIN" ]] || [[ -z "$CERTBOT_EMAIL" ]] || [[ -z "$SERVER_IP" ]]; then
    echo -e "${RED}All fields are required${NC}"
    exit 1
fi

echo -e "\n${YELLOW}Configuration:${NC}"
echo "Main Domain: $MAIN_DOMAIN"
echo "Email: $CERTBOT_EMAIL"
echo "Server IP: $SERVER_IP"
echo ""

# Step 1: Update system
echo -e "${YELLOW}Step 1: Updating system packages...${NC}"
apt-get update
apt-get upgrade -y

# Step 2: Install Nginx
echo -e "${YELLOW}Step 2: Installing Nginx...${NC}"
apt-get install -y nginx

# Step 3: Install Certbot
echo -e "${YELLOW}Step 3: Installing Certbot...${NC}"
apt-get install -y certbot python3-certbot-nginx

# Step 4: Create Nginx configuration
echo -e "${YELLOW}Step 4: Creating Nginx configuration...${NC}"

cat > /etc/nginx/sites-available/repodocs << EOF
# HTTP -> HTTPS redirect
server {
    listen 80;
    listen [::]:80;
    server_name ~^(.+)\.${MAIN_DOMAIN}$ ${MAIN_DOMAIN} www.${MAIN_DOMAIN};
    
    # Let's Encrypt validation
    location /.well-known/acme-challenge/ {
        root /var/www/certbot;
    }
    
    # Redirect all HTTP to HTTPS
    location / {
        return 301 https://\$host\$request_uri;
    }
}

# HTTPS - Main domain
server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name ${MAIN_DOMAIN} www.${MAIN_DOMAIN};
    
    ssl_certificate /etc/letsencrypt/live/${MAIN_DOMAIN}/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/${MAIN_DOMAIN}/privkey.pem;
    
    # SSL Configuration
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;
    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 10m;
    
    # Security headers
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    
    # Proxy to Next.js
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
    }
}

# HTTPS - Custom domains (wildcard)
server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name ~^(.+)\.${MAIN_DOMAIN}$;
    
    ssl_certificate /etc/letsencrypt/live/${MAIN_DOMAIN}/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/${MAIN_DOMAIN}/privkey.pem;
    
    # SSL Configuration
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;
    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 10m;
    
    # Security headers
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    
    # Proxy to Next.js
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
    }
}
EOF

# Enable Nginx site
ln -sf /etc/nginx/sites-available/repodocs /etc/nginx/sites-enabled/repodocs
rm -f /etc/nginx/sites-enabled/default

# Test Nginx configuration
echo -e "${YELLOW}Testing Nginx configuration...${NC}"
nginx -t

# Step 5: Create wildcard SSL certificate
echo -e "${YELLOW}Step 5: Creating SSL certificate for *.${MAIN_DOMAIN}...${NC}"
echo -e "${YELLOW}Note: You'll need to add DNS TXT records for domain verification${NC}\n"

certbot certonly \
    --manual \
    --preferred-challenges=dns \
    --email "$CERTBOT_EMAIL" \
    --agree-tos \
    --no-eff-email \
    -d "*.${MAIN_DOMAIN}" \
    -d "${MAIN_DOMAIN}"

# Step 6: Start and enable services
echo -e "${YELLOW}Step 6: Starting services...${NC}"
systemctl start nginx
systemctl enable nginx
systemctl enable certbot.timer
systemctl start certbot.timer

# Step 7: Test certificate renewal
echo -e "${YELLOW}Step 7: Testing certificate renewal...${NC}"
certbot renew --dry-run

# Step 8: Create .env configuration
echo -e "${YELLOW}Step 8: Creating .env configuration...${NC}"

cat > /tmp/nginx-env-config.txt << EOF

# Add these to your .env file:
NGINX_ENABLED="true"
NGINX_MAIN_DOMAIN="${MAIN_DOMAIN}"
NGINX_SSL_PATH="/etc/letsencrypt/live"
NGINX_CONFIG_PATH="/etc/nginx/sites-available"
CERTBOT_EMAIL="${CERTBOT_EMAIL}"
EOF

echo -e "${GREEN}=== Setup Complete ===${NC}\n"
echo -e "${YELLOW}Next steps:${NC}"
echo "1. Update your DNS records:"
echo "   *.${MAIN_DOMAIN}  A  ${SERVER_IP}"
echo "   ${MAIN_DOMAIN}    A  ${SERVER_IP}"
echo ""
echo "2. Add the following to your .env file:"
cat /tmp/nginx-env-config.txt
echo ""
echo "3. Restart your Next.js application"
echo ""
echo -e "${YELLOW}Useful commands:${NC}"
echo "  Check certificate status: sudo certbot certificates"
echo "  Renew certificates: sudo certbot renew"
echo "  Reload Nginx: sudo systemctl reload nginx"
echo "  View Nginx logs: sudo tail -f /var/log/nginx/error.log"

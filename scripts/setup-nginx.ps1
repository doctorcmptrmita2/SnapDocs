# Nginx + Let's Encrypt Setup Script (Windows WSL2)
# This script helps configure Nginx for custom domains with automatic SSL

Write-Host "=== Nginx + Let's Encrypt Setup ===" -ForegroundColor Green
Write-Host ""

# Check if running in WSL
$isWSL = Test-Path "/proc/version"
if (-not $isWSL) {
    Write-Host "This script is designed for WSL2 (Windows Subsystem for Linux)" -ForegroundColor Red
    Write-Host "For Windows, use WSL2 with Ubuntu and run: bash scripts/setup-nginx.sh" -ForegroundColor Yellow
    exit 1
}

# Get configuration from user
$mainDomain = Read-Host "Enter your main domain (e.g., yourdomain.com)"
$certbotEmail = Read-Host "Enter your email for Let's Encrypt"
$serverIP = Read-Host "Enter your server IP address"

# Validate inputs
if ([string]::IsNullOrWhiteSpace($mainDomain) -or [string]::IsNullOrWhiteSpace($certbotEmail) -or [string]::IsNullOrWhiteSpace($serverIP)) {
    Write-Host "All fields are required" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "Configuration:" -ForegroundColor Yellow
Write-Host "Main Domain: $mainDomain"
Write-Host "Email: $certbotEmail"
Write-Host "Server IP: $serverIP"
Write-Host ""

# Create environment configuration
$envConfig = @"
# Add these to your .env file:
NGINX_ENABLED="true"
NGINX_MAIN_DOMAIN="$mainDomain"
NGINX_SSL_PATH="/etc/letsencrypt/live"
NGINX_CONFIG_PATH="/etc/nginx/sites-available"
CERTBOT_EMAIL="$certbotEmail"
"@

Write-Host "=== Setup Instructions ===" -ForegroundColor Green
Write-Host ""
Write-Host "1. Run the following in WSL2 terminal:" -ForegroundColor Yellow
Write-Host "   sudo bash scripts/setup-nginx.sh" -ForegroundColor Cyan
Write-Host ""
Write-Host "2. When prompted, enter:" -ForegroundColor Yellow
Write-Host "   Domain: $mainDomain" -ForegroundColor Cyan
Write-Host "   Email: $certbotEmail" -ForegroundColor Cyan
Write-Host "   IP: $serverIP" -ForegroundColor Cyan
Write-Host ""
Write-Host "3. Update your DNS records:" -ForegroundColor Yellow
Write-Host "   *.$mainDomain  A  $serverIP" -ForegroundColor Cyan
Write-Host "   $mainDomain    A  $serverIP" -ForegroundColor Cyan
Write-Host ""
Write-Host "4. Add to your .env file:" -ForegroundColor Yellow
Write-Host $envConfig -ForegroundColor Cyan
Write-Host ""
Write-Host "5. Restart your Next.js application" -ForegroundColor Yellow
Write-Host ""

# Save configuration to file
$envConfig | Out-File -FilePath ".env.nginx" -Encoding UTF8
Write-Host "Configuration saved to: .env.nginx" -ForegroundColor Green

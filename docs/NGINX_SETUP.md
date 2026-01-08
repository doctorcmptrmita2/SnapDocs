# Nginx ile Otomatik Custom Domain SSL Yönlendirmesi

Bu rehber, custom domain'leri otomatik olarak yönlendirmek ve SSL sertifikasını Let's Encrypt ile yönetmek için Nginx konfigürasyonunu açıklar.

## Gereksinimler

- Kendi VPS/Sunucu (Nginx kurulu)
- Let's Encrypt Certbot
- PostgreSQL (zaten var)
- Node.js (zaten var)

## Kurulum Adımları

### 1. Certbot Kurulumu

```bash
# Ubuntu/Debian
sudo apt-get update
sudo apt-get install certbot python3-certbot-nginx

# Wildcard sertifika oluştur (DNS validation ile)
sudo certbot certonly --manual --preferred-challenges=dns -d "*.yourdomain.com" -d "yourdomain.com"
```

### 2. Nginx Konfigürasyonu

`/etc/nginx/sites-available/repodocs` dosyasını oluşturun:

```nginx
# HTTP -> HTTPS yönlendirmesi
server {
    listen 80;
    listen [::]:80;
    server_name ~^(.+)\.yourdomain\.com$ yourdomain.com www.yourdomain.com;
    
    # Let's Encrypt validation
    location /.well-known/acme-challenge/ {
        root /var/www/certbot;
    }
    
    # Tüm HTTP trafiğini HTTPS'e yönlendir
    location / {
        return 301 https://$host$request_uri;
    }
}

# HTTPS - Ana domain
server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name yourdomain.com www.yourdomain.com;
    
    ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;
    
    # SSL Konfigürasyonu
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;
    
    # Next.js uygulamasına proxy
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}

# HTTPS - Custom Domains (Wildcard)
server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name ~^(.+)\.yourdomain\.com$;
    
    ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;
    
    # SSL Konfigürasyonu
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;
    
    # Next.js uygulamasına proxy
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### 3. Nginx Konfigürasyonunu Aktifleştir

```bash
# Konfigürasyonu test et
sudo nginx -t

# Nginx'i yeniden başlat
sudo systemctl restart nginx
```

### 4. SSL Sertifikasını Otomatik Yenile

```bash
# Certbot otomatik yenileme servisi
sudo systemctl enable certbot.timer
sudo systemctl start certbot.timer

# Yenileme testi
sudo certbot renew --dry-run
```

## Wildcard Sertifika Yönetimi

Wildcard sertifika (`*.yourdomain.com`) tüm subdomainleri kapsar:
- `docs.yourdomain.com` ✓
- `api.yourdomain.com` ✓
- `custom.yourdomain.com` ✓

## DNS Ayarları

Tüm custom domain'ler için DNS kaydı:

```
*.yourdomain.com  A  YOUR_SERVER_IP
yourdomain.com    A  YOUR_SERVER_IP
```

## Sorun Giderme

### SSL Hatası
```bash
# Sertifika bilgisini kontrol et
sudo certbot certificates

# Sertifikayı yenile
sudo certbot renew --force-renewal
```

### Nginx Hatası
```bash
# Nginx log'ları
sudo tail -f /var/log/nginx/error.log
sudo tail -f /var/log/nginx/access.log
```

## Notlar

- Wildcard sertifika DNS validation gerektirir
- Sertifika 90 günde bir otomatik yenilenir
- Custom domain'ler otomatik olarak Next.js middleware tarafından handle edilir

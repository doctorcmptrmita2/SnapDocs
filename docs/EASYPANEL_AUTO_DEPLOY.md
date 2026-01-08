# Easypanel Otomatik Deployment Rehberi

Bu rehber, Easypanel'de deploy ettiğinizde Nginx otomasyonunun otomatik olarak kurulmasını sağlar.

## Otomatik Deployment Akışı

```
GitHub Push
    ↓
Easypanel Webhook
    ↓
Docker Build
    ↓
Container Start
    ↓
Post-Deploy Hook (scripts/post-deploy.sh)
    ↓
Database Migration
    ↓
Nginx Initialization (opsiyonel)
    ↓
App Ready ✅
```

## Kurulum Adımları

### 1. Easypanel'de App Service Oluştur

1. Proje → "+" → "App" → GitHub seç
2. Repository'yi seç
3. Ayarlar:
   - Name: `app`
   - Branch: `main`
   - Build Method: Dockerfile
   - Port: `3000`

### 2. Environment Variables Ekle

App service → Environment sekmesi:

```env
# Database
DATABASE_URL=postgresql://repodocs:PASSWORD@repodocs_postgres:5432/repodocs

# Redis
REDIS_URL=redis://repodocs_redis:6379

# NextAuth
NEXTAUTH_URL=https://repodocs.yourdomain.com
NEXTAUTH_SECRET=your-secret-here

# GitHub OAuth
GITHUB_CLIENT_ID=your-client-id
GITHUB_CLIENT_SECRET=your-client-secret
GITHUB_WEBHOOK_SECRET=your-webhook-secret

# Nginx Automation (opsiyonel)
NGINX_ENABLED=false
NGINX_MAIN_DOMAIN=yourdomain.com
NGINX_SSL_PATH=/etc/letsencrypt/live
NGINX_CONFIG_PATH=/etc/nginx/sites-available
CERTBOT_EMAIL=admin@yourdomain.com
```

### 3. Deploy Et

1. "Deploy" butonuna tıkla
2. Build tamamlanana kadar bekle

### 4. Post-Deploy Adımları

Deploy tamamlandıktan sonra, Easypanel'de app container'ına terminal aç:

```bash
# Database migration (otomatik çalışır)
npx prisma db push

# Nginx setup (opsiyonel - sadece NGINX_ENABLED=true ise)
sudo bash scripts/init-nginx.sh
```

## Otomatik Çalışan İşler

### ✅ Otomatik (Docker'da)

- Database migration (`npx prisma db push`)
- Environment variables yükleme
- Next.js build ve start
- Health checks

### ⚠️ Manuel (Host Server'da)

Nginx otomasyonunu etkinleştirmek için:

```bash
# Host server'da SSH ile bağlan
ssh root@your-server-ip

# Nginx'i initialize et
sudo bash scripts/init-nginx.sh

# Wildcard SSL sertifikası oluştur
sudo certbot certonly --manual --preferred-challenges=dns \
  -d "*.yourdomain.com" -d "yourdomain.com" \
  -m admin@yourdomain.com

# Nginx'i yeniden yükle
sudo systemctl reload nginx
```

## Deployment Hooks

### Post-Deploy Hook (Otomatik)

`scripts/post-deploy.sh` dosyası deploy tamamlandıktan sonra otomatik olarak çalışır:

```bash
#!/bin/bash
# Database migration
npx prisma db push --skip-generate

# Nginx setup instructions
if [ "$NGINX_ENABLED" = "true" ]; then
    echo "Run: sudo bash scripts/init-nginx.sh"
fi
```

### Docker Entrypoint (Otomatik)

`scripts/docker-entrypoint.sh` dosyası container başladığında çalışır:

```bash
#!/bin/sh
# Nginx status check
if [ "$NGINX_ENABLED" = "true" ]; then
    echo "Nginx automation is enabled"
fi

# Start Next.js
exec node server.js
```

## Easypanel'de Custom Commands

Easypanel'de custom commands ekleyebilirsiniz:

### 1. Database Migration

App service → Commands sekmesi:

```bash
Name: Migrate Database
Command: npx prisma db push
```

### 2. Nginx Setup

```bash
Name: Setup Nginx
Command: sudo bash scripts/init-nginx.sh
```

### 3. Cache Clear

```bash
Name: Clear Cache
Command: redis-cli FLUSHALL
```

## Otomatik Deployment Kontrol Listesi

- [ ] GitHub repository bağlandı
- [ ] Dockerfile doğru
- [ ] Environment variables eklendi
- [ ] Deploy başarılı
- [ ] Database migration tamamlandı
- [ ] App sağlıklı çalışıyor
- [ ] Custom domain test edildi
- [ ] Nginx setup tamamlandı (opsiyonel)

## Sorun Giderme

### Deploy Başarısız

1. Logs sekmesinden hata mesajını kontrol et
2. Environment variables doğru mu kontrol et
3. Dockerfile syntax'ı kontrol et

### Database Migration Hatası

```bash
# Container'ında terminal aç
npx prisma db push --skip-generate

# Veya
npx prisma migrate deploy
```

### Nginx Setup Hatası

```bash
# Host server'da
sudo bash scripts/init-nginx.sh

# Logs kontrol et
sudo tail -f /var/log/nginx/error.log
```

## Faydalı Komutlar

```bash
# Easypanel container'ında
docker exec -it repodocs-app bash

# Database migration
npx prisma db push

# Prisma studio
npx prisma studio

# Nginx test
sudo nginx -t

# Nginx reload
sudo systemctl reload nginx

# Logs
docker logs -f repodocs-app
sudo tail -f /var/log/nginx/error.log
```

## Deployment Akışı Özeti

```
1. GitHub'a push yap
   ↓
2. Easypanel webhook tetiklenir
   ↓
3. Docker build başlar
   ↓
4. Container başlar
   ↓
5. docker-entrypoint.sh çalışır
   ↓
6. Next.js server başlar
   ↓
7. post-deploy.sh çalışır (opsiyonel)
   ↓
8. Database migration yapılır
   ↓
9. App ready ✅
   ↓
10. Nginx setup (manuel - opsiyonel)
```

## Sonraki Adımlar

1. Deploy et
2. Database migration kontrol et
3. Custom domain test et
4. Nginx setup'ı tamamla (opsiyonel)
5. SSL sertifikasını kontrol et

Daha fazla bilgi: `docs/EASYPANEL_NGINX_DEPLOY.md`

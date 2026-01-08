# Deployment Automation - Otomatik Kurulum

Bu dokümantasyon, Easypanel'de deploy ettiğinizde hangi işlerin otomatik olarak yapıldığını ve hangileri manuel yapılması gerektiğini açıklar.

## 🤖 Otomatik İşler (Docker'da)

Deploy ettiğinizde bu işler **otomatik olarak** yapılır:

### 1. Docker Build
```
✅ Dockerfile'dan image oluşturulur
✅ Node.js dependencies yüklenir
✅ Next.js build yapılır
✅ Prisma client generate edilir
```

### 2. Container Start
```
✅ docker-entrypoint.sh çalışır
✅ Environment variables yüklenir
✅ Next.js server başlar
✅ Health checks çalışır
```

### 3. Post-Deploy Hook
```
✅ scripts/post-deploy.sh çalışır
✅ Database migration yapılır (npx prisma db push)
✅ Nginx status kontrol edilir
```

## ⚠️ Manuel İşler (Host Server'da)

Bu işler **manuel olarak** yapılması gerekir:

### 1. Nginx Setup (Opsiyonel)

Eğer `NGINX_ENABLED=true` ise:

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

### 2. DNS Kayıtlarını Güncelle

DNS sağlayıcısında:

```
repodocs      A  YOUR_SERVER_IP
*.yourdomain  A  YOUR_SERVER_IP
yourdomain    A  YOUR_SERVER_IP
```

### 3. Custom Domain Test Et

Dashboard'dan custom domain ekle ve test et.

## 📊 Deployment Timeline

```
T+0s   → GitHub Push
T+5s   → Easypanel Webhook Tetiklenir
T+10s  → Docker Build Başlar
T+60s  → Docker Build Tamamlanır
T+65s  → Container Başlar
T+70s  → docker-entrypoint.sh Çalışır
T+75s  → Next.js Server Başlar
T+80s  → post-deploy.sh Çalışır
T+90s  → Database Migration Tamamlanır
T+95s  → App Ready ✅

Manual Steps (Host Server):
T+100s → Nginx Setup (opsiyonel)
T+120s → SSL Certificate Creation
T+140s → Nginx Reload
```

## 🔄 Deployment Akışı

### Easypanel'de Otomatik

```
1. GitHub Push
   ↓
2. Webhook Tetiklenir
   ↓
3. Docker Build
   ├─ Dockerfile parse
   ├─ Dependencies install
   ├─ Next.js build
   └─ Prisma generate
   ↓
4. Container Start
   ├─ docker-entrypoint.sh
   ├─ Environment load
   └─ Next.js start
   ↓
5. Post-Deploy Hook
   ├─ post-deploy.sh
   ├─ Database migration
   └─ Nginx check
   ↓
6. App Ready ✅
```

### Host Server'da Manuel (Opsiyonel)

```
1. SSH Bağlantısı
   ↓
2. Nginx Initialize
   ├─ Nginx install
   ├─ Certbot install
   └─ Services enable
   ↓
3. SSL Certificate
   ├─ DNS validation
   ├─ Certificate create
   └─ Auto-renewal setup
   ↓
4. Nginx Configure
   ├─ Config update
   ├─ Syntax test
   └─ Reload
   ↓
5. DNS Update
   ├─ A records
   └─ Propagation wait
   ↓
6. Test & Monitor ✅
```

## 📝 Script Dosyaları

### docker-entrypoint.sh (Otomatik)
```bash
#!/bin/sh
# Container başladığında çalışır
# - Nginx status kontrol
# - Next.js server başlat
```

### post-deploy.sh (Otomatik)
```bash
#!/bin/bash
# Deploy tamamlandıktan sonra çalışır
# - Database migration
# - Nginx setup instructions
```

### init-nginx.sh (Manuel)
```bash
#!/bin/bash
# Host server'da manuel çalıştırılır
# - Nginx install
# - Certbot install
# - Services enable
```

### setup-nginx.sh (Manuel)
```bash
#!/bin/bash
# Host server'da manuel çalıştırılır
# - Tam Nginx + Certbot setup
# - SSL certificate creation
# - Auto-renewal configuration
```

## 🎯 Deployment Seçenekleri

### Seçenek 1: Easypanel Sadece (Önerilen)
```
✅ Otomatik: Docker build, container start, database migration
❌ Manuel: Hiçbir şey
⏱️  Süre: ~2 dakika
```

### Seçenek 2: Easypanel + Nginx
```
✅ Otomatik: Docker build, container start, database migration
⚠️  Manuel: Nginx setup, SSL certificate, DNS update
⏱️  Süre: ~10 dakika
```

### Seçenek 3: Easypanel + Nginx + Wildcard
```
✅ Otomatik: Docker build, container start, database migration
⚠️  Manuel: Nginx setup, wildcard certificate, DNS update
⏱️  Süre: ~15 dakika
```

## 🚀 Hızlı Deployment

### 1. Easypanel'de Deploy Et (Otomatik)
```bash
# DEPLOY_TO_EASYPANEL.md takip et
# 5 adımda tamamlanır
```

### 2. Database Migration Kontrol Et (Otomatik)
```bash
# Easypanel logs'ta kontrol et
# "Database migrations complete" mesajı görünür
```

### 3. Custom Domain Test Et (Manuel)
```bash
# Dashboard'dan domain ekle
# DNS kaydını güncelle
# Tarayıcıda test et
```

### 4. Nginx Setup (Opsiyonel - Manuel)
```bash
# Host server'da
sudo bash scripts/init-nginx.sh
sudo certbot certonly --manual --preferred-challenges=dns ...
sudo systemctl reload nginx
```

## 📋 Kontrol Listesi

### Easypanel Deploy
- [ ] GitHub OAuth setup
- [ ] Easypanel project oluştur
- [ ] PostgreSQL database ekle
- [ ] Redis ekle
- [ ] App service ekle
- [ ] Environment variables ekle
- [ ] Deploy et
- [ ] Build başarılı
- [ ] Container çalışıyor

### Post-Deploy
- [ ] Database migration tamamlandı
- [ ] App sağlıklı çalışıyor
- [ ] Logs'ta hata yok
- [ ] Custom domain test edildi

### Nginx Setup (Opsiyonel)
- [ ] SSH bağlantısı sağlandı
- [ ] init-nginx.sh çalıştırıldı
- [ ] SSL certificate oluşturuldu
- [ ] DNS kaydı güncellendi
- [ ] Nginx reload yapıldı

## 🔧 Sorun Giderme

### Deploy Başarısız
```bash
# Easypanel logs kontrol et
# Dockerfile syntax kontrol et
# Environment variables kontrol et
```

### Database Migration Hatası
```bash
# Container'ında terminal aç
npx prisma db push --skip-generate
```

### Nginx Hatası
```bash
# Host server'da
sudo nginx -t
sudo systemctl reload nginx
sudo tail -f /var/log/nginx/error.log
```

## 📚 Daha Fazla Bilgi

- Hızlı deployment: `DEPLOY_TO_EASYPANEL.md`
- Otomatik deployment: `docs/EASYPANEL_AUTO_DEPLOY.md`
- Nginx entegrasyonu: `docs/EASYPANEL_NGINX_DEPLOY.md`
- Kontrol listesi: `DEPLOYMENT_CHECKLIST.md`

## 🎉 Başarılı Deployment Göstergeleri

```
✅ Easypanel'de app çalışıyor
✅ Database migration tamamlandı
✅ GitHub OAuth çalışıyor
✅ Custom domain erişilebiliyor
✅ SSL sertifikası geçerli
✅ Logs'ta hata yok
✅ Performance kabul edilebilir
```

---

**Özet**: Deploy ettiğinizde Docker'da otomatik işler yapılır. Nginx otomasyonunu kullanmak istiyorsanız, host server'da manuel adımlar gerekir.

**Tavsiye**: Başta Easypanel sadece kullanın, sonra Nginx otomasyonunu ekleyin.

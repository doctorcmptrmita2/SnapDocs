# Easypanel'e Deploy - Hızlı Rehber

## 🚀 5 Adımda Deploy

### 1. GitHub OAuth Hazırla

1. https://github.com/settings/developers adresine git
2. "New OAuth App" tıkla
3. Bilgileri doldur:
   ```
   Application name: RepoDocs
   Homepage URL: https://repodocs.yourdomain.com
   Authorization callback URL: https://repodocs.yourdomain.com/api/auth/callback/github
   ```
4. **Client ID** ve **Client Secret**'ı kopyala

### 2. Easypanel'de Proje Oluştur

1. Easypanel dashboard'a gir
2. "Create Project" → `repodocs`
3. PostgreSQL ekle:
   - Name: `postgres`
   - Database: `repodocs`
   - Username: `repodocs`
   - Password: Güçlü şifre (not al!)
4. Redis ekle:
   - Name: `redis`

### 3. App Service Ekle

1. "+" → "App" → GitHub seç
2. Bu repository'yi seç
3. Ayarlar:
   - Name: `app`
   - Branch: `main`
   - Build Method: Dockerfile
   - Port: `3000`

### 4. Environment Variables Ekle

App service → Environment sekmesi:

```env
# Database (Easypanel internal)
DATABASE_URL=postgresql://repodocs:POSTGRES_SIFREN@repodocs_postgres:5432/repodocs

# Redis (Easypanel internal)
REDIS_URL=redis://repodocs_redis:6379

# NextAuth
NEXTAUTH_URL=https://repodocs.yourdomain.com
NEXTAUTH_SECRET=BURAYA_RANDOM_32_KARAKTER

# GitHub OAuth
GITHUB_CLIENT_ID=GITHUB_CLIENT_ID_BURAYA
GITHUB_CLIENT_SECRET=GITHUB_CLIENT_SECRET_BURAYA
GITHUB_WEBHOOK_SECRET=BURAYA_RANDOM_SECRET

# Domain
NEXT_PUBLIC_DOMAIN=yourdomain.com

# Easypanel Integration (opsiyonel)
EASYPANEL_URL=https://your-easypanel-url
EASYPANEL_TOKEN=your-api-token
EASYPANEL_PROJECT=repodocs
EASYPANEL_SERVICE=app

# Nginx Automation (opsiyonel - false ile başla)
NGINX_ENABLED=false
```

### 5. Deploy Et

1. "Deploy" butonuna tıkla
2. Build tamamlanana kadar bekle (3-5 dakika)
3. Logs'ta hata olup olmadığını kontrol et

## ✅ Post-Deploy

### Database Migration

App service → Terminal sekmesi:
```bash
npx prisma db push
```

### Domain Ayarla

1. App service → Domains sekmesi
2. "Add Domain" → `repodocs.yourdomain.com`
3. DNS'te A record ekle:
   ```
   repodocs  A  SUNUCU_IP
   ```
4. SSL otomatik aktif olacak

### Test Et

1. https://repodocs.yourdomain.com adresine git
2. GitHub ile login yap
3. Dashboard'dan proje ekle
4. Docs'u görüntüle

### Nginx Otomasyonunu Etkinleştir (Opsiyonel)

Eğer Nginx otomasyonunu kullanmak istiyorsan:

1. Host server'da SSH ile bağlan:
   ```bash
   ssh root@your-server-ip
   ```

2. Nginx'i initialize et:
   ```bash
   sudo bash scripts/init-nginx.sh
   ```

3. Wildcard SSL sertifikası oluştur:
   ```bash
   sudo certbot certonly --manual --preferred-challenges=dns \
     -d "*.yourdomain.com" -d "yourdomain.com" \
     -m admin@yourdomain.com
   ```

4. Nginx'i yeniden yükle:
   ```bash
   sudo systemctl reload nginx
   ```

Daha fazla bilgi: `docs/EASYPANEL_AUTO_DEPLOY.md`

## 🔧 Sorun Giderme

### Build Hatası
- Logs sekmesinden hata mesajını oku
- GitHub repository'nin public olduğundan emin ol

### Database Bağlantı Hatası
- DATABASE_URL'deki host: `repodocs_postgres` (Easypanel internal)
- Password doğru mu kontrol et

### GitHub Login Çalışmıyor
- NEXTAUTH_URL doğru mu (https dahil)
- GitHub OAuth callback URL eşleşiyor mu
- NEXTAUTH_SECRET set mi

### Custom Domain Çalışmıyor
- DNS kaydı propagate oldu mu (1-24 saat)
- SSL sertifikası oluştu mu
- Easypanel logs'ta hata var mı

## 📚 Daha Fazla Bilgi

- Detaylı Easypanel rehberi: `docs/EASYPANEL_DEPLOY.md`
- Nginx otomasyonu: `docs/EASYPANEL_NGINX_DEPLOY.md`
- Custom domain: `docs/CUSTOM_DOMAIN_AUTOMATION.md`
- Deployment checklist: `DEPLOYMENT_CHECKLIST.md`

## 🎯 Sonraki Adımlar

1. ✅ Deploy tamamlandı
2. Custom domain'ler otomatik olarak yönetilecek
3. SSL sertifikası Let's Encrypt tarafından otomatik yenilenir
4. Nginx otomasyonunu (opsiyonel) daha sonra etkinleştirebilirsin

---

**Deployment Tarihi**: _______________
**Domain**: _______________
**Status**: ✅ Live

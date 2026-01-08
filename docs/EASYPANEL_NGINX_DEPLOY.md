# Easypanel + Nginx Otomasyonu Deploy Rehberi

Bu rehber, Easypanel'de deploy edilen RepoDocs'a Nginx otomasyonunu eklemek için adımları açıklar.

## Genel Bakış

Easypanel'de deploy ettiğinizde:
- Easypanel zaten Nginx reverse proxy'si sağlıyor
- SSL sertifikası Let's Encrypt tarafından otomatik yönetiliyor
- Custom domain'ler Easypanel tarafından yönetiliyor

**Nginx otomasyonu** ek olarak:
- Wildcard sertifika desteği ekler
- Subdomain'ler için otomatik SSL sağlar
- Certbot entegrasyonu ile sertifika yönetimini otomatikleştirir

## Seçenek 1: Easypanel Entegrasyonu (Önerilen)

Easypanel zaten custom domain'leri yönetiyorsa, Nginx otomasyonuna gerek yok.

### Kurulum

1. Easypanel API token'ını alın:
   - Easypanel Dashboard → Settings → API Tokens
   - Token'ı kopyalayın

2. `.env` dosyasını güncelleyin:
   ```env
   EASYPANEL_URL="https://your-easypanel-url"
   EASYPANEL_TOKEN="your-api-token"
   EASYPANEL_PROJECT="repodocs"
   EASYPANEL_SERVICE="app"
   ```

3. Deploy edin (Easypanel otomatik yeniden build edecek)

### Nasıl Çalışır

Custom domain eklendiğinde:
1. API endpoint'i çağrılır
2. Easypanel client domain'i Easypanel'e ekler
3. Easypanel otomatik olarak:
   - SSL sertifikası oluşturur
   - Nginx konfigürasyonunu günceller
   - Yönlendirmeyi yapılandırır

## Seçenek 2: Sunucu Seviyesi Nginx (VPS'de Easypanel varsa)

Eğer Easypanel'i kendi VPS'inizde çalıştırıyorsanız, Nginx otomasyonunu ekleyebilirsiniz.

### Gereksinimler

- Easypanel kurulu VPS
- Root erişimi
- Certbot kurulu

### Kurulum

1. **SSH ile sunucuya bağlanın:**
   ```bash
   ssh root@your-server-ip
   ```

2. **Certbot'u yükleyin (zaten kurulu değilse):**
   ```bash
   apt-get update
   apt-get install -y certbot python3-certbot-nginx
   ```

3. **Wildcard sertifika oluşturun:**
   ```bash
   sudo certbot certonly --manual --preferred-challenges=dns \
     -d "*.yourdomain.com" -d "yourdomain.com" \
     -m admin@yourdomain.com
   ```

4. **Easypanel'de environment variables ekleyin:**
   
   App service → Environment sekmesine git:
   ```env
   NGINX_ENABLED="true"
   NGINX_MAIN_DOMAIN="yourdomain.com"
   NGINX_SSL_PATH="/etc/letsencrypt/live"
   NGINX_CONFIG_PATH="/etc/nginx/sites-available"
   CERTBOT_EMAIL="admin@yourdomain.com"
   ```

5. **Deploy edin:**
   - Easypanel'de "Deploy" butonuna tıklayın
   - Uygulamayı yeniden başlatın

### DNS Ayarları

Sunucu DNS sağlayıcısında:
```
*.yourdomain.com  A  YOUR_SERVER_IP
yourdomain.com    A  YOUR_SERVER_IP
```

## Seçenek 3: Hibrit (Easypanel + Nginx)

Her iki sistemi de kullanabilirsiniz:

```env
# Easypanel
EASYPANEL_URL="https://your-easypanel-url"
EASYPANEL_TOKEN="your-api-token"
EASYPANEL_PROJECT="repodocs"
EASYPANEL_SERVICE="app"

# Nginx (opsiyonel)
NGINX_ENABLED="true"
NGINX_MAIN_DOMAIN="yourdomain.com"
NGINX_SSL_PATH="/etc/letsencrypt/live"
NGINX_CONFIG_PATH="/etc/nginx/sites-available"
CERTBOT_EMAIL="admin@yourdomain.com"
```

Sistem her ikisini de deneyecek ve başarılı olanları kullanacak.

## Easypanel'de Deploy Adımları

### 1. Environment Variables Ekleyin

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

# Easypanel Integration
EASYPANEL_URL=https://your-easypanel-url
EASYPANEL_TOKEN=your-api-token
EASYPANEL_PROJECT=repodocs
EASYPANEL_SERVICE=app

# Nginx Automation (opsiyonel)
NGINX_ENABLED=false
```

### 2. Deploy Edin

1. "Deploy" butonuna tıklayın
2. Build loglarını takip edin
3. Deploy tamamlanana kadar bekleyin

### 3. Database Migration

Deploy tamamlandıktan sonra:

1. App service → Terminal sekmesi
2. Şu komutu çalıştırın:
   ```bash
   npx prisma db push
   ```

### 4. Custom Domain Test Edin

1. Dashboard'dan custom domain ekleyin
2. DNS kaydını güncelleyin
3. Tarayıcıda test edin

## Sorun Giderme

### Custom Domain Çalışmıyor

```bash
# Easypanel container'ında terminal aç
# DNS kaydını kontrol et
nslookup yourdomain.com

# Nginx konfigürasyonunu test et
sudo nginx -t

# Nginx'i yeniden yükle
sudo systemctl reload nginx
```

### SSL Sertifikası Hatası

```bash
# Sertifika durumunu kontrol et
sudo certbot certificates

# Sertifikayı yenile
sudo certbot renew --force-renewal
```

### Easypanel API Hatası

1. API token'ın doğru olduğundan emin olun
2. Easypanel URL'i kontrol edin
3. Logs sekmesinden hata mesajını kontrol edin

## Faydalı Komutlar

```bash
# Easypanel container'ında terminal aç
docker exec -it repodocs-app bash

# Logs'u izle
docker logs -f repodocs-app

# Nginx konfigürasyonunu test et
sudo nginx -t

# Nginx'i yeniden yükle
sudo systemctl reload nginx

# Sertifika bilgisini göster
sudo certbot certificates

# Sertifikayı yenile
sudo certbot renew
```

## Kontrol Listesi ✅

- [ ] Easypanel'de app deploy edildi
- [ ] Environment variables eklendi
- [ ] Database migration yapıldı
- [ ] GitHub OAuth test edildi
- [ ] Custom domain eklendi
- [ ] DNS kaydı güncellendi
- [ ] SSL sertifikası çalışıyor
- [ ] Custom domain'den erişim sağlandı

## Sonraki Adımlar

1. Custom domain'ler otomatik olarak yönetilecek
2. SSL sertifikası Let's Encrypt tarafından otomatik yenilenir
3. Yeni custom domain eklendiğinde sistem otomatik olarak yapılandırır

Daha fazla bilgi için: `docs/CUSTOM_DOMAIN_AUTOMATION.md`

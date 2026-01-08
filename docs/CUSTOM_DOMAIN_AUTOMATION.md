# Custom Domain Automation Guide

Bu rehber, custom domain'leri otomatik olarak yönetmek ve SSL sertifikasını Let's Encrypt ile otomatikleştirmek için adım adım talimatlar sağlar.

## Genel Bakış

Projenizde custom domain'ler şu şekilde çalışır:

1. **Database**: Custom domain'ler `Project` modelinde saklanır
2. **Middleware**: Next.js middleware custom domain'leri algılar ve doğru projeye yönlendirir
3. **Otomasyonlar**: 
   - **Easypanel**: Hosting paneli entegrasyonu (opsiyonel)
   - **Nginx**: Sunucu seviyesi SSL ve yönlendirme (opsiyonel)

## Seçenek 1: Manuel Kurulum (Basit)

Eğer custom domain'leri manuel olarak yönetmek istiyorsanız:

1. Dashboard'dan custom domain ekleyin
2. DNS kaydını güncelleyin:
   ```
   CNAME  docs.yourdomain.com  yourdomain.com
   ```
3. Tarayıcıda test edin

**Avantajlar**: Basit, hızlı
**Dezavantajlar**: SSL sertifikası manuel yönetim gerekir

## Seçenek 2: Easypanel Entegrasyonu

Eğer Easypanel kullanıyorsanız, otomatik domain yönetimi:

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

3. Uygulamayı yeniden başlatın

### Kullanım

Custom domain eklendiğinde, Easypanel otomatik olarak:
- Domain'i ekler
- SSL sertifikasını oluşturur
- Yönlendirmeyi yapılandırır

## Seçenek 3: Nginx Otomasyonu (Önerilen)

Kendi VPS/sunucunuzda Nginx varsa, tam otomasyonu sağlar.

### Gereksinimler

- Ubuntu/Debian VPS
- Root erişimi
- Nginx kurulu (kurulum script'i yükleyecek)
- Let's Encrypt Certbot

### Kurulum

#### 1. Setup Script'ini Çalıştırın

```bash
# SSH ile sunucuya bağlanın
ssh root@your-server-ip

# Setup script'ini çalıştırın
sudo bash scripts/setup-nginx.sh
```

Script şunları yapacak:
- Nginx ve Certbot'u yükler
- Wildcard SSL sertifikası oluşturur
- Nginx konfigürasyonunu ayarlar
- Otomatik yenileme servisi'ni etkinleştirir

#### 2. DNS Kayıtlarını Güncelleyin

Sunucunuzun DNS sağlayıcısında:

```
*.yourdomain.com  A  YOUR_SERVER_IP
yourdomain.com    A  YOUR_SERVER_IP
```

DNS yayılması 1-24 saat sürebilir.

#### 3. .env Dosyasını Güncelleyin

```env
NGINX_ENABLED="true"
NGINX_MAIN_DOMAIN="yourdomain.com"
NGINX_SSL_PATH="/etc/letsencrypt/live"
NGINX_CONFIG_PATH="/etc/nginx/sites-available"
CERTBOT_EMAIL="admin@yourdomain.com"
```

#### 4. Uygulamayı Yeniden Başlatın

```bash
npm run build
npm start
```

### Nasıl Çalışır

1. **Custom Domain Ekleme**:
   - Dashboard'dan custom domain ekleyin
   - API endpoint'i Nginx client'ını çağırır
   - Nginx client Certbot ile SSL sertifikası oluşturur
   - Nginx konfigürasyonu otomatik yüklenir

2. **SSL Sertifikası**:
   - Wildcard sertifika (`*.yourdomain.com`) tüm subdomainleri kapsar
   - Let's Encrypt tarafından otomatik yönetilir
   - 90 günde bir otomatik yenilenir

3. **Yönlendirme**:
   - Nginx tüm custom domain'leri Next.js uygulamasına proxy'ler
   - Middleware custom domain'i algılar ve doğru projeyi yükler

### Sorun Giderme

#### SSL Sertifikası Hatası

```bash
# Sertifika durumunu kontrol edin
sudo certbot certificates

# Sertifikayı manuel olarak yenileyin
sudo certbot renew --force-renewal

# Nginx'i yeniden yükleyin
sudo systemctl reload nginx
```

#### Nginx Hatası

```bash
# Konfigürasyonu test edin
sudo nginx -t

# Nginx log'larını kontrol edin
sudo tail -f /var/log/nginx/error.log

# Nginx'i yeniden başlatın
sudo systemctl restart nginx
```

#### Domain Yönlendirilmiyor

```bash
# DNS kaydını kontrol edin
nslookup yourdomain.com
nslookup *.yourdomain.com

# Nginx'in çalışıp çalışmadığını kontrol edin
sudo systemctl status nginx

# Uygulamanın çalışıp çalışmadığını kontrol edin
curl http://localhost:3000
```

### Faydalı Komutlar

```bash
# Sertifika bilgisini göster
sudo certbot certificates

# Sertifikayı yenile
sudo certbot renew

# Nginx'i yeniden yükle
sudo systemctl reload nginx

# Nginx'i yeniden başlat
sudo systemctl restart nginx

# Nginx log'larını izle
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log

# Certbot otomatik yenileme durumunu kontrol et
sudo systemctl status certbot.timer
```

## Seçenek 4: Kombinasyon (Easypanel + Nginx)

Her iki sistemi de kullanabilirsiniz:

```env
# Easypanel
EASYPANEL_URL="https://your-easypanel-url"
EASYPANEL_TOKEN="your-api-token"
EASYPANEL_PROJECT="repodocs"
EASYPANEL_SERVICE="app"

# Nginx
NGINX_ENABLED="true"
NGINX_MAIN_DOMAIN="yourdomain.com"
NGINX_SSL_PATH="/etc/letsencrypt/live"
NGINX_CONFIG_PATH="/etc/nginx/sites-available"
CERTBOT_EMAIL="admin@yourdomain.com"
```

Sistem her ikisini de deneyecek ve başarılı olanları kullanacak.

## Mimarisi

```
┌─────────────────────────────────────────────────────────────┐
│                    User Browser                              │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
        ┌────────────────────────────────┐
        │  DNS Resolution                │
        │  docs.yourdomain.com → IP      │
        └────────────┬───────────────────┘
                     │
                     ▼
        ┌────────────────────────────────┐
        │  Nginx (Port 443 - HTTPS)      │
        │  - SSL Termination             │
        │  - Wildcard Certificate        │
        │  - Proxy to Next.js            │
        └────────────┬───────────────────┘
                     │
                     ▼
        ┌────────────────────────────────┐
        │  Next.js Middleware            │
        │  - Custom domain algıla        │
        │  - Doğru projeyi bul           │
        │  - /custom-domain route'una    │
        │    yönlendir                   │
        └────────────┬───────────────────┘
                     │
                     ▼
        ┌────────────────────────────────┐
        │  Custom Domain Page            │
        │  - Database'den proje bul      │
        │  - Docs'u yükle                │
        │  - Render et                   │
        └────────────────────────────────┘
```

## Güvenlik Notları

1. **SSL Sertifikası**: Tüm trafiği HTTPS üzerinden yönlendir
2. **CORS**: Custom domain'ler aynı origin'de çalışır
3. **Rate Limiting**: Nginx'de rate limiting ekleyin
4. **Firewall**: Sadece 80 ve 443 portlarını aç

## Performans İpuçları

1. **Caching**: Nginx'de static dosyaları cache'le
2. **Compression**: Gzip compression'ı etkinleştir
3. **CDN**: CloudFlare gibi CDN kullan
4. **Database**: Custom domain lookup'ı cache'le

## Sonraki Adımlar

1. Kurulum seçeneğini belirle
2. Setup script'ini çalıştır
3. DNS kayıtlarını güncelle
4. .env dosyasını yapılandır
5. Uygulamayı yeniden başlat
6. Custom domain ekle ve test et

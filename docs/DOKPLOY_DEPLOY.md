# RepoDocs - Dokploy Deployment Rehberi

Bu rehber RepoDocs'u Dokploy'a deploy etme adımlarını içerir.

## Neden Dokploy?

- ✅ **Public API** - Domain ekleme/silme otomatik
- ✅ **Otomatik SSL** - Let's Encrypt ile Traefik
- ✅ **Kolay Yönetim** - Modern UI
- ✅ **Docker Native** - Container yönetimi

## Gereksinimler

- Dokploy kurulu VPS (Contabo, Hetzner, vb.)
- PostgreSQL database
- Redis cache
- GitHub OAuth App

## Adım 1: Dokploy'da Proje Oluştur

1. Dokploy paneline gir: `https://your-vps-ip:3000`
2. **Projects** > **Create Project** > İsim: `repodocs`
3. **Create Application** > **Application**
4. Provider: **GitHub**
5. Repository: `doctorcmptrmita2/RepoDocs`
6. Branch: `main`

## Adım 2: Database Servisleri Ekle

### PostgreSQL
1. Proje içinde **Create Service** > **PostgreSQL**
2. İsim: `postgres`
3. Database: `repodocs`
4. User: `repodocs`
5. Password: (güçlü şifre)

### Redis
1. **Create Service** > **Redis**
2. İsim: `redis`
3. Password: (opsiyonel)

## Adım 3: Environment Variables

Application > **Environment** sekmesine git ve ekle:

```env
# Database
DATABASE_URL=postgresql://repodocs:PASSWORD@repodocs-postgres:5432/repodocs

# Redis
REDIS_URL=redis://repodocs-redis:6379

# NextAuth
NEXTAUTH_URL=https://repodocs.yourdomain.com
NEXTAUTH_SECRET=generate-with-openssl-rand-base64-32

# Domain
NEXT_PUBLIC_DOMAIN=repodocs.yourdomain.com

# GitHub OAuth
GITHUB_CLIENT_ID=your-client-id
GITHUB_CLIENT_SECRET=your-client-secret
GITHUB_WEBHOOK_SECRET=random-secret

# Dokploy API (Otomatik Domain için)
DOKPLOY_URL=https://your-vps-ip:3000
DOKPLOY_API_KEY=your-api-key
DOKPLOY_APPLICATION_ID=app-id-from-url
```

## Adım 4: Dokploy API Key Oluştur

1. Dokploy > **Settings** > **Profile**
2. **API/CLI Section** > **Generate Token**
3. Token'ı kopyala → `DOKPLOY_API_KEY`

## Adım 5: Application ID Bul

1. Application sayfasına git
2. URL'deki ID'yi kopyala: `https://dokploy:3000/dashboard/project/xxx/services/application/**APP_ID**`
3. Bu ID → `DOKPLOY_APPLICATION_ID`

## Adım 6: Build & Deploy

1. Application > **Deployments** > **Deploy**
2. Build loglarını takip et
3. Başarılı olunca **Domains** sekmesine git

## Adım 7: Ana Domain Ekle

1. **Domains** > **Create Domain**
2. Host: `repodocs.yourdomain.com`
3. Port: `3000`
4. HTTPS: ✅
5. Certificate: `Let's Encrypt`

## Adım 8: DNS Ayarları

Domain sağlayıcında:

```
repodocs.yourdomain.com  →  A  →  VPS_IP_ADDRESS
```

Wildcard subdomain için:
```
*.repodocs.yourdomain.com  →  A  →  VPS_IP_ADDRESS
```

## Adım 9: Database Migration

Dokploy > Application > **Terminal** veya SSH ile:

```bash
npx prisma db push
```

## Adım 10: Test

1. `https://repodocs.yourdomain.com` aç
2. GitHub ile login ol
3. Proje oluştur
4. Custom domain ekle → Otomatik Dokploy'a eklenmeli

## Custom Domain Akışı

```
Kullanıcı Dashboard'dan domain ekler
         ↓
RepoDocs API → Dokploy API (domain.create)
         ↓
Traefik otomatik SSL alır
         ↓
Domain aktif!
```

## Sorun Giderme

### Build Hatası
```bash
# Dokploy > Application > Deployments > Logs
```

### Database Bağlantı Hatası
- `DATABASE_URL` doğru mu?
- PostgreSQL servisi çalışıyor mu?
- Network aynı mı? (internal hostname kullan)

### Domain Eklenmiyor
- `DOKPLOY_API_KEY` geçerli mi?
- `DOKPLOY_APPLICATION_ID` doğru mu?
- API erişimi var mı?

### SSL Hatası
- DNS propagation bekle (5-10 dk)
- Traefik loglarını kontrol et

## Faydalı Komutlar

```bash
# Dokploy CLI (opsiyonel)
npm install -g dokploy-cli
dokploy login
dokploy deploy
```

## Kaynaklar

- [Dokploy Docs](https://docs.dokploy.com)
- [Dokploy API Reference](https://docs.dokploy.com/docs/api/reference-domain)
- [Traefik SSL](https://doc.traefik.io/traefik/https/acme/)

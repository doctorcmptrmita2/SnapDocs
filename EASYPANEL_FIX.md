# Easypanel Hata Düzeltmeleri

## Sorunlar ve Çözümler

### 1. Custom Domain Lookup Error (Fetch Failed)
**Sorun:** Edge Runtime'da fetch başarısız oluyor.
**Çözüm:** Middleware'de sadece header ekleniyor, DB sorgusu page'de yapılıyor.

### 2. Failed to Find Server Action "x"
**Sorun:** Next.js 16 standalone build'de server action uyumsuzluğu.
**Çözüm:** `next.config.js` güncellendi, server actions yapılandırması eklendi.

### 3. Webhook Error: Bad Credentials (401)
**Sorun:** GitHub token geçersiz veya eksik.
**Çözüm:** Error handling iyileştirildi, daha detaylı log eklendi.

## Easypanel'de Yapılması Gerekenler

### 1. Rebuild ve Redeploy
```bash
# Easypanel'de:
# 1. Project > Services > app
# 2. "Rebuild" butonuna tıkla
# 3. Build tamamlandıktan sonra "Deploy" butonuna tıkla
```

### 2. Environment Variables Kontrolü
Easypanel'de şu environment variable'ların doğru olduğundan emin ol:

```env
# Database
DATABASE_URL=postgresql://user:pass@repodocs_db:5432/repodocs

# Redis
REDIS_URL=redis://repodocs_redis:6379

# NextAuth
NEXTAUTH_URL=https://yourdomain.com
NEXTAUTH_SECRET=your-secret-here

# Domain
NEXT_PUBLIC_DOMAIN=yourdomain.com

# GitHub OAuth
GITHUB_CLIENT_ID=your-client-id
GITHUB_CLIENT_SECRET=your-client-secret

# Easypanel (Optional)
EASYPANEL_URL=https://lc58dd.easypanel.host
EASYPANEL_TOKEN=your-token
EASYPANEL_PROJECT=repodocs
EASYPANEL_SERVICE=app
```

### 3. GitHub Token Kontrolü
Webhook hatası için:

1. **Kullanıcı GitHub'a yeniden login olmalı:**
   - Dashboard'a git
   - Logout yap
   - Tekrar login ol (GitHub OAuth)
   - Bu yeni bir access token alacak

2. **Webhook'u yeniden oluştur:**
   - Project settings'e git
   - Webhook'u sil (varsa)
   - Yeniden oluştur

### 4. Logs Kontrolü
Easypanel'de logs'u kontrol et:
```bash
# Easypanel > Services > app > Logs
# Şu hataları görmemelisin:
# - "Custom domain lookup error"
# - "Failed to find Server Action"
# - "Bad credentials" (kullanıcı login olduktan sonra)
```

## Değişiklikler

### `next.config.js`
- Server actions yapılandırması eklendi
- Fetch logging kapatıldı

### `src/middleware.ts`
- Custom domain için sadece header ekleniyor
- Edge Runtime'da DB sorgusu yapılmıyor

### `src/app/api/webhook/github/route.ts`
- Daha iyi error handling
- Detaylı logging
- GitHub API hatalarında 200 dönüyor (retry önlemek için)

## Test

1. **Custom Domain Test:**
   - Custom domain ekle
   - DNS ayarlarını yap
   - Domain'e git, hata olmamalı

2. **Webhook Test:**
   - Logout/login yap
   - Webhook oluştur
   - Repo'ya push yap
   - Logs'da "Bad credentials" olmamalı

3. **Subdomain Test:**
   - `proje.yourdomain.com` gibi subdomain'e git
   - Docs görünmeli

## Notlar

- Tüm değişiklikler Easypanel'de rebuild gerektiriyor
- GitHub token sorunu için kullanıcılar yeniden login olmalı
- Custom domain hataları düzeltildi ama DNS propagation beklemek gerekebilir

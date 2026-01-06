# Easypanel Deploy Rehberi - RepoDocs

## Ön Gereksinimler
- Easypanel kurulu VPS (OVH veya başka)
- Domain (opsiyonel ama önerilir)
- GitHub hesabı (OAuth için)

---

## ADIM 1: GitHub OAuth App Oluştur

1. GitHub'a git: https://github.com/settings/developers
2. "New OAuth App" tıkla
3. Bilgileri doldur:
   - **Application name:** RepoDocs (veya istediğin isim)
   - **Homepage URL:** `https://repodocs.senindomain.com` (veya Easypanel'in vereceği URL)
   - **Authorization callback URL:** `https://repodocs.senindomain.com/api/auth/callback/github`
4. "Register application" tıkla
5. **Client ID**'yi not al
6. "Generate a new client secret" tıkla ve **Client Secret**'ı not al

> ⚠️ Client Secret sadece bir kez gösterilir, kaydet!

---

## ADIM 2: Easypanel'de Proje Oluştur

1. Easypanel dashboard'a gir
2. "Create Project" tıkla
3. Proje adı: `repodocs`

---

## ADIM 3: PostgreSQL Database Ekle

1. Proje içinde "+" tıkla → "Database" seç
2. **PostgreSQL** seç
3. Ayarlar:
   - **Name:** `postgres`
   - **Database:** `repodocs`
   - **Username:** `repodocs`
   - **Password:** Güçlü bir şifre oluştur (not al!)
4. "Create" tıkla
5. Oluşunca "Connection String"i kopyala:
   ```
   postgresql://repodocs:SIFRE@repodocs_postgres:5432/repodocs
   ```

---

## ADIM 4: Redis Ekle

1. Proje içinde "+" tıkla → "Database" seç
2. **Redis** seç
3. Ayarlar:
   - **Name:** `redis`
4. "Create" tıkla
5. Connection string:
   ```
   redis://repodocs_redis:6379
   ```

---

## ADIM 5: App Service Ekle (GitHub'dan)

1. Proje içinde "+" tıkla → "App" seç
2. **GitHub** seç
3. Repository'ni seç (veya URL yapıştır)
4. Ayarlar:
   - **Name:** `app`
   - **Branch:** `main`
   - **Build Method:** Dockerfile
   - **Dockerfile Path:** `Dockerfile`
   - **Port:** `3000`

---

## ADIM 6: Environment Variables Ayarla

App service'inde "Environment" sekmesine git ve şunları ekle:

```env
# Database (Easypanel internal network)
DATABASE_URL=postgresql://repodocs:POSTGRES_SIFREN@repodocs_postgres:5432/repodocs

# Redis (Easypanel internal network)
REDIS_URL=redis://repodocs_redis:6379

# NextAuth
NEXTAUTH_URL=https://repodocs.senindomain.com
NEXTAUTH_SECRET=BURAYA_RANDOM_32_KARAKTER

# GitHub OAuth
GITHUB_CLIENT_ID=github_oauth_client_id
GITHUB_CLIENT_SECRET=github_oauth_client_secret

# Webhook Secret
GITHUB_WEBHOOK_SECRET=BURAYA_RANDOM_SECRET
```

### Secret Oluşturma (Terminal'de):
```bash
# NEXTAUTH_SECRET için:
openssl rand -base64 32

# GITHUB_WEBHOOK_SECRET için:
openssl rand -hex 20
```

---

## ADIM 7: Domain Ayarla

1. App service'inde "Domains" sekmesine git
2. "Add Domain" tıkla
3. Domain gir: `repodocs.senindomain.com`
4. DNS'te A record ekle:
   - **Type:** A
   - **Name:** repodocs
   - **Value:** Sunucu IP adresi
5. SSL otomatik aktif olacak (Let's Encrypt)

---

## ADIM 8: Deploy Et

1. "Deploy" butonuna tıkla
2. Build loglarını takip et
3. İlk build 3-5 dakika sürebilir

---

## ADIM 9: Database Migration

Deploy tamamlandıktan sonra, Easypanel'de app container'ına terminal aç:

1. App service → "Terminal" sekmesi
2. Şu komutu çalıştır:
```bash
npx prisma db push
```

Veya Easypanel "Commands" özelliği varsa oradan çalıştır.

---

## ADIM 10: GitHub OAuth Callback URL Güncelle

Domain aldıysan, GitHub OAuth App'e dön ve callback URL'i güncelle:
```
https://repodocs.senindomain.com/api/auth/callback/github
```

---

## Kontrol Listesi ✅

- [ ] GitHub OAuth App oluşturuldu
- [ ] PostgreSQL database oluşturuldu
- [ ] Redis oluşturuldu
- [ ] App service oluşturuldu
- [ ] Environment variables eklendi
- [ ] Domain ayarlandı (opsiyonel)
- [ ] Deploy başarılı
- [ ] Database migration yapıldı
- [ ] Login test edildi

---

## Sorun Giderme

### Build Hatası
- Logs sekmesinden hata mesajını kontrol et
- Memory yetersizse Easypanel'de resource limit artır

### Database Bağlantı Hatası
- DATABASE_URL'deki host adının doğru olduğundan emin ol
- Easypanel internal network: `repodocs_postgres` formatında

### GitHub Login Çalışmıyor
- NEXTAUTH_URL'in doğru olduğundan emin ol (https dahil)
- GitHub OAuth callback URL'in eşleştiğinden emin ol
- NEXTAUTH_SECRET'ın set edildiğinden emin ol

### Redis Bağlantı Hatası
- REDIS_URL'deki host: `repodocs_redis` formatında

---

## Yararlı Komutlar

```bash
# Prisma migration
npx prisma db push

# Prisma studio (database görüntüle)
npx prisma studio

# Cache temizle (Redis CLI)
redis-cli FLUSHALL
```

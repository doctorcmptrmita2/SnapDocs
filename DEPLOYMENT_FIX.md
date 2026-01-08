# Deployment Fix - Database Migration

Deploy sonrası database migration'ı manuel olarak yapmanız gerekiyor.

## Sorunlar

1. **`sh: prisma: not found`** - Prisma production'da eksikti
2. **`Custom domain lookup error: fetch failed`** - Database boş olduğu için

## Çözüm

### 1. Dockerfile Güncellendi

Tüm `node_modules` şimdi production'a kopyalanıyor (Prisma dahil).

### 2. Database Migration - Manuel

Easypanel'de app container'ında terminal aç:

```bash
# Terminal'de çalıştır
npx prisma db push
```

Veya:

```bash
# Alternatif
npx prisma migrate deploy
```

### 3. Redeploy Et

Dockerfile güncellendiğinden, Easypanel'de:

1. App service → Deploy butonuna tıkla
2. Build tamamlanana bekle
3. Terminal'de migration çalıştır:
   ```bash
   npx prisma db push
   ```

## Adım Adım

### Easypanel'de

1. **App service seç**
2. **Deploy butonuna tıkla**
3. Build tamamlanana bekle (~3-5 dakika)
4. **Terminal sekmesine git**
5. Şu komutu çalıştır:
   ```bash
   npx prisma db push
   ```
6. "Database migrations complete" mesajı görünür

### Test Et

1. https://repodocs.yourdomain.com adresine git
2. GitHub ile login yap
3. Dashboard'dan proje ekle
4. Custom domain test et

## Logs Kontrol

Deployment sonrası logs'ta şunları görmelisin:

```
✅ Ready in XXms
✅ Connecting to Redis
✅ Redis connected successfully
```

Hata yoksa deployment başarılı.

## GitHub Token Sorunu

Logs'ta `Webhook error: Bad credentials` görürsen:

1. GitHub OAuth token'ını kontrol et
2. `.env` dosyasında `GITHUB_CLIENT_SECRET` doğru mu
3. Easypanel'de environment variables güncelle
4. Redeploy et

## Sonraki Adımlar

1. ✅ Dockerfile güncellendi
2. ⏳ Redeploy et
3. ⏳ Database migration çalıştır
4. ⏳ Custom domain test et
5. ⏳ Nginx setup (opsiyonel)

---

**Tavsiye**: Deployment başarılı olana kadar bu adımları takip et.

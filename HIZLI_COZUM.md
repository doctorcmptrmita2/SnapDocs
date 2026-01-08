# Hızlı Çözüm - Easypanel Hataları

## Yapılacaklar (Sırayla)

### 1. Easypanel'de Rebuild
```
1. Easypanel panel'e gir
2. Project > repodocs > Services > app
3. "Rebuild" butonuna tıkla
4. Build bitince "Deploy" butonuna tıkla
```

### 2. Environment Variables Kontrol
Easypanel'de şu değişkenlerin olduğundan emin ol:

**Zorunlu:**
- `DATABASE_URL` - PostgreSQL bağlantısı
- `REDIS_URL` - Redis bağlantısı
- `NEXTAUTH_URL` - Site URL'i (https://yourdomain.com)
- `NEXTAUTH_SECRET` - Random secret
- `NEXT_PUBLIC_DOMAIN` - Ana domain (yourdomain.com)
- `GITHUB_CLIENT_ID` - GitHub OAuth
- `GITHUB_CLIENT_SECRET` - GitHub OAuth

**Opsiyonel:**
- `EASYPANEL_URL` - Easypanel API
- `EASYPANEL_TOKEN` - Easypanel token
- `EASYPANEL_PROJECT` - repodocs
- `EASYPANEL_SERVICE` - app

### 3. GitHub Token Sorunu Çözümü
Webhook "Bad credentials" hatası için:

1. Site'ye git
2. Logout yap
3. Tekrar login ol (GitHub ile)
4. Dashboard'da webhook'u yeniden oluştur

### 4. Test
- Site açılıyor mu?
- Dashboard çalışıyor mu?
- Webhook hatası var mı? (logs'da kontrol et)

## Hatalar Düzeltildi

✅ Custom domain lookup error (fetch failed)
✅ Failed to find Server Action "x"
✅ Webhook error handling iyileştirildi

## Değişen Dosyalar

- `next.config.js` - Server actions config
- `src/middleware.ts` - Edge Runtime fix
- `src/app/api/webhook/github/route.ts` - Error handling
- `EASYPANEL_FIX.md` - Detaylı açıklama
- `HIZLI_COZUM.md` - Bu dosya

## Sorun Devam Ederse

Easypanel logs'u kontrol et:
```
Easypanel > Services > app > Logs
```

Şu hataları görmemelisin:
- "Custom domain lookup error"
- "Failed to find Server Action"
- "Bad credentials" (login sonrası)

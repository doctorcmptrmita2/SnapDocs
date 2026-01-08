# Deployment Checklist - RepoDocs + Nginx Otomasyonu

## Pre-Deployment

- [ ] Tüm kodlar commit edildi
- [ ] `.env.example` güncellenmiş
- [ ] Dockerfile test edildi
- [ ] Docker build başarılı
- [ ] Database migrations hazır

## Easypanel Deployment

### 1. GitHub OAuth Setup
- [ ] GitHub OAuth App oluşturuldu
- [ ] Client ID ve Secret alındı
- [ ] Callback URL doğru ayarlandı

### 2. Easypanel Project
- [ ] Proje oluşturuldu
- [ ] PostgreSQL database oluşturuldu
- [ ] Redis oluşturuldu
- [ ] App service oluşturuldu

### 3. Environment Variables
- [ ] DATABASE_URL ayarlandı
- [ ] REDIS_URL ayarlandı
- [ ] NEXTAUTH_URL ayarlandı
- [ ] NEXTAUTH_SECRET ayarlandı
- [ ] GITHUB_CLIENT_ID ayarlandı
- [ ] GITHUB_CLIENT_SECRET ayarlandı
- [ ] GITHUB_WEBHOOK_SECRET ayarlandı

### 4. Domain Setup
- [ ] Domain Easypanel'de eklendi
- [ ] DNS A record ayarlandı
- [ ] SSL sertifikası oluşturuldu
- [ ] HTTPS çalışıyor

### 5. Deploy
- [ ] Deploy başarılı
- [ ] Build logları kontrol edildi
- [ ] App sağlıklı çalışıyor

### 6. Database Setup
- [ ] Prisma migration yapıldı (`npx prisma db push`)
- [ ] Database tablolar oluşturuldu

## Nginx Otomasyonu Setup (Opsiyonel)

### 1. Sunucu Hazırlığı
- [ ] SSH erişimi sağlandı
- [ ] Root erişimi var
- [ ] Certbot kurulu

### 2. Wildcard Sertifika
- [ ] Wildcard sertifika oluşturuldu
- [ ] DNS TXT record'ları eklendi
- [ ] Sertifika doğrulandı

### 3. Environment Variables
- [ ] NGINX_ENABLED="true" ayarlandı
- [ ] NGINX_MAIN_DOMAIN ayarlandı
- [ ] CERTBOT_EMAIL ayarlandı

### 4. Deploy
- [ ] Easypanel'de redeploy yapıldı
- [ ] Nginx otomasyonu aktif

## Testing

### 1. Temel Fonksiyonlar
- [ ] Ana domain'den erişim sağlandı
- [ ] Login sayfası yükleniyor
- [ ] GitHub OAuth çalışıyor
- [ ] Dashboard erişilebiliyor

### 2. Custom Domain
- [ ] Custom domain eklendi
- [ ] DNS kaydı güncellendi
- [ ] Custom domain'den erişim sağlandı
- [ ] SSL sertifikası geçerli

### 3. Docs Viewer
- [ ] Docs yükleniyor
- [ ] Sidebar görünüyor
- [ ] İçerik render ediliyor
- [ ] Arama çalışıyor

### 4. Performance
- [ ] Sayfa yükleme hızı kabul edilebilir
- [ ] Cache çalışıyor
- [ ] Database sorguları hızlı

## Monitoring

### 1. Logs
- [ ] Easypanel logs kontrol edildi
- [ ] Hata mesajı yok
- [ ] Warning'ler kontrol edildi

### 2. Health Checks
- [ ] App sağlıklı çalışıyor
- [ ] Database bağlantısı aktif
- [ ] Redis bağlantısı aktif

### 3. SSL Sertifikası
- [ ] Sertifika geçerli
- [ ] Sertifika süresi kontrol edildi
- [ ] Otomatik yenileme aktif

## Post-Deployment

### 1. Backup
- [ ] Database backup yapılandırıldı
- [ ] Backup stratejisi belirlendi

### 2. Monitoring
- [ ] Error tracking (Sentry) kuruldu (opsiyonel)
- [ ] Uptime monitoring kuruldu (opsiyonel)
- [ ] Log aggregation kuruldu (opsiyonel)

### 3. Documentation
- [ ] Deployment dokümantasyonu güncellendi
- [ ] Troubleshooting rehberi oluşturuldu
- [ ] Team'e bilgi verildi

## Rollback Plan

- [ ] Önceki versiyon backup'ı var
- [ ] Rollback prosedürü belirlendi
- [ ] Database migration rollback planı var

## Go-Live

- [ ] Tüm kontroller tamamlandı
- [ ] Team onayı alındı
- [ ] Kullanıcılara duyuru yapıldı
- [ ] 24/7 monitoring aktif

---

## Hızlı Referans

### Easypanel Deploy Komutu
```bash
# Easypanel'de app service → Deploy
# Veya GitHub push yapıldığında otomatik deploy
```

### Database Migration
```bash
# Easypanel container'ında
npx prisma db push
```

### Nginx Sertifika Kontrol
```bash
sudo certbot certificates
```

### Logs İzleme
```bash
# Easypanel
docker logs -f repodocs-app

# Nginx
sudo tail -f /var/log/nginx/error.log
```

---

## İletişim

- **Deployment Sorunu**: Easypanel logs kontrol et
- **Database Sorunu**: Prisma studio aç (`npx prisma studio`)
- **Custom Domain Sorunu**: DNS ve SSL sertifikasını kontrol et
- **Performance Sorunu**: Redis cache'i kontrol et

---

**Deployment Tarihi**: _______________
**Deployed By**: _______________
**Status**: _______________

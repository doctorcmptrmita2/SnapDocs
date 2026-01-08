# Nginx Otomasyonu - Hızlı Başlangıç

## 5 Dakikalık Kurulum

### 1. Sunucuya Bağlan
```bash
ssh root@your-server-ip
```

### 2. Setup Script'ini Çalıştır
```bash
sudo bash scripts/setup-nginx.sh
```

### 3. DNS Kayıtlarını Güncelle
```
*.yourdomain.com  A  YOUR_SERVER_IP
yourdomain.com    A  YOUR_SERVER_IP
```

### 4. .env Dosyasını Güncelle
```env
NGINX_ENABLED="true"
NGINX_MAIN_DOMAIN="yourdomain.com"
CERTBOT_EMAIL="admin@yourdomain.com"
```

### 5. Uygulamayı Yeniden Başlat
```bash
npm run build && npm start
```

## Bitti! 🎉

Custom domain'ler artık otomatik olarak:
- SSL sertifikası alacak
- Nginx tarafından yönlendirilecek
- 90 günde bir otomatik yenileme yapılacak

## Sorun Giderme

```bash
# Sertifika durumu
sudo certbot certificates

# Nginx test
sudo nginx -t

# Nginx yeniden yükle
sudo systemctl reload nginx
```

Daha fazla bilgi için: `docs/CUSTOM_DOMAIN_AUTOMATION.md`

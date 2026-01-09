# Traefik On-Demand SSL Setup (Easypanel)

Easypanel zaten Traefik kullanıyor. Traefik'i on-demand SSL için yapılandırabiliriz.

## Adım 1: Traefik Environment Variables

Easypanel > Settings > Traefik > Environment:

```env
# On-demand SSL resolver
TRAEFIK_CERTIFICATESRESOLVERS_MYRESOLVER_ACME_EMAIL=admin@repodocs.dev
TRAEFIK_CERTIFICATESRESOLVERS_MYRESOLVER_ACME_STORAGE=/letsencrypt/acme.json
TRAEFIK_CERTIFICATESRESOLVERS_MYRESOLVER_ACME_TLSCHALLENGE=true

# Enable on-demand certificate
TRAEFIK_CERTIFICATESRESOLVERS_MYRESOLVER_ACME_CASERVER=https://acme-v02.api.letsencrypt.org/directory
```

## Adım 2: App Service Labels

Easypanel > repodocs > app > Advanced > Labels:

```yaml
# Catch-all router for custom domains
traefik.http.routers.repodocs-catchall.rule: HostRegexp(`{host:.+}`)
traefik.http.routers.repodocs-catchall.priority: 1
traefik.http.routers.repodocs-catchall.tls: true
traefik.http.routers.repodocs-catchall.tls.certresolver: myresolver
traefik.http.routers.repodocs-catchall.service: repodocs-app
traefik.http.services.repodocs-app.loadbalancer.server.port: 3000
```

## Adım 3: Traefik'i Yeniden Başlat

Easypanel > Settings > Traefik > Restart

## Adım 4: Test

1. Custom domain ekle: `test.example.com`
2. DNS ayarla: CNAME → repodocs.dev
3. `https://test.example.com` aç
4. SSL otomatik oluşturulmalı

## Önemli Notlar

1. **Rate Limiting**: Let's Encrypt rate limit'leri var (50 sertifika/hafta/domain)
2. **Validation**: Traefik domain'i validate etmeden sertifika alır, bu abuse'a açık olabilir
3. **Wildcard**: Bu yöntem wildcard sertifika almaz, her domain için ayrı sertifika alır

## Güvenlik

Abuse'u önlemek için middleware'de domain validation yapıyoruz:
- Sadece database'de kayıtlı domain'ler çalışır
- Kayıtlı olmayan domain'ler 404 döner

## Alternatif: Caddy

Caddy daha güvenli çünkü sertifika almadan önce domain'i verify eder.
Bkz: `docs/CADDY_SETUP.md`

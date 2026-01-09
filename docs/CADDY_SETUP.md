# Caddy Setup for Automatic Custom Domain SSL

Bu rehber, RepoDocs'ta custom domain'ler için otomatik SSL kurulumunu açıklar.

## Nasıl Çalışıyor?

1. Kullanıcı custom domain ekler: `docs.example.com`
2. DNS'i ayarlar: `docs.example.com` → `repodocs.dev` (CNAME)
3. `docs.example.com` açıldığında:
   - Caddy domain'i verify eder (`/api/domain/verify-caddy`)
   - Otomatik SSL sertifikası alır (Let's Encrypt)
   - Request'i Next.js app'e yönlendirir
4. Middleware domain'i tanır ve doğru projeyi gösterir

## Easypanel Kurulumu

### Adım 1: Caddy Servisi Oluştur

1. Easypanel > repodocs > + Service > App
2. Name: `caddy`
3. Source: Docker Image
4. Image: `caddy:2-alpine`

### Adım 2: Volumes Ekle

```
/data -> caddy_data (persistent)
/config -> caddy_config (persistent)
/etc/caddy/Caddyfile -> Caddyfile (config)
```

### Adım 3: Caddyfile Yükle

Easypanel'de Caddy servisi > Mounts > Add File:

```
Path: /etc/caddy/Caddyfile
Content: (aşağıdaki içerik)
```

```caddyfile
{
    email admin@repodocs.dev
    
    on_demand_tls {
        ask http://app:3000/api/domain/verify-caddy
        interval 1m
        burst 5
    }
}

:443 {
    tls {
        on_demand
    }
    
    reverse_proxy app:3000 {
        header_up Host {host}
        header_up X-Real-IP {remote_host}
        header_up X-Forwarded-For {remote_host}
        header_up X-Forwarded-Proto {scheme}
    }
}

:80 {
    redir https://{host}{uri} permanent
}
```

### Adım 4: Ports Ayarla

- 80:80 (HTTP)
- 443:443 (HTTPS)

### Adım 5: Network Ayarla

Caddy ve app aynı network'te olmalı. Easypanel bunu otomatik yapar.

### Adım 6: Deploy

Deploy butonuna tıkla.

## DNS Ayarları

Kullanıcılar şu DNS kaydını eklemeli:

```
Type: CNAME
Name: docs (veya subdomain)
Value: repodocs.dev
```

## Test

1. Dashboard'da custom domain ekle: `test.example.com`
2. DNS'i ayarla
3. `https://test.example.com` aç
4. SSL otomatik oluşturulmalı

## Alternatif: Traefik ile On-Demand SSL

Easypanel zaten Traefik kullanıyor. Traefik'te de on-demand SSL mümkün:

### Traefik Environment Variables

```
TRAEFIK_CERTIFICATESRESOLVERS_ONDEMAND_ACME_EMAIL=admin@repodocs.dev
TRAEFIK_CERTIFICATESRESOLVERS_ONDEMAND_ACME_STORAGE=/letsencrypt/acme.json
TRAEFIK_CERTIFICATESRESOLVERS_ONDEMAND_ACME_TLSCHALLENGE=true
```

### Traefik Labels (app service)

```
traefik.http.routers.repodocs-custom.rule=HostRegexp(`{host:.+}`)
traefik.http.routers.repodocs-custom.tls=true
traefik.http.routers.repodocs-custom.tls.certresolver=ondemand
```

## Sonuç

Caddy veya Traefik ile on-demand SSL kullanarak:
- ✅ Kullanıcı custom domain ekler
- ✅ DNS'i ayarlar
- ✅ SSL otomatik oluşturulur
- ✅ Easypanel'e manuel domain eklemeye gerek yok

# Wildcard Domain Setup for RepoDocs

Bu rehber, RepoDocs'ta custom domain'lerin otomatik çalışması için wildcard domain kurulumunu açıklar.

## Sorun

Easypanel'in public API'si yok. Her custom domain için manuel olarak Easypanel'e domain eklemek gerekiyor.

## Çözüm: Wildcard Domain

Wildcard domain kullanarak tüm subdomain'ler otomatik çalışır:
- `*.repodocs.dev` → Tüm subdomain'ler otomatik çalışır
- `project1.repodocs.dev` ✅
- `project2.repodocs.dev` ✅
- `myproject.repodocs.dev` ✅

## Kurulum Adımları

### 1. DNS Ayarları

Domain registrar'ınızda (Cloudflare, Namecheap, etc.):

```
Type: A
Name: @
Value: [Easypanel Server IP]

Type: A
Name: *
Value: [Easypanel Server IP]
```

### 2. Easypanel'de Wildcard Domain Ekleme

#### Adım 1: Certificate Resolver Oluştur

1. Easypanel > Settings > Traefik > Environment
2. Şu environment variable'ları ekle:

```
TRAEFIK_CERTIFICATESRESOLVERS_WILDCARD_ACME_EMAIL=admin@repodocs.dev
TRAEFIK_CERTIFICATESRESOLVERS_WILDCARD_ACME_STORAGE=/letsencrypt/acme.json
TRAEFIK_CERTIFICATESRESOLVERS_WILDCARD_ACME_DNSCHALLENGE=true
TRAEFIK_CERTIFICATESRESOLVERS_WILDCARD_ACME_DNSCHALLENGE_PROVIDER=cloudflare
```

#### Adım 2: DNS Provider Credentials

Cloudflare için:
```
CF_API_EMAIL=your-email@example.com
CF_API_KEY=your-cloudflare-api-key
```

Diğer provider'lar için: https://doc.traefik.io/traefik/https/acme/#providers

#### Adım 3: Traefik'i Yeniden Başlat

Easypanel > Settings > Traefik > Restart

#### Adım 4: Wildcard Domain Ekle

1. Easypanel > repodocs > app > Domains
2. Add Domain
3. Domain: `*.repodocs.dev`
4. Wildcard domain: ✅ Enable
5. Resolver: `wildcard`
6. Add

### 3. Test

```bash
curl -I https://test.repodocs.dev
curl -I https://anyproject.repodocs.dev
```

## Custom Domain'ler (docs.example.com)

Wildcard domain sadece subdomain'ler için çalışır. Tamamen farklı domain'ler (docs.example.com) için:

### Seçenek 1: Manuel Ekleme (Önerilen)

1. Kullanıcı DNS'i ayarlar: `docs.example.com` → `repodocs.dev`
2. Admin Easypanel'e domain ekler
3. SSL otomatik oluşturulur

### Seçenek 2: Cloudflare Proxy

1. Kullanıcı Cloudflare kullanır
2. CNAME: `docs.example.com` → `repodocs.dev`
3. Cloudflare SSL sağlar
4. Easypanel'e eklemeye gerek yok

## Mevcut Durum

| Domain Tipi | Otomatik | Manuel |
|-------------|----------|--------|
| `project.repodocs.dev` | ✅ Wildcard ile | - |
| `docs.example.com` | ❌ | ✅ Easypanel'e ekle |

## Sonuç

- Subdomain'ler (`*.repodocs.dev`) wildcard ile otomatik çalışır
- Custom domain'ler (`docs.example.com`) manuel ekleme gerektirir
- Easypanel'in public API'si olmadığı için tam otomasyon mümkün değil

# Custom Domains & Subdomains - Nasıl Yapılır?

RepoDocs için iki tür custom domain desteği:
1. **Subdomain**: `proje.repodocs.dev`
2. **Custom Domain**: `docs.example.com`

---

## 1. Subdomain Desteği (proje.repodocs.dev)

### A. DNS Ayarları (Cloudflare/DNS Provider)

```
Type: A
Name: *
Value: SUNUCU_IP_ADRESI
Proxy: OFF (veya ON - Cloudflare kullanıyorsan)
```

Bu wildcard DNS kaydı `*.repodocs.dev` → sunucu IP'sine yönlendirir.

### B. Easypanel SSL Ayarları

Easypanel'de wildcard SSL için Let's Encrypt DNS challenge gerekiyor:

1. Easypanel → Settings → SSL
2. Wildcard certificate için Cloudflare API token gerekli
3. Ya da Caddy/Traefik ile manuel wildcard SSL

**Alternatif (Daha Kolay):** Cloudflare Proxy kullanarak SSL Cloudflare'dan gelir.

### C. Kod Değişiklikleri

#### middleware.ts (Yeni dosya)
```typescript
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const host = request.headers.get('host') || '';
  const pathname = request.nextUrl.pathname;
  
  // Ana domain - normal routing
  if (host === 'repodocs.dev' || host === 'www.repodocs.dev') {
    return NextResponse.next();
  }
  
  // Subdomain kontrolü (proje.repodocs.dev)
  if (host.endsWith('.repodocs.dev')) {
    const subdomain = host.replace('.repodocs.dev', '');
    
    // API ve static dosyaları atla
    if (pathname.startsWith('/api') || pathname.startsWith('/_next')) {
      return NextResponse.next();
    }
    
    // Subdomain'i proje slug olarak kullan
    // /getting-started → /docs/[subdomain]/main/getting-started
    const version = 'main'; // veya URL'den al
    const newPath = pathname === '/' 
      ? `/docs/${subdomain}/${version}`
      : `/docs/${subdomain}/${version}${pathname}`;
    
    return NextResponse.rewrite(new URL(newPath, request.url));
  }
  
  // Custom domain kontrolü (docs.example.com)
  // Database'den domain → project mapping kontrol et
  // Bu kısım aşağıda detaylı
  
  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
```

---

## 2. Custom Domain Desteği (docs.example.com)

### A. Database Şeması (Zaten var)

```prisma
model Project {
  customDomain String? @unique  // docs.example.com
}
```

### B. Kullanıcı Tarafı (DNS Ayarı)

Kullanıcı kendi DNS'inde:
```
Type: CNAME
Name: docs
Value: repodocs.dev
```

### C. Easypanel'de Domain Ekleme

Her custom domain için Easypanel'de manuel domain eklenmeli:
1. Easypanel → App → Domains
2. "Add Domain" → `docs.example.com`
3. SSL otomatik alınır

**Otomasyon için:** Easypanel API kullanılabilir.

### D. Middleware Güncellemesi

```typescript
// Custom domain kontrolü
const project = await getProjectByDomain(host);
if (project) {
  const newPath = pathname === '/'
    ? `/docs/${project.slug}/${project.branch}`
    : `/docs/${project.slug}/${project.branch}${pathname}`;
  
  return NextResponse.rewrite(new URL(newPath, request.url));
}
```

### E. Domain Doğrulama API

```typescript
// /api/projects/[slug]/domain/verify
// Kullanıcının DNS'i doğru ayarladığını kontrol et
import dns from 'dns/promises';

async function verifyDomain(domain: string): Promise<boolean> {
  try {
    const records = await dns.resolveCname(domain);
    return records.includes('repodocs.dev');
  } catch {
    return false;
  }
}
```

---

## 3. Uygulama Adımları (Sıralı)

### Aşama 1: Subdomain (Kolay)

1. [ ] Cloudflare'da `*.repodocs.dev` A kaydı ekle
2. [ ] Cloudflare Proxy aç (SSL için)
3. [ ] `middleware.ts` oluştur
4. [ ] Test: `test.repodocs.dev` → `repodocs.dev/docs/test/main`

### Aşama 2: Custom Domain (Orta)

1. [ ] Settings sayfasına "Custom Domain" input ekle
2. [ ] Domain kaydetme API'si
3. [ ] DNS doğrulama endpoint'i
4. [ ] Middleware'e custom domain routing ekle
5. [ ] Easypanel API entegrasyonu (opsiyonel)

---

## 4. Easypanel Wildcard SSL (Detaylı)

Easypanel Caddy kullanıyor. Wildcard SSL için:

### Seçenek A: Cloudflare Proxy (Önerilen)

1. Cloudflare'da domain ekle
2. SSL/TLS → Full (Strict)
3. Wildcard DNS kaydı ekle
4. Proxy: ON

SSL Cloudflare'dan gelir, Easypanel'de sadece HTTP yeterli.

### Seçenek B: Let's Encrypt DNS Challenge

Easypanel → Settings → SSL Provider ayarlarında Cloudflare API token gerekli.

```
CF_API_TOKEN=your-cloudflare-api-token
```

---

## 5. Örnek Akış

### Subdomain
```
Kullanıcı: proje-adi.repodocs.dev/getting-started
↓
Middleware: host = proje-adi.repodocs.dev
↓
Rewrite: /docs/proje-adi/main/getting-started
↓
Sayfa render
```

### Custom Domain
```
Kullanıcı: docs.example.com/api/auth
↓
Middleware: host = docs.example.com
↓
DB Query: SELECT * FROM Project WHERE customDomain = 'docs.example.com'
↓
Rewrite: /docs/example-project/main/api/auth
↓
Sayfa render
```

---

## 6. Öncelik Sırası

1. **Hemen yapılabilir:** Subdomain desteği (sadece DNS + middleware)
2. **Sonra:** Custom domain (UI + API + doğrulama gerekli)

Subdomain ile başlayalım mı?

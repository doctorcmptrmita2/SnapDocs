# SnapDoc.dev v2.0 - Teknik Analiz & MVP Planı

## 🎯 Vizyon
**"The Most Reliable & High-Performance Bridge between Git and Docs"**

Git reposundaki Markdown dosyalarını anında profesyonel dokümantasyon sitesine çeviren SaaS platformu.

---

## 🔥 10x Fark: "The Healthy Docs Engine"

| Özellik | Rakipler | SnapDoc |
|---------|----------|---------|
| Kurulum | 15-30 dk config | 30 saniye OAuth |
| Veri Kaynağı | Her istekte API | Edge Cache (10ms) |
| Versiyonlama | Manuel config | Git-native (otomatik) |
| Docs Health | Yok | Kırık link + lint raporu |
| Rate Limit | Sorun | Webhook-based, sorun yok |

---

## 🏗️ Teknik Mimari

```
┌─────────────┐     ┌──────────────┐     ┌─────────────────┐
│   GitHub    │────▶│   Webhook    │────▶│  SnapDoc Worker │
│  (Push)     │     │  Endpoint    │     │  (Parse+Cache)  │
└─────────────┘     └──────────────┘     └────────┬────────┘
                                                  │
                                                  ▼
┌─────────────┐     ┌──────────────┐     ┌─────────────────┐
│  Visitor    │◀────│  Edge CDN    │◀────│   Edge KV/DB    │
│  (10ms)     │     │  (Global)    │     │  (Cached HTML)  │
└─────────────┘     └──────────────┘     └─────────────────┘
```

### Veri Akışı (Anti-Rate Limit)
1. Kullanıcı kodu push eder
2. GitHub Webhook → SnapDoc API tetiklenir
3. Worker: Dosyaları çeker → Parse → Edge KV'ye yazar
4. Ziyaretçi: GitHub'a gitmeden Edge'den 10ms'de döner

---

## 📦 Tech Stack

| Katman | Teknoloji | Neden |
|--------|-----------|-------|
| Framework | Next.js 14 (App Router) | Edge + ISR desteği |
| Styling | Tailwind CSS | Hızlı, utility-first |
| Auth | NextAuth.js + GitHub OAuth | Kolay entegrasyon |
| Database | Prisma + PostgreSQL (Neon) | Serverless, ölçeklenebilir |
| Cache | Vercel KV (Redis) | Edge-native, düşük latency |
| Markdown | unified + remark + rehype | Esnek pipeline |
| Syntax | Shiki | 150+ dil, VS Code temaları |
| Sanitize | rehype-sanitize | XSS koruması |
| Deploy | Vercel | Edge Functions, kolay CI/CD |

---

## 📅 3 Haftalık MVP Backlog

### Hafta 1: Temel Motor (The Core)
- [ ] Proje yapısı kurulumu
- [ ] GitHub OAuth entegrasyonu
- [ ] Markdown parser pipeline (remark/rehype/shiki)
- [ ] Temel UI: Sidebar + Content + Header
- [ ] Dosya yapısından otomatik navigasyon

### Hafta 2: Performans (The Speed)
- [ ] GitHub Webhook endpoint
- [ ] Edge KV cache sistemi
- [ ] Versiyonlama: Branch/Tag dropdown
- [ ] SEO: Meta tags, OpenGraph, Sitemap
- [ ] Incremental Static Regeneration

### Hafta 3: Pro & QA (The Value)
- [ ] Custom domain desteği
- [ ] Docs Linter: Kırık link raporu
- [ ] Dashboard: Proje yönetimi
- [ ] Landing page
- [ ] Stripe entegrasyonu (temel)

---

## 💰 Fiyatlandırma

| Plan | Fiyat | Özellikler |
|------|-------|------------|
| Hobby | $0 | 1 Public repo, *.snapdoc.dev subdomain |
| Pro | $12/ay | Sınırsız public, 1 private, custom domain |
| Team | $29/ay | Sınırsız private, versiyonlama, lint raporu |
| AI Add-on | +$10/ay | AI Search & Chat (kredi limitli) |

---

## 📁 Proje Yapısı

```
snapdoc/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── (marketing)/        # Landing, pricing
│   │   ├── (dashboard)/        # User dashboard
│   │   ├── (docs)/             # Docs viewer
│   │   └── api/                # API routes
│   │       ├── auth/           # NextAuth
│   │       ├── webhook/        # GitHub webhooks
│   │       └── docs/           # Docs API
│   ├── components/             # React components
│   │   ├── ui/                 # Shadcn/ui
│   │   ├── docs/               # Docs-specific
│   │   └── dashboard/          # Dashboard-specific
│   ├── lib/                    # Core utilities
│   │   ├── parser/             # Markdown pipeline
│   │   ├── github/             # GitHub API client
│   │   ├── cache/              # Edge KV operations
│   │   └── db/                 # Prisma client
│   └── types/                  # TypeScript types
├── prisma/
│   └── schema.prisma           # Database schema
├── public/                     # Static assets
└── config files...
```

---

## 🚀 Başlangıç Sorusu

**Rate limit ve performans için bu veriyi nerede cache'lemeyi planlıyorsun?**

Önerilen seçenekler:
1. **Vercel KV (Redis)** - Edge-native, düşük latency, $0-30/ay
2. **Cloudflare KV** - Global, ucuz, Cloudflare ekosistemi
3. **Upstash Redis** - Serverless, pay-per-request
4. **In-memory + ISR** - Basit başlangıç, sonra scale

MVP için önerim: **Vercel KV** - Next.js ile native entegrasyon, Edge Functions'da çalışır.

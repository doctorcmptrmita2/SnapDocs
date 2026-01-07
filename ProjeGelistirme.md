# RepoDocs.dev - Proje Geliştirme Yol Haritası

## ✅ Tamamlanan (MVP Core)

- [x] Next.js 16 + TypeScript kurulumu
- [x] Docker Compose (PostgreSQL + Redis)
- [x] GitHub OAuth entegrasyonu
- [x] Prisma veritabanı şeması
- [x] Markdown parser (remark/rehype + Shiki)
- [x] Redis cache sistemi
- [x] Dashboard (proje listesi)
- [x] Proje oluşturma sayfası
- [x] Proje ayarları sayfası
- [x] Docs viewer (sidebar + content + TOC)
- [x] Manuel cache refresh API

---

## 🚀 Öncelikli Geliştirmeler (Hafta 1-2)

### 1. Docs Viewer İyileştirmeleri
- [x] **Copy Code Button** - Kod bloklarında kopyalama ✅
- [x] **Dark Mode** - Tema değiştirici ✅
- [x] **Arama (Search)** - Tüm dokümanlarda full-text search ✅
- [x] **Breadcrumb** - Navigasyon yolu gösterimi ✅
- [x] **Prev/Next Navigation** - Dokümanlar arası geçiş ✅
- [x] **Mobile Responsive** - Hamburger menü, touch-friendly ✅

### 2. Versiyonlama (Git-Native)
- [x] Branch listesi çekme (main, develop, etc.) ✅
- [x] Tag listesi çekme (v1.0.0, v2.0.0) ✅
- [x] Version dropdown selector ✅
- [x] Her versiyon için ayrı cache ✅

### 3. GitHub Webhook (Auto-Sync)
- [x] Webhook handler (push events) ✅
- [x] Webhook kurulum API ✅
- [x] Webhook yönetim UI ✅
- [x] Webhook status dashboard'da göster ✅
- [ ] Sadece değişen dosyaları güncelle (incremental) - opsiyonel

### 4. Custom Domain
- [x] Domain ekleme UI ✅
- [x] DNS doğrulama (CNAME/A record) ✅
- [x] Middleware custom domain routing ✅
- [ ] SSL sertifikası (Let's Encrypt - hosting tarafında)

---

## 🎯 Değer Katan Özellikler (Hafta 3-4)

### 5. Docs Linter (Healthy Docs Engine)
- [ ] Kırık link tespiti (internal + external)
- [ ] Eksik frontmatter uyarısı
- [ ] Orphan sayfalar (hiçbir yerden link verilmemiş)
- [ ] Dashboard'da lint raporu
- [ ] CI/CD entegrasyonu (GitHub Action)

### 6. Analytics
- [ ] Sayfa görüntüleme sayısı
- [ ] Popüler dokümanlar
- [ ] Arama sorguları (ne arıyorlar?)
- [ ] 404 sayfaları (eksik içerik tespiti)

### 7. Tema & Branding
- [ ] Renk paleti seçimi
- [ ] Logo yükleme
- [ ] Favicon
- [ ] Footer özelleştirme
- [ ] Hazır tema şablonları

### 8. SEO & Performance
- [x] Sitemap.xml otomatik oluşturma ✅
- [x] robots.txt ✅
- [x] OpenGraph meta tags ✅
- [x] Twitter cards ✅
- [x] Canonical URLs ✅
- [ ] OpenGraph images (auto-generate) - opsiyonel
- [ ] JSON-LD structured data - opsiyonel
- [ ] Core Web Vitals optimizasyonu

---

## 💰 Monetizasyon (Hafta 5+)

### 9. Stripe Entegrasyonu
- [ ] Fiyatlandırma sayfası
- [ ] Checkout flow
- [ ] Subscription yönetimi
- [ ] Usage-based billing (API calls)
- [ ] Invoice/fatura

### 10. Team Features
- [ ] Organizasyon oluşturma
- [ ] Üye davet etme
- [ ] Role-based access (admin, editor, viewer)
- [ ] Audit log

---

## 🤖 AI Özellikleri (Gelecek)

### 11. AI Search & Chat
- [ ] Doküman embedding'leri (OpenAI/Cohere)
- [ ] Semantic search
- [ ] Chat interface ("Bu API nasıl kullanılır?")
- [ ] Kredi sistemi

### 12. AI Content Assist
- [ ] Otomatik özet oluşturma
- [ ] Çeviri önerileri
- [ ] Yazım/gramer kontrolü
- [ ] İçerik önerileri

---

## 🛠️ Teknik Borç & İyileştirmeler

- [ ] Error boundary'ler
- [ ] Loading states (skeleton)
- [ ] Rate limiting (API)
- [ ] Input validation (zod everywhere)
- [ ] Unit testler
- [ ] E2E testler (Playwright)
- [ ] CI/CD pipeline
- [ ] Logging & monitoring (Sentry)
- [ ] Database backup stratejisi

---

## 📊 Öncelik Matrisi

| Özellik | Etki | Efor | Öncelik |
|---------|------|------|---------|
| Search | Yüksek | Orta | ⭐⭐⭐ |
| Dark Mode | Orta | Düşük | ⭐⭐⭐ |
| Versiyonlama | Yüksek | Orta | ⭐⭐⭐ |
| Docs Linter | Yüksek | Orta | ⭐⭐⭐ |
| Custom Domain | Yüksek | Yüksek | ⭐⭐ |
| Analytics | Orta | Orta | ⭐⭐ |
| AI Search | Yüksek | Yüksek | ⭐ |
| Team Features | Orta | Yüksek | ⭐ |

---

## 🎬 Hemen Başlayabileceğimiz İşler

1. **Search** - Redis'te zaten veriler var, basit bir search endpoint yeterli
2. **Dark Mode** - Tailwind dark: prefix'leri ekle
3. **Copy Code Button** - Client component, 10 satır kod
4. **Prev/Next Nav** - Nav array'den hesapla
5. **Mobile Menu** - Sidebar'ı drawer yap

Hangisinden başlayalım?

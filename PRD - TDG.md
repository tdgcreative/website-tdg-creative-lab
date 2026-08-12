# PRD — Website The Digital Grounds (TDG Creative Lab)

**Versi:** 1.0
**Tanggal:** 11 Agustus 2026
**Disusun untuk:** Persiapan development website agency
**Tech Stack:** Astro (Static Site Generation)

---

## 1. Ringkasan Proyek

### 1.1 Latar Belakang
Klien adalah agency digital marketing & creative agency yang berbasis di Surabaya, Indonesia, dengan positioning sebagai pembangun "Digital & Brand Ecosystem" — bukan sekadar vendor layanan terpisah. Klien sudah dipercaya oleh 50+ brand dengan spesialisasi di industri Healthcare, Fashion, F&B, Sport, serta Architecture & Lifestyle.

### 1.2 ⚠️ Catatan Penamaan Brand (perlu dikonfirmasi ke klien)
Ditemukan dua penyebutan nama berbeda di aset yang diberikan:
- **Logo & Moodboard:** "The Digital Grounds"
- **Dokumen Copywriting:** "TDG Creative Lab"

Kemungkinan ini rebranding (TDG Creative Lab → The Digital Grounds) dan dokumen copywriting belum di-update, atau "TDG" adalah nama singkat yang tetap dipakai berdampingan. **Konfirmasi ke klien sebelum development**, karena ini akan menentukan:
- `<title>` tag & brand name di seluruh meta tag
- Nama di structured data (Organization/LocalBusiness schema)
- Domain, favicon, OG image
- Copywriting hero section ("TDG Creative Lab" vs "The Digital Grounds")

Dokumen ini sementara memakai **"The Digital Grounds"** sebagai nama utama (mengikuti logo, karena logo biasanya final), dengan "TDG" sebagai singkatan.

### 1.3 Tujuan Website
1. Menjadi kanal akuisisi klien baru (lead generation via form kontak).
2. Menampilkan portofolio & kapabilitas ekosistem digital secara meyakinkan.
3. **SEO-friendly dari fondasi** — terindeks dengan baik oleh Google, khususnya untuk pencarian lokal (Surabaya/Indonesia) terkait jasa digital marketing & creative agency.
4. Loading cepat & ringan (selaras dengan pilihan tech stack Astro).

### 1.4 Target Audience
Brand owner / marketing decision maker (PIC perusahaan) di industri Healthcare, Fashion, F&B, Sport, Architecture & Lifestyle, yang mencari partner ekosistem digital lengkap (bukan freelancer/vendor tunggal).

---

## 2. Brand Identity Reference

| Elemen | Detail |
|---|---|
| Nama brand | The Digital Grounds (TDG) — *perlu konfirmasi, lihat 1.2* |
| Warna background | `#E6E4E4` (light warm gray) |
| Warna dasar | `#000000` |
| Warna aksen utama | `#FF5000` (orange) |
| Warna aksen sekunder | `#FF7D00` (orange lebih terang) |
| Font | Helvetica (Family) |
| Lokasi bisnis | Surabaya, Indonesia |
| Tone & voice | Modern & direct, sistematis, tidak berbunga-bunga; kata ganti "kami" (tim) / "kita" (bersama klien) |

**Gaya visual (dari moodboard):** high-contrast, gradient oranye-ke-hitam, tipografi tebal/besar sebagai statement visual, layout grid ala carousel Instagram untuk showcase portofolio, campuran foto produk/potret dengan overlay teks pendek yang punchy.

---

## 3. Tech Stack & Arsitektur

| Layer | Pilihan | Alasan |
|---|---|---|
| Framework | **Astro** | Output HTML statis by default (zero-JS by default) → sangat ramah SEO & Core Web Vitals, cepat di-crawl Googlebot tanpa perlu render JS |
| Styling | Tailwind CSS (via `@astrojs/tailwind`) | Cepat implementasi desain berbasis moodboard, mudah maintain consistency warna/spacing |
| Image handling | `astro:assets` (built-in Image component) | Auto-optimize ke WebP/AVIF, auto `width`/`height` → mencegah layout shift (CLS) |
| Sitemap | `@astrojs/sitemap` | Auto-generate `sitemap-index.xml` saat build |
| Form kontak | Perlu backend eksternal (lihat §3.1) | Astro statis tidak punya backend form bawaan |
| Hosting | Vercel / Netlify / Cloudflare Pages | Semua support Astro SSG native, auto HTTPS, CDN global (bagus untuk LCP) |
| Analytics | Google Analytics 4 + Google Search Console | Wajib untuk monitoring SEO pasca-launch |

### 3.1 Solusi Form Kontak (Astro = static, butuh keputusan)
Karena Astro secara default tidak punya server untuk memproses submit form, perlu dipilih salah satu:
- **Form service pihak ketiga** (mis. Web3Forms, Formspree, atau Netlify Forms bila hosting di Netlify) — paling cepat diimplementasi, tanpa backend sendiri.
- **Astro API Route / Server Endpoint** (Astro mendukung mode hybrid/SSR untuk endpoint tertentu) → kirim ke email/WhatsApp API/Google Sheet.

*(Rekomendasi: mulai dengan form service pihak ketiga untuk MVP, bisa upgrade ke custom endpoint nanti.)*

---

## 4. Sitemap & Struktur Konten

Berdasarkan *Structure & Copywriting Guide V2* dari klien — **3 halaman utama**:

### 4.1 Home (`/`)
- **Hero:** Headline "The Digital Grounds" / "TDG Creative Lab" (sesuai keputusan §1.2) + sub-headline "Digital Marketing & Creative Agency. Based in Indonesia."
- **Core Pitch:** "Building The Digital & Brand Ecosystem." + copy kepercayaan 50+ brand
- **Portfolio Section:** "Some of Our Works" — 4 highlight klien (FAME, AIO Aesthetic Clinic, Tispun Bakeshop, Nara Dental) + CTA "View All Works" → `/works-and-services`
- **Industry Expertise:** Healthcare, Fashion, F&B, Sport, Architecture & Lifestyle

### 4.2 Works & Services (`/works-and-services`)
- Headline: "Our Works within The Digital & Brand Ecosystem"
- 4 kategori scope layanan (tabel): Content & Media Management, Brand & Digital Foundation, Visual Production & Documentation, Tactical Executions (catatan: kategori ke-4 bersifat eksklusif/tidak dipublikasikan detail, ada CTA "jadwalkan diskusi")
- Industry Expertise (repeat)

### 4.3 Contact (`/contact`)
- Headline: "Ready to Grow Your Brand?"
- Form: Nama Perusahaan, Lokasi Perusahaan, Nama PIC, No. WhatsApp PIC, Email PIC, Budget, Pesan/Kebutuhan
- Info kontak: Email, WhatsApp, Lokasi (Surabaya)

### 4.4 Halaman Tambahan yang Disarankan (di luar guideline, untuk kelengkapan teknis)
| Halaman | Alasan |
|---|---|
| `404.html` custom | Astro & Google Search sama-sama merekomendasikan halaman 404 kustom agar UX tetap terjaga saat broken link |
| Thank-you / konfirmasi setelah submit form | UX form yang baik + bisa jadi conversion tracking goal di GA4 |
| `robots.txt` & `sitemap-index.xml` | Wajib secara teknis untuk SEO (dibahas detail di `SEOskill.md`) |

> **Belum ada halaman About/Portfolio detail per-case-study/Blog** dalam guideline — jika roadmap ke depan butuh ini (misal untuk konten SEO jangka panjang / topical authority), catat sebagai fase 2, bukan blocker untuk launch pertama.

---

## 5. Komponen UI yang Dibutuhkan

- Navbar (sticky, minimal — 3 nav item + logo + CTA "Contact")
- Footer (kontak, sosial media, copyright)
- Hero section (per halaman, headline besar sesuai gaya Helvetica bold)
- Portfolio card/grid (gambar + nama klien + jenis layanan)
- Service scope table/cards (4 kategori)
- Industry expertise badge/tag list
- Contact form (dengan validasi client-side)
- CTA button (gaya sesuai moodboard: pill button oranye)

---

## 6. SEO Requirements (ringkas — detail lengkap di `SEOskill.md`)

- Setiap halaman: unique `<title>`, unique meta description, satu `<h1>`.
- Structured data: `Organization`/`ProfessionalService` + `LocalBusiness` (Surabaya) dalam format JSON-LD.
- Sitemap XML & robots.txt auto-generate saat build.
- URL slug deskriptif: `/`, `/works-and-services`, `/contact` (bukan `/page1`, dst).
- Semua gambar pakai `astro:assets` dengan `alt` text deskriptif.
- Core Web Vitals target: LCP < 2.5s, INP < 200ms, CLS < 0.1.
- Mobile-first (Google pakai mobile-first indexing — desain & test harus prioritas mobile).

---

## 7. Non-Functional Requirements

| Aspek | Target |
|---|---|
| Performance | Lighthouse Performance score ≥ 90 (mobile) |
| Responsive | Breakpoint minimal: mobile (375px), tablet (768px), desktop (1280px+) |
| Browser support | 2 versi terakhir Chrome, Safari, Firefox, Edge |
| Aksesibilitas dasar | Kontras warna teks vs background `#E6E4E4`/`#000000` dicek WCAG AA, semua form field punya `<label>` |
| Bahasa | Konten saat ini Bahasa Indonesia (campur istilah Inggris di beberapa copy) — konfirmasi ke klien apakah perlu versi EN di masa depan (mempengaruhi struktur URL/hreflang) |

---

## 8. Konten & Aset yang Masih Dibutuhkan dari Klien

- [ ] Email resmi TDG
- [ ] Nomor/link WhatsApp bisnis
- [ ] Foto/gambar high-res untuk 4 portfolio highlight (FAME, AIO Aesthetic Clinic, Tispun Bakeshop, Nara Dental) — untuk `alt text` dan optimasi gambar
- [ ] Logo dalam format vector (SVG) untuk favicon & OG image — saat ini hanya ada PNG transparan
- [ ] Konfirmasi nama brand final (§1.2)
- [ ] Domain yang akan dipakai (untuk setup Search Console, sitemap, canonical URL)
- [ ] Akun Google Business Profile sudah ada atau belum (penting untuk local SEO Surabaya)

---

## 9. Asumsi & Out of Scope (v1)

- Tidak ada blog/CMS di versi pertama (bisa jadi fase 2 untuk strategi konten SEO jangka panjang).
- Tidak ada multi-bahasa (ID only) kecuali dikonfirmasi lain oleh klien.
- Detail case study "Tactical Executions" sengaja tidak dipublikasikan di web (sesuai catatan klien) — hanya dibahas via diskusi langsung.
- E-commerce/payment tidak relevan untuk website profil agency ini.

---

## 10. Milestone Kerja (usulan)

1. **Setup & Foundation** — inisialisasi Astro project, integrasi Tailwind + sitemap + image optimization, setup layout dasar (Base Layout dengan SEO meta component)
2. **Build 3 halaman utama** sesuai copy & struktur di atas
3. **Implementasi SEO teknis** (lihat `SEOskill.md`) — meta tags, structured data, robots.txt, sitemap
4. **Integrasi form kontak** + testing
5. **QA:** cek responsive, Lighthouse audit, validasi structured data (Rich Results Test), broken link check
6. **Pre-launch:** submit sitemap ke Google Search Console, setup GA4, verifikasi domain
7. **Launch & monitoring**

# SEOskill.md — Panduan SEO Teknis untuk Website Astro (The Digital Grounds)

Disusun berdasarkan riset langsung ke dokumentasi resmi **Google Search Central**
(developers.google.com/search/docs) — Search Essentials, SEO Starter Guide, Core Web
Vitals, dan Structured Data guidelines — lalu diterjemahkan menjadi checklist teknis
yang spesifik untuk implementasi di **Astro**.

Gunakan file ini sebagai referensi kerja selama development, bukan sekadar dibaca sekali.

---

## 0. Prinsip Dasar (Search Essentials)

Google hanya bisa mengindeks halaman jika 3 syarat minimum ini terpenuhi:

1. **Googlebot tidak diblokir** — tidak ada `robots.txt` yang men-disallow, halaman
   tidak butuh login.
2. **Halaman merespons HTTP 200** — bukan halaman error (4xx/5xx).
3. **Konten bisa diindeks** — teks ada di HTML (bukan hanya di gambar), tidak melanggar
   spam policy Google.

Ketiga syarat ini **tidak menjamin ranking**, tapi tanpa ini halaman bahkan tidak akan
muncul di index sama sekali. Ini adalah baseline wajib sebelum bicara "SEO friendly"
dalam arti lebih luas.

Keuntungan besar memakai **Astro**: output default adalah HTML statis murni tanpa perlu
JavaScript untuk render konten utama. Ini menghindari kelas masalah "JavaScript SEO"
sepenuhnya (Googlebot harus render JS dulu sebelum bisa membaca konten di
framework client-side-rendered seperti React SPA murni) — konten TDG akan langsung
terbaca oleh crawler tanpa proses rendering tambahan.

---

## 1. Konfigurasi Astro Wajib

### 1.1 `astro.config.mjs` — set `site`
```js
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import tailwind from '@astrojs/tailwind';

export default defineConfig({
  site: 'https://www.thedigitalgrounds.com', // ganti dengan domain final
  integrations: [sitemap(), tailwind()],
});
```
`site` wajib diisi — dipakai `@astrojs/sitemap` untuk generate URL absolut di sitemap,
dan dipakai untuk generate canonical URL absolut per halaman.

### 1.2 Konsistensi URL (hindari duplicate content otomatis)
Google akan mencoba menyatukan (canonicalize) versi URL yang duplikat secara otomatis,
tapi lebih aman jika kita tegaskan dari awal:
- **Pilih satu:** trailing slash konsisten (`/contact/` atau `/contact`, jangan campur).
  Set via `trailingSlash: 'never'` atau `'always'` di `astro.config.mjs`.
- **Redirect non-www → www (atau sebaliknya)** dan **http → https** di level hosting
  (Vercel/Netlify/Cloudflare Pages sudah handle HTTPS redirect otomatis by default).
- Jangan biarkan halaman yang sama bisa diakses lewat 2 URL berbeda tanpa canonical/redirect
  — bukan pelanggaran, tapi berpotensi membingungkan user & memboroskan crawl budget.

---

## 2. SEO Component Pattern (Base Layout)

Buat 1 komponen `BaseHead.astro` yang menerima props per halaman, dipakai di semua layout:

```astro
---
// src/components/BaseHead.astro
interface Props {
  title: string;
  description: string;
  ogImage?: string;
  canonicalPath?: string; // contoh: "/works-and-services"
}
const { title, description, ogImage = '/og-default.jpg', canonicalPath = '' } = Astro.props;
const canonicalURL = new URL(canonicalPath, Astro.site);
---
<title>{title}</title>
<meta name="description" content={description} />
<link rel="canonical" href={canonicalURL} />
<meta name="viewport" content="width=device-width, initial-scale=1" />

<!-- Open Graph -->
<meta property="og:type" content="website" />
<meta property="og:title" content={title} />
<meta property="og:description" content={description} />
<meta property="og:image" content={new URL(ogImage, Astro.site)} />
<meta property="og:url" content={canonicalURL} />

<!-- Twitter/X card -->
<meta name="twitter:card" content="summary_large_image" />

<link rel="icon" href="/favicon.svg" type="image/svg+xml" />
```

**Kenapa `<link rel="canonical">` penting:** ini cara utama memberi tahu Google mana
URL "resmi" dari sebuah halaman jika ada kemungkinan diakses lewat variasi URL lain.

### 2.1 Aturan title & meta description per halaman
Bukan aturan kaku dari Google (tidak ada "wajib sekian karakter"), tapi praktik yang
membantu title/description tampil utuh di hasil pencarian:

| Halaman | Title (contoh) | Meta Description (contoh) |
|---|---|---|
| Home | `The Digital Grounds — Digital Marketing & Creative Agency Surabaya` | Ekosistem digital & brand lengkap: social media management, brand development, hingga produksi visual. Dipercaya 50+ brand di Surabaya & Indonesia. |
| Works & Services | `Layanan & Portofolio — The Digital Grounds` | Lihat scope layanan kami: Content & Media Management, Brand & Digital Foundation, Visual Production, hingga Tactical Executions. |
| Contact | `Hubungi Kami — The Digital Grounds` | Siap mengembangkan brand Anda? Sampaikan kebutuhan bisnis Anda dan tim kami siapkan kerangka eksekusinya. |

- Title unik per halaman, langsung menjelaskan isi halaman + nama brand.
- Description ringkas (1–2 kalimat), berisi poin paling relevan halaman tsb — ini yang
  akan dipakai Google sebagai *snippet* di hasil pencarian (meski Google kadang menyusun
  snippet-nya sendiri dari isi konten, bukan cuma dari meta description).
- **Jangan** isi meta keywords tag — Google Search **tidak memakainya sama sekali**,
  cukup skip.

### 2.2 Heading hierarchy
- Setiap halaman **hanya 1 `<h1>`** — biasanya headline hero section.
- Urutan heading (`h1` → `h2` → `h3`) tidak wajib sempurna secara SEO ranking (Google
  bilang ini tidak masalah kalau urut-urutannya tidak sempurna), tapi tetap disarankan
  rapi untuk aksesibilitas (screen reader).

---

## 3. Structured Data (JSON-LD)

Google merekomendasikan format **JSON-LD** dibanding Microdata/RDFa karena paling mudah
di-maintain dan bisa ditaruh terpisah dari markup visual (di dalam `<script type="application/ld+json">`).

### 3.1 Organization / ProfessionalService — pasang di semua halaman (via BaseHead atau Layout)
```astro
<script type="application/ld+json" set:html={JSON.stringify({
  "@context": "https://schema.org",
  "@type": "ProfessionalService",
  "name": "The Digital Grounds",
  "image": "https://www.thedigitalgrounds.com/logo.png",
  "url": "https://www.thedigitalgrounds.com",
  "telephone": "+62-XXX-XXXX-XXXX",
  "address": {
    "@type": "PostalAddress",
    "addressLocality": "Surabaya",
    "addressCountry": "ID"
  },
  "sameAs": [
    "https://instagram.com/xxxx"
  ]
})} />
```
- Pakai `ProfessionalService` (subtype dari `LocalBusiness`) karena TDG adalah bisnis
  jasa dengan lokasi fisik di Surabaya — ini yang paling relevan untuk local SEO.
- Isi hanya data yang **benar-benar akurat dan terlihat di halaman** — Google secara
  eksplisit melarang structured data untuk informasi yang tidak ditampilkan ke user.
- `sameAs` menghubungkan ke profil sosial media resmi (bantu Google memahami entitas
  brand yang sama di berbagai platform).

### 3.2 BreadcrumbList (opsional, tapi membantu tampilan breadcrumb di hasil pencarian)
Dengan hanya 3 halaman flat, breadcrumb tidak krusial, tapi bisa ditambahkan nanti jika
struktur URL berkembang (mis. halaman detail per case study).

### 3.3 Validasi wajib sebelum & sesudah deploy
- Development: cek dengan **[Rich Results Test](https://search.google.com/test/rich-results)**
- Setelah live: pantau **Rich result status report** di Search Console — structured data
  bisa "pecah" akibat perubahan template, jadi perlu dicek berkala, bukan sekali saja.

---

## 4. Gambar & Core Web Vitals

### 4.1 Wajib pakai `astro:assets`
```astro
---
import { Image } from 'astro:assets';
import heroImg from '../assets/hero.jpg';
---
<Image src={heroImg} alt="Tim The Digital Grounds sedang produksi konten untuk klien FAME" width={1200} height={800} />
```
- Auto-convert ke format modern (WebP/AVIF) → mempercepat LCP.
- `width`/`height` otomatis di-set → mencegah **Cumulative Layout Shift (CLS)** saat
  gambar baru selesai load.
- **Alt text wajib deskriptif** — bukan sekadar `"image1.jpg"`, jelaskan relasi gambar
  dengan konten sekitarnya (mis. nama klien/portofolio yang relevan).

### 4.2 Hero image (LCP element)
Gambar/hero section di atas fold biasanya jadi elemen **Largest Contentful Paint (LCP)**.
Untuk elemen ini secara khusus:
- Jangan lazy-load (`loading="eager"` atau default Astro untuk gambar above-the-fold).
- Pertimbangkan `fetchpriority="high"` pada tag `<img>` hero.
- Gambar lain di bawah fold (portfolio grid, dst) boleh lazy-load default.

### 4.3 Target Core Web Vitals (standar resmi Google)
| Metrik | Arti | Target "Good" |
|---|---|---|
| **LCP** (Largest Contentful Paint) | Kecepatan loading elemen konten terbesar | < 2.5 detik |
| **INP** (Interaction to Next Paint) | Responsivitas terhadap interaksi user | < 200 ms |
| **CLS** (Cumulative Layout Shift) | Stabilitas visual (elemen tidak "loncat") | < 0.1 |

Astro sangat membantu di sini karena default-nya minim JavaScript (mengurangi risiko
INP buruk). Kalau ada komponen interaktif (form, dropdown, dsb) yang butuh JS, pakai
**Astro Islands** dengan directive `client:visible` atau `client:idle` — bukan
`client:load` untuk semua komponen — supaya JS tidak dieksekusi lebih awal dari perlu.

Cek performa dengan **PageSpeed Insights** (pagespeed.web.dev) dan pantau tren jangka
panjang lewat **Core Web Vitals report di Search Console** (data real-user, bukan lab).

---

## 5. `robots.txt` & Sitemap

### 5.1 `public/robots.txt`
```
User-agent: *
Allow: /

Sitemap: https://www.thedigitalgrounds.com/sitemap-index.xml
```
Karena semua halaman TDG ditujukan untuk publik (tidak ada halaman admin/private di
scope v1), tidak perlu `Disallow` apa pun kecuali nanti ada halaman thank-you page yang
sebaiknya tidak muncul di hasil pencarian (opsional, lihat §5.3).

### 5.2 Sitemap — otomatis via `@astrojs/sitemap`
Setelah integrasi terpasang (§1.1), Astro otomatis generate `sitemap-index.xml` +
`sitemap-0.xml` saat build, berisi semua halaman statis yang di-build. Tidak perlu
dibuat manual.

### 5.3 Halaman yang sebaiknya di-`noindex` (bukan di robots.txt, tapi meta tag)
Kalau ada thank-you/confirmation page setelah submit form kontak, tambahkan:
```html
<meta name="robots" content="noindex" />
```
di halaman tsb — supaya tidak muncul sebagai hasil pencarian terpisah yang membingungkan
(karena isinya bukan konten untuk ditemukan lewat search, hanya konfirmasi transaksional).
Catatan: blokir via `robots.txt` **tidak** mencegah URL muncul di hasil pencarian
(hanya mencegah crawling) — untuk benar-benar mencegah indexing, harus pakai `noindex`.

---

## 6. Local SEO (Surabaya)

Karena TDG punya lokasi fisik dan target klien yang kemungkinan besar mencari "agency
Surabaya" / "digital marketing agency Indonesia":

1. **Google Business Profile** — pastikan klien punya/klaim profil bisnisnya, dengan
   nama, alamat, telepon (NAP) yang **identik persis** dengan yang ada di website
   (inkonsistensi NAP bisa membingungkan sinyal lokal).
2. Cantumkan alamat/kota di halaman Contact secara jelas dalam teks (bukan cuma di
   gambar/logo), karena ini membantu Google memahami relevansi lokal halaman tsb.
3. `ProfessionalService` structured data (§3.1) dengan `address` yang benar.

---

## 7. Kata Kunci & Pemetaan Konten per Halaman (brainstorm awal)

Berdasarkan copy & scope layanan yang sudah ada di guideline klien, berikut draft target
topik/kata kunci per halaman (untuk didiskusikan lebih lanjut, bukan hasil riset volume
pencarian — perlu divalidasi dengan Google Keyword Planner/tools sejenis sebelum final):

| Halaman | Topik/kata kunci draft |
|---|---|
| Home | digital marketing agency Surabaya, creative agency Indonesia, brand ecosystem agency |
| Works & Services | jasa social media management, brand development agency, jasa website development Surabaya, KOL management, event documentation |
| Contact | kontak digital marketing agency Surabaya, konsultasi brand agency |

Catatan penting dari Google sendiri: **jangan cuma mikirin exact keyword match** —
tulis natural untuk pembaca manusia (PIC marketing/brand owner), karena sistem Google
sudah cukup canggih memahami relevansi topik meski kata yang dipakai user saat mencari
tidak persis sama dengan kata di halaman.

---

## 8. Hal yang **TIDAK PERLU** Dikhawatirkan

Langsung dari dokumentasi resmi Google — supaya waktu development tidak habis untuk
hal yang tidak berdampak:

- ❌ Meta keywords tag — tidak dipakai Google sama sekali.
- ❌ Keyword stuffing (mengulang-ulang kata kunci) — malah melanggar spam policy.
- ❌ Panjang/pendek konten sebagai patokan mutlak — tidak ada jumlah kata minimum ajaib.
- ❌ Urutan heading harus sempurna (h1→h2→h3 tanpa lompat) — tidak berpengaruh ke ranking.
- ❌ Subdomain vs subdirectory — pilih yang paling masuk akal secara bisnis, bukan SEO.
- ❌ Percaya "E-E-A-T adalah ranking factor" — ini bukan sinyal ranking langsung.
- ❌ Keyword di nama domain — dampaknya sangat kecil, hampir tidak ada, kecuali sekadar muncul di breadcrumb URL.

---

## 9. Pre-Launch & Post-Launch Checklist

### Sebelum launch
- [ ] `site` di `astro.config.mjs` sudah diisi domain final
- [ ] Semua halaman punya title & meta description unik
- [ ] Semua gambar pakai `astro:assets` + alt text terisi
- [ ] Structured data lolos Rich Results Test tanpa error
- [ ] `robots.txt` accessible di `/robots.txt`, tidak sengaja block seluruh situs
      (cek tidak ada `Disallow: /` yang ketinggalan dari mode development)
- [ ] Sitemap accessible di `/sitemap-index.xml`
- [ ] Test mobile-first: cek tampilan & fungsi di viewport mobile dulu, baru desktop
- [ ] Lighthouse audit (mobile) — Performance, Accessibility, Best Practices, SEO ≥ 90

### Setelah launch
- [ ] Verifikasi domain di **Google Search Console**
- [ ] Submit sitemap di Search Console
- [ ] Setup **Google Analytics 4** + conversion goal untuk submit form kontak
- [ ] Cek indexing status per halaman lewat **URL Inspection Tool**
- [ ] Pantau **Core Web Vitals report** & **Rich Result status** secara berkala (bukan
      sekali cek lalu lupa — bisa berubah karena perubahan konten/template)
- [ ] Cek `site:namadomain.com` di Google untuk memastikan halaman benar-benar terindeks

---

## Sumber Referensi
Semua panduan di atas dirangkum dari dokumentasi resmi Google Search Central:
- Search Essentials & Technical Requirements — developers.google.com/search/docs/essentials
- SEO Starter Guide — developers.google.com/search/docs/fundamentals/seo-starter-guide
- Core Web Vitals — developers.google.com/search/docs/appearance/core-web-vitals
- Structured Data Intro — developers.google.com/search/docs/appearance/structured-data/intro-structured-data

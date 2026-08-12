# 🌐 The Digital Grounds — Company Profile Website

<p align="center">
  <img src="./public/TDG LOGO TRANSPARENT.png" alt="The Digital Grounds Logo" width="120" />
</p>

<p align="center">
  <strong>Premium Multi-Language (Indonesian/English) Website for TDG Creative Lab</strong>
</p>

<p align="center">
  <a href="https://astro.build"><img src="https://img.shields.io/badge/Astro-v7.2.0-ff5a03?style=for-the-badge&logo=astro&logoColor=white" alt="Astro version" /></a>
  <a href="https://tailwindcss.com"><img src="https://img.shields.io/badge/Tailwind_CSS-v4.0-06b6d4?style=for-the-badge&logo=tailwindcss&logoColor=white" alt="Tailwind CSS version" /></a>
  <a href="https://www.typescriptlang.org/"><img src="https://img.shields.io/badge/TypeScript-Strict-3178c6?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript Strict" /></a>
</p>

---

## 🚀 Overview

This repository contains the complete source code for **The Digital Grounds** (also known as **TDG Creative Lab**), a premium digital marketing and creative agency based in Surabaya, Indonesia. 

The website is designed with a high-contrast, modern layout featuring dynamic brand-orange accents, smooth micro-animations, and full multi-language capabilities. It is built as a **Static Site (SSG)** using Astro to achieve instantaneous loading speeds, zero client-side JavaScript overhead by default, and excellent **Core Web Vitals**.

---

## 🛠️ Tech Stack & Integrations

- **Framework**: [Astro](https://astro.build/) (Static Site Generation - SSG) 🚀
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/) (using the new fast `@tailwindcss/vite` compiler) 🎨
- **SEO & Sitemap**: [@astrojs/sitemap](https://docs.astro.build/en/guides/integrations-guide/sitemap/) (automates indexing XML schemas) 🔍
- **Coding Standards**: Strict TypeScript for type safety ⚙️

---

## 📂 Project Structure

```bash
├── public/
│   ├── TDG LOGO TRANSPARENT.png   # Original brand logo
│   └── robots.txt                 # Search engine crawler directives
├── src/
│   ├── components/
│   │   ├── BaseHead.astro         # Meta tags, OpenGraph, Canonical, and JSON-LD schema
│   │   ├── Navbar.astro           # Sticky navigation header with language switcher
│   │   ├── Footer.astro           # Dynamic footer with localized NAP info
│   │   └── PortfolioCard.astro    # Showcase portfolio item cards with hover animations
│   ├── i18n/
│   │   ├── ui.ts                  # Localization dictionary files (ID and EN)
│   │   └── utils.ts               # Translation routing utilities & path-preserver
│   ├── layouts/
│   │   └── BaseLayout.astro       # Main wrapper layout template
│   ├── pages/
│   │   ├── index.astro            # Home page (Indonesian - Default)
│   │   ├── works-and-services.astro # Works & Services page (Indonesian)
│   │   ├── contact.astro          # Contact page (Indonesian)
│   │   ├── 404.astro              # Custom 404 error page (noindex)
│   │   ├── thanks.astro           # Contact form thanks page (noindex)
│   │   └── en/                    # English Locale directory (/en/)
│   │       ├── index.astro        # Home page (English)
│   │       ├── works-and-services.astro # Works & Services page (English)
│   │       ├── contact.astro      # Contact page (English)
│   │       └── thanks.astro       # Contact form thanks page (English)
│   └── styles/
│       └── global.css             # Tailwind v4 theme configurations & base styles
├── astro.config.mjs               # Astro project configurations (i18n & integrations)
├── package.json                   # Project packages and execution scripts
└── tsconfig.json                  # TypeScript compiler settings
```

---

## 🌐 Multi-Language (i18n) Setup

The project implements Astro's native multi-language routing with `prefixDefaultLocale: false` to ensure a clean Indonesian-first mapping alongside a sub-folder based English language interface.

- **Bahasa Indonesia** (Default locale): Hosted at `/`
  - *Example page*: `/works-and-services`
- **English** (Secondary locale): Hosted with a `/en` prefix
  - *Example page*: `/en/works-and-services`

### 🔄 Path-Preserving Language Switcher
The language switcher in the navigation bar maintains the user's active page path when switching languages. For instance:
- Clicking "EN" while on `/works-and-services` redirects cleanly to `/en/works-and-services`.
- Clicking "ID" while on `/en/contact` redirects cleanly to `/contact`.

### 🔤 Localization Dictionaries
All core UI text (form labels, buttons, headers, navigation, confirmation pages) is localized dynamically via a dictionary mapping. You can inspect or update translations inside [src/i18n/ui.ts](file:///Users/basdmo/Documents/Website%20TDG%20Creative%20Lab/src/i18n/ui.ts).

---

## ⚡ Key Visual & Design Variables

Astro utilizes Tailwind CSS v4's new CSS variable theme definition inside [src/styles/global.css](file:///Users/basdmo/Documents/Website%20TDG%20Creative%20Lab/src/styles/global.css):
- **Background (`--color-brand-bg`)**: Warm Light Gray (`#E6E4E4`)
- **Dark/Base (`--color-brand-dark`)**: Pitch Black (`#000000`)
- **Primary Accent (`--color-brand-orange`)**: Neon Orange (`#FF5000`)
- **Secondary Accent (`--color-brand-orange-light`)**: Light Amber Orange (`#FF7D00`)

---

## 📈 Search Engine Optimization (SEO) & Performance

- **One H1 Rule**: Strictly enforced across all page layouts for semantic HTML structure.
- **Canonical URLs**: Generated dynamically using canonical path helpers to prevent duplicate content crawling penalties.
- **JSON-LD Schema**: Embeds a robust `ProfessionalService` local business schema for Surabaya on indexable pages.
- **Index Controls**: The customized `404` and `thanks` paths contain `<meta name="robots" content="noindex" />` to block duplicate or utility pages from search results.
- **XML Sitemaps**: Auto-generated via `@astrojs/sitemap` inside `dist/sitemap-index.xml` upon build.

---

## 🏃 Getting Started

### 📋 Prerequisites
Make sure you have Node.js installed (v22.12.0 or higher is recommended):
```bash
node --version
```

### 📥 Installation
1. Install project dependencies:
   ```bash
   npm install
   ```

### 🚀 Running the Project
- **Start local development server** with hot reload:
  ```bash
  npm run dev
  ```
  Open **[http://localhost:4321](http://localhost:4321)** in your browser.

- **Build for production**:
  ```bash
  npm run build
  ```
  This creates optimized static files in the `/dist` directory.

- **Preview the production build locally**:
  ```bash
  npx astro preview
  ```

---

## 📞 Client Content Placeholders

The project currently uses the following default values. You can update these inside [src/components/Footer.astro](file:///Users/basdmo/Documents/Website%20TDG%20Creative%20Lab/src/components/Footer.astro), [src/pages/contact.astro](file:///Users/basdmo/Documents/Website%20TDG%20Creative%20Lab/src/pages/contact.astro), and [src/components/BaseHead.astro](file:///Users/basdmo/Documents/Website%20TDG%20Creative%20Lab/src/components/BaseHead.astro):
- **Official Email**: `hello@thedigitalgrounds.com`
- **WhatsApp Link**: `+62 812-3456-789`
- **Office Location**: Surabaya, Jawa Timur, Indonesia
- **Official Domain**: `https://www.thedigitalgrounds.com`

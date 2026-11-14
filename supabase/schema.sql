-- ============================================================================
-- TDG Creative Lab — Supabase Database Schema & Storage Setup
-- Project Ref: cpvbgcdgmyfgnwcvrwxq
-- Jalankan script ini di Supabase Dashboard -> SQL Editor (atau via `supabase db push`)
-- ============================================================================

-- 1. Tabel Blog Articles (Menyimpan artikel blog bilingual ID & EN)
CREATE TABLE IF NOT EXISTS public.blog_articles (
  id TEXT PRIMARY KEY,
  category TEXT NOT NULL DEFAULT 'Content & Media Management',
  cover_image TEXT NOT NULL DEFAULT '/images/portfolio/fame.jpg',
  author TEXT NOT NULL DEFAULT 'The Digital Grounds Team',
  published_at DATE NOT NULL DEFAULT CURRENT_DATE,
  updated_at DATE NOT NULL DEFAULT CURRENT_DATE,
  featured BOOLEAN NOT NULL DEFAULT false,
  status TEXT NOT NULL DEFAULT 'published',
  id_lang JSONB NOT NULL DEFAULT '{}'::jsonb,
  en_lang JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. Tabel Site Settings (Menyimpan konfigurasi Global: WhatsApp, Meta Pixel, GTM, & Konten Halaman)
CREATE TABLE IF NOT EXISTS public.site_settings (
  key TEXT PRIMARY KEY,
  data JSONB NOT NULL DEFAULT '{}'::jsonb,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. Enable Row Level Security (RLS) & Policies
ALTER TABLE public.blog_articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow public read blog_articles" ON public.blog_articles;
CREATE POLICY "Allow public read blog_articles"
  ON public.blog_articles FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Allow admin insert blog_articles" ON public.blog_articles;
CREATE POLICY "Allow admin insert blog_articles"
  ON public.blog_articles FOR INSERT
  WITH CHECK (true);

DROP POLICY IF EXISTS "Allow admin update blog_articles" ON public.blog_articles;
CREATE POLICY "Allow admin update blog_articles"
  ON public.blog_articles FOR UPDATE
  USING (true)
  WITH CHECK (true);

DROP POLICY IF EXISTS "Allow admin delete blog_articles" ON public.blog_articles;
CREATE POLICY "Allow admin delete blog_articles"
  ON public.blog_articles FOR DELETE
  USING (true);

DROP POLICY IF EXISTS "Allow public read site_settings" ON public.site_settings;
CREATE POLICY "Allow public read site_settings"
  ON public.site_settings FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Allow admin insert site_settings" ON public.site_settings;
CREATE POLICY "Allow admin insert site_settings"
  ON public.site_settings FOR INSERT
  WITH CHECK (true);

DROP POLICY IF EXISTS "Allow admin update site_settings" ON public.site_settings;
CREATE POLICY "Allow admin update site_settings"
  ON public.site_settings FOR UPDATE
  USING (true)
  WITH CHECK (true);

-- 4. Setup Storage Bucket untuk Upload Gambar (Media)
INSERT INTO storage.buckets (id, name, public)
VALUES ('media', 'media', true)
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "Public Access Media" ON storage.objects;
CREATE POLICY "Public Access Media"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'media');

DROP POLICY IF EXISTS "Admin Upload Media" ON storage.objects;
CREATE POLICY "Admin Upload Media"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'media');

DROP POLICY IF EXISTS "Admin Update Media" ON storage.objects;
CREATE POLICY "Admin Update Media"
  ON storage.objects FOR UPDATE
  USING (bucket_id = 'media');

DROP POLICY IF EXISTS "Admin Delete Media" ON storage.objects;
CREATE POLICY "Admin Delete Media"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'media');

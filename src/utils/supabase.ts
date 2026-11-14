import { createClient, type SupabaseClient } from '@supabase/supabase-js';

export const DEFAULT_SUPABASE_URL = 'https://cpvbgcdgmyfgnwcvrwxq.supabase.co';
export const DEFAULT_SUPABASE_ANON_KEY = 'sb_publishable_uBzGx6HtR0ZfzmJnkA_MsQ_-VrBRVJo';

let clientInstance: SupabaseClient | null = null;

export function getSupabaseConfig() {
  let url = import.meta.env?.PUBLIC_SUPABASE_URL || DEFAULT_SUPABASE_URL;
  let key = import.meta.env?.PUBLIC_SUPABASE_ANON_KEY || DEFAULT_SUPABASE_ANON_KEY;

  if (typeof window !== 'undefined') {
    try {
      const saved = localStorage.getItem('tdg_supabase_config');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.url) url = parsed.url;
        if (parsed.key) key = parsed.key;
      }
    } catch {}
  }

  return { url, key };
}

export function getSupabaseClient(): SupabaseClient {
  if (clientInstance) return clientInstance;
  const { url, key } = getSupabaseConfig();
  clientInstance = createClient(url, key, {
    auth: { persistSession: false },
  });
  return clientInstance;
}

export function resetSupabaseClient() {
  clientInstance = null;
}

export interface BlogArticleRecord {
  id: string;
  category: string;
  coverImage: string;
  author: string;
  publishedAt: string;
  updatedAt: string;
  featured: boolean;
  status: 'published' | 'draft' | string;
  id_lang: {
    slug: string;
    title: string;
    seoTitle: string;
    seoDescription: string;
    focusKeyword: string;
    coverAlt: string;
    excerpt: string;
    tags: string[];
    content: string;
  };
  en_lang: {
    slug: string;
    title: string;
    seoTitle: string;
    seoDescription: string;
    focusKeyword: string;
    coverAlt: string;
    excerpt: string;
    tags: string[];
    content: string;
  };
}

function rowToArticle(row: any): BlogArticleRecord {
  return {
    id: row.id,
    category: row.category || 'Content & Media Management',
    coverImage: row.cover_image || row.coverImage || '/images/portfolio/fame.jpg',
    author: row.author || 'The Digital Grounds Team',
    publishedAt: row.published_at || row.publishedAt || new Date().toISOString().slice(0, 10),
    updatedAt: row.updated_at || row.updatedAt || new Date().toISOString().slice(0, 10),
    featured: Boolean(row.featured),
    status: row.status || 'published',
    id_lang: row.id_lang || {},
    en_lang: row.en_lang || {},
  };
}

function articleToRow(article: BlogArticleRecord) {
  return {
    id: article.id,
    category: article.category || 'Content & Media Management',
    cover_image: article.coverImage || '/images/portfolio/fame.jpg',
    author: article.author || 'The Digital Grounds Team',
    published_at: article.publishedAt || new Date().toISOString().slice(0, 10),
    updated_at: article.updatedAt || new Date().toISOString().slice(0, 10),
    featured: Boolean(article.featured),
    status: article.status || 'published',
    id_lang: article.id_lang || {},
    en_lang: article.en_lang || {},
  };
}

/**
 * Fetch all blog articles from Supabase `blog_articles` table (or `site_settings` fallback).
 */
export async function fetchSupabaseBlogArticles(): Promise<BlogArticleRecord[] | null> {
  try {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase
      .from('blog_articles')
      .select('*')
      .order('published_at', { ascending: false });

    if (!error && Array.isArray(data) && data.length > 0) {
      return data.map(rowToArticle);
    }

    // Fallback check in site_settings table if blog_articles is empty
    const { data: settingRow, error: settingErr } = await supabase
      .from('site_settings')
      .select('data')
      .eq('key', 'blog')
      .maybeSingle();

    if (!settingErr && settingRow?.data?.articles && Array.isArray(settingRow.data.articles)) {
      return settingRow.data.articles;
    }

    return data ? data.map(rowToArticle) : null;
  } catch {
    return null;
  }
}

/**
 * Sync full list of blog articles and SEO config to Supabase
 */
export async function syncBlogToSupabase(blogData: { seo?: any; articles: BlogArticleRecord[] }): Promise<{ ok: boolean; error?: string }> {
  try {
    const supabase = getSupabaseClient();
    const articles = blogData.articles || [];

    // 1. Upsert all articles into blog_articles table
    if (articles.length > 0) {
      const rows = articles.map(articleToRow);
      const { error: upsertErr } = await supabase
        .from('blog_articles')
        .upsert(rows, { onConflict: 'id' });

      // Delete removed articles if table exists
      if (!upsertErr) {
        const currentIds = articles.map((a) => a.id);
        const { data: existingRows } = await supabase.from('blog_articles').select('id');
        if (existingRows) {
          const toDelete = existingRows.map((r: any) => r.id).filter((id: string) => !currentIds.includes(id));
          if (toDelete.length > 0) {
            await supabase.from('blog_articles').delete().in('id', toDelete);
          }
        }
      }
    }

    // 2. Also save full blog object in site_settings table for complete backup
    const { error: settingsErr } = await supabase
      .from('site_settings')
      .upsert(
        {
          key: 'blog',
          data: blogData,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'key' }
      );

    if (settingsErr) {
      return { ok: false, error: settingsErr.message };
    }

    return { ok: true };
  } catch (err: any) {
    return { ok: false, error: err?.message || 'Unknown Supabase error' };
  }
}

/**
 * Save a specific site setting module ('settings' | 'home' | 'portfolios' | 'blog') to Supabase
 */
export async function saveSiteSettingToSupabase(key: string, data: any): Promise<{ ok: boolean; error?: string }> {
  try {
    const supabase = getSupabaseClient();
    const { error } = await supabase
      .from('site_settings')
      .upsert(
        {
          key,
          data,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'key' }
      );

    if (error) {
      return { ok: false, error: error.message };
    }
    return { ok: true };
  } catch (err: any) {
    return { ok: false, error: err?.message || 'Failed to save to Supabase' };
  }
}

/**
 * Fetch all site settings from Supabase (`settings`, `home`, `portfolios`, `blog`)
 */
export async function fetchAllSupabaseState(): Promise<{
  settings?: any;
  home?: any;
  portfolios?: any;
  blog?: any;
} | null> {
  try {
    const supabase = getSupabaseClient();
    const [settingsRes, articlesRes] = await Promise.all([
      supabase.from('site_settings').select('key, data'),
      supabase.from('blog_articles').select('*').order('published_at', { ascending: false }),
    ]);

    const result: Record<string, any> = {};
    if (!settingsRes.error && Array.isArray(settingsRes.data)) {
      for (const row of settingsRes.data) {
        result[row.key] = row.data;
      }
    }

    if (!articlesRes.error && Array.isArray(articlesRes.data) && articlesRes.data.length > 0) {
      const mapped = articlesRes.data.map(rowToArticle);
      result.blog = {
        seo: result.blog?.seo || {
          id: {
            title: 'Blog & Artikel Strategi Digital — The Digital Grounds',
            description: 'Artikel, studi kasus, dan panduan strategi digital marketing, brand development, social media management, serta produksi kreatif dari tim The Digital Grounds Surabaya.',
          },
          en: {
            title: 'Digital Strategy Blog & Articles — The Digital Grounds',
            description: 'Articles, case studies, and actionable guides on digital marketing, brand development, social media management, and visual production by The Digital Grounds.',
          },
        },
        articles: mapped,
      };
    }

    return Object.keys(result).length > 0 ? result : null;
  } catch {
    return null;
  }
}

/**
 * Upload media file to Supabase Storage bucket `media`
 */
export async function uploadMediaToSupabase(file: File, folder = 'general'): Promise<{ ok: boolean; url?: string; error?: string }> {
  try {
    const supabase = getSupabaseClient();
    const safeName = `${Date.now()}-${file.name.toLowerCase().replace(/[^a-z0-9._-]/g, '-')}`;
    const filePath = `${folder}/${safeName}`;

    const { error } = await supabase.storage.from('media').upload(filePath, file, {
      cacheControl: '3600',
      upsert: true,
    });

    if (error) {
      return { ok: false, error: error.message };
    }

    const { data: publicUrlData } = supabase.storage.from('media').getPublicUrl(filePath);
    return { ok: true, url: publicUrlData.publicUrl };
  } catch (err: any) {
    return { ok: false, error: err?.message || 'Storage upload failed' };
  }
}

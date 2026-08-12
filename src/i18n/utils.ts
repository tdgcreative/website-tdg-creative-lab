import { ui, defaultLang, type TranslationKey } from './ui';
export type { TranslationKey };

export function getLangFromUrl(url: URL) {
  const [, lang] = url.pathname.split('/');
  if (lang in ui) return lang as keyof typeof ui;
  return defaultLang;
}

export function useTranslations(lang: keyof typeof ui) {
  return function t(key: TranslationKey) {
    return ui[lang][key] || ui[defaultLang][key];
  };
}

export function useTranslatedPath(lang: keyof typeof ui) {
  return function translatePath(path: string, l: string = lang) {
    const isDefault = l === defaultLang;
    // Strip leading slash if any, then prepend the locale if not default
    const cleanPath = path.startsWith('/') ? path : `/${path}`;
    
    // For 404 or external links
    if (path.startsWith('http') || path.startsWith('mailto:') || path.startsWith('tel:') || path.startsWith('https://wa.me')) {
      return path;
    }
    
    if (isDefault) {
      return cleanPath;
    }
    
    return `/en${cleanPath === '/' ? '' : cleanPath}`;
  };
}

export function getRouteFromUrl(url: URL): string {
  const pathname = url.pathname;
  const parts = pathname.split('/');
  // If first part is locale 'en', remove it
  if (parts[1] === 'en') {
    return '/' + parts.slice(2).join('/');
  }
  return pathname;
}

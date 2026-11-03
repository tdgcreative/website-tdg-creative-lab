// @ts-check
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import sitemap from '@astrojs/sitemap';
import { tdgAdminVitePlugin } from './src/utils/admin-vite-plugin.ts';

// https://astro.build/config
export default defineConfig({
  site: 'https://www.thedigitalgrounds.com',
  trailingSlash: 'never',
  i18n: {
    defaultLocale: 'id',
    locales: ['id', 'en'],
    routing: {
      prefixDefaultLocale: false,
    },
  },
  vite: {
    plugins: [tailwindcss(), tdgAdminVitePlugin()]
  },
  integrations: [
    sitemap({
      filter: (page) => !page.includes('/admin') && !page.includes('/thanks')
    })
  ]
});

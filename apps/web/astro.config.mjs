import react from '@astrojs/react';
import sitemap from '@astrojs/sitemap';
import { defineConfig } from 'astro/config';

/**
 * Build-time timestamp used as `lastmod` for every sitemap entry. This is
 * the coarsest-possible hint — per-URL granularity would require tracking
 * last-modified per brand-guide entry or per page file, which isn't worth
 * the build-time complexity for a site that redeploys on every push.
 */
const lastmod = new Date().toISOString();

export default defineConfig({
  site: 'https://guitarserials.org',
  trailingSlash: 'always',
  integrations: [
    react(),
    sitemap({
      filter: (page) => !page.endsWith('/find-serial/'),
      /*
       * Per-URL priority + changefreq hints. Google treats these as
       * suggestions (not rules) but they're cheap signals.
       *
       *   1.0  — home (main entry point)
       *   0.8  — brand pages (the actual content)
       *   0.5  — methodology + about (supplementary)
       */
      serialize(item) {
        item.lastmod = lastmod;
        if (item.url === 'https://guitarserials.org/') {
          item.priority = 1.0;
          item.changefreq = 'weekly';
        } else if (item.url.includes('/brands/')) {
          item.priority = 0.8;
          item.changefreq = 'monthly';
        } else {
          item.priority = 0.5;
          item.changefreq = 'yearly';
        }
        return item;
      },
    }),
  ],
});

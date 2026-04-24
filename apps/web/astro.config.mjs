import react from '@astrojs/react';
import sitemap from '@astrojs/sitemap';
import { defineConfig } from 'astro/config';

export default defineConfig({
  site: 'https://guitarserials.org',
  // Canonical URL form is trailing-slash (matches Astro's default folder
  // routing). Internal links should also use trailing slashes — see the
  // brand-card hrefs in index.astro + [brand].astro. The CloudFront stack
  // additionally 301s the no-slash form to the slash form so crawlers and
  // backlinkers that arrive at /brands/gibson end up on /brands/gibson/.
  trailingSlash: 'always',
  integrations: [
    react(),
    sitemap({
      // /brands/<slug>/find-serial/ is a meta-refresh redirect page with a
      // `<meta name="robots" content="noindex">` tag. Including it in the
      // sitemap tells crawlers "please index this" while the page itself
      // says "don't index me" — exactly the kind of conflicting signal
      // that wastes crawl budget. The real content lives on the brand page
      // under #find-serial, which IS in the sitemap.
      filter: (page) => !page.endsWith('/find-serial/'),
    }),
  ],
});

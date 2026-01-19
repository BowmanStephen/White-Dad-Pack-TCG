/**
 * Generate sitemap.xml for DadDeck
 *
 * This script generates a comprehensive sitemap with all pages, their priorities,
 * and last modified dates. Run with: bun run generate-sitemap
 */

const SITE_URL = 'https://dadddeck.com';

interface SitemapEntry {
  url: string;
  lastModified: string;
  changeFrequency: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never';
  priority: number;
}

// Define all pages with their SEO metadata
const sitemapEntries: SitemapEntry[] = [
  {
    url: '/',
    lastModified: new Date().toISOString(),
    changeFrequency: 'weekly',
    priority: 1.0,
  },
  {
    url: '/pack',
    lastModified: new Date().toISOString(),
    changeFrequency: 'daily', // Main game page, frequently visited
    priority: 0.9,
  },
  {
    url: '/collection',
    lastModified: new Date().toISOString(),
    changeFrequency: 'weekly',
    priority: 0.8,
  },
  {
    url: '/offline',
    lastModified: new Date().toISOString(),
    changeFrequency: 'monthly',
    priority: 0.1, // Low priority, also has noindex meta tag
  },
];

/**
 * Generate XML sitemap
 */
function generateSXML(entries: SitemapEntry[]): string {
  const urlset = entries
    .map((entry) => {
      const fullUrl = `${SITE_URL}${entry.url}`;
      return `  <url>
    <loc>${fullUrl}</loc>
    <lastmod>${entry.lastModified}</lastmod>
    <changefreq>${entry.changeFrequency}</changefreq>
    <priority>${entry.priority.toFixed(1)}</priority>
  </url>`;
    })
    .join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urlset}
</urlset>`;
}

/**
 * Write sitemap to public directory
 */
function writeSitemap() {
  const fs = require('fs');
  const path = require('path');

  const sitemap = generateSXML(sitemapEntries);
  const outputPath = path.join(process.cwd(), 'public', 'sitemap.xml');

  fs.writeFileSync(outputPath, sitemap, 'utf-8');
  console.log(`✅ Sitemap generated: ${outputPath}`);
  console.log(`   Entries: ${sitemapEntries.length}`);
}

// Run the script
writeSitemap();

export { generateSXML, sitemapEntries };

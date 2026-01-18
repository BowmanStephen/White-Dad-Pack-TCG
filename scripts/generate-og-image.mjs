/**
 * Generate Open Graph (OG) Image for DadDeck™
 *
 * Creates a 1200x630px image optimized for social media sharing
 * on Twitter/X, Facebook, LinkedIn, and other platforms.
 *
 * Run with: bun run generate-og-image
 */

import Sharp from 'sharp';
import { readFile } from 'fs/promises';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = join(__dirname, '..');

// OG image dimensions (Twitter/Facebook recommended size)
const WIDTH = 1200;
const HEIGHT = 630;

// DadDeck brand colors
const colors = {
  background: '#0f172a', // slate-900
  accent: '#f59e0b', // amber-500
  text: '#ffffff',
  subtext: '#94a3b8', // slate-400
  rare: '#eab308', // gold
  epic: '#a855f7', // purple
  legendary: '#f97316', // orange
  mythic: '#ec4899', // pink
};

async function generateOGImage() {
  console.log('🎴 Generating DadDeck™ OG Image...');

  try {
    // Create SVG for the OG image
    const svg = `
      <svg width="${WIDTH}" height="${HEIGHT}" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <!-- Gradient background -->
          <linearGradient id="bgGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style="stop-color:#1e293b;stop-opacity:1" />
            <stop offset="50%" style="stop-color:#0f172a;stop-opacity:1" />
            <stop offset="100%" style="stop-color:#1e293b;stop-opacity:1" />
          </linearGradient>

          <!-- Card glow effect -->
          <filter id="glow">
            <feGaussianBlur stdDeviation="4" result="coloredBlur"/>
            <feMerge>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>

          <!-- Holographic gradient -->
          <linearGradient id="holoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style="stop-color:#ec4899;stop-opacity:0.3" />
            <stop offset="50%" style="stop-color:#a855f7;stop-opacity:0.3" />
            <stop offset="100%" style="stop-color:#f97316;stop-opacity:0.3" />
          </linearGradient>
        </defs>

        <!-- Background -->
        <rect width="${WIDTH}" height="${HEIGHT}" fill="url(#bgGradient)"/>

        <!-- Decorative card back patterns (subtle) -->
        <g opacity="0.05">
          <rect x="50" y="50" width="200" height="280" rx="16" fill="#ffffff"/>
          <rect x="${WIDTH - 250}" y="${HEIGHT - 330}" width="200" height="280" rx="16" fill="#ffffff"/>
          <rect x="${WIDTH - 300}" y="50" width="200" height="280" rx="16" fill="#ffffff"/>
          <rect x="50" y="${HEIGHT - 330}" width="200" height="280" rx="16" fill="#ffffff"/>
        </g>

        <!-- Center highlight card -->
        <g transform="translate(${WIDTH / 2 - 180}, ${HEIGHT / 2 - 200})">
          <!-- Card background -->
          <rect width="360" height="400" rx="24" fill="url(#holoGradient)" stroke="#f59e0b" stroke-width="4" filter="url(#glow)"/>

          <!-- Inner card -->
          <rect x="20" y="20" width="320" height="360" rx="16" fill="#1e293b" opacity="0.8"/>

          <!-- Card icon (grill emoji as large text) -->
          <text x="180" y="180" font-size="120" text-anchor="middle" fill="#f59e0b">🔥</text>

          <!-- Dad type label -->
          <text x="180" y="240" font-size="18" font-weight="bold" text-anchor="middle" fill="#f59e0b" font-family="system-ui, sans-serif">BBQ DAD</text>

          <!-- Card name -->
          <text x="180" y="280" font-size="32" font-weight="900" text-anchor="middle" fill="#ffffff" font-family="system-ui, sans-serif">Grillmaster</text>
          <text x="180" y="315" font-size="28" font-weight="900" text-anchor="middle" fill="#ffffff" font-family="system-ui, sans-serif">Gary</text>

          <!-- Rarity badge -->
          <rect x="120" y="340" width="120" height="36" rx="18" fill="#f59e0b" opacity="0.2"/>
          <text x="180" y="365" font-size="16" font-weight="900" text-anchor="middle" fill="#f59e0b" font-family="system-ui, sans-serif">LEGENDARY</text>
        </g>

        <!-- Top branding -->
        <g transform="translate(60, 80)">
          <text x="0" y="0" font-size="72" font-weight="900" fill="#f59e0b" font-family="system-ui, sans-serif">DadDeck™</text>
          <text x="5" y="45" font-size="28" font-weight="600" fill="${colors.subtext}" font-family="system-ui, sans-serif" letter-spacing="4">THE WHITE DAD TRADING CARD SIMULATOR</text>
        </g>

        <!-- Bottom call to action -->
        <g transform="translate(${WIDTH / 2}, ${HEIGHT - 80})">
          <text x="0" y="0" font-size="32" font-weight="700" text-anchor="middle" fill="#ffffff" font-family="system-ui, sans-serif">Open Your Free Pack</text>
          <text x="0" y="45" font-size="28" font-weight="600" text-anchor="middle" fill="#f59e0b" font-family="system-ui, sans-serif">dadddeck.com</text>
        </g>

        <!-- Rarity badges (bottom corners) -->
        <g transform="translate(60, ${HEIGHT - 100})">
          <circle cx="20" cy="20" r="12" fill="${colors.rare}" opacity="0.8"/>
          <circle cx="50" cy="20" r="12" fill="${colors.epic}" opacity="0.8"/>
          <circle cx="80" cy="20" r="12" fill="${colors.legendary}" opacity="0.8"/>
          <circle cx="110" cy="20" r="12" fill="${colors.mythic}" opacity="0.8"/>
        </g>

        <g transform="translate(${WIDTH - 180}, ${HEIGHT - 100})">
          <circle cx="20" cy="20" r="12" fill="${colors.mythic}" opacity="0.8"/>
          <circle cx="50" cy="20" r="12" fill="${colors.legendary}" opacity="0.8"/>
          <circle cx="80" cy="20" r="12" fill="${colors.epic}" opacity="0.8"/>
          <circle cx="110" cy="20" r="12" fill="${colors.rare}" opacity="0.8"/>
        </g>
      </svg>
    `;

    // Convert SVG to PNG using Sharp
    const pngBuffer = await Sharp(Buffer.from(svg))
      .png()
      .toBuffer();

    // Save the image
    const outputPath = join(rootDir, 'public', 'og-image.png');
    await Sharp(pngBuffer).toFile(outputPath);

    console.log(`✅ OG image generated: ${outputPath}`);
    console.log(`   Size: ${(pngBuffer.length / 1024).toFixed(2)} KB`);

    // Get image info
    const metadata = await Sharp(outputPath).metadata();
    console.log(`   Dimensions: ${metadata.width}x${metadata.height}`);

    return outputPath;
  } catch (error) {
    console.error('❌ Error generating OG image:', error);
    throw error;
  }
}

// Run the generator
generateOGImage().catch(console.error);

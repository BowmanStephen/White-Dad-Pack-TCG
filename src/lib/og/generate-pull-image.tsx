/**
 * Dynamic OG Image Generation for Pack Pulls
 *
 * NOTE: This module is currently disabled/stubbed because it requires
 * server-side rendering capabilities that aren't available in the static
 * Astro build. The satori + resvg libraries need Node.js runtime.
 *
 * To enable:
 * 1. Install: bun add @resvg/resvg-js
 * 2. Configure Astro for SSR mode
 * 3. Uncomment the implementation below
 *
 * For now, OG images use the static template at /public/og-image.png
 */

import type { Pack } from '../../types';
import type { PackCard } from '../../types/pack';

// Satori dimensions
const OG_WIDTH = 1200;
const OG_HEIGHT = 630;

// DadDeck brand colors (exported for use in other modules)
export const COLORS = {
  background: '#0f172a', // slate-900
  accent: '#f59e0b', // amber-500
  text: '#ffffff',
  subtext: '#94a3b8', // slate-400
  rare: '#eab308', // gold
  epic: '#a855f7', // purple
  legendary: '#f97316', // orange
  mythic: '#ec4899', // pink
};

// Rarity border colors
export const RARITY_COLORS: Record<string, string> = {
  common: '#9ca3af',
  uncommon: '#3b82f6',
  rare: '#eab308',
  epic: '#a855f7',
  legendary: '#f97316',
  mythic: '#ec4899'
};

export interface OGImageResult {
  success: boolean;
  imagePath?: string;
  error?: string;
}

/**
 * Generate dynamic OG image for a pack pull
 *
 * Currently returns a stub result pointing to the static OG image.
 * Full implementation requires SSR mode and @resvg/resvg-js package.
 *
 * @param pack - The pack that was opened
 * @param bestCard - The best card from the pack (for featuring)
 * @returns Result with success status and image path
 */
export async function generatePullOGImage(
  pack: Pack,
  bestCard: PackCard
): Promise<OGImageResult> {
  // Stub implementation - returns static OG image
  // Dynamic generation requires SSR mode
  console.warn(
    '[generatePullOGImage] Dynamic OG image generation is disabled. ' +
    'Using static OG image instead. See file comments for enabling.'
  );

  return {
    success: true,
    imagePath: '/og-image.png', // Fallback to static image
  };
}

/**
 * Check if dynamic OG image generation is available
 * Currently always returns false (requires SSR mode)
 */
export function isDynamicOGAvailable(): boolean {
  return false;
}

/*
 * ============================================================================
 * FULL IMPLEMENTATION (Disabled - requires SSR + @resvg/resvg-js)
 * ============================================================================
 *
 * To enable dynamic OG image generation:
 *
 * 1. Install dependencies:
 *    bun add satori @resvg/resvg-js
 *
 * 2. Update astro.config.mjs for SSR:
 *    export default defineConfig({
 *      output: 'hybrid', // or 'server'
 *      adapter: vercel(), // or node(), etc.
 *    });
 *
 * 3. Uncomment and use this implementation:
 *
 * import satori from 'satori';
 * import { Resvg } from '@resvg/resvg-js';
 * import { join } from 'path';
 *
 * // Load font at module initialization
 * let fontData: ArrayBuffer | null = null;
 *
 * async function loadFont(): Promise<ArrayBuffer> {
 *   if (fontData) return fontData;
 *
 *   const response = await fetch(
 *     'https://cdn.jsdelivr.net/npm/source-sans-pro@14.0.0/source-sans-pro-v14-latin-regular.ttf'
 *   );
 *   fontData = await response.arrayBuffer();
 *   return fontData;
 * }
 *
 * export async function generatePullOGImage(
 *   pack: Pack,
 *   bestCard: PackCard
 * ): Promise<OGImageResult> {
 *   try {
 *     const font = await loadFont();
 *
 *     // Create JSX element for Satori (see original implementation)
 *     const element = createOGElement(pack, bestCard);
 *
 *     // Render to SVG with Satori
 *     const svg = await satori(element, {
 *       width: OG_WIDTH,
 *       height: OG_HEIGHT,
 *       fonts: [{
 *         name: 'Inter',
 *         data: font,
 *         weight: 400,
 *         style: 'normal',
 *       }],
 *     });
 *
 *     // Convert SVG to PNG using resvg
 *     const resvg = new Resvg(svg, {
 *       fitTo: { mode: 'width', value: OG_WIDTH },
 *     });
 *     const pngData = resvg.render();
 *     const pngBuffer = pngData.asPng();
 *
 *     // Generate unique filename and save
 *     const filename = `pull-${pack.id}-${Date.now()}.png`;
 *     const publicDir = join(process.cwd(), 'public', 'shares');
 *     const outputPath = join(publicDir, filename);
 *
 *     const fs = await import('fs/promises');
 *     await fs.mkdir(publicDir, { recursive: true }).catch(() => {});
 *     await fs.writeFile(outputPath, pngBuffer);
 *
 *     return {
 *       success: true,
 *       imagePath: `/shares/${filename}`
 *     };
 *   } catch (error) {
 *     console.error('[generatePullOGImage] Error:', error);
 *     return {
 *       success: false,
 *       error: error instanceof Error ? error.message : 'Failed to generate OG image'
 *     };
 *   }
 * }
 */

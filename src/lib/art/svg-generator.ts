import type { Card, Rarity } from '../../types';
import { createSeededRandom, type SeededRandom } from '../utils/seeded-random';
import { getDadTypeColors } from './dad-type-colors';
import * as fs from 'fs';
import * as path from 'path';

/**
 * SVG Generative Art System for DadDeck Cards
 *
 * Creates unique SVG artwork for each card based on:
 * - Card ID (seed for consistent randomness)
 * - Dad Type (color palette)
 * - Rarity (pattern complexity)
 * - Card name (text overlay)
 * - Rarity border (stroke styling)
 */

export interface SVGArtOptions {
  width: number;
  height: number;
  showName: boolean;
  showBorder: boolean;
}

const DEFAULT_OPTIONS: SVGArtOptions = {
  width: 400,
  height: 550,
  showName: true,
  showBorder: true,
};

/**
 * Generate SVG artwork for a card
 * @param card - The card to generate art for
 * @param options - Artwork generation options
 * @returns SVG string
 */
export function generateCardSVG(
  card: Card,
  options: Partial<SVGArtOptions> = {}
): string {
  const opts = { ...DEFAULT_OPTIONS, ...options };
  const rng = createSeededRandom(card.id);
  let colors = getDadTypeColors(card.type);

  // Fallback for unknown card types
  if (!colors) {
    console.warn(`Unknown card type: ${card.type}, using default colors`);
    colors = {
      primary: '#64748b',
      secondary: '#94a3b8',
      accent: '#fbbf24',
      background: 'linear-gradient(135deg, #334155 0%, #475569 50%, #334155 100%)',
    };
  }

  // Build SVG elements
  const elements: string[] = [];

  // Background
  elements.push(createBackground(opts.width, opts.height, colors, rng));

  // Pattern layer
  elements.push(createPattern(opts.width, opts.height, colors, card.rarity, rng));

  // Shapes layer
  elements.push(createShapes(opts.width, opts.height, colors, card.rarity, rng));

  // Card name overlay
  if (opts.showName) {
    elements.push(createCardName(opts.width, card.name, colors));
  }

  // Rarity border
  if (opts.showBorder) {
    elements.push(createRarityBorder(opts.width, opts.height, card.rarity));
  }

  // Assemble SVG
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${opts.width} ${opts.height}" width="${opts.width}" height="${opts.height}">
  <defs>
    <linearGradient id="bg-gradient-${card.id}" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:${colors.primary};stop-opacity:0.26" />
      <stop offset="50%" style="stop-color:${colors.secondary};stop-opacity:0.4" />
      <stop offset="100%" style="stop-color:${colors.primary};stop-opacity:0.26" />
    </linearGradient>
    ${createFilters(card.id)}
  </defs>
  ${elements.join('\n  ')}
</svg>`;
}

/**
 * Create background rectangle with gradient
 */
function createBackground(
  width: number,
  height: number,
  colors: ReturnType<typeof getDadTypeColors>,
  rng: SeededRandom
): string {
  return `<rect width="${width}" height="${height}" fill="url(#bg-gradient-${rng.next()})" />`;
}

/**
 * Create pattern layer based on dad type and rarity
 */
function createPattern(
  width: number,
  height: number,
  colors: ReturnType<typeof getDadTypeColors>,
  rarity: Rarity,
  rng: SeededRandom
): string {
  const complexity = getRarityComplexity(rarity);
  const patternType = rng.range(0, 4);

  let pattern = '';
  switch (patternType) {
    case 0:
      pattern = createDotPattern(width, height, colors, complexity, rng);
      break;
    case 1:
      pattern = createLinePattern(width, height, colors, complexity, rng);
      break;
    case 2:
      pattern = createGeometricPattern(width, height, colors, complexity, rng);
      break;
    case 3:
      pattern = createWavePattern(width, height, colors, complexity, rng);
      break;
  }

  return `<g opacity="0.3">${pattern}</g>`;
}

/**
 * Create decorative shapes layer
 */
function createShapes(
  width: number,
  height: number,
  colors: ReturnType<typeof getDadTypeColors>,
  rarity: Rarity,
  rng: SeededRandom
): string {
  const complexity = getRarityComplexity(rarity);
  const shapeCount = Math.floor(complexity * 3) + 2;
  const shapes: string[] = [];

  for (let i = 0; i < shapeCount; i++) {
    const x = rng.next() * width;
    const y = rng.next() * height;
    const size = rng.next() * 80 + 20;
    const shapeType = rng.range(0, 4);
    const color = rng.pick([colors.primary, colors.secondary, colors.accent]);
    const opacity = (rng.next() * 0.3 + 0.1).toFixed(2);

    let shape = '';
    switch (shapeType) {
      case 0: // Circle
        shape = `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${(size / 2).toFixed(1)}" fill="${color}" opacity="${opacity}" />`;
        break;
      case 1: // Square
        shape = `<rect x="${(x - size / 2).toFixed(1)}" y="${(y - size / 2).toFixed(1)}" width="${size.toFixed(1)}" height="${size.toFixed(1)}" fill="${color}" opacity="${opacity}" />`;
        break;
      case 2: // Triangle
        const points = [
          `${x.toFixed(1)},${(y - size / 2).toFixed(1)}`,
          `${(x + size / 2).toFixed(1)},${(y + size / 2).toFixed(1)}`,
          `${(x - size / 2).toFixed(1)},${(y + size / 2).toFixed(1)}`
        ].join(' ');
        shape = `<polygon points="${points}" fill="${color}" opacity="${opacity}" />`;
        break;
      case 3: // Diamond
        const diamondPoints = [
          `${x.toFixed(1)},${(y - size / 2).toFixed(1)}`,
          `${(x + size / 2).toFixed(1)},${y.toFixed(1)}`,
          `${x.toFixed(1)},${(y + size / 2).toFixed(1)}`,
          `${(x - size / 2).toFixed(1)},${y.toFixed(1)}`
        ].join(' ');
        shape = `<polygon points="${diamondPoints}" fill="${color}" opacity="${opacity}" />`;
        break;
    }
    shapes.push(shape);
  }

  return shapes.join('\n    ');
}

/**
 * Create card name overlay at bottom
 */
function createCardName(
  width: number,
  name: string,
  colors: ReturnType<typeof getDadTypeColors>
): string {
  const fontSize = 24;
  const padding = 16;
  const y = 550 - fontSize / 2 - padding;

  // Truncate long names
  let displayName = name;
  if (displayName.length > 25) {
    displayName = displayName.substring(0, 22) + '...';
  }

  return `
  <!-- Text background banner -->
  <defs>
    <linearGradient id="text-bg-${displayName.length}" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" style="stop-color:#000000;stop-opacity:0.7" />
      <stop offset="50%" style="stop-color:${colors.primary};stop-opacity:0.4" />
      <stop offset="100%" style="stop-color:#000000;stop-opacity:0.7" />
    </linearGradient>
  </defs>
  <rect x="0" y="${550 - fontSize - padding * 2}" width="${width}" height="${fontSize + padding * 2}" fill="url(#text-bg-${displayName.length})" />

  <!-- Text shadow -->
  <text x="${width / 2}" y="${y}" font-family="system-ui, -apple-system, sans-serif" font-size="${fontSize}" font-weight="bold" text-anchor="middle" fill="#000000" opacity="0.8">${displayName}</text>

  <!-- Main text -->
  <text x="${width / 2}" y="${y - 2}" font-family="system-ui, -apple-system, sans-serif" font-size="${fontSize}" font-weight="bold" text-anchor="middle" fill="#ffffff">${displayName}</text>`;
}

/**
 * Create rarity border
 */
function createRarityBorder(width: number, height: number, rarity: Rarity): string {
  const borderWidth = getRarityBorderWidth(rarity);
  const borderColor = getRarityBorderColor(rarity);

  return `
  <!-- Rarity border -->
  <rect x="${borderWidth / 2}" y="${borderWidth / 2}" width="${width - borderWidth}" height="${height - borderWidth}"
        fill="none" stroke="${borderColor}" stroke-width="${borderWidth}" rx="8" ry="8" />`;
}

/**
 * Create SVG filters for effects
 */
function createFilters(cardId: string): string {
  return `
  <filter id="shadow-${cardId}">
    <feDropShadow dx="0" dy="2" stdDeviation="3" flood-opacity="0.8"/>
  </filter>`;
}

/**
 * Pattern: Dots
 */
function createDotPattern(
  width: number,
  height: number,
  colors: ReturnType<typeof getDadTypeColors>,
  complexity: number,
  rng: SeededRandom
): string {
  const spacing = Math.max(10, 40 - complexity * 5);
  const dotSize = Math.max(2, complexity * 2);
  const dots: string[] = [];

  for (let x = 0; x < width; x += spacing) {
    for (let y = 0; y < height; y += spacing) {
      if (rng.next() > 0.3) {
        const color = rng.pick([colors.primary, colors.secondary, colors.accent]);
        const offsetX = (rng.next() * 10).toFixed(1);
        const offsetY = (rng.next() * 10).toFixed(1);
        dots.push(`<circle cx="${(x + parseFloat(offsetX)).toFixed(1)}" cy="${(y + parseFloat(offsetY)).toFixed(1)}" r="${dotSize}" fill="${color}" />`);
      }
    }
  }

  return dots.join('\n    ');
}

/**
 * Pattern: Lines
 */
function createLinePattern(
  width: number,
  height: number,
  colors: ReturnType<typeof getDadTypeColors>,
  complexity: number,
  rng: SeededRandom
): string {
  const lineCount = Math.floor(complexity * 5) + 5;
  const lines: string[] = [];

  for (let i = 0; i < lineCount; i++) {
    const color = rng.pick([colors.primary, colors.secondary, colors.accent]);
    const lineWidth = (rng.next() * 3 + 1).toFixed(1);
    const opacity = (rng.next() * 0.3 + 0.1).toFixed(2);

    if (rng.next() > 0.5) {
      // Horizontal
      const y = (rng.next() * height).toFixed(1);
      lines.push(`<line x1="0" y1="${y}" x2="${width}" y2="${y}" stroke="${color}" stroke-width="${lineWidth}" opacity="${opacity}" />`);
    } else {
      // Vertical
      const x = (rng.next() * width).toFixed(1);
      lines.push(`<line x1="${x}" y1="0" x2="${x}" y2="${height}" stroke="${color}" stroke-width="${lineWidth}" opacity="${opacity}" />`);
    }
  }

  return lines.join('\n    ');
}

/**
 * Pattern: Geometric shapes
 */
function createGeometricPattern(
  width: number,
  height: number,
  colors: ReturnType<typeof getDadTypeColors>,
  complexity: number,
  rng: SeededRandom
): string {
  const shapeCount = Math.floor(complexity * 2) + 3;
  const shapes: string[] = [];

  for (let i = 0; i < shapeCount; i++) {
    const x = rng.next() * width;
    const y = rng.next() * height;
    const size = rng.next() * 60 + 20;
    const color = rng.pick([colors.primary, colors.secondary, colors.accent]);
    const lineWidth = (rng.next() * 2 + 1).toFixed(1);
    const opacity = (rng.next() * 0.2 + 0.1).toFixed(2);

    if (rng.next() > 0.5) {
      // Rectangle
      shapes.push(
        `<rect x="${(x - size / 2).toFixed(1)}" y="${(y - size / 2).toFixed(1)}" width="${size.toFixed(1)}" height="${size.toFixed(1)}" fill="none" stroke="${color}" stroke-width="${lineWidth}" opacity="${opacity}" />`
      );
    } else {
      // Circle
      shapes.push(
        `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${(size / 2).toFixed(1)}" fill="none" stroke="${color}" stroke-width="${lineWidth}" opacity="${opacity}" />`
      );
    }
  }

  return shapes.join('\n    ');
}

/**
 * Pattern: Waves
 */
function createWavePattern(
  width: number,
  height: number,
  colors: ReturnType<typeof getDadTypeColors>,
  complexity: number,
  rng: SeededRandom
): string {
  const waveCount = Math.floor(complexity * 2) + 2;
  const waves: string[] = [];

  for (let w = 0; w < waveCount; w++) {
    const color = rng.pick([colors.primary, colors.secondary, colors.accent]);
    const lineWidth = (rng.next() * 2 + 1).toFixed(1);
    const opacity = (rng.next() * 0.2 + 0.1).toFixed(2);
    const amplitude = rng.next() * 30 + 10;
    const frequency = rng.next() * 0.02 + 0.01;
    const phase = rng.next() * Math.PI * 2;
    const yOffset = rng.next() * height;

    // Generate path data
    const points: string[] = [];
    for (let x = 0; x <= width; x += 5) {
      const y = yOffset + Math.sin(x * frequency + phase) * amplitude;
      points.push(`${x},${y.toFixed(1)}`);
    }

    waves.push(
      `<polyline points="${points.join(' ')}" fill="none" stroke="${color}" stroke-width="${lineWidth}" opacity="${opacity}" />`
    );
  }

  return waves.join('\n    ');
}

/**
 * Get complexity factor based on rarity
 * Common = 1, Mythic = 6
 */
function getRarityComplexity(rarity: Rarity): number {
  const complexityMap: Record<Rarity, number> = {
    common: 1,
    uncommon: 2,
    rare: 3,
    epic: 4,
    legendary: 5,
    mythic: 6,
  };
  return complexityMap[rarity] || 1;
}

/**
 * Get border width based on rarity
 */
function getRarityBorderWidth(rarity: Rarity): number {
  const widthMap: Record<Rarity, number> = {
    common: 4,
    uncommon: 6,
    rare: 8,
    epic: 10,
    legendary: 12,
    mythic: 16,
  };
  return widthMap[rarity] || 4;
}

/**
 * Get border color based on rarity
 */
function getRarityBorderColor(rarity: Rarity): string {
  const colorMap: Record<Rarity, string> = {
    common: '#9ca3af',
    uncommon: '#3b82f6',
    rare: '#eab308',
    epic: '#a855f7',
    legendary: '#f97316',
    mythic: '#ec4899',
  };
  return colorMap[rarity] || '#9ca3af';
}

/**
 * Generate all SVG files for cards
 * @param cards - Array of cards to generate SVGs for
 * @param outputDir - Directory to save SVG files
 * @returns Array of generated file paths
 */
export async function generateAllCardSVGs(
  cards: Card[],
  outputDir: string
): Promise<string[]> {
  const generatedPaths: string[] = [];

  // Ensure output directory exists
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  // Generate SVG for each card
  for (const card of cards) {
    const svg = generateCardSVG(card);
    const filename = `${card.id}-${slugify(card.name)}.svg`;
    const filepath = path.join(outputDir, filename);

    fs.writeFileSync(filepath, svg, 'utf-8');
    generatedPaths.push(filepath);
  }

  return generatedPaths;
}

/**
 * Convert string to filename-safe slug
 */
function slugify(str: string): string {
  return str
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .substring(0, 50);
}

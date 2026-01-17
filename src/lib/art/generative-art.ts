import type { Card, Rarity } from '../../types';
import { createSeededRandom, type SeededRandom } from '../utils/seeded-random';
import { getDadTypeColors } from './dad-type-colors';

/**
 * Generative Art System for DadDeck Cards
 *
 * Creates unique canvas-based artwork for each card based on:
 * - Card ID (seed for consistent randomness)
 * - Dad Type (color palette)
 * - Rarity (pattern complexity)
 */

export interface GenerativeArtOptions {
  width: number;
  height: number;
  showName: boolean;
}

const DEFAULT_OPTIONS: GenerativeArtOptions = {
  width: 400,
  height: 400,
  showName: true,
};

/**
 * Generate artwork for a card
 * @param card - The card to generate art for
 * @param options - Artwork generation options
 * @returns Data URL of the generated artwork
 */
export function generateCardArtwork(
  card: Card,
  options: Partial<GenerativeArtOptions> = {}
): string {
  const opts = { ...DEFAULT_OPTIONS, ...options };
  const canvas = document.createElement('canvas');
  canvas.width = opts.width;
  canvas.height = opts.height;
  const ctx = canvas.getContext('2d');

  if (!ctx) {
    throw new Error('Failed to get canvas context');
  }

  // Create seeded random from card ID
  const rng = createSeededRandom(card.id);

  // Get color palette
  const colors = getDadTypeColors(card.type);

  // Draw artwork layers
  drawBackground(ctx, opts.width, opts.height, colors, rng);
  drawPattern(ctx, opts.width, opts.height, colors, card.rarity, rng);
  drawShapes(ctx, opts.width, opts.height, colors, card.rarity, rng);

  // Draw card name overlay
  if (opts.showName) {
    drawCardName(ctx, opts.width, card.name, colors);
  }

  return canvas.toDataURL('image/png');
}

/**
 * Draw the background gradient
 */
function drawBackground(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  colors: ReturnType<typeof getDadTypeColors>,
  rng: SeededRandom
): void {
  // Slightly vary gradient positions based on seed
  const x1 = rng.next() * width * 0.3;
  const y1 = rng.next() * height * 0.3;
  const x2 = width - rng.next() * width * 0.3;
  const y2 = height - rng.next() * height * 0.3;

  const grad = ctx.createLinearGradient(x1, y1, x2, y2);
  grad.addColorStop(0, colors.primary + '44'); // 26% opacity
  grad.addColorStop(0.5, colors.secondary + '66'); // 40% opacity
  grad.addColorStop(1, colors.primary + '44');

  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, width, height);
}

/**
 * Draw pattern based on dad type and rarity
 */
function drawPattern(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  colors: ReturnType<typeof getDadTypeColors>,
  rarity: Rarity,
  rng: SeededRandom
): void {
  // Pattern complexity increases with rarity
  const complexity = getRarityComplexity(rarity);

  ctx.save();
  ctx.globalAlpha = 0.3;

  switch (rng.range(0, 4)) {
    case 0:
      drawDotPattern(ctx, width, height, colors, complexity, rng);
      break;
    case 1:
      drawLinePattern(ctx, width, height, colors, complexity, rng);
      break;
    case 2:
      drawGeometricPattern(ctx, width, height, colors, complexity, rng);
      break;
    case 3:
      drawWavePattern(ctx, width, height, colors, complexity, rng);
      break;
  }

  ctx.restore();
}

/**
 * Draw decorative shapes
 */
function drawShapes(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  colors: ReturnType<typeof getDadTypeColors>,
  rarity: Rarity,
  rng: SeededRandom
): void {
  const complexity = getRarityComplexity(rarity);
  const shapeCount = Math.floor(complexity * 3) + 2;

  ctx.save();

  for (let i = 0; i < shapeCount; i++) {
    const x = rng.next() * width;
    const y = rng.next() * height;
    const size = rng.next() * 80 + 20;
    const shapeType = rng.range(0, 4);

    ctx.fillStyle = rng.pick([colors.primary, colors.secondary, colors.accent]);
    ctx.globalAlpha = rng.next() * 0.3 + 0.1;

    ctx.beginPath();

    switch (shapeType) {
      case 0: // Circle
        ctx.arc(x, y, size / 2, 0, Math.PI * 2);
        break;
      case 1: // Square
        ctx.rect(x - size / 2, y - size / 2, size, size);
        break;
      case 2: // Triangle
        ctx.moveTo(x, y - size / 2);
        ctx.lineTo(x + size / 2, y + size / 2);
        ctx.lineTo(x - size / 2, y + size / 2);
        ctx.closePath();
        break;
      case 3: // Diamond
        ctx.moveTo(x, y - size / 2);
        ctx.lineTo(x + size / 2, y);
        ctx.lineTo(x, y + size / 2);
        ctx.lineTo(x - size / 2, y);
        ctx.closePath();
        break;
    }

    ctx.fill();
  }

  ctx.restore();
}

/**
 * Draw card name overlay at bottom
 */
function drawCardName(
  ctx: CanvasRenderingContext2D,
  width: number,
  name: string,
  colors: ReturnType<typeof getDadTypeColors>
): void {
  const fontSize = 24;
  const padding = 16;

  ctx.save();

  // Background banner
  const gradient = ctx.createLinearGradient(0, 0, width, 0);
  gradient.addColorStop(0, 'rgba(0, 0, 0, 0.7)');
  gradient.addColorStop(0.5, colors.primary + '66'); // Semi-transparent primary
  gradient.addColorStop(1, 'rgba(0, 0, 0, 0.7)');

  ctx.fillStyle = gradient;
  ctx.fillRect(0, ctx.canvas.height - fontSize - padding * 2, width, fontSize + padding * 2);

  // Text shadow for readability
  ctx.shadowColor = 'rgba(0, 0, 0, 0.8)';
  ctx.shadowBlur = 4;
  ctx.shadowOffsetX = 0;
  ctx.shadowOffsetY = 2;

  // Draw text
  ctx.fillStyle = '#ffffff';
  ctx.font = `bold ${fontSize}px system-ui, -apple-system, sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  // Truncate long names
  let displayName = name;
  if (displayName.length > 20) {
    displayName = displayName.substring(0, 17) + '...';
  }

  ctx.fillText(
    displayName,
    width / 2,
    ctx.canvas.height - fontSize / 2 - padding
  );

  ctx.restore();
}

/**
 * Pattern: Dots
 */
function drawDotPattern(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  colors: ReturnType<typeof getDadTypeColors>,
  complexity: number,
  rng: SeededRandom
): void {
  const spacing = Math.max(10, 40 - complexity * 5);
  const dotSize = Math.max(2, complexity * 2);

  for (let x = 0; x < width; x += spacing) {
    for (let y = 0; y < height; y += spacing) {
      if (rng.next() > 0.3) {
        ctx.fillStyle = rng.pick([colors.primary, colors.secondary, colors.accent]);
        ctx.beginPath();
        ctx.arc(x + rng.next() * 10, y + rng.next() * 10, dotSize, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  }
}

/**
 * Pattern: Lines
 */
function drawLinePattern(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  colors: ReturnType<typeof getDadTypeColors>,
  complexity: number,
  rng: SeededRandom
): void {
  const lineCount = Math.floor(complexity * 5) + 5;

  for (let i = 0; i < lineCount; i++) {
    ctx.strokeStyle = rng.pick([colors.primary, colors.secondary, colors.accent]);
    ctx.lineWidth = rng.next() * 3 + 1;
    ctx.globalAlpha = rng.next() * 0.3 + 0.1;

    ctx.beginPath();
    if (rng.next() > 0.5) {
      // Horizontal
      const y = rng.next() * height;
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
    } else {
      // Vertical
      const x = rng.next() * width;
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
    }
    ctx.stroke();
  }
}

/**
 * Pattern: Geometric shapes
 */
function drawGeometricPattern(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  colors: ReturnType<typeof getDadTypeColors>,
  complexity: number,
  rng: SeededRandom
): void {
  const shapeCount = Math.floor(complexity * 2) + 3;

  for (let i = 0; i < shapeCount; i++) {
    const x = rng.next() * width;
    const y = rng.next() * height;
    const size = rng.next() * 60 + 20;

    ctx.strokeStyle = rng.pick([colors.primary, colors.secondary, colors.accent]);
    ctx.lineWidth = rng.next() * 2 + 1;
    ctx.globalAlpha = rng.next() * 0.2 + 0.1;

    ctx.beginPath();
    if (rng.next() > 0.5) {
      // Rectangle
      ctx.strokeRect(x - size / 2, y - size / 2, size, size);
    } else {
      // Circle
      ctx.arc(x, y, size / 2, 0, Math.PI * 2);
      ctx.stroke();
    }
  }
}

/**
 * Pattern: Waves
 */
function drawWavePattern(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  colors: ReturnType<typeof getDadTypeColors>,
  complexity: number,
  rng: SeededRandom
): void {
  const waveCount = Math.floor(complexity * 2) + 2;

  for (let w = 0; w < waveCount; w++) {
    ctx.strokeStyle = rng.pick([colors.primary, colors.secondary, colors.accent]);
    ctx.lineWidth = rng.next() * 2 + 1;
    ctx.globalAlpha = rng.next() * 0.2 + 0.1;

    const amplitude = rng.next() * 30 + 10;
    const frequency = rng.next() * 0.02 + 0.01;
    const phase = rng.next() * Math.PI * 2;
    const yOffset = rng.next() * height;

    ctx.beginPath();
    for (let x = 0; x < width; x++) {
      const y = yOffset + Math.sin(x * frequency + phase) * amplitude;
      if (x === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    }
    ctx.stroke();
  }
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
 * Generate artwork data URL for a card
 * This is the main export function
 */
export function generateArtworkUrl(card: Card): string {
  return generateCardArtwork(card, {
    width: 400,
    height: 400,
    showName: true,
  });
}

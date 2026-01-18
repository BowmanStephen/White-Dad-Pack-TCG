/**
 * Tests for SVG artwork generation
 */

import { describe, it, expect } from 'vitest';
import { generateCardSVG } from '@/lib/art/svg-generator';
import { getAllCards } from '@/lib/cards/database';
import * as fs from 'fs';
import * as path from 'path';

describe('SVG Artwork Generation', () => {
  describe('generateCardSVG', () => {
    it('should generate valid SVG for a card', () => {
      const cards = getAllCards();
      const card = cards[0];

      const svg = generateCardSVG(card);

      // Verify it's a valid SVG string
      expect(svg).toContain('<?xml version="1.0" encoding="UTF-8"?>');
      expect(svg).toContain('<svg');
      expect(svg).toContain('xmlns="http://www.w3.org/2000/svg"');
      expect(svg).toContain(`viewBox="0 0 400 550"`);
      expect(svg).toContain('</svg>');
    });

    it('should include card name in SVG', () => {
      const cards = getAllCards();
      const card = cards[0];

      const svg = generateCardSVG(card);

      // Should contain the card name (or truncated version)
      const displayName = card.name.length > 25
        ? card.name.substring(0, 22) + '...'
        : card.name;

      expect(svg).toContain(displayName);
    });

    it('should include rarity border', () => {
      const cards = getAllCards();
      const card = cards[0];

      const svg = generateCardSVG(card);

      // Should contain rarity border
      expect(svg).toContain('Rarity border');
      expect(svg).toContain(`stroke="${getRarityBorderColor(card.rarity)}"`);
    });

    it('should use dad type colors', () => {
      const cards = getAllCards();
      const card = cards.find(c => c.type === 'BBQ_DICKTATOR') || cards[0];

      const svg = generateCardSVG(card);

      // BBQ_DICKTATOR should use red/orange colors
      if (card.type === 'BBQ_DICKTATOR') {
        expect(svg).toContain('#ef4444'); // Red
        expect(svg).toContain('#f97316'); // Orange
      }
    });

    it('should generate unique SVGs for different cards', () => {
      const cards = getAllCards();
      const card1 = cards[0];
      const card2 = cards[1];

      const svg1 = generateCardSVG(card1);
      const svg2 = generateCardSVG(card2);

      // Different cards should generate different SVGs
      expect(svg1).not.toBe(svg2);
    });

    it('should generate consistent SVG for same card', () => {
      const cards = getAllCards();
      const card = cards[0];

      const svg1 = generateCardSVG(card);
      const svg2 = generateCardSVG(card);

      // Same card should generate identical SVG (seeded random)
      expect(svg1).toBe(svg2);
    });

    it('should respect showName option', () => {
      const cards = getAllCards();
      const card = cards[0];

      const svgWithName = generateCardSVG(card, { showName: true });
      const svgWithoutName = generateCardSVG(card, { showName: false });

      // With name should contain text background banner
      expect(svgWithName).toContain('<!-- Text background banner -->');

      // Without name should not contain text background banner
      expect(svgWithoutName).not.toContain('<!-- Text background banner -->');
    });

    it('should respect showBorder option', () => {
      const cards = getAllCards();
      const card = cards[0];

      const svgWithBorder = generateCardSVG(card, { showBorder: true });
      const svgWithoutBorder = generateCardSVG(card, { showBorder: false });

      // With border should contain border
      expect(svgWithBorder).toContain('<!-- Rarity border -->');

      // Without border should not contain border
      expect(svgWithoutBorder).not.toContain('<!-- Rarity border -->');
    });

    it('should respect custom dimensions', () => {
      const cards = getAllCards();
      const card = cards[0];

      const svg = generateCardSVG(card, { width: 800, height: 1100 });

      // Should use custom dimensions
      expect(svg).toContain('viewBox="0 0 800 1100"');
      expect(svg).toContain('width="800"');
      expect(svg).toContain('height="1100"');
    });
  });

  describe('verifyAllCardsHaveArtwork', () => {
    it('should verify all cards have corresponding SVG files', () => {
      const cards = getAllCards();
      const cardsDir = path.join(process.cwd(), 'public/images/cards');

      // Check that directory exists
      expect(fs.existsSync(cardsDir)).toBe(true);

      // Check that each card has an SVG file
      const missingArtwork: string[] = [];

      for (const card of cards) {
        const filename = `${card.id}-${slugify(card.name)}.svg`;
        const filepath = path.join(cardsDir, filename);

        if (!fs.existsSync(filepath)) {
          missingArtwork.push(filename);
        }
      }

      // All cards should have artwork
      expect(missingArtwork).toHaveLength(0);
    });

    it('should verify all SVG files are valid', () => {
      const cards = getAllCards();
      const cardsDir = path.join(process.cwd(), 'public/images/cards');

      // Check that each SVG file is valid
      const invalidFiles: string[] = [];

      for (const card of cards) {
        const filename = `${card.id}-${slugify(card.name)}.svg`;
        const filepath = path.join(cardsDir, filename);

        if (fs.existsSync(filepath)) {
          const content = fs.readFileSync(filepath, 'utf-8');

          // Check for valid SVG structure
          if (!content.includes('<?xml') ||
              !content.includes('<svg') ||
              !content.includes('</svg>')) {
            invalidFiles.push(filename);
          }
        }
      }

      // All SVGs should be valid
      expect(invalidFiles).toHaveLength(0);
    });

    it('should have the correct number of SVG files', () => {
      const cards = getAllCards();
      const cardsDir = path.join(process.cwd(), 'public/images/cards');

      const files = fs.readdirSync(cardsDir).filter(f => f.endsWith('.svg'));

      // Should have at least one SVG per card (allow extras)
      expect(files.length).toBeGreaterThanOrEqual(cards.length);
    });
  });
});

/**
 * Helper function to get rarity border color
 */
function getRarityBorderColor(rarity: string): string {
  const colorMap: Record<string, string> = {
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
 * Helper function to slugify card names
 */
function slugify(str: string): string {
  return str
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .substring(0, 50);
}

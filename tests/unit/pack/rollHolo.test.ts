import { describe, it, expect } from 'vitest';
import { rollHolo } from '../../../src/lib/pack/generator';
import { SeededRandom } from '../../../src/lib/utils/random';
import type { Rarity, HoloVariant } from '../../../src/types';

describe('rollHolo - US038 Holo Variant Assignment', () => {
  const SAMPLE_SIZE = 10000;
  const ACCEPTABLE_ERROR = 0.02; // 2% tolerance for statistical tests

  describe('Function Signature', () => {
    it('should be a named export function', () => {
      expect(typeof rollHolo).toBe('function');
    });

    it('should accept rarity and rng parameters', () => {
      const rng = new SeededRandom(12345);
      const result = rollHolo('common', rng);
      expect(typeof result).toBe('string');
    });

    it('should return a valid HoloVariant', () => {
      const rng = new SeededRandom(12345);
      const validVariants: HoloVariant[] = ['none', 'standard', 'reverse', 'full_art', 'prismatic'];
      const result = rollHolo('common', rng);
      expect(validVariants).toContain(result);
    });
  });

  describe('Distribution - US038 AC2', () => {
    it('should distribute approximately 80% none', () => {
      const counts: Record<HoloVariant, number> = {
        none: 0,
        standard: 0,
        reverse: 0,
        full_art: 0,
        prismatic: 0,
      };

      for (let i = 0; i < SAMPLE_SIZE; i++) {
        const rng = new SeededRandom(i);
        const result = rollHolo('common', rng);
        counts[result]++;
      }

      const noneRatio = counts.none / SAMPLE_SIZE;
      expect(noneRatio).toBeGreaterThanOrEqual(0.80 - ACCEPTABLE_ERROR);
      expect(noneRatio).toBeLessThanOrEqual(0.80 + ACCEPTABLE_ERROR);
    });

    it('should distribute approximately 15% standard', () => {
      const counts: Record<HoloVariant, number> = {
        none: 0,
        standard: 0,
        reverse: 0,
        full_art: 0,
        prismatic: 0,
      };

      for (let i = 0; i < SAMPLE_SIZE; i++) {
        const rng = new SeededRandom(i);
        const result = rollHolo('common', rng);
        counts[result]++;
      }

      const standardRatio = counts.standard / SAMPLE_SIZE;
      expect(standardRatio).toBeGreaterThanOrEqual(0.15 - ACCEPTABLE_ERROR);
      expect(standardRatio).toBeLessThanOrEqual(0.15 + ACCEPTABLE_ERROR);
    });

    it('should distribute approximately 3% reverse', () => {
      const counts: Record<HoloVariant, number> = {
        none: 0,
        standard: 0,
        reverse: 0,
        full_art: 0,
        prismatic: 0,
      };

      for (let i = 0; i < SAMPLE_SIZE; i++) {
        const rng = new SeededRandom(i);
        const result = rollHolo('common', rng);
        counts[result]++;
      }

      const reverseRatio = counts.reverse / SAMPLE_SIZE;
      expect(reverseRatio).toBeGreaterThanOrEqual(0.03 - ACCEPTABLE_ERROR);
      expect(reverseRatio).toBeLessThanOrEqual(0.03 + ACCEPTABLE_ERROR);
    });

    it('should distribute approximately 1.5% full_art (for legendary+)', () => {
      const counts: Record<HoloVariant, number> = {
        none: 0,
        standard: 0,
        reverse: 0,
        full_art: 0,
        prismatic: 0,
      };

      for (let i = 0; i < SAMPLE_SIZE; i++) {
        const rng = new SeededRandom(i);
        const result = rollHolo('legendary', rng);
        counts[result]++;
      }

      // For legendary, full_art rolls that succeed go to full_art, otherwise fallback to reverse
      // So we need to check full_art + some reverse (from fallback)
      const fullArtRatio = counts.full_art / SAMPLE_SIZE;
      expect(fullArtRatio).toBeGreaterThanOrEqual(0.015 - ACCEPTABLE_ERROR);
      expect(fullArtRatio).toBeLessThanOrEqual(0.015 + ACCEPTABLE_ERROR);
    });

    it('should distribute approximately 0.5% prismatic (for mythic only)', () => {
      const counts: Record<HoloVariant, number> = {
        none: 0,
        standard: 0,
        reverse: 0,
        full_art: 0,
        prismatic: 0,
      };

      for (let i = 0; i < SAMPLE_SIZE; i++) {
        const rng = new SeededRandom(i);
        const result = rollHolo('mythic', rng);
        counts[result]++;
      }

      const prismaticRatio = counts.prismatic / SAMPLE_SIZE;
      expect(prismaticRatio).toBeGreaterThanOrEqual(0.005 - ACCEPTABLE_ERROR);
      expect(prismaticRatio).toBeLessThanOrEqual(0.005 + ACCEPTABLE_ERROR);
    });
  });

  describe('Rarity Restrictions - US038 AC3-AC5', () => {
    it('should only return prismatic for mythic rarity - US038 AC3', () => {
      const counts: Record<HoloVariant, number> = {
        none: 0,
        standard: 0,
        reverse: 0,
        full_art: 0,
        prismatic: 0,
      };

      // Test non-mythic rarities should never get prismatic
      const nonMythicRarities: Rarity[] = ['common', 'uncommon', 'rare', 'epic', 'legendary'];

      for (const rarity of nonMythicRarities) {
        for (let i = 0; i < SAMPLE_SIZE; i++) {
          const rng = new SeededRandom(i + rarity.length * 1000);
          const result = rollHolo(rarity, rng);
          counts[result]++;
        }
      }

      expect(counts.prismatic).toBe(0);
    });

    it('should only return full_art for legendary or mythic rarity - US038 AC4', () => {
      const counts: Record<HoloVariant, number> = {
        none: 0,
        standard: 0,
        reverse: 0,
        full_art: 0,
        prismatic: 0,
      };

      // Test rarities below legendary should never get full_art
      const lowerRarities: Rarity[] = ['common', 'uncommon', 'rare', 'epic'];

      for (const rarity of lowerRarities) {
        for (let i = 0; i < SAMPLE_SIZE; i++) {
          const rng = new SeededRandom(i + rarity.length * 1000);
          const result = rollHolo(rarity, rng);
          counts[result]++;
        }
      }

      expect(counts.full_art).toBe(0);
    });

    it('should allow standard and reverse for any rarity', () => {
      const counts: Record<HoloVariant, number> = {
        none: 0,
        standard: 0,
        reverse: 0,
        full_art: 0,
        prismatic: 0,
      };

      // All rarities should be able to get standard and reverse
      const allRarities: Rarity[] = ['common', 'uncommon', 'rare', 'epic', 'legendary', 'mythic'];

      for (const rarity of allRarities) {
        for (let i = 0; i < 1000; i++) {
          const rng = new SeededRandom(i + rarity.length * 1000);
          const result = rollHolo(rarity, rng);
          counts[result]++;
        }
      }

      // All rarities combined should have some standard and reverse
      expect(counts.standard).toBeGreaterThan(0);
      expect(counts.reverse).toBeGreaterThan(0);
    });
  });

  describe('Deterministic Behavior', () => {
    it('should return the same result with the same seed', () => {
      const seed = 99999;
      const rng1 = new SeededRandom(seed);
      const rng2 = new SeededRandom(seed);

      const result1 = rollHolo('common', rng1);
      const result2 = rollHolo('common', rng2);

      expect(result1).toBe(result2);
    });

    it('should return different results with different seeds', () => {
      const rng1 = new SeededRandom(11111);
      const rng2 = new SeededRandom(22222);

      // Not guaranteed to be different, but with different seeds this should be true
      // Run multiple times to increase confidence
      let differentCount = 0;
      for (let i = 0; i < 100; i++) {
        const r1 = new SeededRandom(i);
        const r2 = new SeededRandom(i + 1000);
        const result1 = rollHolo('common', r1);
        const result2 = rollHolo('common', r2);
        if (result1 !== result2) differentCount++;
      }

      // At least some should be different
      expect(differentCount).toBeGreaterThan(10);
    });
  });

  describe('Edge Cases', () => {
    it('should handle all rarities without errors', () => {
      const allRarities: Rarity[] = ['common', 'uncommon', 'rare', 'epic', 'legendary', 'mythic'];

      for (const rarity of allRarities) {
        const rng = new SeededRandom(12345);
        expect(() => rollHolo(rarity, rng)).not.toThrow();
      }
    });

    it('should consistently handle extreme values', () => {
      // Test with edge case seeds that might produce boundary rolls
      const edgeCases = [0, 0.5, 0.8, 0.99, 1];

      for (const seed of edgeCases) {
        const rng = new SeededRandom(seed * 100000);
        const result = rollHolo('common', rng);
        expect(['none', 'standard', 'reverse', 'full_art', 'prismatic']).toContain(result);
      }
    });
  });
});

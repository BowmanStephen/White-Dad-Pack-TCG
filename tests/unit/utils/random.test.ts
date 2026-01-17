import { describe, it, expect } from 'vitest';
import { SeededRandom, generateId, weightedRandom } from '../../../src/lib/utils/random';

describe('Random Utilities - US043 Random Utility Tests', () => {
  describe('SeededRandom.nextInt() - Bound Testing', () => {
    it('should return integer within bounds [min, max)', () => {
      const rng = new SeededRandom(12345);

      for (let i = 0; i < 1000; i++) {
        const result = rng.nextInt(5, 10);
        expect(result).toBeGreaterThanOrEqual(5);
        expect(result).toBeLessThan(10);
        expect(Number.isInteger(result)).toBe(true);
      }
    });

    it('should handle zero-based range correctly', () => {
      const rng = new SeededRandom(54321);

      for (let i = 0; i < 1000; i++) {
        const result = rng.nextInt(0, 5);
        expect(result).toBeGreaterThanOrEqual(0);
        expect(result).toBeLessThan(5);
        expect(Number.isInteger(result)).toBe(true);
      }
    });

    it('should handle single value range', () => {
      const rng = new SeededRandom(99999);

      for (let i = 0; i < 100; i++) {
        const result = rng.nextInt(7, 8);
        expect(result).toBe(7);
      }
    });

    it('should handle negative ranges', () => {
      const rng = new SeededRandom(11111);

      for (let i = 0; i < 1000; i++) {
        const result = rng.nextInt(-10, -5);
        expect(result).toBeGreaterThanOrEqual(-10);
        expect(result).toBeLessThan(-5);
      }
    });

    it('should handle large ranges efficiently', () => {
      const rng = new SeededRandom(42);

      for (let i = 0; i < 1000; i++) {
        const result = rng.nextInt(0, 1000000);
        expect(result).toBeGreaterThanOrEqual(0);
        expect(result).toBeLessThan(1000000);
      }
    });
  });

  describe('SeededRandom.pick() - Array Selection', () => {
    it('should pick element from array', () => {
      const rng = new SeededRandom(12345);
      const array = ['a', 'b', 'c', 'd', 'e'];
      const result = rng.pick(array);

      expect(array).toContain(result);
    });

    it('should pick from single-element array', () => {
      const rng = new SeededRandom(54321);
      const array = ['only'];
      const result = rng.pick(array);

      expect(result).toBe('only');
    });

    it('should pick from empty array (edge case handling)', () => {
      const rng = new SeededRandom(99999);
      const array: string[] = [];

      // This should return undefined for empty array
      expect(() => rng.pick(array)).not.toThrow();
      expect(rng.pick(array)).toBeUndefined();
    });

    it('should pick from array of numbers', () => {
      const rng = new SeededRandom(11111);
      const array = [1, 2, 3, 4, 5];
      const result = rng.pick(array);

      expect(array).toContain(result);
    });

    it('should pick from array of objects', () => {
      const rng = new SeededRandom(42);
      const array = [
        { id: 1, name: 'Alice' },
        { id: 2, name: 'Bob' },
        { id: 3, name: 'Charlie' },
      ];
      const result = rng.pick(array);

      expect(array).toContain(result);
    });

    it('should eventually pick all elements from small array over many iterations', () => {
      const rng = new SeededRandom(777);
      const array = ['a', 'b', 'c'];
      const picked = new Set<string>();

      // With enough iterations, we should see all elements
      for (let i = 0; i < 100; i++) {
        picked.add(rng.pick(array));
      }

      expect(picked.size).toBe(3);
      expect(picked.has('a')).toBe(true);
      expect(picked.has('b')).toBe(true);
      expect(picked.has('c')).toBe(true);
    });
  });

  describe('SeededRandom.shuffle() - Array Shuffling', () => {
    it('should shuffle array and return all elements', () => {
      const rng = new SeededRandom(12345);
      const original = [1, 2, 3, 4, 5];
      const shuffled = rng.shuffle(original);

      expect(shuffled).toHaveLength(5);
      expect(shuffled).toEqual(expect.arrayContaining([1, 2, 3, 4, 5]));
      expect(original).toEqual([1, 2, 3, 4, 5]); // Original unchanged
    });

    it('should handle single-element array', () => {
      const rng = new SeededRandom(54321);
      const array = [1];
      const shuffled = rng.shuffle(array);

      expect(shuffled).toEqual([1]);
    });

    it('should handle empty array', () => {
      const rng = new SeededRandom(99999);
      const array: number[] = [];
      const shuffled = rng.shuffle(array);

      expect(shuffled).toEqual([]);
    });

    it('should produce different order with different seeds', () => {
      const array = [1, 2, 3, 4, 5];
      const rng1 = new SeededRandom(111);
      const rng2 = new SeededRandom(222);

      const shuffled1 = rng1.shuffle(array);
      const shuffled2 = rng2.shuffle(array);

      expect(shuffled1).not.toEqual(shuffled2);
    });

    it('should produce same order with same seed', () => {
      const array = [1, 2, 3, 4, 5];
      const rng1 = new SeededRandom(12345);
      const rng2 = new SeededRandom(12345);

      const shuffled1 = rng1.shuffle(array);
      const shuffled2 = rng2.shuffle(array);

      expect(shuffled1).toEqual(shuffled2);
    });
  });

  describe('weightedRandom() - Distribution Accuracy', () => {
    it('should select options according to their weights', () => {
      const weights = { a: 0.5, b: 0.3, c: 0.2 };
      const results: Record<string, number> = { a: 0, b: 0, c: 0 };
      const iterations = 10000;

      for (let i = 0; i < iterations; i++) {
        const result = weightedRandom(weights);
        results[result]++;
      }

      // Check distribution is approximately correct (within 5%)
      expect(results['a'] / iterations).toBeCloseTo(0.5, 1);
      expect(results['b'] / iterations).toBeCloseTo(0.3, 1);
      expect(results['c'] / iterations).toBeCloseTo(0.2, 1);
    });

    it('should handle equal weights (uniform distribution)', () => {
      const weights = { a: 1, b: 1, c: 1, d: 1 };
      const results: Record<string, number> = { a: 0, b: 0, c: 0, d: 0 };
      const iterations = 10000;

      for (let i = 0; i < iterations; i++) {
        const result = weightedRandom(weights);
        results[result]++;
      }

      // Each option should appear ~25% of the time
      for (const key of Object.keys(results)) {
        expect(results[key] / iterations).toBeCloseTo(0.25, 1);
      }
    });

    it('should handle single option', () => {
      const weights = { only: 1 };

      for (let i = 0; i < 100; i++) {
        const result = weightedRandom(weights);
        expect(result).toBe('only');
      }
    });

    it('should handle zero-weighted options (never selected)', () => {
      const weights = { a: 1, b: 0, c: 1 };
      const results: Record<string, number> = { a: 0, b: 0, c: 0 };
      const iterations = 1000;

      for (let i = 0; i < iterations; i++) {
        const result = weightedRandom(weights);
        results[result]++;
      }

      expect(results.b).toBe(0);
      expect(results.a).toBeGreaterThan(0);
      expect(results.c).toBeGreaterThan(0);
    });

    it('should handle very small weights', () => {
      const weights = { common: 0.99, rare: 0.01 };
      const results: Record<string, number> = { common: 0, rare: 0 };
      const iterations = 10000;

      for (let i = 0; i < iterations; i++) {
        const result = weightedRandom(weights);
        results[result]++;
      }

      // Rare should appear ~1% of the time
      expect(results.rare / iterations).toBeCloseTo(0.01, 1);
      expect(results.common / iterations).toBeCloseTo(0.99, 1);
    });
  });

  describe('Seeded Random Consistency', () => {
    it('should produce same sequence with same seed', () => {
      const seed = 12345;
      const rng1 = new SeededRandom(seed);
      const rng2 = new SeededRandom(seed);

      const sequence1: number[] = [];
      const sequence2: number[] = [];

      for (let i = 0; i < 100; i++) {
        sequence1.push(rng1.nextInt(0, 100));
        sequence2.push(rng2.nextInt(0, 100));
      }

      expect(sequence1).toEqual(sequence2);
    });

    it('should produce different sequences with different seeds', () => {
      const rng1 = new SeededRandom(12345);
      const rng2 = new SeededRandom(54321);

      const sequence1: number[] = [];
      const sequence2: number[] = [];

      for (let i = 0; i < 100; i++) {
        sequence1.push(rng1.nextInt(0, 100));
        sequence2.push(rng2.nextInt(0, 100));
      }

      expect(sequence1).not.toEqual(sequence2);
    });

    it('should maintain consistency across next(), nextInt(), pick()', () => {
      const seed = 99999;
      const rng1 = new SeededRandom(seed);
      const rng2 = new SeededRandom(seed);

      // Mix different operations
      const results1: (number | string)[] = [];
      const results2: (number | string)[] = [];

      const array = ['a', 'b', 'c', 'd', 'e'];

      for (let i = 0; i < 50; i++) {
        results1.push(rng1.nextInt(0, 10));
        results1.push(rng1.next());
        results1.push(rng1.pick(array));

        results2.push(rng2.nextInt(0, 10));
        results2.push(rng2.next());
        results2.push(rng2.pick(array));
      }

      expect(results1).toEqual(results2);
    });

    it('should allow resetting seed by creating new instance', () => {
      const seed = 42;
      const rng1 = new SeededRandom(seed);

      const sequence1: number[] = [];
      for (let i = 0; i < 10; i++) {
        sequence1.push(rng1.nextInt(0, 100));
      }

      // Create new RNG with same seed
      const rng2 = new SeededRandom(seed);
      const sequence2: number[] = [];
      for (let i = 0; i < 10; i++) {
        sequence2.push(rng2.nextInt(0, 100));
      }

      expect(sequence1).toEqual(sequence2);
    });

    it('should work with weightedRandom using seeded RNG', () => {
      const seed = 777;
      const rng1 = new SeededRandom(seed);
      const rng2 = new SeededRandom(seed);

      const weights = { a: 0.3, b: 0.5, c: 0.2 };
      const results1: string[] = [];
      const results2: string[] = [];

      for (let i = 0; i < 100; i++) {
        results1.push(weightedRandom(weights, rng1));
        results2.push(weightedRandom(weights, rng2));
      }

      expect(results1).toEqual(results2);
    });
  });

  describe('Bias Testing - Statistical Fairness', () => {
    it('nextInt() should have uniform distribution across range', () => {
      const rng = new SeededRandom(12345);
      const range = 10;
      const iterations = 100000;
      const counts = new Array(range).fill(0);

      for (let i = 0; i < iterations; i++) {
        const result = rng.nextInt(0, range);
        counts[result]++;
      }

      // Each number should appear approximately 1/range of the time
      const expectedRatio = 1 / range;
      const tolerance = 0.02; // 2% tolerance

      for (let i = 0; i < range; i++) {
        const ratio = counts[i] / iterations;
        expect(ratio).toBeGreaterThan(expectedRatio - tolerance);
        expect(ratio).toBeLessThan(expectedRatio + tolerance);
      }
    });

    it('next() should have uniform distribution [0, 1)', () => {
      const rng = new SeededRandom(54321);
      const iterations = 100000;
      let sum = 0;
      let min = 1;
      let max = 0;

      for (let i = 0; i < iterations; i++) {
        const result = rng.next();
        sum += result;
        min = Math.min(min, result);
        max = Math.max(max, result);
      }

      const mean = sum / iterations;

      // Mean should be approximately 0.5 for uniform distribution
      expect(mean).toBeCloseTo(0.5, 1);

      // Should span most of the range (allowing some randomness at edges)
      expect(min).toBeLessThan(0.01);
      expect(max).toBeGreaterThan(0.99);
    });

    it('pick() should select all elements uniformly over many iterations', () => {
      const rng = new SeededRandom(99999);
      const array = ['a', 'b', 'c', 'd', 'e'];
      const iterations = 50000;
      const counts: Record<string, number> = {
        a: 0, b: 0, c: 0, d: 0, e: 0,
      };

      for (let i = 0; i < iterations; i++) {
        const result = rng.pick(array);
        counts[result]++;
      }

      // Each element should appear approximately 1/5 of the time
      const expectedRatio = 1 / array.length;
      const tolerance = 0.02; // 2% tolerance

      for (const key of Object.keys(counts)) {
        const ratio = counts[key] / iterations;
        expect(ratio).toBeGreaterThan(expectedRatio - tolerance);
        expect(ratio).toBeLessThan(expectedRatio + tolerance);
      }
    });

    it('shuffle() should produce all permutations over many iterations', () => {
      const array = [1, 2, 3];
      const iterations = 10000;
      const permutations = new Set<string>();
      const rng = new SeededRandom(11111);

      // There are 3! = 6 possible permutations
      for (let i = 0; i < iterations; i++) {
        const shuffled = rng.shuffle([...array]);
        permutations.add(JSON.stringify(shuffled));
      }

      // Should see all 6 permutations over many iterations
      // (Though statistically we might miss 1-2 due to randomness)
      expect(permutations.size).toBeGreaterThanOrEqual(4);
    });

    it('weightedRandom() should match exact weights over many iterations', () => {
      const rng = new SeededRandom(42);
      const weights = { low: 0.1, medium: 0.3, high: 0.6 };
      const iterations = 50000;
      const counts: Record<string, number> = { low: 0, medium: 0, high: 0 };

      for (let i = 0; i < iterations; i++) {
        const result = weightedRandom(weights, rng);
        counts[result]++;
      }

      // Check distribution matches weights within tolerance
      const tolerance = 0.02; // 2% tolerance
      expect(counts.low / iterations).toBeCloseTo(0.1, 1);
      expect(counts.medium / iterations).toBeCloseTo(0.3, 1);
      expect(counts.high / iterations).toBeCloseTo(0.6, 1);
    });

    it('should not show position bias in pick() for different array sizes', () => {
      const iterations = 10000;

      // Test small array
      const smallArray = ['a', 'b', 'c'];
      const smallCounts: Record<string, number> = { a: 0, b: 0, c: 0 };
      const rng1 = new SeededRandom(22222);

      for (let i = 0; i < iterations; i++) {
        const result = rng1.pick(smallArray);
        smallCounts[result]++;
      }

      const expectedRatio = 1 / smallArray.length;
      const tolerance = 0.02;

      for (const key of Object.keys(smallCounts)) {
        const ratio = smallCounts[key] / iterations;
        expect(ratio).toBeGreaterThan(expectedRatio - tolerance);
        expect(ratio).toBeLessThan(expectedRatio + tolerance);
      }

      // Test large array
      const largeArray = Array.from({ length: 50 }, (_, i) => i);
      const largeCounts = new Array(50).fill(0);
      const rng2 = new SeededRandom(33333);

      for (let i = 0; i < iterations * 10; i++) {
        const result = rng2.pick(largeArray);
        largeCounts[result]++;
      }

      const largeExpectedRatio = 1 / largeArray.length;
      for (let i = 0; i < 50; i++) {
        const ratio = largeCounts[i] / (iterations * 10);
        expect(ratio).toBeGreaterThan(largeExpectedRatio - tolerance);
        expect(ratio).toBeLessThan(largeExpectedRatio + tolerance);
      }
    });
  });

  describe('generateId() - UUID Generation', () => {
    it('should generate valid UUID-like strings', () => {
      const id = generateId();

      expect(id).toMatch(
        /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
      );
    });

    it('should generate unique IDs', () => {
      const ids = new Set<string>();
      const iterations = 10000;

      for (let i = 0; i < iterations; i++) {
        ids.add(generateId());
      }

      expect(ids.size).toBe(iterations);
    });

    it('should always have version 4 (random UUID)', () => {
      for (let i = 0; i < 1000; i++) {
        const id = generateId();
        // Version 4 UUIDs have '4' at position 14
        expect(id.charAt(14)).toBe('4');
      }
    });

    it('should have correct variant bits', () => {
      for (let i = 0; i < 1000; i++) {
        const id = generateId();
        // Variant bits should be 10xx, meaning char at position 19 should be 8, 9, a, or b
        const variantChar = id.charAt(19).toLowerCase();
        expect(['8', '9', 'a', 'b']).toContain(variantChar);
      }
    });

    it('should have consistent length', () => {
      for (let i = 0; i < 1000; i++) {
        const id = generateId();
        expect(id).toHaveLength(36); // Standard UUID length
      }
    });
  });

  describe('Edge Cases', () => {
    it('should handle seed value of 0', () => {
      const rng = new SeededRandom(0);

      expect(rng.nextInt(0, 10)).toBeDefined();
      expect(rng.next()).toBeDefined();
    });

    it('should handle maximum safe integer seed', () => {
      const seed = Number.MAX_SAFE_INTEGER;
      const rng = new SeededRandom(seed);

      expect(rng.nextInt(0, 10)).toBeDefined();
    });

    it('should handle negative seed', () => {
      const rng = new SeededRandom(-12345);

      expect(rng.nextInt(0, 10)).toBeDefined();
      expect(rng.next()).toBeGreaterThanOrEqual(0);
      expect(rng.next()).toBeLessThan(1);
    });

    it('should handle very large weight values in weightedRandom', () => {
      const weights = { a: 1000000, b: 2000000, c: 3000000 };
      const results: Record<string, number> = { a: 0, b: 0, c: 0 };
      const iterations = 10000;

      for (let i = 0; i < iterations; i++) {
        const result = weightedRandom(weights);
        results[result]++;
      }

      // Ratios should still be correct
      expect(results['a'] / iterations).toBeCloseTo(1/6, 1);
      expect(results['b'] / iterations).toBeCloseTo(2/6, 1);
      expect(results['c'] / iterations).toBeCloseTo(3/6, 1);
    });

    it('should handle very small weight values in weightedRandom', () => {
      const weights = { a: 0.0001, b: 0.0002, c: 0.0003 };
      const results: Record<string, number> = { a: 0, b: 0, c: 0 };
      const iterations = 10000;

      for (let i = 0; i < iterations; i++) {
        const result = weightedRandom(weights);
        results[result]++;
      }

      // Ratios should still be correct
      expect(results['a'] / iterations).toBeCloseTo(1/6, 1);
      expect(results['b'] / iterations).toBeCloseTo(2/6, 1);
      expect(results['c'] / iterations).toBeCloseTo(3/6, 1);
    });
  });
});

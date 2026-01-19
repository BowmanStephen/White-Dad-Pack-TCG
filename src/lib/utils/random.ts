/**
 * Seeded random number generator for reproducible results
 */
export class SeededRandom {
  private seed: number;

  constructor(seed?: number) {
    this.seed = seed ?? Date.now();
  }

  /**
   * Generate a random number between 0 and 1
   */
  next(): number {
    this.seed = (this.seed * 1103515245 + 12345) & 0x7fffffff;
    return this.seed / 0x7fffffff;
  }

  /**
   * Generate a random integer between min (inclusive) and max (exclusive)
   */
  nextInt(min: number, max: number): number {
    return Math.floor(this.next() * (max - min)) + min;
  }

  /**
   * Pick a random element from an array
   */
  pick<T>(array: T[]): T {
    return array[this.nextInt(0, array.length)];
  }

  /**
   * Shuffle an array in place using Fisher-Yates algorithm
   */
  shuffle<T>(array: T[]): T[] {
    const result = [...array];
    for (let i = result.length - 1; i > 0; i--) {
      const j = this.nextInt(0, i + 1);
      [result[i], result[j]] = [result[j], result[i]];
    }
    return result;
  }
}

/**
 * Generate a random UUID-like string
 */
export function generateId(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

/**
 * Weighted random selection
 * @param weights Object mapping keys to their weights (probabilities)
 * @param rng Optional seeded random generator
 * @returns The selected key
 */
export function weightedRandom<T extends string>(
  weights: Partial<Record<T, number>>,
  rng?: SeededRandom
): T {
  const entries = Object.entries(weights) as [T, number][];
  const totalWeight = entries.reduce((sum, [, weight]) => sum + weight, 0);

  let random = rng ? rng.next() : Math.random();
  random *= totalWeight;

  let cumulative = 0;
  for (const [key, weight] of entries) {
    cumulative += weight;
    if (random <= cumulative) {
      return key;
    }
  }

  // Fallback to last item (shouldn't happen with valid weights)
  return entries[entries.length - 1][0];
}

/**
 * Generate a random boolean with specified probability
 * @param probability The probability of returning true (0-1)
 * @returns true with the given probability, false otherwise
 *
 * @example
 * ```ts
 * randomBoolean(0.5); // 50% chance of true
 * randomBoolean(0.1); // 10% chance of true
 * randomBoolean(1.0); // Always true
 * randomBoolean(0.0); // Always false
 * ```
 */
export function randomBoolean(probability: number): boolean {
  // Clamp probability between 0 and 1
  const clampedProbability = Math.max(0, Math.min(1, probability));
  return Math.random() < clampedProbability;
}

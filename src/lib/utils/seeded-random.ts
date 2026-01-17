/**
 * Seeded Random Number Generator
 *
 * Uses a Mulberry32 algorithm for fast, deterministic random number generation.
 * Given the same seed, it will always produce the same sequence of numbers.
 *
 * This allows us to generate consistent card artwork based on card IDs.
 */

export class SeededRandom {
  private state: number;

  /**
   * Create a new seeded random generator
   * @param seed - The seed value (use hashString() for string seeds)
   */
  constructor(seed: number) {
    this.state = seed;
  }

  /**
   * Generate a random number between 0 and 1
   */
  next(): number {
    let t = this.state += 0x6D2B79F5;
    t = Math.imul(t ^ t >>> 15, t | 1);
    t ^= t + Math.imul(t ^ t >>> 7, t | 61);
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  }

  /**
   * Generate a random integer between min (inclusive) and max (exclusive)
   */
  range(min: number, max: number): number {
    return Math.floor(this.next() * (max - min)) + min;
  }

  /**
   * Generate a random number from a normal distribution (Gaussian)
   * Uses Box-Muller transform
   */
  normal(mean: number = 0, stdDev: number = 1): number {
    const u1 = this.next();
    const u2 = this.next();
    const z0 = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
    return z0 * stdDev + mean;
  }

  /**
   * Pick a random element from an array
   */
  pick<T>(array: T[]): T {
    return array[Math.floor(this.next() * array.length)];
  }

  /**
   * Generate a random color
   */
  color(): string {
    const r = Math.floor(this.next() * 256);
    const g = Math.floor(this.next() * 256);
    const b = Math.floor(this.next() * 256);
    return `rgb(${r}, ${g}, ${b})`;
  }

  /**
   * Generate a random color with alpha
   */
  colorAlpha(alpha: number = 1): string {
    const r = Math.floor(this.next() * 256);
    const g = Math.floor(this.next() * 256);
    const b = Math.floor(this.next() * 256);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  }
}

/**
 * Hash a string to a numeric seed
 * Uses a simple but effective DJB2 hash
 */
export function hashString(str: string): number {
  let hash = 5381;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) + hash) + str.charCodeAt(i); // hash * 33 + c
  }
  return hash >>> 0; // Convert to unsigned 32-bit integer
}

/**
 * Create a seeded random generator from a string seed
 */
export function createSeededRandom(seed: string): SeededRandom {
  return new SeededRandom(hashString(seed));
}

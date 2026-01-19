import type { DadType } from '@/types';

// Import jokes database
import jokesDatabase from '@/data/jokes.json';

// Type for the jokes database structure
interface JokesDatabase {
  jokes: Record<DadType, string[]>;
}

// Cache for loaded jokes to avoid re-reading the file
let jokesCache: Record<DadType, string[]> | null = null;

/**
 * Load jokes from the jokes database
 * @returns Categorized jokes by dad type
 */
export function loadJokes(): Record<DadType, string[]> {
  if (jokesCache) {
    return jokesCache;
  }

  jokesCache = (jokesDatabase as JokesDatabase).jokes;
  return jokesCache;
}

/**
 * Get a random joke for a specific dad type
 * @param dadType - The type of dad to get a joke for
 * @returns A random joke string, or a generic fallback if no jokes exist for that type
 */
export function getRandomJoke(dadType: DadType): string {
  const jokes = loadJokes();
  const typeJokes = jokes[dadType] || [];

  if (typeJokes.length === 0) {
    // Fallback joke if no jokes exist for this type
    return "I'd tell you a joke, but I'm still buffering... just like my old computer!";
  }

  // Get a random index
  const randomIndex = Math.floor(Math.random() * typeJokes.length);
  return typeJokes[randomIndex];
}

/**
 * Get multiple unique jokes for a specific dad type
 * @param dadType - The type of dad to get jokes for
 * @param count - Number of unique jokes to return
 * @returns Array of unique joke strings
 */
export function getMultipleJokes(dadType: DadType, count: number): string[] {
  const jokes = loadJokes();
  const typeJokes = jokes[dadType] || [];

  if (typeJokes.length === 0) {
    return [getRandomJoke(dadType)];
  }

  // Shuffle the jokes
  const shuffled = [...typeJokes].sort(() => Math.random() - 0.5);

  // Return up to 'count' jokes
  return shuffled.slice(0, Math.min(count, shuffled.length));
}

/**
 * Get all jokes for a specific dad type
 * @param dadType - The type of dad to get jokes for
 * @returns Array of all joke strings for that type
 */
export function getAllJokesForType(dadType: DadType): string[] {
  const jokes = loadJokes();
  return jokes[dadType] || [];
}

/**
 * Get joke count for a specific dad type
 * @param dadType - The type of dad to count jokes for
 * @returns Number of jokes for that type
 */
export function getJokeCount(dadType: DadType): number {
  const jokes = loadJokes();
  return (jokes[dadType] || []).length;
}

/**
 * Get total joke count across all dad types
 * @returns Total number of jokes in the database
 */
export function getTotalJokeCount(): number {
  const jokes = loadJokes();
  let total = 0;

  for (const typeJokes of Object.values(jokes)) {
    total += typeJokes.length;
  }

  return total;
}

/**
 * Clear the jokes cache (useful for testing or hot-reloading)
 */
export function clearJokesCache(): void {
  jokesCache = null;
}

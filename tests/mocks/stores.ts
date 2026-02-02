/**
 * Mock helpers for Nanostores testing
 *
 * Provides proper Nanostores-compatible mocks that work with Vitest
 * and Svelte 5 component testing.
 */
import { vi } from 'vitest';
import type { Pack, PackState, PackCard, AppError } from '@/types';

/**
 * Create a mock Nanostores-compatible store
 *
 * Mimics the behavior of a nanostores atom with subscribe/get/set methods.
 * The subscribe method immediately calls the callback with the current value
 * (matching real Nanostores behavior) and returns an unsubscribe function.
 *
 * @template T - The store value type
 * @param initialValue - The initial value for the store
 * @returns A mock store object with get, set, and subscribe methods
 */
export function createMockStore<T>(initialValue: T) {
  let value = initialValue;
  const subscribers = new Set<(val: T) => void>();

  return {
    /**
     * Get the current store value
     */
    get: () => value,

    /**
     * Set a new store value and notify all subscribers
     * @param newValue - The new value to set
     */
    set: (newValue: T) => {
      value = newValue;
      subscribers.forEach(sub => sub(newValue));
    },

    /**
     * Subscribe to store changes
     * Immediately calls the callback with the current value (Nanostores behavior)
     *
     * @param callback - Function to call when value changes
     * @returns Unsubscribe function
     */
    subscribe: (callback: (val: T) => void) => {
      subscribers.add(callback);
      // Immediately call with current value (Nanostores behavior)
      callback(value);
      return () => subscribers.delete(callback);
    }
  };
}

/**
 * Create a complete mock pack store with all Nanostores and functions
 *
 * This mock provides:
 * - All pack store functions (openNewPack, skipToResults, etc.) as vi.fn() mocks
 * - All Nanostores (currentPack, packState, etc.) as createMockStore instances
 *
 * @returns A complete mock pack store object
 */
export function createMockPackStore() {
  return {
    // Pack store functions (all mocked)
    openNewPack: vi.fn(),
    completePackAnimation: vi.fn(),
    skipToResults: vi.fn(),
    nextCard: vi.fn(),
    prevCard: vi.fn(),
    resetPack: vi.fn(),
    showResults: vi.fn(),

    // Nanostores (all with proper subscribe/get/set)
    currentPack: createMockStore<Pack | null>(null),
    packState: createMockStore<PackState>('idle'),
    currentCardIndex: createMockStore<number>(0),
    revealedCards: createMockStore<Set<number>>(new Set()),
    packStats: createMockStore<{
      totalCards: number;
      rarityBreakdown: Record<string, number>;
      holoCount: number;
      bestCard: PackCard;
    } | null>(null),
    packError: createMockStore<AppError | null>(null),
    storageError: createMockStore<AppError | null>(null),
    currentTearAnimation: createMockStore<'standard' | 'slow' | 'explosive'>('standard')
  };
}

/**
 * Create a mock pack for testing
 *
 * @param overrides - Optional partial pack to override defaults
 * @returns A complete Pack object with test data
 */
export function createMockPack(overrides: Partial<Pack> = {}): Pack {
  const defaultCards: PackCard[] = [
    {
      id: 'card-1',
      name: 'BBQ Dad',
      rarity: 'common',
      dadType: 'BBQ_DAD',
      stats: {
        dadJoke: 50,
        grillSkill: 80,
        fixIt: 30,
        napPower: 60,
        remoteControl: 70,
        thermostat: 40,
        sockSandal: 20,
        beerSnob: 55
      },
      ability: { name: 'Grill Master', description: '+20 Grill Skill when cooking burgers' },
      flavorText: '"Grilling isn\'t just cooking, it\'s a lifestyle."',
      isHolo: false,
      holoType: 'none',
      isRevealed: false,
      collectionId: 'collection-1'
    },
    {
      id: 'card-2',
      name: 'Fix-It Dad',
      rarity: 'uncommon',
      dadType: 'FIX_IT_DAD',
      stats: {
        dadJoke: 40,
        grillSkill: 30,
        fixIt: 90,
        napPower: 50,
        remoteControl: 60,
        thermostat: 70,
        sockSandal: 25,
        beerSnob: 45
      },
      ability: { name: 'Duct Tape Master', description: 'Can fix anything with duct tape' },
      flavorText: '"If it can\'t be fixed with duct tape, you\'re not using enough duct tape."',
      isHolo: true,
      holoType: 'standard',
      isRevealed: false,
      collectionId: 'collection-1'
    },
    {
      id: 'card-3',
      name: 'Couch Dad',
      rarity: 'rare',
      dadType: 'COUCH_DAD',
      stats: {
        dadJoke: 70,
        grillSkill: 20,
        fixIt: 10,
        napPower: 95,
        remoteControl: 85,
        thermostat: 50,
        sockSandal: 30,
        beerSnob: 60
      },
      ability: { name: 'Remote Control Whisperer', description: 'Always finds the best show to watch' },
      flavorText: '"I\'m not asleep, I\'m just resting my eyes."',
      isHolo: false,
      holoType: 'none',
      isRevealed: false,
      collectionId: 'collection-1'
    }
  ];

  return {
    id: 'test-pack-1',
    packType: 'standard',
    cards: defaultCards,
    openedAt: new Date().toISOString(),
    bestRarity: 'rare',
    design: {
      background: 'gradient',
      borderColor: 'gold'
    },
    tearAnimation: 'standard',
    ...overrides
  };
}

/**
 * Create a mock AppError for testing
 *
 * @param overrides - Optional partial error to override defaults
 * @returns A complete AppError object
 */
export function createMockError(overrides: Partial<AppError> = {}): AppError {
  return {
    id: 'err_test',
    category: 'generation' as any,
    title: 'Pack Generation Failed',
    message: 'Unable to generate pack. Please try again.',
    icon: '⚠️',
    recovery: [
      { label: 'Try Again', action: 'retry' }
    ],
    timestamp: Date.now(),
    logged: false,
    ...overrides
  };
}

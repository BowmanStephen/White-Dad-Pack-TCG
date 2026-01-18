/**
 * Pity System Tests
 *
 * Tests for the bad luck protection system that guarantees rare+ pulls
 * after a certain number of packs without pulling them.
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  pityCounter,
  updatePityCounters,
  getPityState,
  getPityMultiplier,
  isRarityGuaranteed,
  getGuaranteedRarity,
  resetPityCounters,
  getPacksUntilRare,
  getPacksUntilEpic,
  getPacksUntilLegendary,
  getPacksUntilMythic,
  applyPityToRarityProbabilities,
} from '../../../src/stores/pity';
import { DEFAULT_PITY_THRESHOLDS } from '../../../src/types';
import type { Pack, PackCard, Rarity } from '../../../src/types';

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: vi.fn((key: string) => store[key] || null),
    setItem: vi.fn((key: string, value: string) => {
      store[key] = value;
    }),
    removeItem: vi.fn((key: string) => {
      delete store[key];
    }),
    clear: vi.fn(() => {
      store = {};
    }),
  };
})();

Object.defineProperty(global, 'localStorage', {
  value: localStorageMock,
});

// Helper to create a mock pack
function createMockPack(rarities: Rarity[]): Pack {
  const cards: PackCard[] = rarities.map((rarity, i) => ({
    id: `card-${i}`,
    name: `Card ${i}`,
    subtitle: 'Test Card',
    type: 'BBQ_DAD',
    rarity,
    artwork: '/test.png',
    stats: {
      dadJoke: 50,
      grillSkill: 50,
      fixIt: 50,
      napPower: 50,
      remoteControl: 50,
      thermostat: 50,
      sockSandal: 50,
      beerSnob: 50,
    },
    flavorText: 'Test',
    abilities: [],
    series: 1,
    cardNumber: i + 1,
    totalInSeries: 50,
    artist: 'Test',
    isRevealed: true,
    isHolo: false,
    holoType: 'none',
  }));

  // Find best rarity
  const rarityOrder = { common: 0, uncommon: 1, rare: 2, epic: 3, legendary: 4, mythic: 5 };
  const bestRarity = rarities.reduce((best, r) => 
    rarityOrder[r] > rarityOrder[best] ? r : best, 'common' as Rarity);

  return {
    id: 'test-pack',
    cards,
    openedAt: new Date(),
    bestRarity,
    design: 'standard',
  };
}

describe('Pity System Store', () => {
  beforeEach(() => {
    localStorageMock.clear();
    resetPityCounters();
  });

  describe('resetPityCounters', () => {
    it('should reset all counters to 0', () => {
      // Simulate some packs without rare
      for (let i = 0; i < 10; i++) {
        updatePityCounters(createMockPack(['common', 'common', 'common', 'common', 'common', 'uncommon']));
      }

      // Reset
      resetPityCounters();

      const state = getPityState();
      expect(state.counters.packsSinceRare).toBe(0);
      expect(state.counters.packsSinceEpic).toBe(0);
      expect(state.counters.packsSinceLegendary).toBe(0);
      expect(state.counters.packsSinceMythic).toBe(0);
    });
  });

  describe('updatePityCounters', () => {
    it('should increment counters when no rare+ is pulled', () => {
      const pack = createMockPack(['common', 'common', 'common', 'common', 'common', 'uncommon']);
      updatePityCounters(pack);

      const state = getPityState();
      expect(state.counters.packsSinceRare).toBe(1);
      expect(state.counters.packsSinceEpic).toBe(1);
      expect(state.counters.packsSinceLegendary).toBe(1);
      expect(state.counters.packsSinceMythic).toBe(1);
    });

    it('should reset rare counter when rare is pulled', () => {
      // First, open some packs without rare
      for (let i = 0; i < 5; i++) {
        updatePityCounters(createMockPack(['common', 'common', 'common', 'common', 'common', 'uncommon']));
      }

      // Now pull a rare
      updatePityCounters(createMockPack(['common', 'common', 'common', 'common', 'common', 'rare']));

      const state = getPityState();
      expect(state.counters.packsSinceRare).toBe(0);
      expect(state.counters.packsSinceEpic).toBe(6); // Still counting for epic
    });

    it('should reset all relevant counters when mythic is pulled', () => {
      // Open 10 packs without anything good
      for (let i = 0; i < 10; i++) {
        updatePityCounters(createMockPack(['common', 'common', 'common', 'common', 'common', 'uncommon']));
      }

      // Pull a mythic
      updatePityCounters(createMockPack(['common', 'common', 'common', 'common', 'common', 'mythic']));

      const state = getPityState();
      expect(state.counters.packsSinceRare).toBe(0);
      expect(state.counters.packsSinceEpic).toBe(0);
      expect(state.counters.packsSinceLegendary).toBe(0);
      expect(state.counters.packsSinceMythic).toBe(0);
    });
  });

  describe('getPityState', () => {
    it('should calculate progress percentages correctly', () => {
      // Open 15 packs without rare (soft pity threshold)
      for (let i = 0; i < 15; i++) {
        updatePityCounters(createMockPack(['common', 'common', 'common', 'common', 'common', 'uncommon']));
      }

      const state = getPityState();

      // 15 packs / 30 hard pity = 50%
      expect(state.rareProgress).toBe(50);
      expect(state.rareSoftPityActive).toBe(true);
      expect(state.rareGuaranteed).toBe(false);
    });

    it('should show guaranteed when at hard pity', () => {
      // Open 30 packs without rare (hard pity threshold)
      for (let i = 0; i < 30; i++) {
        updatePityCounters(createMockPack(['common', 'common', 'common', 'common', 'common', 'uncommon']));
      }

      const state = getPityState();
      expect(state.rareProgress).toBe(100);
      expect(state.rareGuaranteed).toBe(true);
    });
  });

  describe('getPityMultiplier', () => {
    it('should return 1.0 when below soft pity', () => {
      const multiplier = getPityMultiplier('rare');
      expect(multiplier).toBe(1.0);
    });

    it('should return increased multiplier at soft pity', () => {
      // Open 15 packs (soft pity threshold)
      for (let i = 0; i < 15; i++) {
        updatePityCounters(createMockPack(['common', 'common', 'common', 'common', 'common', 'uncommon']));
      }

      const multiplier = getPityMultiplier('rare');
      expect(multiplier).toBeGreaterThan(1.0);
      expect(multiplier).toBe(DEFAULT_PITY_THRESHOLDS.rare.softPityMultiplier);
    });

    it('should return Infinity at hard pity (guaranteed)', () => {
      // Open 30 packs (hard pity)
      for (let i = 0; i < 30; i++) {
        updatePityCounters(createMockPack(['common', 'common', 'common', 'common', 'common', 'uncommon']));
      }

      const multiplier = getPityMultiplier('rare');
      expect(multiplier).toBe(Infinity);
    });
  });

  describe('isRarityGuaranteed', () => {
    it('should return false when below hard pity', () => {
      expect(isRarityGuaranteed('rare')).toBe(false);
      expect(isRarityGuaranteed('epic')).toBe(false);
    });

    it('should return true when at hard pity for rare', () => {
      for (let i = 0; i < 30; i++) {
        updatePityCounters(createMockPack(['common', 'common', 'common', 'common', 'common', 'uncommon']));
      }

      expect(isRarityGuaranteed('rare')).toBe(true);
      expect(isRarityGuaranteed('epic')).toBe(false); // Not yet at epic hard pity
    });
  });

  describe('getGuaranteedRarity', () => {
    it('should return null when no rarity is guaranteed', () => {
      expect(getGuaranteedRarity()).toBeNull();
    });

    it('should return the highest guaranteed rarity', () => {
      // Get to rare hard pity
      for (let i = 0; i < 30; i++) {
        updatePityCounters(createMockPack(['common', 'common', 'common', 'common', 'common', 'uncommon']));
      }

      expect(getGuaranteedRarity()).toBe('rare');

      // Get to epic hard pity (60 total)
      for (let i = 0; i < 30; i++) {
        updatePityCounters(createMockPack(['common', 'common', 'common', 'common', 'common', 'uncommon']));
      }

      expect(getGuaranteedRarity()).toBe('epic');
    });
  });

  describe('getPacksUntil functions', () => {
    it('should return correct packs until rare', () => {
      expect(getPacksUntilRare()).toBe(30);

      // Open 10 packs
      for (let i = 0; i < 10; i++) {
        updatePityCounters(createMockPack(['common', 'common', 'common', 'common', 'common', 'uncommon']));
      }

      expect(getPacksUntilRare()).toBe(20);
    });

    it('should return 0 when at or past hard pity', () => {
      for (let i = 0; i < 35; i++) {
        updatePityCounters(createMockPack(['common', 'common', 'common', 'common', 'common', 'uncommon']));
      }

      expect(getPacksUntilRare()).toBe(0);
    });
  });

  describe('applyPityToRarityProbabilities', () => {
    it('should not modify probabilities when below soft pity', () => {
      const baseProbabilities = { uncommon: 0.74, rare: 0.20, epic: 0.05, legendary: 0.009, mythic: 0.001 };
      const boosted = applyPityToRarityProbabilities(baseProbabilities);

      // Should be normalized but not significantly boosted
      expect(boosted.rare).toBeCloseTo(0.20, 1);
    });

    it('should force guaranteed rarity when at hard pity', () => {
      // Get to rare hard pity
      for (let i = 0; i < 30; i++) {
        updatePityCounters(createMockPack(['common', 'common', 'common', 'common', 'common', 'uncommon']));
      }

      const baseProbabilities = { uncommon: 0.74, rare: 0.20, epic: 0.05, legendary: 0.009, mythic: 0.001 };
      const boosted = applyPityToRarityProbabilities(baseProbabilities);

      // Should be 100% rare
      expect(boosted.rare).toBe(1.0);
      expect(Object.keys(boosted)).toHaveLength(1);
    });
  });
});

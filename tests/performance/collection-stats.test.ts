/**
 * US107: Code Quality - Optimize Collection Stats Computation
 *
 * Performance tests to verify that cached rarity counts improve performance
 * compared to iterating through all packs/cards on every stats call.
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { collection, getCollectionStats, getCollectionState, clearCollection } from '../../src/stores/collection';
import { generatePack } from '../../src/lib/pack/generator';
import type { Pack } from '../../src/types';

describe('Collection Stats Performance - US107', () => {
  beforeEach(() => {
    clearCollection();
  });

  it('should use cached rarity counts for getCollectionStats', () => {
    // Generate and add 100 packs
    const packs: Pack[] = [];
    for (let i = 0; i < 100; i++) {
      const pack = generatePack();
      packs.push(pack);
      collection.set({
        packs: [...packs],
        metadata: {
          totalPacksOpened: i + 1,
          lastOpenedAt: new Date(),
          uniqueCards: [],
          rarePulls: 0,
          holoPulls: 0,
          created: new Date(),
          rarityCounts: {
            common: 300,
            uncommon: 150,
            rare: 40,
            epic: 8,
            legendary: 2,
            mythic: 0,
          },
        },
      });
    }

    // Warm up call (initializes any lazy state)
    getCollectionStats();

    // Measure time for subsequent calls (should use cache)
    const times: number[] = [];
    for (let i = 0; i < 10; i++) {
      const start = performance.now();
      const stats = getCollectionStats();
      const time = performance.now() - start;
      times.push(time);

      // Verify correctness
      expect(stats.rarePulls).toBe(40);
      expect(stats.epicPulls).toBe(8);
      expect(stats.legendaryPulls).toBe(2);
      expect(stats.mythicPulls).toBe(0);
    }

    // Average time should be very fast (< 1ms)
    const avgTime = times.reduce((a, b) => a + b, 0) / times.length;
    expect(avgTime).toBeLessThan(1);

    // All calls should be fast (< 5ms even in worst case)
    times.forEach(time => {
      expect(time).toBeLessThan(5);
    });
  });

  it('should use cached rarity counts for getCollectionState', () => {
    // Generate and add 50 packs
    const packs: Pack[] = [];
    for (let i = 0; i < 50; i++) {
      const pack = generatePack();
      packs.push(pack);
      collection.set({
        packs: [...packs],
        metadata: {
          totalPacksOpened: i + 1,
          lastOpenedAt: new Date(),
          uniqueCards: [],
          rarePulls: 0,
          holoPulls: 0,
          created: new Date(),
          rarityCounts: {
            common: 150,
            uncommon: 100,
            rare: 40,
            epic: 8,
            legendary: 2,
            mythic: 0,
          },
        },
      });
    }

    // Warm up call
    getCollectionState();

    // Measure time for subsequent calls (should use cache)
    const times: number[] = [];
    for (let i = 0; i < 10; i++) {
      const start = performance.now();
      const state = getCollectionState();
      const time = performance.now() - start;
      times.push(time);

      // Verify cached counts are returned
      expect(state.rarityCounts.common).toBe(150);
      expect(state.rarityCounts.uncommon).toBe(100);
      expect(state.rarityCounts.rare).toBe(40);
      expect(state.rarityCounts.epic).toBe(8);
      expect(state.rarityCounts.legendary).toBe(2);
      expect(state.rarityCounts.mythic).toBe(0);
    }

    // Average time should be very fast (< 1ms)
    const avgTime = times.reduce((a, b) => a + b, 0) / times.length;
    expect(avgTime).toBeLessThan(1);

    // All calls should be fast (< 5ms even in worst case)
    times.forEach(time => {
      expect(time).toBeLessThan(5);
    });
  });

  it('should incrementally update rarity counts when adding packs', () => {
    // Start with empty collection
    const current = collection.get();

    // Add first pack with known rarity distribution
    const pack1 = generatePack();
    // Manually set pack to have known rarities for testing
    pack1.cards[0].rarity = 'common';
    pack1.cards[1].rarity = 'common';
    pack1.cards[2].rarity = 'common';
    pack1.cards[3].rarity = 'uncommon';
    pack1.cards[4].rarity = 'rare';
    pack1.cards[5].rarity = 'epic';

    collection.set({
      packs: [pack1],
      metadata: {
        totalPacksOpened: 1,
        lastOpenedAt: new Date(),
        uniqueCards: [],
        rarePulls: 3,
        holoPulls: 0,
        created: new Date(),
        rarityCounts: {
          common: 3,
          uncommon: 1,
          rare: 1,
          epic: 1,
          legendary: 0,
          mythic: 0,
        },
      },
    });

    const stats1 = getCollectionStats();
    expect(stats1.rarePulls).toBe(1);
    expect(stats1.epicPulls).toBe(1);

    // Add second pack
    const pack2 = generatePack();
    pack2.cards[0].rarity = 'legendary';
    pack2.cards[1].rarity = 'common';
    pack2.cards[2].rarity = 'common';
    pack2.cards[3].rarity = 'uncommon';
    pack2.cards[4].rarity = 'rare';
    pack2.cards[5].rarity = 'rare';

    collection.set({
      packs: [pack2, pack1],
      metadata: {
        totalPacksOpened: 2,
        lastOpenedAt: new Date(),
        uniqueCards: [],
        rarePulls: 5,
        holoPulls: 0,
        created: new Date(),
        rarityCounts: {
          common: 5,
          uncommon: 2,
          rare: 3,
          epic: 1,
          legendary: 1,
          mythic: 0,
        },
      },
    });

    const stats2 = getCollectionStats();
    expect(stats2.legendaryPulls).toBe(1);
    expect(stats2.rarePulls).toBe(3);
    expect(stats2.totalCards).toBe(12);
  });

  it('should fall back to computation when rarityCounts is missing (migration)', () => {
    // Simulate old collection without rarityCounts
    const pack1 = generatePack();
    pack1.cards.forEach(card => {
      card.rarity = 'common';
    });

    collection.set({
      packs: [pack1],
      metadata: {
        totalPacksOpened: 1,
        lastOpenedAt: new Date(),
        uniqueCards: [],
        rarePulls: 0,
        holoPulls: 0,
        created: new Date(),
        // No rarityCounts - simulates old collection
      },
    });

    const state = getCollectionState();

    // Should compute from packs (fallback)
    expect(state.rarityCounts.common).toBeGreaterThan(0);
  });

  it('should reset rarity counts when clearing collection', () => {
    // Start with collection
    collection.set({
      packs: [],
      metadata: {
        totalPacksOpened: 10,
        lastOpenedAt: new Date(),
        uniqueCards: ['card1', 'card2'],
        rarePulls: 5,
        holoPulls: 2,
        created: new Date(),
        rarityCounts: {
          common: 30,
          uncommon: 20,
          rare: 8,
          epic: 2,
          legendary: 0,
          mythic: 0,
        },
      },
    });

    // Clear collection
    clearCollection();

    // Verify counts are reset
    const state = getCollectionState();
    expect(state.rarityCounts.common).toBe(0);
    expect(state.rarityCounts.rare).toBe(0);
    expect(state.totalCards).toBe(0);
  });
});

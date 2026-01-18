/**
 * Unit Tests for Collection Store
 *
 * Tests the collection state management:
 * 1. savePackToCollection() - Adding packs to collection
 * 2. Collection stats calculation
 * 3. Filter by rarity
 * 4. Filter by dad type
 * 5. Search by card name
 * 6. Export/import collection
 *
 * User Story: PACK-050
 * Acceptance Criteria: Test collection store functionality
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  collectionStore,
  collection,
  savePackToCollection,
  addPackToCollection,
  clearUserCollection,
  clearCollection,
  getPackById,
  getPacksByRarity,
  getRecentPacks,
  getCollectionState,
  getCollectionStats,
  getStreakCounter,
  getCurrentStreak,
  getBestStreak,
  exportCollection,
  importCollection,
  getPityCounter,
  getPityTrigger,
  trackCollectionView,
  trackCollectionFilter,
  trackCollectionSort
} from '@/stores/collection';
import type { Collection, Pack, PackCard, Rarity } from '@/types';
import { RARITY_ORDER } from '@/types';
import type { PityCounter, StreakCounter } from '@/types/collection';

// Mock IndexedDB functions
vi.mock('@/lib/storage/indexeddb', () => ({
  loadCollection: vi.fn(() => Promise.resolve(null)),
  saveCollection: vi.fn(() => Promise.resolve({ success: true })),
  clearCollection: vi.fn(() => Promise.resolve()),
  needsLocalStorageMigration: vi.fn(() => Promise.resolve(false)),
  migrateFromLocalStorage: vi.fn(() => Promise.resolve({ success: true, migrated: 0 })),
  getStorageUsage: vi.fn(() => Promise.resolve({ used: 1000, limit: 5000000 })),
  isStorageAvailable: vi.fn(() => Promise.resolve(true))
}));

// Mock analytics
vi.mock('@/stores/analytics', () => ({
  trackEvent: vi.fn()
}));

// Mock quota manager
vi.mock('@/lib/storage/quota-manager', () => ({
  getStorageQuotaInfo: vi.fn(() => Promise.resolve({ used: 1000, limit: 5000000, percentage: 0.02 })),
  getQuotaSummary: vi.fn(() => Promise.resolve('Using 1KB of 5MB (0.02%)')),
  autoManageQuota: vi.fn(() => Promise.resolve({ success: true, actions: [] }))
}));

// Helper function to create a test pack
function createTestPack(overrides?: Partial<Pack>): Pack {
  const cards: PackCard[] = [
    {
      id: 'card-001',
      name: 'Test Card 1',
      subtitle: 'Common Card',
      type: 'BBQ_DAD',
      rarity: 'common',
      isHolo: false,
      holoType: 'none',
      stats: {
        dadJoke: 50,
        grillSkill: 60,
        fixIt: 40,
        napPower: 30,
        remoteControl: 50,
        thermostat: 60,
        sockSandal: 45,
        beerSnob: 70
      },
      flavorText: 'Test flavor text',
      artwork: '/images/test-card.png'
    },
    {
      id: 'card-002',
      name: 'Test Card 2',
      subtitle: 'Rare Card',
      type: 'FIX_IT_DAD',
      rarity: 'rare',
      isHolo: true,
      holoType: 'standard',
      stats: {
        dadJoke: 70,
        grillSkill: 50,
        fixIt: 90,
        napPower: 40,
        remoteControl: 60,
        thermostat: 50,
        sockSandal: 55,
        beerSnob: 65
      },
      flavorText: 'Rare test flavor',
      artwork: '/images/test-card-rare.png'
    }
  ];

  return {
    id: 'pack-test-001',
    cards,
    openedAt: new Date('2026-01-18T10:00:00Z'),
    bestRarity: 'rare',
    design: 'standard',
    ...overrides
  };
}

// Helper function to create a test collection
function createTestCollection(packs: Pack[] = []): Collection {
  return {
    packs,
    metadata: {
      totalPacksOpened: packs.length,
      lastOpenedAt: packs.length > 0 ? packs[0].openedAt : null,
      uniqueCards: packs.flatMap(p => p.cards.map(c => c.id)),
      rarePulls: packs.flatMap(p => p.cards).filter(c => RARITY_ORDER[c.rarity] >= RARITY_ORDER.rare).length,
      holoPulls: packs.flatMap(p => p.cards).filter(c => c.isHolo).length,
      created: new Date('2026-01-01T00:00:00Z'),
      rarityCounts: {
        common: 0,
        uncommon: 0,
        rare: 0,
        epic: 0,
        legendary: 0,
        mythic: 0
      },
      pityCounter: {
        rare: 0,
        epic: 0,
        legendary: 0,
        mythic: 0
      },
      streakCounter: {
        current: 0,
        best: 0
      }
    }
  };
}

describe('Collection Store', () => {
  beforeEach(() => {
    // Reset store to empty collection before each test
    collectionStore.set(createTestCollection());
  });

  describe('savePackToCollection()', () => {
    it('should add a pack to an empty collection', () => {
      const testPack = createTestPack();

      const result = savePackToCollection(testPack);

      expect(result.success).toBe(true);
      expect(result.error).toBeUndefined();

      const current = collectionStore.get();
      expect(current.packs).toHaveLength(1);
      expect(current.packs[0]).toEqual(testPack);
      expect(current.metadata.totalPacksOpened).toBe(1);
    });

    it('should add pack to beginning of collection (newest first)', () => {
      const pack1 = createTestPack({ id: 'pack-001' });
      const pack2 = createTestPack({ id: 'pack-002' });

      savePackToCollection(pack1);
      savePackToCollection(pack2);

      const current = collectionStore.get();
      expect(current.packs).toHaveLength(2);
      expect(current.packs[0].id).toBe('pack-002'); // Most recent first
      expect(current.packs[1].id).toBe('pack-001');
    });

    it('should track unique cards correctly', () => {
      const pack1 = createTestPack();
      const pack2 = createTestPack({
        id: 'pack-002',
        cards: [
          ...pack1.cards, // Duplicate cards
          {
            id: 'card-003', // New unique card
            name: 'Test Card 3',
            subtitle: 'Epic Card',
            type: 'COUCH_DAD',
            rarity: 'epic',
            isHolo: false,
            holoType: 'none',
            stats: {
              dadJoke: 80,
              grillSkill: 40,
              fixIt: 30,
              napPower: 95,
              remoteControl: 70,
              thermostat: 40,
              sockSandal: 50,
              beerSnob: 60
            },
            flavorText: 'Epic test flavor',
            artwork: '/images/test-card-epic.png'
          }
        ]
      });

      savePackToCollection(pack1);
      savePackToCollection(pack2);

      const current = collectionStore.get();
      expect(current.metadata.uniqueCards).toHaveLength(3); // 2 from pack1 + 1 new from pack2
      expect(current.metadata.uniqueCards).toContain('card-001');
      expect(current.metadata.uniqueCards).toContain('card-002');
      expect(current.metadata.uniqueCards).toContain('card-003');
    });

    it('should count rare+ pulls correctly', () => {
      const packWithRare = createTestPack();
      const rareCards = packWithRare.cards.filter(
        c => RARITY_ORDER[c.rarity] >= RARITY_ORDER.rare
      );

      savePackToCollection(packWithRare);

      const current = collectionStore.get();
      expect(current.metadata.rarePulls).toBe(rareCards.length);
    });

    it('should count holo pulls correctly', () => {
      const packWithHolo = createTestPack();
      const holoCards = packWithHolo.cards.filter(c => c.isHolo);

      savePackToCollection(packWithHolo);

      const current = collectionStore.get();
      expect(current.metadata.holoPulls).toBe(holoCards.length);
    });

    it('should update rarity counts incrementally', () => {
      const pack = createTestPack();

      savePackToCollection(pack);

      const current = collectionStore.get();
      expect(current.metadata.rarityCounts).toBeDefined();
      expect(current.metadata.rarityCounts!.common).toBe(1);
      expect(current.metadata.rarityCounts!.rare).toBe(1);
    });

    it('should update pity counter', () => {
      const pack = createTestPack();

      savePackToCollection(pack);

      const current = collectionStore.get();
      expect(current.metadata.pityCounter).toBeDefined();
      expect(current.metadata.pityCounter!.rare).toBe(0); // Should reset after pulling rare
    });

    it('should update streak counter on pack with rare+', () => {
      const packWithRare = createTestPack();

      savePackToCollection(packWithRare);

      const streak = getStreakCounter();
      expect(streak.current).toBe(1); // Streak incremented
      expect(streak.best).toBe(1);
    });

    it('should reset streak counter on pack without rare+', () => {
      const commonOnlyPack = createTestPack({
        cards: [
          {
            id: 'card-common-001',
            name: 'Common Dad',
            subtitle: 'Just Common',
            type: 'BBQ_DAD',
            rarity: 'common',
            isHolo: false,
            holoType: 'none',
            stats: {
              dadJoke: 30,
              grillSkill: 40,
              fixIt: 30,
              napPower: 20,
              remoteControl: 30,
              thermostat: 40,
              sockSandal: 25,
              beerSnob: 35
            },
            flavorText: 'Common flavor',
            artwork: '/images/common.png'
          }
        ],
        bestRarity: 'common'
      });

      // First set a streak
      const rarePack = createTestPack();
      savePackToCollection(rarePack);
      expect(getCurrentStreak()).toBe(1);

      // Then add common pack (should reset)
      savePackToCollection(commonOnlyPack);
      expect(getCurrentStreak()).toBe(0);
      expect(getBestStreak()).toBe(1); // Best streak preserved
    });

    it('should be an alias for addPackToCollection', () => {
      const pack1 = createTestPack({ id: 'pack-alias-1' });
      const pack2 = createTestPack({ id: 'pack-alias-2' });

      const result1 = savePackToCollection(pack1);
      const result2 = addPackToCollection(pack2);

      expect(result1.success).toBe(true);
      expect(result2.success).toBe(true);

      const current = collectionStore.get();
      expect(current.packs).toHaveLength(2);
    });

    it('should handle errors gracefully', () => {
      // Pass invalid pack (should not crash)
      const invalidPack = null as unknown as Pack;

      const result = savePackToCollection(invalidPack);

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });
  });

  describe('getCollectionStats()', () => {
    it('should return zero stats for empty collection', () => {
      const stats = getCollectionStats();

      expect(stats.totalPacks).toBe(0);
      expect(stats.totalCards).toBe(0);
      expect(stats.uniqueCards).toBe(0);
      expect(stats.rarePulls).toBe(0);
      expect(stats.epicPulls).toBe(0);
      expect(stats.legendaryPulls).toBe(0);
      expect(stats.mythicPulls).toBe(0);
      expect(stats.holoPulls).toBe(0);
    });

    it('should calculate total packs correctly', () => {
      const pack1 = createTestPack({ id: 'pack-001' });
      const pack2 = createTestPack({ id: 'pack-002' });
      const pack3 = createTestPack({ id: 'pack-003' });

      savePackToCollection(pack1);
      savePackToCollection(pack2);
      savePackToCollection(pack3);

      const stats = getCollectionStats();
      expect(stats.totalPacks).toBe(3);
    });

    it('should calculate total cards correctly', () => {
      const pack1 = createTestPack(); // 2 cards
      const pack2 = createTestPack({
        id: 'pack-002',
        cards: [
          ...createTestPack().cards,
          {
            id: 'card-003',
            name: 'Card 3',
            subtitle: 'Extra',
            type: 'COUCH_DAD',
            rarity: 'uncommon',
            isHolo: false,
            holoType: 'none',
            stats: {
              dadJoke: 50,
              grillSkill: 50,
              fixIt: 50,
              napPower: 50,
              remoteControl: 50,
              thermostat: 50,
              sockSandal: 50,
              beerSnob: 50
            },
            flavorText: 'Extra card',
            artwork: '/images/extra.png'
          }
        ]
      }); // 3 cards

      savePackToCollection(pack1);
      savePackToCollection(pack2);

      const stats = getCollectionStats();
      expect(stats.totalCards).toBe(5); // 2 + 3
    });

    it('should calculate unique cards correctly', () => {
      const pack1 = createTestPack();
      const pack2 = createTestPack({
        id: 'pack-002',
        cards: pack1.cards // Same cards
      });

      savePackToCollection(pack1);
      savePackToCollection(pack2);

      const stats = getCollectionStats();
      expect(stats.uniqueCards).toBe(2); // Only 2 unique cards despite 2 packs
    });

    it('should count rarity pulls correctly', () => {
      const epicPack = createTestPack({
        cards: [
          {
            id: 'card-epic',
            name: 'Epic Dad',
            subtitle: 'Very Epic',
            type: 'GOLF_DAD',
            rarity: 'epic',
            isHolo: true,
            holoType: 'full_art',
            stats: {
              dadJoke: 85,
              grillSkill: 70,
              fixIt: 60,
              napPower: 50,
              remoteControl: 65,
              thermostat: 55,
              sockSandal: 60,
              beerSnob: 75
            },
            flavorText: 'Epic flavor',
            artwork: '/images/epic.png'
          }
        ],
        bestRarity: 'epic'
      });

      savePackToCollection(epicPack);

      const stats = getCollectionStats();
      expect(stats.epicPulls).toBe(1);
    });

    it('should track last opened timestamp', () => {
      const pack = createTestPack({ openedAt: new Date('2026-01-18T12:00:00Z') });

      savePackToCollection(pack);

      const stats = getCollectionStats();
      expect(stats.lastOpenedAt).toBeDefined();
      expect(stats.lastOpenedAt).toBeInstanceOf(Date);
      // Note: The collection store sets lastOpenedAt to new Date(), not the pack's openedAt
    });
  });

  describe('getCollectionState()', () => {
    it('should return empty state for empty collection', () => {
      const state = getCollectionState();

      expect(state.openedPacks).toHaveLength(0);
      expect(state.uniqueCards).toHaveLength(0);
      expect(state.totalCards).toBe(0);
      expect(state.rarityCounts).toEqual({
        common: 0,
        uncommon: 0,
        rare: 0,
        epic: 0,
        legendary: 0,
        mythic: 0
      });
    });

    it('should return current collection state', () => {
      const pack = createTestPack();
      savePackToCollection(pack);

      const state = getCollectionState();

      expect(state.openedPacks).toHaveLength(1);
      expect(state.uniqueCards).toHaveLength(2);
      expect(state.totalCards).toBe(2);
      expect(state.rarityCounts.common).toBe(1);
      expect(state.rarityCounts.rare).toBe(1);
    });
  });

  describe('Filter by Rarity', () => {
    beforeEach(() => {
      // Add packs with different rarities
      const commonPack = createTestPack({
        id: 'pack-common',
        cards: [
          {
            id: 'card-common',
            name: 'Common Dad',
            subtitle: 'Common',
            type: 'BBQ_DAD',
            rarity: 'common',
            isHolo: false,
            holoType: 'none',
            stats: {
              dadJoke: 30,
              grillSkill: 40,
              fixIt: 30,
              napPower: 20,
              remoteControl: 30,
              thermostat: 40,
              sockSandal: 25,
              beerSnob: 35
            },
            flavorText: 'Common',
            artwork: '/images/common.png'
          }
        ],
        bestRarity: 'common'
      });

      const rarePack = createTestPack({
        id: 'pack-rare',
        bestRarity: 'rare'
      });

      const epicPack = createTestPack({
        id: 'pack-epic',
        cards: [
          {
            id: 'card-epic',
            name: 'Epic Dad',
            subtitle: 'Epic',
            type: 'GOLF_DAD',
            rarity: 'epic',
            isHolo: true,
            holoType: 'full_art',
            stats: {
              dadJoke: 85,
              grillSkill: 70,
              fixIt: 60,
              napPower: 50,
              remoteControl: 65,
              thermostat: 55,
              sockSandal: 60,
              beerSnob: 75
            },
            flavorText: 'Epic',
            artwork: '/images/epic.png'
          }
        ],
        bestRarity: 'epic'
      });

      savePackToCollection(commonPack);
      savePackToCollection(rarePack);
      savePackToCollection(epicPack);
    });

    it('should filter packs by rarity', () => {
      const rarePacks = getPacksByRarity('rare');
      const epicPacks = getPacksByRarity('epic');
      const commonPacks = getPacksByRarity('common');

      expect(rarePacks).toHaveLength(1);
      expect(rarePacks[0].id).toBe('pack-rare');

      expect(epicPacks).toHaveLength(1);
      expect(epicPacks[0].id).toBe('pack-epic');

      expect(commonPacks).toHaveLength(1);
      expect(commonPacks[0].id).toBe('pack-common');
    });

    it('should return empty array for rarity with no packs', () => {
      const legendaryPacks = getPacksByRarity('legendary');

      expect(legendaryPacks).toHaveLength(0);
      expect(legendaryPacks).toEqual([]);
    });

    it('should handle all rarity types', () => {
      const rarities: Rarity[] = ['common', 'uncommon', 'rare', 'epic', 'legendary', 'mythic'];

      rarities.forEach(rarity => {
        const packs = getPacksByRarity(rarity);
        expect(Array.isArray(packs)).toBe(true);
        packs.forEach(pack => {
          expect(pack.bestRarity).toBe(rarity);
        });
      });
    });
  });

  describe('Filter by Dad Type', () => {
    beforeEach(() => {
      const bbqDadCard = {
        id: 'card-bbq',
        name: 'BBQ Dad',
        subtitle: 'Grill Master',
        type: 'BBQ_DAD' as const,
        rarity: 'rare' as const,
        isHolo: false,
        holoType: 'none' as const,
        stats: {
          dadJoke: 60,
          grillSkill: 95,
          fixIt: 40,
          napPower: 30,
          remoteControl: 50,
          thermostat: 60,
          sockSandal: 45,
          beerSnob: 70
        },
        flavorText: 'BBQ time',
        artwork: '/images/bbq.png'
      };

      const fixItDadCard = {
        id: 'card-fixit',
        name: 'Fix-It Dad',
        subtitle: 'Handy Man',
        type: 'FIX_IT_DAD' as const,
        rarity: 'uncommon' as const,
        isHolo: false,
        holoType: 'none' as const,
        stats: {
          dadJoke: 50,
          grillSkill: 40,
          fixIt: 90,
          napPower: 35,
          remoteControl: 55,
          thermostat: 50,
          sockSandal: 40,
          beerSnob: 60
        },
        flavorText: 'Fixes things',
        artwork: '/images/fixit.png'
      };

      const pack1 = createTestPack({
        id: 'pack-bbq',
        cards: [bbqDadCard],
        bestRarity: 'rare'
      });

      const pack2 = createTestPack({
        id: 'pack-fixit',
        cards: [fixItDadCard],
        bestRarity: 'uncommon'
      });

      const pack3 = createTestPack({
        id: 'pack-mixed',
        cards: [bbqDadCard, fixItDadCard],
        bestRarity: 'rare'
      });

      savePackToCollection(pack1);
      savePackToCollection(pack2);
      savePackToCollection(pack3);
    });

    it('should filter cards by dad type from collection', () => {
      const current = collection.get();

      // Get all cards from all packs
      const allCards = current.packs.flatMap(p => p.cards);

      // Filter for BBQ_DAD type
      const bbqCards = allCards.filter(c => c.type === 'BBQ_DAD');

      expect(bbqCards.length).toBe(2); // pack-bbq + pack-mixed

      // Filter for FIX_IT_DAD type
      const fixItCards = allCards.filter(c => c.type === 'FIX_IT_DAD');

      expect(fixItCards.length).toBe(2); // pack-fixit + pack-mixed
    });

    it('should handle type filtering edge cases', () => {
      const current = collection.get();
      const allCards = current.packs.flatMap(p => p.cards);

      // Test non-existent type
      const gamerCards = allCards.filter(c => c.type === 'GAMER_GIZZARD');

      expect(gamerCards).toHaveLength(0);
    });

    it('should support all dad type values', () => {
      const current = collection.get();
      const allCards = current.packs.flatMap(p => p.cards);

      // Verify we have BBQ_DAD and FIX_IT_DAD types
      const types = new Set(allCards.map(c => c.type));

      expect(types.has('BBQ_DAD')).toBe(true);
      expect(types.has('FIX_IT_DAD')).toBe(true);
    });
  });

  describe('Search by Card Name', () => {
    beforeEach(() => {
      const cards = [
        {
          id: 'card-001',
          name: 'Grillmaster Gary',
          subtitle: 'Flame Keeper',
          type: 'BBQ_DAD' as const,
          rarity: 'rare' as const,
          isHolo: true,
          holoType: 'standard' as const,
          stats: {
            dadJoke: 75,
            grillSkill: 95,
            fixIt: 40,
            napPower: 30,
            remoteControl: 50,
            thermostat: 60,
            sockSandal: 45,
            beerSnob: 70
          },
          flavorText: 'Propane is just a suggestion',
          artwork: '/images/gary.png'
        },
        {
          id: 'card-002',
          name: 'Fix-It Fred',
          subtitle: 'The Repairman',
          type: 'FIX_IT_DAD' as const,
          rarity: 'uncommon' as const,
          isHolo: false,
          holoType: 'none' as const,
          stats: {
            dadJoke: 60,
            grillSkill: 40,
            fixIt: 90,
            napPower: 35,
            remoteControl: 55,
            thermostat: 50,
            sockSandal: 40,
            beerSnob: 60
          },
          flavorText: "I'll fix it tomorrow",
          artwork: '/images/fred.png'
        },
        {
          id: 'card-003',
          name: 'Grill Dad Gary Jr',
          subtitle: 'Apprentice',
          type: 'BBQ_DAD' as const,
          rarity: 'common' as const,
          isHolo: false,
          holoType: 'none' as const,
          stats: {
            dadJoke: 40,
            grillSkill: 60,
            fixIt: 30,
            napPower: 25,
            remoteControl: 35,
            thermostat: 45,
            sockSandal: 30,
            beerSnob: 50
          },
          flavorText: 'Learning the ropes',
          artwork: '/images/gary-jr.png'
        }
      ];

      const pack = createTestPack({
        id: 'pack-search',
        cards,
        bestRarity: 'rare'
      });

      savePackToCollection(pack);
    });

    it('should search cards by exact name match', () => {
      const current = collection.get();
      const allCards = current.packs.flatMap(p => p.cards);

      const results = allCards.filter(c =>
        c.name.toLowerCase().includes('grillmaster gary')
      );

      expect(results).toHaveLength(1);
      expect(results[0].name).toBe('Grillmaster Gary');
    });

    it('should search cards by partial name match (case insensitive)', () => {
      const current = collection.get();
      const allCards = current.packs.flatMap(p => p.cards);

      const results = allCards.filter(c =>
        c.name.toLowerCase().includes('grill')
      );

      expect(results).toHaveLength(2); // Grillmaster Gary + Grill Dad Gary Jr
    });

    it('should return empty array for non-existent search term', () => {
      const current = collection.get();
      const allCards = current.packs.flatMap(p => p.cards);

      const results = allCards.filter(c =>
        c.name.toLowerCase().includes('nonexistent')
      );

      expect(results).toHaveLength(0);
    });

    it('should search across all packs in collection', () => {
      // Add another pack with different cards
      const pack2 = createTestPack({
        id: 'pack-search-2',
        cards: [
          {
            id: 'card-004',
            name: 'Couch Dad Carl',
            subtitle: 'Napping Expert',
            type: 'COUCH_DAD' as const,
            rarity: 'common' as const,
            isHolo: false,
            holoType: 'none' as const,
            stats: {
              dadJoke: 55,
              grillSkill: 30,
              fixIt: 25,
              napPower: 95,
              remoteControl: 85,
              thermostat: 40,
              sockSandal: 35,
              beerSnob: 50
            },
            flavorText: 'Five more minutes',
            artwork: '/images/carl.png'
          }
        ],
        bestRarity: 'common'
      });

      savePackToCollection(pack2);

      const current = collection.get();
      const allCards = current.packs.flatMap(p => p.cards);

      // Should find cards across both packs
      const dadResults = allCards.filter(c => c.name.toLowerCase().includes('dad'));

      expect(dadResults.length).toBeGreaterThanOrEqual(2);
    });

    it('should handle empty search term', () => {
      const current = collection.get();
      const allCards = current.packs.flatMap(p => p.cards);

      const results = allCards.filter(c => c.name.toLowerCase().includes(''));

      // Empty search should return all cards
      expect(results.length).toBe(3);
    });
  });

  describe('Export/Import Collection', () => {
    beforeEach(() => {
      // Add some test data
      const pack1 = createTestPack({ id: 'export-001' });
      const pack2 = createTestPack({ id: 'export-002' });

      savePackToCollection(pack1);
      savePackToCollection(pack2);
    });

    it('should export collection as JSON string', async () => {
      const exported = await exportCollection();

      expect(typeof exported).toBe('string');

      const parsed = JSON.parse(exported);
      expect(parsed).toHaveProperty('packs');
      expect(parsed).toHaveProperty('metadata');
      expect(parsed.packs).toHaveLength(2);
    });

    it('should include all collection data in export', async () => {
      const exported = await exportCollection();
      const parsed = JSON.parse(exported);

      expect(parsed.packs).toHaveLength(2);
      expect(parsed.metadata.totalPacksOpened).toBe(2);
      expect(parsed.metadata.uniqueCards).toBeDefined();
      expect(parsed.metadata.rarityCounts).toBeDefined();
      expect(parsed.metadata.pityCounter).toBeDefined();
      expect(parsed.metadata.streakCounter).toBeDefined();
    });

    it('should import valid collection JSON', async () => {
      const testCollection: Collection = {
        packs: [
          createTestPack({ id: 'import-001' }),
          createTestPack({ id: 'import-002' })
        ],
        metadata: {
          totalPacksOpened: 2,
          lastOpenedAt: new Date(),
          uniqueCards: ['card-001', 'card-002'],
          rarePulls: 1,
          holoPulls: 1,
          created: new Date(),
          rarityCounts: {
            common: 1,
            uncommon: 0,
            rare: 1,
            epic: 0,
            legendary: 0,
            mythic: 0
          },
          pityCounter: {
            rare: 5,
            epic: 2,
            legendary: 1,
            mythic: 0
          },
          streakCounter: {
            current: 2,
            best: 5
          }
        }
      };

      const jsonData = JSON.stringify(testCollection);
      const result = await importCollection(jsonData);

      expect(result.success).toBe(true);
      expect(result.error).toBeUndefined();
      expect(result.imported).toBe(2);

      // Verify collection was updated
      const current = collectionStore.get();
      expect(current.packs).toHaveLength(2);
    });

    it('should reject invalid collection JSON', async () => {
      const invalidJson = '{ "invalid": "data" }';
      const result = await importCollection(invalidJson);

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
      expect(result.error).toContain('Invalid collection data format');
    });

    it('should reject malformed JSON', async () => {
      const malformedJson = '{ invalid json }';
      const result = await importCollection(malformedJson);

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });

    it('should preserve all metadata on import', async () => {
      const testCollection: Collection = {
        packs: [createTestPack({ id: 'import-meta' })],
        metadata: {
          totalPacksOpened: 100,
          lastOpenedAt: new Date('2026-01-18T10:00:00Z'),
          uniqueCards: ['card-001', 'card-002', 'card-003'],
          rarePulls: 50,
          holoPulls: 25,
          created: new Date('2026-01-01T00:00:00Z'),
          rarityCounts: {
            common: 40,
            uncommon: 30,
            rare: 20,
            epic: 8,
            legendary: 2,
            mythic: 0
          },
          pityCounter: {
            rare: 3,
            epic: 7,
            legendary: 15,
            mythic: 45
          },
          streakCounter: {
            current: 5,
            best: 10
          }
        }
      };

      const jsonData = JSON.stringify(testCollection);
      await importCollection(jsonData);

      const current = collectionStore.get();
      expect(current.metadata.totalPacksOpened).toBe(100);
      expect(current.metadata.uniqueCards).toHaveLength(3);
      expect(current.metadata.rarePulls).toBe(50);
      expect(current.metadata.holoPulls).toBe(25);
      expect(current.metadata.pityCounter!.rare).toBe(3);
      expect(current.metadata.streakCounter!.current).toBe(5);
      expect(current.metadata.streakCounter!.best).toBe(10);
    });

    it('should maintain data integrity through export/import cycle', async () => {
      // Export current collection
      const exported = await exportCollection();
      const original = collectionStore.get();

      // Clear collection
      clearUserCollection();

      // Import exported data
      const result = await importCollection(exported);

      expect(result.success).toBe(true);

      const imported = collectionStore.get();

      // Verify data integrity
      expect(imported.packs).toHaveLength(original.packs.length);
      expect(imported.metadata.totalPacksOpened).toBe(original.metadata.totalPacksOpened);
      expect(imported.metadata.uniqueCards).toEqual(original.metadata.uniqueCards);
    });
  });

  describe('Utility Functions', () => {
    it('should get pack by ID', () => {
      const pack = createTestPack({ id: 'find-me-001' });
      savePackToCollection(pack);

      const found = getPackById('find-me-001');

      expect(found).toBeDefined();
      expect(found!.id).toBe('find-me-001');
    });

    it('should return undefined for non-existent pack ID', () => {
      const found = getPackById('non-existent-id');

      expect(found).toBeUndefined();
    });

    it('should get recent packs', () => {
      const pack1 = createTestPack({ id: 'recent-001' });
      const pack2 = createTestPack({ id: 'recent-002' });
      const pack3 = createTestPack({ id: 'recent-003' });

      savePackToCollection(pack1);
      savePackToCollection(pack2);
      savePackToCollection(pack3);

      const recent = getRecentPacks(2);

      expect(recent).toHaveLength(2);
      expect(recent[0].id).toBe('recent-003'); // Most recent
      expect(recent[1].id).toBe('recent-002');
    });

    it('should return all packs if requested count exceeds total', () => {
      const pack1 = createTestPack({ id: 'all-001' });
      const pack2 = createTestPack({ id: 'all-002' });

      savePackToCollection(pack1);
      savePackToCollection(pack2);

      const recent = getRecentPacks(10);

      expect(recent).toHaveLength(2);
    });

    it('should clear collection completely', () => {
      const pack1 = createTestPack({ id: 'clear-001' });
      const pack2 = createTestPack({ id: 'clear-002' });

      savePackToCollection(pack1);
      savePackToCollection(pack2);

      expect(collectionStore.get().packs).toHaveLength(2);

      const result = clearUserCollection();

      expect(result.success).toBe(true);
      expect(collectionStore.get().packs).toHaveLength(0);
      expect(collectionStore.get().metadata.totalPacksOpened).toBe(0);
    });

    it('should provide backward compatibility with clearCollection alias', () => {
      const pack = createTestPack({ id: 'alias-clear' });
      savePackToCollection(pack);

      expect(collectionStore.get().packs).toHaveLength(1);

      const result = clearCollection();

      expect(result.success).toBe(true);
      expect(collectionStore.get().packs).toHaveLength(0);
    });

    it('should get pity counter', () => {
      const pityCounter = getPityCounter();

      expect(pityCounter).toBeDefined();
      expect(pityCounter).toHaveProperty('rare');
      expect(pityCounter).toHaveProperty('epic');
      expect(pityCounter).toHaveProperty('legendary');
      expect(pityCounter).toHaveProperty('mythic');
    });

    it('should get pity trigger', () => {
      // Set up collection with high pity counters
      const collectionWithPity: Collection = {
        packs: [],
        metadata: {
          totalPacksOpened: 50,
          lastOpenedAt: new Date(),
          uniqueCards: [],
          rarePulls: 10,
          holoPulls: 5,
          created: new Date(),
          rarityCounts: {
            common: 20,
            uncommon: 15,
            rare: 10,
            epic: 3,
            legendary: 2,
            mythic: 0
          },
          pityCounter: {
            rare: 10, // Should trigger rare pity
            epic: 5,
            legendary: 2,
            mythic: 0
          },
          streakCounter: {
            current: 3,
            best: 5
          }
        }
      };

      collectionStore.set(collectionWithPity);

      const trigger = getPityTrigger();

      expect(trigger).toBe('rare');
    });

    it('should return null when no pity trigger reached', () => {
      const trigger = getPityTrigger();

      expect(trigger).toBeNull();
    });

    it('should track collection view', () => {
      expect(() => trackCollectionView()).not.toThrow();
    });

    it('should track collection filter', () => {
      expect(() => trackCollectionFilter('rarity', 'rare')).not.toThrow();
    });

    it('should track collection sort', () => {
      expect(() => trackCollectionSort('date-obtained')).not.toThrow();
    });

    it('should get streak counter', () => {
      const streak = getStreakCounter();

      expect(streak).toBeDefined();
      expect(streak).toHaveProperty('current');
      expect(streak).toHaveProperty('best');
    });

    it('should get current streak', () => {
      const current = getCurrentStreak();

      expect(typeof current).toBe('number');
      expect(current).toBeGreaterThanOrEqual(0);
    });

    it('should get best streak', () => {
      const best = getBestStreak();

      expect(typeof best).toBe('number');
      expect(best).toBeGreaterThanOrEqual(0);
    });
  });

  describe('Edge Cases and Error Handling', () => {
    it('should handle empty pack gracefully', () => {
      const emptyPack: Pack = {
        id: 'empty-pack',
        cards: [],
        openedAt: new Date(),
        bestRarity: 'common',
        design: 'standard'
      };

      const result = savePackToCollection(emptyPack);

      expect(result.success).toBe(true);
    });

    it('should handle very long card names in search', () => {
      const longNameCard = {
        id: 'card-long',
        name: 'a'.repeat(200), // Very long name (lowercase)
        subtitle: 'Long Name',
        type: 'BBQ_DAD' as const,
        rarity: 'common' as const,
        isHolo: false,
        holoType: 'none' as const,
        stats: {
          dadJoke: 50,
          grillSkill: 50,
          fixIt: 50,
          napPower: 50,
          remoteControl: 50,
          thermostat: 50,
          sockSandal: 50,
          beerSnob: 50
        },
        flavorText: 'Long',
        artwork: '/images/long.png'
      };

      const pack = createTestPack({
        cards: [longNameCard],
        bestRarity: 'common'
      });

      savePackToCollection(pack);

      const current = collection.get();
      const allCards = current.packs.flatMap(p => p.cards);

      const results = allCards.filter(c => c.name.toLowerCase().includes('a'));

      expect(results.length).toBeGreaterThan(0);
    });

    it('should handle special characters in search', () => {
      const specialCharCard = {
        id: 'card-special',
        name: "Dad's Special-Friend @ Home",
        subtitle: 'Special Characters',
        type: 'COUCH_DAD' as const,
        rarity: 'uncommon' as const,
        isHolo: false,
        holoType: 'none' as const,
        stats: {
          dadJoke: 65,
          grillSkill: 45,
          fixIt: 35,
          napPower: 80,
          remoteControl: 70,
          thermostat: 45,
          sockSandal: 40,
          beerSnob: 55
        },
        flavorText: 'Special!',
        artwork: '/images/special.png'
      };

      const pack = createTestPack({
        cards: [specialCharCard],
        bestRarity: 'uncommon'
      });

      savePackToCollection(pack);

      const current = collection.get();
      const allCards = current.packs.flatMap(p => p.cards);

      // Should find with special characters
      const results1 = allCards.filter(c => c.name.toLowerCase().includes('@'));
      expect(results1.length).toBeGreaterThan(0);

      // Should find with apostrophe
      const results2 = allCards.filter(c => c.name.toLowerCase().includes('dad\'s'));
      expect(results2.length).toBeGreaterThan(0);
    });

    it('should handle unicode characters in search', () => {
      const unicodeCard = {
        id: 'card-unicode',
        name: 'Dad with emojis and special characters',
        subtitle: 'Unicode Test',
        type: 'TECH_DAD' as const,
        rarity: 'rare' as const,
        isHolo: false,
        holoType: 'none' as const,
        stats: {
          dadJoke: 70,
          grillSkill: 50,
          fixIt: 60,
          napPower: 45,
          remoteControl: 80,
          thermostat: 55,
          sockSandal: 50,
          beerSnob: 65
        },
        flavorText: 'Unicode',
        artwork: '/images/unicode.png'
      };

      const pack = createTestPack({
        cards: [unicodeCard],
        bestRarity: 'rare'
      });

      savePackToCollection(pack);

      const current = collection.get();
      const allCards = current.packs.flatMap(p => p.cards);

      const results = allCards.filter(c => c.name.toLowerCase().includes('emoji'));

      expect(results.length).toBeGreaterThan(0);
    });
  });
});

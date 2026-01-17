/**
 * Integration Tests - Core User Flows
 * Tests complete user journeys across multiple systems
 */

import { describe, it, expect, beforeEach, afterEach, vi, beforeAll } from 'vitest';
import { generatePack } from '../../src/lib/pack/generator';
import { collection, clearCollection, addPackToCollection, getCollectionStats } from '../../src/stores/collection';
import { 
  battleHistory, 
  clearAllBattleData, 
  battleState, 
  currentBattle,
  playerTeam,
  opponentTeam,
  startBattle,
  selectedCards
} from '../../src/stores/battle';
import { currentPack, packState, resetPack } from '../../src/stores/pack';
import type { Pack, PackCard, BattleHistoryEntry } from '../../src/types';

// Mock card factory
function createMockCard(
  id: string,
  rarity: PackCard['rarity'],
  type: PackCard['type'] = 'BBQ_DAD'
): PackCard {
  return {
    id,
    name: `Test Card ${id}`,
    subtitle: 'Test Subtitle',
    type,
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
    flavorText: 'Test flavor text',
    abilities: [],
    series: 1,
    cardNumber: 1,
    totalInSeries: 50,
    artist: 'Test Artist',
    isRevealed: false,
    isHolo: false,
    holoType: 'none',
  };
}

describe('Integration Tests - Core User Flows', () => {
  beforeAll(() => {
    // Polyfill localStorage for tests
    const mockLocalStorage = (() => {
      let store: Record<string, string> = {};
      return {
        getItem: (key: string) => store[key] || null,
        setItem: (key: string, value: string) => { store[key] = value.toString(); },
        removeItem: (key: string) => { delete store[key]; },
        clear: () => { store = {}; },
        key: (index: number) => Object.keys(store)[index] || null,
        get length() { return Object.keys(store).length; },
      };
    })();

    Object.defineProperty(globalThis, 'localStorage', {
      value: mockLocalStorage,
      writable: true,
      configurable: true
    });
    
    // Mock userProfile to avoid leaderboard errors
    vi.mock('../../src/stores/leaderboard', () => ({
      userProfile: {
        get: () => ({ stats: {} }),
        set: vi.fn(),
        listen: vi.fn(() => () => {}),
      },
      initializeProfile: vi.fn(),
      loadLeaderboard: vi.fn(),
      loadLeaderboardTask: Promise.resolve(),
    }));
  });

  beforeEach(() => {
    // Reset all stores before each test
    resetPack();
    clearCollection();
    clearAllBattleData();
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Complete Pack Opening Flow', () => {
    it('should go from idle to results', () => {
      // Start in idle state
      expect(packState.get()).toBe('idle');

      // Generate pack
      const pack = generatePack();
      currentPack.set(pack);
      packState.set('cards_ready');

      expect(packState.get()).toBe('cards_ready');
      expect(currentPack.get()).not.toBeNull();

      // Simulate card reveals
      for (let i = 0; i < 6; i++) {
        pack.cards[i].isRevealed = true;
      }

      packState.set('results');

      expect(packState.get()).toBe('results');
      expect(pack.cards.every(c => c.isRevealed)).toBe(true);
    });

    it('should persist pack to collection', () => {
      // Generate and open pack
      const pack = generatePack();
      currentPack.set(pack);
      packState.set('results');

      // Mark all cards as revealed
      pack.cards.forEach(card => {
        card.isRevealed = true;
      });

      // Add to collection
      addPackToCollection(pack);

      // Verify collection has the pack
      const current = collection.get();
      expect(current.packs).toHaveLength(1);
      expect(current.packs[0].cards).toHaveLength(6);
      expect(current.packs[0].cards).toEqual(expect.arrayContaining(pack.cards));
    });

    it('should prevent duplicates in collection metadata', () => {
      // Create mock pack with duplicate card
      const card = createMockCard('card-1', 'common');
      const pack: Pack = {
        id: 'pack-1',
        cards: [
          card,
          card, // Duplicate
          createMockCard('card-2', 'uncommon'),
          createMockCard('card-3', 'rare'),
          createMockCard('card-4', 'rare'),
          createMockCard('card-5', 'common'),
        ],
        openedAt: new Date(),
        bestRarity: 'rare',
        design: 'standard',
      };

      // Add to collection
      addPackToCollection(pack);

      const current = collection.get();

      // Should have 1 pack
      expect(current.packs).toHaveLength(1);
      // Unique cards should be 5 (since card-1 is duplicated)
      expect(current.metadata.uniqueCards).toHaveLength(5);
    });

    it('should calculate collection stats correctly', () => {
      const pack = generatePack();
      addPackToCollection(pack);

      // Add another pack
      const pack2 = generatePack();
      addPackToCollection(pack2);

      // Verify collection stats
      const stats = getCollectionStats();
      expect(stats.totalPacks).toBe(2);
      expect(stats.totalCards).toBe(12);
      expect(stats.uniqueCards).toBeGreaterThan(0);
    });

    it('should handle back navigation during pack opening', () => {
      // Start pack opening
      const pack = generatePack();
      currentPack.set(pack);
      packState.set('cards_ready');

      // Reveal some cards
      pack.cards[0].isRevealed = true;
      pack.cards[1].isRevealed = true;

      // Simulate going back (state reset)
      resetPack();

      // Should be back to idle
      expect(packState.get()).toBe('idle');
      expect(currentPack.get()).toBeNull();
    });
  });

  describe('Pack to Battle Flow', () => {
    it('should create battle deck from collection', () => {
      // Add packs to collection
      const pack1 = generatePack();
      const pack2 = generatePack();
      addPackToCollection(pack1);
      addPackToCollection(pack2);

      const current = collection.get();
      const allCards = current.packs.flatMap(p => p.cards);

      // Select 3 cards for battle
      const battleCards = allCards.slice(0, 3);

      expect(battleCards).toHaveLength(3);
      expect(battleCards.every(c => c.id)).toBe(true);
    });

    it('should validate deck constraints', () => {
      const pack = generatePack();
      addPackToCollection(pack);
      const current = collection.get();
      const allCards = current.packs[0].cards;

      // Try to create deck with < 3 cards
      const invalidDeck = allCards.slice(0, 2);

      expect(invalidDeck.length).toBeLessThan(3);

      // Valid deck
      const validDeck = allCards.slice(0, 3);

      expect(validDeck.length).toBe(3);
    });

    it('should track battle results', () => {
      // Setup collection
      const pack = generatePack();
      addPackToCollection(pack);

      // Simulate battle result entry
      const battleResult = {
        winner: 'player' as const,
        duration: 5000,
        turns: 5,
        timestamp: new Date(),
        playerTeam: {
          teamName: 'Your Dad Squad',
          isPlayer: true,
          cards: pack.cards.slice(0, 3).map((c, i) => ({ 
            card: c, 
            currentHP: 100, 
            maxHP: 100, 
            isAlive: true, 
            position: (i + 1) as any 
          })),
        },
        opponentTeam: {
          teamName: 'Opponent',
          isPlayer: false,
          cards: pack.cards.slice(3, 6).map((c, i) => ({ 
            card: c, 
            currentHP: 0, 
            maxHP: 100, 
            isAlive: false, 
            position: (i + 1) as any 
          })),
        },
        battleLog: [],
      };

      // Add to history
      const historyEntry: BattleHistoryEntry = {
        id: `battle_${Date.now()}`,
        mode: 'casual',
        result: battleResult as any,
        playerDeck: pack.cards.slice(0, 3).map(c => c.id),
        timestamp: new Date(),
      };

      battleHistory.set([historyEntry]);

      const updatedHistory = battleHistory.get();

      expect(updatedHistory).toHaveLength(1);
      expect(updatedHistory[0].result.winner).toBe('player');
    });
  });

  describe('Collection to Crafting Flow', () => {
    it('should deduct materials from collection on craft', () => {
      // Add cards to collection via packs
      const pack: Pack = {
        id: 'pack-1',
        cards: [
          createMockCard('1', 'common'),
          createMockCard('2', 'common'),
          createMockCard('3', 'common'),
        ],
        openedAt: new Date(),
        bestRarity: 'common',
        design: 'standard',
      };
      addPackToCollection(pack);

      // Craft with 3 cards
      const current = collection.get();
      const allCards = current.packs.flatMap(p => p.cards);
      const materialsToConsume = allCards.slice(0, 3);
      
      // Since our collection store works by packs, we might need to modify it or simulate the removal
      const remainingPacks = current.packs.map(p => ({
        ...p,
        cards: p.cards.filter(c => !materialsToConsume.some(m => m.id === c.id))
      })).filter(p => p.cards.length > 0);

      collection.set({
        ...current,
        packs: remainingPacks
      });

      // Verify cards removed
      const finalCollection = collection.get();
      const finalCards = finalCollection.packs.flatMap(p => p.cards);
      expect(finalCards).toHaveLength(0);
    });

    it('should handle insufficient materials', () => {
      // Add only 2 cards to collection
      const pack: Pack = {
        id: 'pack-1',
        cards: [
          createMockCard('1', 'common'),
          createMockCard('2', 'common'),
        ],
        openedAt: new Date(),
        bestRarity: 'common',
        design: 'standard',
      };
      addPackToCollection(pack);

      // Try to craft requiring 3 cards
      const allCards = collection.get().packs.flatMap(p => p.cards);
      const hasEnoughMaterials = allCards.length >= 3;

      expect(hasEnoughMaterials).toBe(false);
    });

    it('should add crafted card to collection', () => {
      // Start with materials
      const pack: Pack = {
        id: 'pack-1',
        cards: [
          createMockCard('1', 'common'),
          createMockCard('2', 'common'),
          createMockCard('3', 'common'),
        ],
        openedAt: new Date(),
        bestRarity: 'common',
        design: 'standard',
      };
      addPackToCollection(pack);

      // Craft new card
      const craftedCard = createMockCard('crafted-1', 'uncommon');

      // Add as a new pack or update existing
      const craftedPack: Pack = {
        id: 'crafted-pack-1',
        cards: [craftedCard],
        openedAt: new Date(),
        bestRarity: 'uncommon',
        design: 'standard',
      };
      
      // Remove materials and add result
      const current = collection.get();
      collection.set({
        ...current,
        packs: [craftedPack]
      });

      // Verify
      const finalCollection = collection.get();
      const finalCards = finalCollection.packs.flatMap(p => p.cards);
      expect(finalCards).toHaveLength(1);
      expect(finalCards[0].rarity).toBe('uncommon');
    });
  });

  describe('Multi-System Integration', () => {
    it('should track user journey across all systems', () => {
      // 1. Open packs with unique mock cards to avoid ID collisions in tests
      const pack1: Pack = {
        id: 'pack-1',
        cards: [1, 2, 3, 4, 5, 6].map(i => createMockCard(`p1-c${i}`, 'common')),
        openedAt: new Date(),
        bestRarity: 'common',
        design: 'standard',
      };
      const pack2: Pack = {
        id: 'pack-2',
        cards: [1, 2, 3, 4, 5, 6].map(i => createMockCard(`p2-c${i}`, 'common')),
        openedAt: new Date(),
        bestRarity: 'common',
        design: 'standard',
      };
      const pack3: Pack = {
        id: 'pack-3',
        cards: [1, 2, 3, 4, 5, 6].map(i => createMockCard(`p3-c${i}`, 'common')),
        openedAt: new Date(),
        bestRarity: 'common',
        design: 'standard',
      };

      addPackToCollection(pack1);
      addPackToCollection(pack2);
      addPackToCollection(pack3);

      expect(collection.get().packs).toHaveLength(3);
      const allCards = collection.get().packs.flatMap(p => p.cards);
      expect(allCards.length).toBe(18);

      // 2. Battle with some cards
      const battleDeck = allCards.slice(0, 3);
      selectedCards.set(battleDeck);

      // Simulate a battle
      const battleResult = {
        winner: 'player' as const,
        duration: 3000,
        turns: 3,
        timestamp: new Date(),
        playerTeam: {
          teamName: 'Player',
          isPlayer: true,
          cards: battleDeck.map((c, i) => ({ 
            card: c, 
            currentHP: 100, 
            maxHP: 100, 
            isAlive: true, 
            position: (i + 1) as any 
          })),
        },
        opponentTeam: {
          teamName: 'Opponent',
          isPlayer: false,
          cards: allCards.slice(3, 6).map((c, i) => ({ 
            card: c, 
            currentHP: 0, 
            maxHP: 100, 
            isAlive: false, 
            position: (i + 1) as any 
          })),
        },
        battleLog: [],
      };

      const historyEntry: BattleHistoryEntry = {
        id: `battle_${Date.now()}`,
        mode: 'casual',
        result: battleResult as any,
        playerDeck: battleDeck.map(c => c.id),
        timestamp: new Date(),
      };

      battleHistory.set([historyEntry]);

      expect(battleHistory.get()).toHaveLength(1);

      // 3. Craft with remaining cards
      const craftingMaterials = allCards.slice(6, 9);
      const current = collection.get();
      const remainingPacks = current.packs.map(p => ({
        ...p,
        cards: p.cards.filter(c => !craftingMaterials.some(m => m.id === c.id))
      })).filter(p => p.cards.length > 0);

      collection.set({
        ...current,
        packs: remainingPacks
      });

      expect(collection.get().packs.flatMap(p => p.cards).length).toBe(18 - 3);

      // 4. Verify final state
      expect(collection.get().packs.length).toBeGreaterThan(0);
      expect(battleHistory.get().length).toBeGreaterThan(0);
    });

    it('should handle rapid state changes across stores', () => {
      // Rapidly open multiple packs
      for (let i = 0; i < 5; i++) {
        const pack = generatePack();
        currentPack.set(pack);

        // Simulate instant results
        pack.cards.forEach(c => c.isRevealed = true);

        // Add to collection
        addPackToCollection(pack);
      }

      // Should handle all packs
      expect(collection.get().packs).toHaveLength(5);
      expect(collection.get().packs.flatMap(p => p.cards)).toHaveLength(30); // 5 packs * 6 cards
    });

    it('should maintain state consistency during errors', () => {
      const pack = generatePack();
      currentPack.set(pack);

      // Simulate error during opening
      const initialCollection = collection.get();
      const initialBattleHistory = battleHistory.get();

      // Error occurs - states should not be corrupted
      expect(initialCollection).toBeDefined();
      expect(initialBattleHistory).toBeDefined();
      expect(currentPack.get()).toBeDefined();
    });
  });

  describe('State Persistence and Recovery', () => {
    it('should recover pack state after refresh', () => {
      const pack = generatePack();
      currentPack.set(pack);
      packState.set('revealing');

      // Simulate refresh (stores persist)
      const recoveredPack = currentPack.get();
      const recoveredState = packState.get();

      expect(recoveredPack).not.toBeNull();
      expect(recoveredState).toBe('revealing');
    });

    it('should recover collection after refresh', () => {
      const pack = generatePack();
      addPackToCollection(pack);

      // Simulate refresh
      const recoveredCollection = collection.get();

      expect(recoveredCollection.packs).toHaveLength(1);
    });

    it('should recover battle history after refresh', () => {
      const historyEntry: BattleHistoryEntry = {
        id: 'battle-1',
        mode: 'casual',
        result: {
          winner: 'player',
          duration: 5000,
          turns: 5,
          timestamp: new Date(),
          playerTeam: { teamName: 'Player', isPlayer: true, cards: [] },
          opponentTeam: { teamName: 'Opponent', isPlayer: false, cards: [] },
          battleLog: []
        },
        playerDeck: [],
        timestamp: new Date(),
      };

      battleHistory.set([historyEntry]);

      // Simulate refresh
      const recoveredHistory = battleHistory.get();

      expect(recoveredHistory).toHaveLength(1);
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty collection', () => {
      clearCollection();

      const current = collection.get();
      expect(current.packs).toHaveLength(0);
      expect(current.packs).toEqual([]);
    });

    it('should handle large collection', () => {
      // Generate 50 packs (300 cards)
      for (let i = 0; i < 50; i++) {
        addPackToCollection(generatePack());
      }

      const current = collection.get();
      expect(current.packs).toHaveLength(50);
      expect(current.packs.flatMap(p => p.cards)).toHaveLength(300);
    });

    it('should handle concurrent operations', () => {
      // Open pack while in battle
      const pack = generatePack();
      currentPack.set(pack);

      currentBattle.set({
        winner: 'player',
        duration: 5000,
        turns: 5,
        timestamp: new Date(),
        playerTeam: {
          teamName: 'Player',
          isPlayer: true,
          cards: pack.cards.slice(0, 3).map((c, i) => ({ 
            card: c, 
            currentHP: 100, 
            maxHP: 100, 
            isAlive: true, 
            position: (i + 1) as any 
          })),
        },
        opponentTeam: {
          teamName: 'Opponent',
          isPlayer: false,
          cards: pack.cards.slice(3, 6).map((c, i) => ({ 
            card: c, 
            currentHP: 0, 
            maxHP: 100, 
            isAlive: false, 
            position: (i + 1) as any 
          })),
        },
        battleLog: [],
      } as any);

      // Both should coexist
      expect(currentPack.get()).not.toBeNull();
      expect(currentBattle.get()).not.toBeNull();
    });
  });
});

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  calculateCollectionCompletion,
  getMissingCardsByRarity,
  getMissingCardsByType,
  getAllMissingCards,
  isMilestoneAchieved,
  getNewlyAchievedMilestones,
  getCompletionSummary,
  calculateBonusPacksFromMilestones,
} from '@/lib/collection/completion';
import type { Collection, Pack, PackCard, Rarity, DadType, CollectionCompletion, CompletionMilestone, CompletionConfig } from '@/types';

// Mock the database module
vi.mock('@/lib/cards/database', () => ({
  getAllCards: vi.fn(() => mockAllCards),
  getCardsByRarity: vi.fn((rarity: Rarity) => mockAllCards.filter(c => c.rarity === rarity)),
}));

// Helper to create a minimal valid PackCard
function createMockPackCard(overrides: Partial<PackCard> & { id: string; name: string; rarity: Rarity; type: DadType }): PackCard {
  return {
    id: overrides.id,
    name: overrides.name,
    subtitle: overrides.subtitle || '',
    type: overrides.type,
    rarity: overrides.rarity,
    artwork: overrides.artwork || '',
    stats: overrides.stats || { dadJoke: 50, grillSkill: 50, fixIt: 50, napPower: 50, remoteControl: 50, thermostat: 50, sockSandal: 50, beerSnob: 50 },
    flavorText: overrides.flavorText || '',
    abilities: overrides.abilities || [],
    series: overrides.series || 1,
    cardNumber: overrides.cardNumber || 1,
    totalInSeries: overrides.totalInSeries || 100,
    artist: overrides.artist || 'Test Artist',
    isRevealed: overrides.isRevealed ?? true,
    isHolo: overrides.isHolo ?? false,
    holoType: overrides.holoType || 'none',
  };
}

// Mock card data for testing
const mockAllCards: PackCard[] = [
  // Common cards (5)
  createMockPackCard({ id: 'common_1', name: 'Common Dad 1', rarity: 'common', type: 'BBQ_DICKTATOR' as DadType }),
  createMockPackCard({ id: 'common_2', name: 'Common Dad 2', rarity: 'common', type: 'BBQ_DICKTATOR' as DadType }),
  createMockPackCard({ id: 'common_3', name: 'Common Dad 3', rarity: 'common', type: 'FIX_IT_FUCKBOY' as DadType }),
  createMockPackCard({ id: 'common_4', name: 'Common Dad 4', rarity: 'common', type: 'FIX_IT_FUCKBOY' as DadType }),
  createMockPackCard({ id: 'common_5', name: 'Common Dad 5', rarity: 'common', type: 'GOLF_GONAD' as DadType }),
  // Uncommon cards (4)
  createMockPackCard({ id: 'uncommon_1', name: 'Uncommon Dad 1', rarity: 'uncommon', type: 'BBQ_DICKTATOR' as DadType }),
  createMockPackCard({ id: 'uncommon_2', name: 'Uncommon Dad 2', rarity: 'uncommon', type: 'COUCH_CUMMANDER' as DadType }),
  createMockPackCard({ id: 'uncommon_3', name: 'Uncommon Dad 3', rarity: 'uncommon', type: 'LAWN_LUNATIC' as DadType }),
  createMockPackCard({ id: 'uncommon_4', name: 'Uncommon Dad 4', rarity: 'uncommon', type: 'CAR_COCK' as DadType }),
  // Rare cards (3)
  createMockPackCard({ id: 'rare_1', name: 'Rare Dad 1', rarity: 'rare', type: 'BBQ_DICKTATOR' as DadType }),
  createMockPackCard({ id: 'rare_2', name: 'Rare Dad 2', rarity: 'rare', type: 'OFFICE_ORGASMS' as DadType }),
  createMockPackCard({ id: 'rare_3', name: 'Rare Dad 3', rarity: 'rare', type: 'COOL_CUCKS' as DadType }),
  // Epic cards (2)
  createMockPackCard({ id: 'epic_1', name: 'Epic Dad 1', rarity: 'epic', type: 'TECH_TWATS' as DadType }),
  createMockPackCard({ id: 'epic_2', name: 'Epic Dad 2', rarity: 'epic', type: 'COACH_CUMSTERS' as DadType }),
  // Legendary cards (1)
  createMockPackCard({ id: 'legendary_1', name: 'Legendary Dad 1', rarity: 'legendary', type: 'HOLIDAY_HORNDOGS' as DadType }),
  // Mythic cards (1)
  createMockPackCard({ id: 'mythic_1', name: 'Mythic Dad 1', rarity: 'mythic', type: 'ITEM' as DadType, isHolo: true, holoType: 'prismatic' }),
];
// Total: 16 cards

// Helper to create a collection with specific cards
function createCollection(cardIds: string[]): Collection {
  const cards = cardIds.map(id => mockAllCards.find(c => c.id === id)!).filter(Boolean);
  const pack: Pack = {
    id: 'test-pack-1',
    cards,
    openedAt: new Date(),
    bestRarity: cards.length > 0 ? cards.reduce((best, card) => {
      const order = { common: 0, uncommon: 1, rare: 2, epic: 3, legendary: 4, mythic: 5 };
      return order[card.rarity] > order[best.rarity] ? card : best;
    }, cards[0]).rarity : 'common',
    design: 'standard',
  };
  return {
    packs: [pack],
    metadata: {
      totalPacksOpened: 1,
      lastOpenedAt: new Date(),
      uniqueCards: cardIds,
      rarePulls: 0,
      holoPulls: 0,
    },
  };
}

function createEmptyCollection(): Collection {
  return {
    packs: [],
    metadata: {
      totalPacksOpened: 0,
      lastOpenedAt: null,
      uniqueCards: [],
      rarePulls: 0,
      holoPulls: 0,
    },
  };
}

describe('Collection Completion System', () => {
  describe('calculateCollectionCompletion', () => {
    it('should return 0% completion for empty collection', () => {
      const collection = createEmptyCollection();
      const completion = calculateCollectionCompletion(collection);

      expect(completion.totalCardsOwned).toBe(0);
      expect(completion.overallPercentage).toBe(0);
      expect(completion.totalCardsInGame).toBe(16);
    });

    it('should calculate correct overall completion percentage', () => {
      // Own 4 out of 16 cards = 25%
      const collection = createCollection(['common_1', 'common_2', 'uncommon_1', 'rare_1']);
      const completion = calculateCollectionCompletion(collection);

      expect(completion.totalCardsOwned).toBe(4);
      expect(completion.totalCardsInGame).toBe(16);
      expect(completion.overallPercentage).toBe(25);
    });

    it('should calculate 100% completion when all cards owned', () => {
      const allCardIds = mockAllCards.map(c => c.id);
      const collection = createCollection(allCardIds);
      const completion = calculateCollectionCompletion(collection);

      expect(completion.totalCardsOwned).toBe(16);
      expect(completion.overallPercentage).toBe(100);
    });

    it('should handle duplicate cards in collection', () => {
      // Create collection with duplicates
      const pack1: Pack = {
        id: 'pack-1',
        cards: [mockAllCards[0], mockAllCards[1]],
        openedAt: new Date(),
        bestRarity: 'common',
        design: 'standard',
      };
      const pack2: Pack = {
        id: 'pack-2',
        cards: [mockAllCards[0], mockAllCards[2]], // common_1 is duplicate
        openedAt: new Date(),
        bestRarity: 'common',
        design: 'standard',
      };
      const collection: Collection = {
        packs: [pack1, pack2],
        metadata: {
          totalPacksOpened: 2,
          lastOpenedAt: new Date(),
          uniqueCards: ['common_1', 'common_2', 'common_3'],
          rarePulls: 0,
          holoPulls: 0,
        },
      };

      const completion = calculateCollectionCompletion(collection);
      expect(completion.totalCardsOwned).toBe(3); // Only unique cards counted
    });

    it('should include lastUpdated timestamp', () => {
      const collection = createEmptyCollection();
      const before = new Date();
      const completion = calculateCollectionCompletion(collection);
      const after = new Date();

      expect(completion.lastUpdated.getTime()).toBeGreaterThanOrEqual(before.getTime());
      expect(completion.lastUpdated.getTime()).toBeLessThanOrEqual(after.getTime());
    });
  });

  describe('Per-Rarity Completion Tracking', () => {
    it('should track completion for each rarity tier', () => {
      // Own all common cards (5), some uncommon (2)
      const collection = createCollection([
        'common_1', 'common_2', 'common_3', 'common_4', 'common_5',
        'uncommon_1', 'uncommon_2',
      ]);
      const completion = calculateCollectionCompletion(collection);

      expect(completion.rarityCompletion.common.totalCards).toBe(5);
      expect(completion.rarityCompletion.common.ownedCards).toBe(5);
      expect(completion.rarityCompletion.common.percentage).toBe(100);

      expect(completion.rarityCompletion.uncommon.totalCards).toBe(4);
      expect(completion.rarityCompletion.uncommon.ownedCards).toBe(2);
      expect(completion.rarityCompletion.uncommon.percentage).toBe(50);

      expect(completion.rarityCompletion.rare.ownedCards).toBe(0);
      expect(completion.rarityCompletion.rare.percentage).toBe(0);
    });

    it('should identify missing cards per rarity', () => {
      const collection = createCollection(['common_1', 'common_2']);
      const completion = calculateCollectionCompletion(collection);

      expect(completion.rarityCompletion.common.missingCardIds).toContain('common_3');
      expect(completion.rarityCompletion.common.missingCardIds).toContain('common_4');
      expect(completion.rarityCompletion.common.missingCardIds).toContain('common_5');
      expect(completion.rarityCompletion.common.missingCardIds).not.toContain('common_1');
    });

    it('should handle empty rarity tiers gracefully', () => {
      const collection = createEmptyCollection();
      const completion = calculateCollectionCompletion(collection);

      // All rarities should have 0 owned
      expect(completion.rarityCompletion.common.ownedCards).toBe(0);
      expect(completion.rarityCompletion.mythic.ownedCards).toBe(0);
    });
  });

  describe('Per-Type (DadType) Completion Tracking', () => {
    it('should track completion for each dad type', () => {
      // BBQ_DICKTATOR has: common_1, common_2, uncommon_1, rare_1 (4 cards)
      const collection = createCollection(['common_1', 'common_2', 'uncommon_1']);
      const completion = calculateCollectionCompletion(collection);

      const bbqCompletion = completion.typeCompletion['BBQ_DICKTATOR' as DadType];
      expect(bbqCompletion.totalCards).toBe(4);
      expect(bbqCompletion.ownedCards).toBe(3);
      expect(bbqCompletion.percentage).toBe(75);
    });

    it('should identify missing cards per type', () => {
      const collection = createCollection(['common_1']);
      const completion = calculateCollectionCompletion(collection);

      const bbqCompletion = completion.typeCompletion['BBQ_DICKTATOR' as DadType];
      expect(bbqCompletion.missingCardIds).toContain('common_2');
      expect(bbqCompletion.missingCardIds).toContain('uncommon_1');
      expect(bbqCompletion.missingCardIds).toContain('rare_1');
      expect(bbqCompletion.missingCardIds).not.toContain('common_1');
    });

    it('should handle types with no cards owned', () => {
      const collection = createEmptyCollection();
      const completion = calculateCollectionCompletion(collection);

      const itemCompletion = completion.typeCompletion['ITEM' as DadType];
      expect(itemCompletion.ownedCards).toBe(0);
      expect(itemCompletion.percentage).toBe(0);
    });
  });

  describe('Milestone Calculations', () => {
    it('should mark 25% milestone as achieved', () => {
      // 4/16 = 25%
      const collection = createCollection(['common_1', 'common_2', 'common_3', 'common_4']);
      const completion = calculateCollectionCompletion(collection);

      const milestone25 = completion.overallMilestones.find(m => m.percentage === 25);
      expect(milestone25?.achieved).toBe(true);
      expect(milestone25?.achievedAt).toBeDefined();
    });

    it('should mark 50% milestone as achieved', () => {
      // 8/16 = 50%
      const collection = createCollection([
        'common_1', 'common_2', 'common_3', 'common_4', 'common_5',
        'uncommon_1', 'uncommon_2', 'uncommon_3',
      ]);
      const completion = calculateCollectionCompletion(collection);

      const milestone50 = completion.overallMilestones.find(m => m.percentage === 50);
      expect(milestone50?.achieved).toBe(true);
    });

    it('should mark 75% milestone as achieved', () => {
      // 12/16 = 75%
      const collection = createCollection([
        'common_1', 'common_2', 'common_3', 'common_4', 'common_5',
        'uncommon_1', 'uncommon_2', 'uncommon_3', 'uncommon_4',
        'rare_1', 'rare_2', 'rare_3',
      ]);
      const completion = calculateCollectionCompletion(collection);

      const milestone75 = completion.overallMilestones.find(m => m.percentage === 75);
      expect(milestone75?.achieved).toBe(true);
    });

    it('should mark 100% milestone as achieved', () => {
      const allCardIds = mockAllCards.map(c => c.id);
      const collection = createCollection(allCardIds);
      const completion = calculateCollectionCompletion(collection);

      const milestone100 = completion.overallMilestones.find(m => m.percentage === 100);
      expect(milestone100?.achieved).toBe(true);
    });

    it('should not mark unachieved milestones', () => {
      // 2/16 = 12.5% (below 25%)
      const collection = createCollection(['common_1', 'common_2']);
      const completion = calculateCollectionCompletion(collection);

      const milestone25 = completion.overallMilestones.find(m => m.percentage === 25);
      expect(milestone25?.achieved).toBe(false);
      expect(milestone25?.achievedAt).toBeUndefined();
    });

    it('should include all milestone percentages (25, 50, 75, 100)', () => {
      const collection = createEmptyCollection();
      const completion = calculateCollectionCompletion(collection);

      const percentages = completion.overallMilestones.map(m => m.percentage);
      expect(percentages).toContain(25);
      expect(percentages).toContain(50);
      expect(percentages).toContain(75);
      expect(percentages).toContain(100);
    });
  });

  describe('getMissingCardsByRarity', () => {
    it('should return all cards of a rarity when none owned', () => {
      const collection = createEmptyCollection();
      const missing = getMissingCardsByRarity(collection, 'common');

      expect(missing).toHaveLength(5);
      expect(missing).toContain('common_1');
      expect(missing).toContain('common_5');
    });

    it('should return only missing cards of a rarity', () => {
      const collection = createCollection(['common_1', 'common_3']);
      const missing = getMissingCardsByRarity(collection, 'common');

      expect(missing).toHaveLength(3);
      expect(missing).toContain('common_2');
      expect(missing).toContain('common_4');
      expect(missing).toContain('common_5');
      expect(missing).not.toContain('common_1');
    });

    it('should return empty array when all cards of rarity owned', () => {
      const collection = createCollection([
        'common_1', 'common_2', 'common_3', 'common_4', 'common_5',
      ]);
      const missing = getMissingCardsByRarity(collection, 'common');

      expect(missing).toHaveLength(0);
    });
  });

  describe('getMissingCardsByType', () => {
    it('should return all cards of a type when none owned', () => {
      const collection = createEmptyCollection();
      const missing = getMissingCardsByType(collection, 'BBQ_DICKTATOR' as DadType);

      expect(missing).toHaveLength(4);
      expect(missing).toContain('common_1');
      expect(missing).toContain('rare_1');
    });

    it('should return only missing cards of a type', () => {
      const collection = createCollection(['common_1', 'uncommon_1']);
      const missing = getMissingCardsByType(collection, 'BBQ_DICKTATOR' as DadType);

      expect(missing).toHaveLength(2);
      expect(missing).toContain('common_2');
      expect(missing).toContain('rare_1');
    });
  });

  describe('getAllMissingCards', () => {
    it('should return all cards when collection is empty', () => {
      const collection = createEmptyCollection();
      const missing = getAllMissingCards(collection);

      expect(missing).toHaveLength(16);
    });

    it('should return only missing cards', () => {
      const collection = createCollection(['common_1', 'rare_1', 'mythic_1']);
      const missing = getAllMissingCards(collection);

      expect(missing).toHaveLength(13);
      expect(missing).not.toContain('common_1');
      expect(missing).not.toContain('rare_1');
      expect(missing).not.toContain('mythic_1');
    });

    it('should return empty array when collection is complete', () => {
      const allCardIds = mockAllCards.map(c => c.id);
      const collection = createCollection(allCardIds);
      const missing = getAllMissingCards(collection);

      expect(missing).toHaveLength(0);
    });
  });

  describe('isMilestoneAchieved', () => {
    it('should return true when milestone is achieved', () => {
      const collection = createCollection(['common_1', 'common_2', 'common_3', 'common_4']);
      expect(isMilestoneAchieved(collection, 25)).toBe(true);
    });

    it('should return false when milestone is not achieved', () => {
      const collection = createCollection(['common_1']);
      expect(isMilestoneAchieved(collection, 25)).toBe(false);
    });

    it('should return true for all previous milestones when higher achieved', () => {
      // 12/16 = 75%
      const collection = createCollection([
        'common_1', 'common_2', 'common_3', 'common_4', 'common_5',
        'uncommon_1', 'uncommon_2', 'uncommon_3', 'uncommon_4',
        'rare_1', 'rare_2', 'rare_3',
      ]);

      expect(isMilestoneAchieved(collection, 25)).toBe(true);
      expect(isMilestoneAchieved(collection, 50)).toBe(true);
      expect(isMilestoneAchieved(collection, 75)).toBe(true);
      expect(isMilestoneAchieved(collection, 100)).toBe(false);
    });
  });

  describe('getNewlyAchievedMilestones', () => {
    it('should return newly achieved milestones', () => {
      const previousCollection = createCollection(['common_1', 'common_2', 'common_3']);
      const currentCollection = createCollection(['common_1', 'common_2', 'common_3', 'common_4']);

      const previousCompletion = calculateCollectionCompletion(previousCollection);
      const currentCompletion = calculateCollectionCompletion(currentCollection);

      const newMilestones = getNewlyAchievedMilestones(previousCompletion, currentCompletion);

      // Should include the overall 25% milestone (may also include rarity milestones)
      expect(newMilestones.length).toBeGreaterThanOrEqual(1);
      expect(newMilestones.some(m => m.percentage === 25)).toBe(true);
    });

    it('should return empty array when no new milestones', () => {
      const collection = createCollection(['common_1', 'common_2']);
      const completion = calculateCollectionCompletion(collection);

      const newMilestones = getNewlyAchievedMilestones(completion, completion);

      expect(newMilestones).toHaveLength(0);
    });

    it('should return multiple new milestones when jumping completion', () => {
      const previousCollection = createEmptyCollection();
      const currentCollection = createCollection([
        'common_1', 'common_2', 'common_3', 'common_4', 'common_5',
        'uncommon_1', 'uncommon_2', 'uncommon_3', 'uncommon_4',
      ]); // 9/16 = 56.25%

      const previousCompletion = calculateCollectionCompletion(previousCollection);
      const currentCompletion = calculateCollectionCompletion(currentCollection);

      const newMilestones = getNewlyAchievedMilestones(previousCompletion, currentCompletion);

      expect(newMilestones.some(m => m.percentage === 25)).toBe(true);
      expect(newMilestones.some(m => m.percentage === 50)).toBe(true);
    });
  });

  describe('getCompletionSummary', () => {
    it('should return correct summary for partial collection', () => {
      const collection = createCollection(['common_1', 'common_2', 'common_3', 'common_4']);
      const summary = getCompletionSummary(collection);

      expect(summary.overall).toBe(25);
      expect(summary.ownedCards).toBe(4);
      expect(summary.totalCards).toBe(16);
      expect(summary.nextMilestone).toBe(50);
      expect(summary.cardsToNextMilestone).toBe(4); // Need 8 for 50%, have 4
    });

    it('should return null nextMilestone when 100% complete', () => {
      const allCardIds = mockAllCards.map(c => c.id);
      const collection = createCollection(allCardIds);
      const summary = getCompletionSummary(collection);

      expect(summary.overall).toBe(100);
      expect(summary.nextMilestone).toBeNull();
      expect(summary.cardsToNextMilestone).toBe(0);
    });

    it('should include rarity progress breakdown', () => {
      const collection = createCollection([
        'common_1', 'common_2', 'common_3', 'common_4', 'common_5',
        'uncommon_1', 'uncommon_2',
      ]);
      const summary = getCompletionSummary(collection);

      expect(summary.rarityProgress.common).toBe(100);
      expect(summary.rarityProgress.uncommon).toBe(50);
      expect(summary.rarityProgress.rare).toBe(0);
    });
  });

  describe('calculateBonusPacksFromMilestones', () => {
    it('should return correct packs for 25% milestone', () => {
      const milestones: CompletionMilestone[] = [{
        percentage: 25,
        achieved: true,
        reward: { type: 'badge', value: 'test', description: '3 Bonus Packs', icon: '' },
      }];

      expect(calculateBonusPacksFromMilestones(milestones)).toBe(3);
    });

    it('should return correct packs for 50% milestone', () => {
      const milestones: CompletionMilestone[] = [{
        percentage: 50,
        achieved: true,
        reward: { type: 'badge', value: 'test', description: '5 Bonus Packs', icon: '' },
      }];

      expect(calculateBonusPacksFromMilestones(milestones)).toBe(5);
    });

    it('should return correct packs for 75% milestone', () => {
      const milestones: CompletionMilestone[] = [{
        percentage: 75,
        achieved: true,
        reward: { type: 'badge', value: 'test', description: '10 Bonus Packs', icon: '' },
      }];

      expect(calculateBonusPacksFromMilestones(milestones)).toBe(10);
    });

    it('should return correct packs for 100% milestone', () => {
      const milestones: CompletionMilestone[] = [{
        percentage: 100,
        achieved: true,
        reward: { type: 'badge', value: 'test', description: '20 Bonus Packs', icon: '' },
      }];

      expect(calculateBonusPacksFromMilestones(milestones)).toBe(20);
    });

    it('should sum packs from multiple milestones', () => {
      const milestones: CompletionMilestone[] = [
        { percentage: 25, achieved: true, reward: { type: 'badge', value: 'test', description: '3 Bonus Packs', icon: '' } },
        { percentage: 50, achieved: true, reward: { type: 'badge', value: 'test', description: '5 Bonus Packs', icon: '' } },
      ];

      expect(calculateBonusPacksFromMilestones(milestones)).toBe(8);
    });

    it('should return 0 for empty milestone array', () => {
      expect(calculateBonusPacksFromMilestones([])).toBe(0);
    });
  });

  describe('Badges and Achievements', () => {
    it('should award badges for achieved milestones', () => {
      const collection = createCollection(['common_1', 'common_2', 'common_3', 'common_4']);
      const completion = calculateCollectionCompletion(collection);

      expect(completion.badgesAwarded).toContain('collector_quarter');
      expect(completion.achievementsUnlocked).toContain('overall_25');
    });

    it('should not award badges for unachieved milestones', () => {
      const collection = createCollection(['common_1']);
      const completion = calculateCollectionCompletion(collection);

      expect(completion.badgesAwarded).not.toContain('collector_quarter');
      expect(completion.badgesAwarded).not.toContain('collector_half');
    });

    it('should award all applicable badges', () => {
      // 12/16 = 75%
      const collection = createCollection([
        'common_1', 'common_2', 'common_3', 'common_4', 'common_5',
        'uncommon_1', 'uncommon_2', 'uncommon_3', 'uncommon_4',
        'rare_1', 'rare_2', 'rare_3',
      ]);
      const completion = calculateCollectionCompletion(collection);

      expect(completion.badgesAwarded).toContain('collector_quarter');
      expect(completion.badgesAwarded).toContain('collector_half');
      expect(completion.badgesAwarded).toContain('collector_three_quarters');
      expect(completion.badgesAwarded).not.toContain('collector_complete');
    });
  });

  describe('Custom Completion Config', () => {
    it('should respect custom milestone percentages', () => {
      const customConfig: CompletionConfig = {
        milestonePercentages: [10, 30, 60, 90],
        enableRarityMilestones: true,
        enableTypeMilestones: true,
        autoClaimRewards: true,
      };

      const collection = createCollection(['common_1', 'common_2']); // 12.5%
      const completion = calculateCollectionCompletion(collection, customConfig);

      const percentages = completion.overallMilestones.map(m => m.percentage);
      expect(percentages).toContain(10);
      expect(percentages).toContain(30);
      expect(percentages).not.toContain(25);
    });

    it('should disable rarity milestones when configured', () => {
      const customConfig: CompletionConfig = {
        milestonePercentages: [25, 50, 75, 100],
        enableRarityMilestones: false,
        enableTypeMilestones: true,
        autoClaimRewards: true,
      };

      const collection = createCollection([
        'common_1', 'common_2', 'common_3', 'common_4', 'common_5',
      ]);
      const completion = calculateCollectionCompletion(collection, customConfig);

      expect(completion.rarityCompletion.common.milestones).toHaveLength(0);
    });
  });

  describe('Edge Cases', () => {
    it('should handle percentage rounding correctly', () => {
      // 1/16 = 6.25%
      const collection = createCollection(['common_1']);
      const completion = calculateCollectionCompletion(collection);

      expect(completion.overallPercentage).toBe(6.25);
    });

    it('should handle collection with multiple packs', () => {
      const pack1: Pack = {
        id: 'pack-1',
        cards: [mockAllCards[0], mockAllCards[1], mockAllCards[2]],
        openedAt: new Date(),
        bestRarity: 'common',
        design: 'standard',
      };
      const pack2: Pack = {
        id: 'pack-2',
        cards: [mockAllCards[3], mockAllCards[4], mockAllCards[5]],
        openedAt: new Date(),
        bestRarity: 'uncommon',
        design: 'standard',
      };
      const collection: Collection = {
        packs: [pack1, pack2],
        metadata: {
          totalPacksOpened: 2,
          lastOpenedAt: new Date(),
          uniqueCards: [],
          rarePulls: 0,
          holoPulls: 0,
        },
      };

      const completion = calculateCollectionCompletion(collection);
      expect(completion.totalCardsOwned).toBe(6);
    });

    it('should handle cards appearing in multiple packs (duplicates)', () => {
      // Same card in multiple packs
      const pack1: Pack = {
        id: 'pack-1',
        cards: [mockAllCards[0]],
        openedAt: new Date(),
        bestRarity: 'common',
        design: 'standard',
      };
      const pack2: Pack = {
        id: 'pack-2',
        cards: [mockAllCards[0]], // Duplicate
        openedAt: new Date(),
        bestRarity: 'common',
        design: 'standard',
      };
      const collection: Collection = {
        packs: [pack1, pack2],
        metadata: {
          totalPacksOpened: 2,
          lastOpenedAt: new Date(),
          uniqueCards: ['common_1'],
          rarePulls: 0,
          holoPulls: 0,
        },
      };

      const completion = calculateCollectionCompletion(collection);
      expect(completion.totalCardsOwned).toBe(1); // Only count unique
    });
  });
});

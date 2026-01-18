/**
 * Collection Completion Tests
 *
 * Tests for the collection completion tracking and milestone system.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  calculateCollectionCompletion,
  getMissingCardsByRarity,
  getMissingCardsByType,
  getAllMissingCards,
  isMilestoneAchieved,
  getNewlyAchievedMilestones,
  getCompletionSummary,
  calculateBonusPacksFromMilestones,
} from '../../../../src/lib/collection/completion';
import type { Collection, Pack, PackCard, Rarity, DadType } from '../../../../src/types';

// Mock the card database
vi.mock('../../../../src/lib/cards/database', () => ({
  getAllCards: () => [
    // Create a small set of test cards (2 per rarity for testing)
    { id: 'common-1', name: 'Common 1', rarity: 'common', type: 'BBQ_DAD' },
    { id: 'common-2', name: 'Common 2', rarity: 'common', type: 'FIX_IT_DAD' },
    { id: 'uncommon-1', name: 'Uncommon 1', rarity: 'uncommon', type: 'BBQ_DAD' },
    { id: 'uncommon-2', name: 'Uncommon 2', rarity: 'uncommon', type: 'GOLF_DAD' },
    { id: 'rare-1', name: 'Rare 1', rarity: 'rare', type: 'COUCH_DAD' },
    { id: 'rare-2', name: 'Rare 2', rarity: 'rare', type: 'LAWN_DAD' },
    { id: 'epic-1', name: 'Epic 1', rarity: 'epic', type: 'CAR_DAD' },
    { id: 'epic-2', name: 'Epic 2', rarity: 'epic', type: 'OFFICE_DAD' },
    { id: 'legendary-1', name: 'Legendary 1', rarity: 'legendary', type: 'COOL_DAD' },
    { id: 'legendary-2', name: 'Legendary 2', rarity: 'legendary', type: 'COACH_DAD' },
    { id: 'mythic-1', name: 'Mythic 1', rarity: 'mythic', type: 'CHEF_DAD' },
    { id: 'mythic-2', name: 'Mythic 2', rarity: 'mythic', type: 'HOLIDAY_DAD' },
  ],
  getCardsByRarity: (rarity: Rarity) => {
    const cards = [
      { id: 'common-1', name: 'Common 1', rarity: 'common', type: 'BBQ_DAD' },
      { id: 'common-2', name: 'Common 2', rarity: 'common', type: 'FIX_IT_DAD' },
      { id: 'uncommon-1', name: 'Uncommon 1', rarity: 'uncommon', type: 'BBQ_DAD' },
      { id: 'uncommon-2', name: 'Uncommon 2', rarity: 'uncommon', type: 'GOLF_DAD' },
      { id: 'rare-1', name: 'Rare 1', rarity: 'rare', type: 'COUCH_DAD' },
      { id: 'rare-2', name: 'Rare 2', rarity: 'rare', type: 'LAWN_DAD' },
      { id: 'epic-1', name: 'Epic 1', rarity: 'epic', type: 'CAR_DAD' },
      { id: 'epic-2', name: 'Epic 2', rarity: 'epic', type: 'OFFICE_DAD' },
      { id: 'legendary-1', name: 'Legendary 1', rarity: 'legendary', type: 'COOL_DAD' },
      { id: 'legendary-2', name: 'Legendary 2', rarity: 'legendary', type: 'COACH_DAD' },
      { id: 'mythic-1', name: 'Mythic 1', rarity: 'mythic', type: 'CHEF_DAD' },
      { id: 'mythic-2', name: 'Mythic 2', rarity: 'mythic', type: 'HOLIDAY_DAD' },
    ];
    return cards.filter(c => c.rarity === rarity);
  },
}));

// Helper to create mock pack card
function createMockPackCard(id: string, rarity: Rarity, type: DadType): PackCard {
  return {
    id,
    name: `Card ${id}`,
    subtitle: 'Test',
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
    flavorText: 'Test',
    abilities: [],
    series: 1,
    cardNumber: 1,
    totalInSeries: 50,
    artist: 'Test',
    isRevealed: true,
    isHolo: false,
    holoType: 'none',
  };
}

// Helper to create mock collection
function createMockCollection(ownedCardIds: string[]): Collection {
  const packs: Pack[] = [];

  // Create packs containing the owned cards
  for (let i = 0; i < ownedCardIds.length; i += 6) {
    const packCards = ownedCardIds.slice(i, i + 6).map(id => {
      // Determine rarity from ID
      let rarity: Rarity = 'common';
      let type: DadType = 'BBQ_DAD';
      if (id.includes('uncommon')) rarity = 'uncommon';
      if (id.includes('rare')) rarity = 'rare';
      if (id.includes('epic')) rarity = 'epic';
      if (id.includes('legendary')) rarity = 'legendary';
      if (id.includes('mythic')) rarity = 'mythic';
      return createMockPackCard(id, rarity, type);
    });

    const rarityOrder = { common: 0, uncommon: 1, rare: 2, epic: 3, legendary: 4, mythic: 5 };
    const bestRarity = packCards.reduce((best, c) =>
      rarityOrder[c.rarity] > rarityOrder[best] ? c.rarity : best, 'common' as Rarity);

    packs.push({
      id: `pack-${i}`,
      cards: packCards,
      openedAt: new Date(),
      bestRarity,
      design: 'standard',
    });
  }

  return {
    packs,
    metadata: {
      totalPacksOpened: packs.length,
      lastOpenedAt: new Date(),
      uniqueCards: ownedCardIds,
      rarePulls: 0,
      holoPulls: 0,
    },
  };
}

describe('Collection Completion System', () => {
  describe('calculateCollectionCompletion', () => {
    it('should calculate 0% for empty collection', () => {
      const emptyCollection = createMockCollection([]);
      const completion = calculateCollectionCompletion(emptyCollection);

      expect(completion.totalCardsOwned).toBe(0);
      expect(completion.overallPercentage).toBe(0);
      expect(completion.overallMilestones.every(m => !m.achieved)).toBe(true);
    });

    it('should calculate correct percentage for partial collection', () => {
      // Own 3 out of 12 cards = 25%
      const collection = createMockCollection(['common-1', 'uncommon-1', 'rare-1']);
      const completion = calculateCollectionCompletion(collection);

      expect(completion.totalCardsOwned).toBe(3);
      expect(completion.totalCardsInGame).toBe(12);
      expect(completion.overallPercentage).toBe(25);
    });

    it('should calculate 100% for complete collection', () => {
      const allCards = [
        'common-1', 'common-2',
        'uncommon-1', 'uncommon-2',
        'rare-1', 'rare-2',
        'epic-1', 'epic-2',
        'legendary-1', 'legendary-2',
        'mythic-1', 'mythic-2',
      ];
      const collection = createMockCollection(allCards);
      const completion = calculateCollectionCompletion(collection);

      expect(completion.totalCardsOwned).toBe(12);
      expect(completion.overallPercentage).toBe(100);
      expect(completion.overallMilestones.every(m => m.achieved)).toBe(true);
    });

    it('should track per-rarity completion', () => {
      // Own all commons
      const collection = createMockCollection(['common-1', 'common-2']);
      const completion = calculateCollectionCompletion(collection);

      expect(completion.rarityCompletion.common.percentage).toBe(100);
      expect(completion.rarityCompletion.common.ownedCards).toBe(2);
      expect(completion.rarityCompletion.uncommon.percentage).toBe(0);
    });

    it('should track missing cards', () => {
      const collection = createMockCollection(['common-1']);
      const completion = calculateCollectionCompletion(collection);

      expect(completion.rarityCompletion.common.missingCardIds).toContain('common-2');
      expect(completion.rarityCompletion.common.missingCardIds).not.toContain('common-1');
    });
  });

  describe('getMissingCardsByRarity', () => {
    it('should return all cards of rarity when none owned', () => {
      const collection = createMockCollection([]);
      const missing = getMissingCardsByRarity(collection, 'common');

      expect(missing).toHaveLength(2);
      expect(missing).toContain('common-1');
      expect(missing).toContain('common-2');
    });

    it('should return only missing cards when some owned', () => {
      const collection = createMockCollection(['common-1']);
      const missing = getMissingCardsByRarity(collection, 'common');

      expect(missing).toHaveLength(1);
      expect(missing).toContain('common-2');
      expect(missing).not.toContain('common-1');
    });

    it('should return empty array when all owned', () => {
      const collection = createMockCollection(['common-1', 'common-2']);
      const missing = getMissingCardsByRarity(collection, 'common');

      expect(missing).toHaveLength(0);
    });
  });

  describe('getMissingCardsByType', () => {
    it('should return missing cards of a specific type', () => {
      const collection = createMockCollection([]);
      const missing = getMissingCardsByType(collection, 'BBQ_DAD');

      // BBQ_DAD: common-1, uncommon-1
      expect(missing).toHaveLength(2);
      expect(missing).toContain('common-1');
      expect(missing).toContain('uncommon-1');
    });
  });

  describe('getAllMissingCards', () => {
    it('should return all cards when none owned', () => {
      const collection = createMockCollection([]);
      const missing = getAllMissingCards(collection);

      expect(missing).toHaveLength(12);
    });

    it('should return remaining cards when some owned', () => {
      const collection = createMockCollection(['common-1', 'rare-1', 'mythic-1']);
      const missing = getAllMissingCards(collection);

      expect(missing).toHaveLength(9);
      expect(missing).not.toContain('common-1');
      expect(missing).not.toContain('rare-1');
      expect(missing).not.toContain('mythic-1');
    });
  });

  describe('isMilestoneAchieved', () => {
    it('should return false for unachieved milestone', () => {
      const collection = createMockCollection(['common-1']); // ~8%
      expect(isMilestoneAchieved(collection, 25)).toBe(false);
    });

    it('should return true for achieved milestone', () => {
      const collection = createMockCollection(['common-1', 'uncommon-1', 'rare-1']); // 25%
      expect(isMilestoneAchieved(collection, 25)).toBe(true);
    });
  });

  describe('getNewlyAchievedMilestones', () => {
    it('should detect newly achieved milestones', () => {
      const previousCollection = createMockCollection(['common-1', 'uncommon-1']); // ~17%
      const currentCollection = createMockCollection(['common-1', 'uncommon-1', 'rare-1']); // 25%

      const previousCompletion = calculateCollectionCompletion(previousCollection);
      const currentCompletion = calculateCollectionCompletion(currentCollection);

      const newMilestones = getNewlyAchievedMilestones(previousCompletion, currentCompletion);

      expect(newMilestones.length).toBeGreaterThan(0);
      expect(newMilestones.some(m => m.percentage === 25)).toBe(true);
    });

    it('should return empty array when no new milestones', () => {
      const collection = createMockCollection(['common-1']);
      const completion = calculateCollectionCompletion(collection);

      const newMilestones = getNewlyAchievedMilestones(completion, completion);

      expect(newMilestones).toHaveLength(0);
    });
  });

  describe('getCompletionSummary', () => {
    it('should return summary with progress data', () => {
      const collection = createMockCollection(['common-1', 'uncommon-1']); // ~17%
      const summary = getCompletionSummary(collection);

      expect(summary.overall).toBeCloseTo(16.67, 1);
      expect(summary.nextMilestone).toBe(25);
      expect(summary.ownedCards).toBe(2);
      expect(summary.totalCards).toBe(12);
      expect(summary.cardsToNextMilestone).toBe(1); // Need 3 for 25%, have 2
    });

    it('should return null nextMilestone when complete', () => {
      const allCards = [
        'common-1', 'common-2', 'uncommon-1', 'uncommon-2',
        'rare-1', 'rare-2', 'epic-1', 'epic-2',
        'legendary-1', 'legendary-2', 'mythic-1', 'mythic-2',
      ];
      const collection = createMockCollection(allCards);
      const summary = getCompletionSummary(collection);

      expect(summary.overall).toBe(100);
      expect(summary.nextMilestone).toBeNull();
    });
  });

  describe('calculateBonusPacksFromMilestones', () => {
    it('should calculate correct bonus packs for milestones', () => {
      const milestones = [
        { percentage: 25, reward: { type: 'badge' as const, value: 'test', description: '3 Bonus Packs', icon: '🎖️' }, achieved: true },
        { percentage: 50, reward: { type: 'badge' as const, value: 'test', description: '5 Bonus Packs', icon: '🎖️' }, achieved: true },
      ];

      const bonusPacks = calculateBonusPacksFromMilestones(milestones);

      // 25% = 3 packs, 50% = 5 packs
      expect(bonusPacks).toBe(8);
    });

    it('should return 0 for empty milestones', () => {
      expect(calculateBonusPacksFromMilestones([])).toBe(0);
    });
  });
});

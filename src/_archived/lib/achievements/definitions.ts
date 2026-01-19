/**
 * Achievement Definitions
 *
 * Defines all available achievements with their conditions and progress tracking.
 */

import type { Achievement, AchievementConfig } from '@/types';

// ============================================================================
// Achievement Icons (using emoji/SVG for now, replace with actual images)
// ============================================================================
const ICONS = {
  first_pack: '/images/achievements/first-pack.png',
  pack_collector: '/images/achievements/pack-collector.png',
  card_collector: '/images/achievements/card-collector.png',
  holo_hunter: '/images/achievements/holo-hunter.png',
  mythic_finder: '/images/achievements/mythic-finder.png',
  collector_100: '/images/achievements/collector-100.png',
  collection_master: '/images/achievements/collection-master.png',
  trading_master: '/images/achievements/trading-master.png',
  social_butterfly: '/images/achievements/social-butterfly.png',
  dedicated_player: '/images/achievements/dedicated-player.png',
  week_warrior: '/images/achievements/week-warrior.png',
  month_master: '/images/achievements/month-master.png',
  pack_addict: '/images/achievements/pack-addict.png',
  lucky_day: '/images/achievements/lucky-day.png',
  rarity_master: '/images/achievements/rarity-master.png',
  completionist: '/images/achievements/completionist.png',
};

// ============================================================================
// Achievement Configurations
// ============================================================================

export const ACHIEVEMENT_DEFINITIONS: AchievementConfig[] = [
  // Collection Achievements
  {
    name: 'First Pack',
    description: 'Open your first pack of cards',
    icon: ICONS.first_pack,
    rarity: 'bronze',
    category: 'collection',
    checkCondition: (ctx) => ctx.stats.totalPacksOpened >= 1,
    getProgress: (ctx) => Math.min(ctx.stats.totalPacksOpened, 1),
    maxProgress: 1,
  },
  {
    name: 'Pack Collector',
    description: 'Open 10 packs',
    icon: ICONS.pack_collector,
    rarity: 'bronze',
    category: 'collection',
    checkCondition: (ctx) => ctx.stats.totalPacksOpened >= 10,
    getProgress: (ctx) => Math.min(ctx.stats.totalPacksOpened, 10),
    maxProgress: 10,
  },
  {
    name: 'Card Collector',
    description: 'Collect 50 unique cards',
    icon: ICONS.card_collector,
    rarity: 'silver',
    category: 'collection',
    checkCondition: (ctx) => ctx.stats.uniqueCardsOwned >= 50,
    getProgress: (ctx) => Math.min(ctx.stats.uniqueCardsOwned, 50),
    maxProgress: 50,
  },
  {
    name: 'Holo Hunter',
    description: 'Collect 10 holographic cards',
    icon: ICONS.holo_hunter,
    rarity: 'silver',
    category: 'collection',
    checkCondition: (ctx) => ctx.stats.totalHolographicCards >= 10,
    getProgress: (ctx) => Math.min(ctx.stats.totalHolographicCards, 10),
    maxProgress: 10,
  },
  {
    name: 'Mythic Finder',
    description: 'Find a Mythic rarity card',
    icon: ICONS.mythic_finder,
    rarity: 'gold',
    category: 'collection',
    checkCondition: (ctx) => ctx.stats.mythicCardsOwned >= 1,
    getProgress: (ctx) => Math.min(ctx.stats.mythicCardsOwned, 1),
    maxProgress: 1,
  },
  {
    name: 'Collector',
    description: 'Collect 100 unique cards',
    icon: ICONS.collector_100,
    rarity: 'gold',
    category: 'collection',
    checkCondition: (ctx) => ctx.stats.uniqueCardsOwned >= 100,
    getProgress: (ctx) => Math.min(ctx.stats.uniqueCardsOwned, 100),
    maxProgress: 100,
  },
  {
    name: 'Collection Master',
    description: 'Collect all available cards',
    icon: ICONS.collection_master,
    rarity: 'platinum',
    category: 'collection',
    checkCondition: (ctx) => ctx.stats.uniqueCardsOwned >= 200, // Adjust based on total card count
    getProgress: (ctx) => Math.min(ctx.stats.uniqueCardsOwned, 200),
    maxProgress: 200,
  },

  // Social Achievements
  {
    name: 'Trading Master',
    description: 'Complete 5 trades',
    icon: ICONS.trading_master,
    rarity: 'silver',
    category: 'social',
    checkCondition: (ctx) => ctx.stats.totalTradesCompleted >= 5,
    getProgress: (ctx) => Math.min(ctx.stats.totalTradesCompleted, 5),
    maxProgress: 5,
  },
  {
    name: 'Social Butterfly',
    description: 'Complete 20 trades',
    icon: ICONS.social_butterfly,
    rarity: 'gold',
    category: 'social',
    checkCondition: (ctx) => ctx.stats.totalTradesCompleted >= 20,
    getProgress: (ctx) => Math.min(ctx.stats.totalTradesCompleted, 20),
    maxProgress: 20,
  },

  // Special Achievements
  {
    name: 'Dedicated Player',
    description: 'Open packs on 3 consecutive days',
    icon: ICONS.dedicated_player,
    rarity: 'silver',
    category: 'special',
    checkCondition: (ctx) => ctx.stats.currentStreak >= 3,
    getProgress: (ctx) => Math.min(ctx.stats.currentStreak, 3),
    maxProgress: 3,
  },
  {
    name: 'Week Warrior',
    description: 'Maintain a 7-day login streak',
    icon: ICONS.week_warrior,
    rarity: 'gold',
    category: 'special',
    checkCondition: (ctx) => ctx.stats.currentStreak >= 7,
    getProgress: (ctx) => Math.min(ctx.stats.currentStreak, 7),
    maxProgress: 7,
  },
  {
    name: 'Month Master',
    description: 'Maintain a 30-day login streak',
    icon: ICONS.month_master,
    rarity: 'platinum',
    category: 'special',
    checkCondition: (ctx) => ctx.stats.currentStreak >= 30,
    getProgress: (ctx) => Math.min(ctx.stats.currentStreak, 30),
    maxProgress: 30,
  },
  {
    name: 'Pack Addict',
    description: 'Open 100 packs',
    icon: ICONS.pack_addict,
    rarity: 'gold',
    category: 'special',
    checkCondition: (ctx) => ctx.stats.totalPacksOpened >= 100,
    getProgress: (ctx) => Math.min(ctx.stats.totalPacksOpened, 100),
    maxProgress: 100,
  },
  {
    name: 'Lucky Day',
    description: 'Open a pack with 3+ rare or better cards',
    icon: ICONS.lucky_day,
    rarity: 'gold',
    category: 'special',
    checkCondition: (ctx) => {
      if (!ctx.pack) return false;
      const rareOrBetter = ctx.pack.cards.filter(
        c => c.rarity === 'rare' || c.rarity === 'epic' || c.rarity === 'legendary' || c.rarity === 'mythic'
      );
      return rareOrBetter.length >= 3;
    },
    maxProgress: 1,
  },
  {
    name: 'Rarity Master',
    description: 'Collect at least one card of each rarity',
    icon: ICONS.rarity_master,
    rarity: 'platinum',
    category: 'collection',
    checkCondition: (ctx) =>
      ctx.stats.commonCardsOwned >= 1 &&
      ctx.stats.uncommonCardsOwned >= 1 &&
      ctx.stats.rareCardsOwned >= 1 &&
      ctx.stats.epicCardsOwned >= 1 &&
      ctx.stats.legendaryCardsOwned >= 1,
    getProgress: (ctx) => {
      let count = 0;
      if (ctx.stats.commonCardsOwned >= 1) count++;
      if (ctx.stats.uncommonCardsOwned >= 1) count++;
      if (ctx.stats.rareCardsOwned >= 1) count++;
      if (ctx.stats.epicCardsOwned >= 1) count++;
      if (ctx.stats.legendaryCardsOwned >= 1) count++;
      return count;
    },
    maxProgress: 5,
  },
  {
    name: 'Completionist',
    description: 'Unlock all other achievements',
    icon: ICONS.completionist,
    rarity: 'platinum',
    category: 'special',
    hidden: true,
    hint: 'Unlock every other achievement to reveal this one',
    checkCondition: (ctx) => {
      // This will be checked dynamically based on total unlocked
      return false; // Handled specially in achievement checker
    },
    maxProgress: 1,
  },
];

// ============================================================================
// Achievement Initialization
// ============================================================================

/**
 * Convert achievement configs to achievement instances with IDs
 */
export function initializeAchievements(): Achievement[] {
  return ACHIEVEMENT_DEFINITIONS.map((config, index) => ({
    id: `achievement_${index}`,
    ...config,
    progress: 0,
  }));
}

/**
 * Get achievement by ID
 */
export function getAchievementById(id: string): AchievementConfig | undefined {
  const index = parseInt(id.replace('achievement_', ''));
  return ACHIEVEMENT_DEFINITIONS[index];
}

/**
 * Get all achievement definitions
 */
export function getAllAchievementDefinitions(): AchievementConfig[] {
  return ACHIEVEMENT_DEFINITIONS;
}

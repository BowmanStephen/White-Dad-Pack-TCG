import { computed } from 'nanostores';
import { persistentAtom } from '@nanostores/persistent';
import type {
  Achievement,
  AchievementConfig,
  AchievementContext,
  AchievementState,
} from '../types';
import { getCollectionStats, collection } from './collection';
import { trackEvent } from './analytics';

// Custom encoder for Achievement type (handles Date serialization)
const achievementEncoder = {
  encode(data: Achievement[]): string {
    return JSON.stringify(data, (_key, value) => {
      // Convert Date objects to ISO strings
      if (value instanceof Date) {
        return value.toISOString();
      }
      return value;
    });
  },
  decode(str: string): Achievement[] {
    const data = JSON.parse(str);
    // Convert ISO strings back to Date objects
    return data.map((achievement: Achievement) => ({
      ...achievement,
      unlockedAt: achievement.unlockedAt ? new Date(achievement.unlockedAt) : undefined,
    }));
  },
};

// Achievement definitions - all possible achievements
export const ACHIEVEMENT_DEFINITIONS: Record<string, AchievementConfig> = {
  // Opening achievements
  first_pack: {
    name: 'First Pack',
    description: 'Open your first pack',
    icon: '🎁',
    rarity: 'bronze',
    category: 'opening',
    checkCondition: (context) => context.stats.totalPacks >= 1,
  },
  ten_packs: {
    name: 'Pack Enthusiast',
    description: 'Open 10 packs',
    icon: '📦',
    rarity: 'silver',
    category: 'opening',
    maxProgress: 10,
    checkCondition: (context) => context.stats.totalPacks >= 10,
    getProgress: (context) => Math.min(context.stats.totalPacks, 10),
  },
  fifty_packs: {
    name: 'Dedicated Dad',
    description: 'Open 50 packs',
    icon: '💪',
    rarity: 'gold',
    category: 'opening',
    maxProgress: 50,
    checkCondition: (context) => context.stats.totalPacks >= 50,
    getProgress: (context) => Math.min(context.stats.totalPacks, 50),
  },
  hundred_packs: {
    name: 'Dedicated',
    description: 'Open 100 packs',
    icon: '🏆',
    rarity: 'platinum',
    category: 'opening',
    maxProgress: 100,
    checkCondition: (context) => context.stats.totalPacks >= 100,
    getProgress: (context) => Math.min(context.stats.totalPacks, 100),
  },

  // Collection achievements
  collector: {
    name: 'Collector',
    description: 'Own 25 unique cards',
    icon: '📚',
    rarity: 'silver',
    category: 'collection',
    maxProgress: 25,
    checkCondition: (context) => context.stats.uniqueCards >= 25,
    getProgress: (context) => Math.min(context.stats.uniqueCards, 25),
  },
  master_collector: {
    name: 'Master Collector',
    description: 'Own 50 unique cards',
    icon: '👑',
    rarity: 'gold',
    category: 'collection',
    maxProgress: 50,
    checkCondition: (context) => context.stats.uniqueCards >= 50,
    getProgress: (context) => Math.min(context.stats.uniqueCards, 50),
  },

  // Rarity achievements
  rare_pull: {
    name: 'Rare Find',
    description: 'Pull a rare or better card',
    icon: '✨',
    rarity: 'bronze',
    category: 'rare',
    checkCondition: (context) =>
      context.stats.rarePulls > 0 ||
      context.stats.epicPulls > 0 ||
      context.stats.legendaryPulls > 0 ||
      context.stats.mythicPulls > 0,
  },
  epic_pull: {
    name: 'Epic Discovery',
    description: 'Pull an epic card',
    icon: '💜',
    rarity: 'silver',
    category: 'rare',
    checkCondition: (context) => context.stats.epicPulls > 0,
  },
  legendary_pull: {
    name: 'Legendary Hunter',
    description: 'Pull a legendary card',
    icon: '🔥',
    rarity: 'gold',
    category: 'rare',
    checkCondition: (context) => context.stats.legendaryPulls > 0,
  },
  mythic_hunter: {
    name: 'Mythic Hunter',
    description: 'Pull a mythic card',
    icon: '🌟',
    rarity: 'platinum',
    category: 'rare',
    checkCondition: (context) => context.stats.mythicPulls > 0,
  },

  // Holo achievements
  holo_collector: {
    name: 'Holo Collector',
    description: 'Pull 10 holographic cards',
    icon: '🌈',
    rarity: 'silver',
    category: 'holo',
    maxProgress: 10,
    checkCondition: (context) => context.stats.holoPulls >= 10,
    getProgress: (context) => Math.min(context.stats.holoPulls, 10),
  },
  holo_master: {
    name: 'Holo Master',
    description: 'Pull 25 holographic cards',
    icon: '💎',
    rarity: 'gold',
    category: 'holo',
    maxProgress: 25,
    checkCondition: (context) => context.stats.holoPulls >= 25,
    getProgress: (context) => Math.min(context.stats.holoPulls, 25),
  },

  // Variety achievements (future expansion)
  // complete_set: {
  //   name: 'Complete Set',
  //   description: 'Collect all cards from a series',
  //   icon: '🎯',
  //   rarity: 'platinum',
  //   category: 'variety',
  //   checkCondition: (context) => {
  //     // Check if any series is complete
  //     const seriesCounts: Record<number, Set<string>> = {};
  //     for (const pack of context.collection.packs) {
  //       for (const card of pack.cards) {
  //         if (!seriesCounts[card.series]) {
  //           seriesCounts[card.series] = new Set();
  //         }
  //         seriesCounts[card.series].add(card.id);
  //       }
  //     }
  //     return Object.values(seriesCounts).some((cards) => cards.size >= 50);
  //   },
  // },
};

// Achievement state with LocalStorage persistence
export const achievements = persistentAtom<Achievement[]>(
  'daddeck-achievements',
  [],
  achievementEncoder
);

// Recently unlocked achievements (for popup queue)
export const recentlyUnlocked = persistentAtom<string[]>(
  'daddeck-recently-unlocked',
  [],
  {
    encode: (data) => JSON.stringify(data),
    decode: (str) => JSON.parse(str),
  }
);

// Computed: Get all unlocked achievements
export const unlockedAchievements = computed(achievements, (all) =>
  all.filter((a) => a.unlockedAt)
);

// Computed: Get all locked achievements (with progress)
export const lockedAchievements = computed(achievements, (all) =>
  all.filter((a) => !a.unlockedAt)
);

// Computed: Get total unlocked count
export const totalUnlocked = computed(unlockedAchievements, (unlocked) =>
  unlocked.length
);

// Computed: Get total achievement count
export const totalAchievements = computed(achievements, (all) => all.length);

// Computed: Get completion percentage
export const completionPercentage = computed(
  [totalUnlocked, totalAchievements],
  (unlocked, total) => (total > 0 ? (unlocked / total) * 100 : 0)
);

/**
 * Initialize achievements from definitions
 * Creates achievement objects for all defined achievements
 */
export function initializeAchievements(): void {
  const current = achievements.get();
  const currentIds = new Set(current.map((a) => a.id));

  const newAchievements: Achievement[] = [...current];

  // Add any new achievements from definitions
  for (const [id, definition] of Object.entries(ACHIEVEMENT_DEFINITIONS)) {
    if (!currentIds.has(id)) {
      newAchievements.push({
        id,
        name: definition.name,
        description: definition.description,
        icon: definition.icon,
        rarity: definition.rarity,
        category: definition.category,
        maxProgress: definition.maxProgress,
        progress: 0,
      });
    }
  }

  // Save if anything changed
  if (newAchievements.length !== current.length) {
    achievements.set(newAchievements);
  }
}

/**
 * Get current achievement context for checking conditions
 */
export function getAchievementContext(pack: any = null): AchievementContext {
  const currentCollection = collection.get();
  const stats = getCollectionStats();

  return {
    pack,
    collection: currentCollection,
    stats,
  };
}

/**
 * Check if an achievement is unlocked
 */
export function isAchievementUnlocked(achievementId: string): boolean {
  const current = achievements.get();
  const achievement = current.find((a) => a.id === achievementId);
  return achievement?.unlockedAt !== undefined;
}

/**
 * Update progress for a progressive achievement
 */
export function updateAchievementProgress(
  achievementId: string,
  progress: number
): void {
  const current = achievements.get();
  const achievement = current.find((a) => a.id === achievementId);

  if (!achievement) return;

  const definition = ACHIEVEMENT_DEFINITIONS[achievementId];
  if (!definition?.maxProgress) return;

  const updatedAchievements = current.map((a) => {
    if (a.id === achievementId) {
      return {
        ...a,
        progress: Math.min(progress, definition.maxProgress!),
      };
    }
    return a;
  });

  achievements.set(updatedAchievements);
}

/**
 * Unlock an achievement
 * Returns true if newly unlocked, false if already unlocked
 */
export function unlockAchievement(
  achievementId: string
): { unlocked: boolean; achievement?: Achievement } {
  // Check if already unlocked
  if (isAchievementUnlocked(achievementId)) {
    return { unlocked: false };
  }

  const current = achievements.get();
  const definition = ACHIEVEMENT_DEFINITIONS[achievementId];

  if (!definition) {
    console.error(`Achievement definition not found: ${achievementId}`);
    return { unlocked: false };
  }

  const updatedAchievements = current.map((a) => {
    if (a.id === achievementId) {
      return {
        ...a,
        unlockedAt: new Date(),
        progress: definition.maxProgress || 1,
      };
    }
    return a;
  });

  achievements.set(updatedAchievements);

  // Add to recently unlocked queue
  const recent = recentlyUnlocked.get();
  recentlyUnlocked.set([...recent, achievementId]);

  // Get the unlocked achievement
  const unlocked = updatedAchievements.find((a) => a.id === achievementId);

  // Track achievement unlock event
  trackEvent({
    type: 'achievement_unlock',
    data: {
      achievementId,
      achievementName: definition.name,
      rarity: definition.rarity,
      category: definition.category,
    },
  } as any);

  return { unlocked: true, achievement: unlocked };
}

/**
 * Check all achievements and unlock any that meet conditions
 * Returns array of newly unlocked achievements
 */
export function checkAndUnlockAchievements(
  context: AchievementContext
): Achievement[] {
  const newlyUnlocked: Achievement[] = [];

  for (const [id, definition] of Object.entries(ACHIEVEMENT_DEFINITIONS)) {
    // Skip if already unlocked
    if (isAchievementUnlocked(id)) continue;

    // Check if condition is met
    if (definition.checkCondition(context)) {
      const result = unlockAchievement(id);
      if (result.unlocked && result.achievement) {
        newlyUnlocked.push(result.achievement);
      }
    }

    // Update progress for progressive achievements
    if (definition.getProgress && !isAchievementUnlocked(id)) {
      const progress = definition.getProgress(context);
      updateAchievementProgress(id, progress);
    }
  }

  return newlyUnlocked;
}

/**
 * Get achievement by ID
 */
export function getAchievement(id: string): Achievement | undefined {
  const current = achievements.get();
  return current.find((a) => a.id === id);
}

/**
 * Get achievements by category
 */
export function getAchievementsByCategory(category: string): Achievement[] {
  const current = achievements.get();
  return current.filter((a) => a.category === category);
}

/**
 * Get achievements by rarity
 */
export function getAchievementsByRarity(rarity: string): Achievement[] {
  const current = achievements.get();
  return current.filter((a) => a.rarity === rarity);
}

/**
 * Clear recently unlocked queue (called after showing popups)
 */
export function clearRecentlyUnlocked(): void {
  recentlyUnlocked.set([]);
}

/**
 * Get next achievement from recently unlocked queue
 * Returns undefined if queue is empty
 */
export function getNextRecentlyUnlocked(): Achievement | undefined {
  const recent = recentlyUnlocked.get();
  if (recent.length === 0) return undefined;

  const [nextId, ...remaining] = recent;
  recentlyUnlocked.set(remaining);

  return getAchievement(nextId);
}

/**
 * Reset all achievements (for testing/debugging)
 */
export function resetAchievements(): void {
  achievements.set([]);
  recentlyUnlocked.set([]);
  initializeAchievements();
}

/**
 * Get shareable badge data for an achievement
 * Returns SVG data URL for sharing
 */
export function getAchievementBadge(achievementId: string): string | null {
  const achievement = getAchievement(achievementId);
  if (!achievement) return null;

  const definition = ACHIEVEMENT_DEFINITIONS[achievementId];
  if (!definition) return null;

  const config = {
    width: 400,
    height: 200,
    padding: 20,
  };

  const rarityConfig = {
    bronze: { bg: '#cd7f32', border: '#e5a85c' },
    silver: { bg: '#c0c0c0', border: '#e0e0e0' },
    gold: { bg: '#ffd700', border: '#ffe55c' },
    platinum: { bg: '#e5e4e2', border: '#f0eff0' },
  }[definition.rarity];

  // Create SVG badge
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="${config.width}" height="${config.height}" viewBox="0 0 ${config.width} ${config.height}">
      <!-- Background -->
      <rect x="0" y="0" width="${config.width}" height="${config.height}" fill="${rarityConfig.bg}" rx="12"/>

      <!-- Border -->
      <rect x="4" y="4" width="${config.width - 8}" height="${config.height - 8}" fill="none" stroke="${rarityConfig.border}" stroke-width="4" rx="10"/>

      <!-- Icon -->
      <text x="30" y="${config.height / 2}" font-size="48" text-anchor="middle" dominant-baseline="middle">${definition.icon}</text>

      <!-- Title -->
      <text x="100" y="${config.height / 2 - 20}" font-size="24" font-weight="bold" fill="#1f2937">${definition.name}</text>

      <!-- Description -->
      <text x="100" y="${config.height / 2 + 15}" font-size="14" fill="#374151">${definition.description}</text>

      <!-- DadDeck branding -->
      <text x="${config.width - 60}" y="${config.height - 20}" font-size="12" fill="#4b5563" text-anchor="end">DadDeck™</text>
    </svg>
  `;

  // Convert to data URL
  const dataUrl = `data:image/svg+xml;base64,${btoa(unescape(encodeURIComponent(svg)))}`;
  return dataUrl;
}

/**
 * Export achievements as JSON (for backup/sharing)
 */
export function exportAchievements(): string {
  const current = achievements.get();
  return JSON.stringify(current, null, 2);
}

/**
 * Import achievements from JSON (for backup/restore)
 */
export function importAchievements(
  jsonData: string
): { success: boolean; error?: string; imported?: number } {
  try {
    const data = JSON.parse(jsonData) as Achievement[];

    // Validate basic structure
    if (!Array.isArray(data)) {
      return { success: false, error: 'Invalid achievement data: not an array' };
    }

    achievements.set(data);
    return { success: true, imported: data.length };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to import achievements',
    };
  }
}

// Initialize achievements on module load
if (typeof window !== 'undefined') {
  initializeAchievements();
}

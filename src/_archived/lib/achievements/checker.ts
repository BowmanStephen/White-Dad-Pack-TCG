/**
 * Achievement Checker
 *
 * Monitors game state and automatically unlocks achievements when conditions are met.
 */

import type { Achievement, AchievementContext, AchievementConfig } from '@/types';
import { ACHIEVEMENT_DEFINITIONS } from './definitions';
import { unlockAchievement } from '@/stores/achievements';

/**
 * Check and unlock achievements based on current game state
 *
 * @param context - Current game state context
 * @returns Array of newly unlocked achievement IDs
 */
export function checkAndUnlockAchievements(context: AchievementContext): string[] {
  const newlyUnlocked: string[] = [];

  for (let i = 0; i < ACHIEVEMENT_DEFINITIONS.length; i++) {
    const definition = ACHIEVEMENT_DEFINITIONS[i];
    const achievementId = `achievement_${i}`;

    // Check if achievement is already unlocked
    if (isAchievementUnlocked(context, achievementId)) {
      continue;
    }

    // Check if condition is met
    if (definition.checkCondition(context)) {
      // Unlock the achievement
      unlockAchievement({
        id: achievementId,
        name: definition.name,
        description: definition.description,
        icon: definition.icon,
        rarity: definition.rarity,
        category: definition.category,
        maxProgress: definition.maxProgress,
        progress: definition.maxProgress || 1,
        hidden: definition.hidden,
        hint: definition.hint,
      });

      newlyUnlocked.push(achievementId);
    }
  }

  // Check for Completionist achievement (all other achievements unlocked)
  const completionistIndex = ACHIEVEMENT_DEFINITIONS.findIndex(
    def => def.name === 'Completionist'
  );

  if (completionistIndex !== -1) {
    const completionistId = `achievement_${completionistIndex}`;
    const totalAchievements = ACHIEVEMENT_DEFINITIONS.length;
    const unlockedCount = countUnlockedAchievements(context);

    if (unlockedCount >= totalAchievements - 1 && !isAchievementUnlocked(context, completionistId)) {
      const completionistDef = ACHIEVEMENT_DEFINITIONS[completionistIndex];

      unlockAchievement({
        id: completionistId,
        name: completionistDef.name,
        description: completionistDef.description,
        icon: completionistDef.icon,
        rarity: completionistDef.rarity,
        category: completionistDef.category,
        maxProgress: completionistDef.maxProgress,
        progress: completionistDef.maxProgress || 1,
        hidden: completionistDef.hidden,
        hint: completionistDef.hint,
      });

      newlyUnlocked.push(completionistId);
    }
  }

  return newlyUnlocked;
}

/**
 * Update achievement progress without unlocking
 *
 * @param context - Current game state context
 * @returns Map of achievement ID to progress
 */
export function updateAchievementProgress(context: AchievementContext): Map<string, number> {
  const progressMap = new Map<string, number>();

  for (let i = 0; i < ACHIEVEMENT_DEFINITIONS.length; i++) {
    const definition = ACHIEVEMENT_DEFINITIONS[i];
    const achievementId = `achievement_${i}`;

    // Skip if already unlocked
    if (isAchievementUnlocked(context, achievementId)) {
      continue;
    }

    // Get current progress
    if (definition.getProgress) {
      const progress = definition.getProgress(context);
      const maxProgress = definition.maxProgress || 1;
      progressMap.set(achievementId, Math.min(progress, maxProgress));
    }
  }

  return progressMap;
}

/**
 * Check if achievement is already unlocked
 */
function isAchievementUnlocked(context: AchievementContext, achievementId: string): boolean {
  return context.collection.achievements?.some(a => a.id === achievementId && a.unlockedAt) || false;
}

/**
 * Count total unlocked achievements
 */
function countUnlockedAchievements(context: AchievementContext): number {
  if (!context.collection.achievements) return 0;
  return context.collection.achievements.filter(a => a.unlockedAt).length;
}

/**
 * Get achievement progress for display
 *
 * @param context - Current game state context
 * @param achievementId - Achievement ID to check
 * @returns Current progress and max progress
 */
export function getAchievementProgress(
  context: AchievementContext,
  achievementId: string
): { current: number; max: number } {
  const index = parseInt(achievementId.replace('achievement_', ''));
  const definition = ACHIEVEMENT_DEFINITIONS[index];

  if (!definition) {
    return { current: 0, max: 1 };
  }

  // If already unlocked, return full progress
  if (isAchievementUnlocked(context, achievementId)) {
    return {
      current: definition.maxProgress || 1,
      max: definition.maxProgress || 1,
    };
  }

  // Get current progress
  const current = definition.getProgress
    ? Math.min(definition.getProgress(context), definition.maxProgress || 1)
    : 0;

  return {
    current,
    max: definition.maxProgress || 1,
  };
}

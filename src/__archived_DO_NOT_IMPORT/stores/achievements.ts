import { atom } from 'nanostores';
import type { Achievement, AchievementRarity } from '../types';
import { playSound } from './audio';
import { trackEvent } from './analytics';

/**
 * Achievement Store - Manages achievement state and toast notifications
 *
 * Features:
 * - Toast notification queue for sequential display
 * - Rarity-based sound effects
 * - Achievement unlock tracking
 * - Recently unlocked achievements for popup display
 */

// Achievement state
export const $achievements = atom<Achievement[]>([]);

// Toast queue (achievements waiting to be displayed)
export const $achievementToastQueue = atom<Achievement[]>([]);

// Currently displayed toast (for animation control)
export const $currentToast = atom<Achievement | null>(null);

// Recently unlocked achievements (for gallery highlights)
export const $recentlyUnlocked = atom<string[]>([]);

// Export stores without $ prefix for imports
export const achievements = $achievements;
export const achievementToastQueue = $achievementToastQueue;
export const currentToast = $currentToast;
export const recentlyUnlocked = $recentlyUnlocked;

// Achievement storage key
const ACHIEVEMENTS_KEY = 'daddeck_achievements';

/**
 * Initialize achievements from localStorage
 */
export function initializeAchievements(): void {
  if (typeof window === 'undefined') return;

  const saved = localStorage.getItem(ACHIEVEMENTS_KEY);
  if (saved) {
    try {
      const parsed = JSON.parse(saved);
      // Convert date strings back to Date objects
      const achievements = parsed.map((a: any) => ({
        ...a,
        unlockedAt: a.unlockedAt ? new Date(a.unlockedAt) : undefined,
      }));
      $achievements.set(achievements);
    } catch (error) {
      console.error('Failed to load achievements:', error);
    }
  }
}

/**
 * Save achievements to localStorage
 */
function saveAchievements(): void {
  if (typeof window === 'undefined') return;

  const achievements = $achievements.get();
  localStorage.setItem(ACHIEVEMENTS_KEY, JSON.stringify(achievements));
}

/**
 * Get achievement sound type based on rarity
 */
function getAchievementSoundType(rarity: AchievementRarity): 'card_reveal' | 'jingle' {
  // Platinum achievements get the jingle treatment
  if (rarity === 'platinum') return 'jingle';
  return 'card_reveal';
}

/**
 * Get card rarity equivalent for achievement sound
 */
function getAchievementSoundRarity(rarity: AchievementRarity): 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary' | 'mythic' {
  switch (rarity) {
    case 'bronze':
      return 'common';
    case 'silver':
      return 'uncommon';
    case 'gold':
      return 'rare';
    case 'platinum':
      return 'legendary';
    default:
      return 'common';
  }
}

/**
 * Unlock an achievement
 * @param achievement - Achievement to unlock
 */
export function unlockAchievement(achievement: Achievement): void {
  const currentAchievements = $achievements.get();

  // Check if already unlocked
  const existing = currentAchievements.find(a => a.id === achievement.id);
  if (existing && existing.unlockedAt) {
    return; // Already unlocked
  }

  // Update achievement with unlock timestamp
  const unlockedAchievement: Achievement = {
    ...achievement,
    unlockedAt: new Date(),
  };

  // Update achievements list
  const updatedAchievements = existing
    ? currentAchievements.map(a => a.id === achievement.id ? unlockedAchievement : a)
    : [...currentAchievements, unlockedAchievement];

  $achievements.set(updatedAchievements);
  saveAchievements();

  // Add to recently unlocked (keep last 10)
  const recent = $recentlyUnlocked.get();
  $recentlyUnlocked.set([achievement.id, ...recent].slice(0, 10));

  // Add to toast queue
  const queue = $achievementToastQueue.get();
  $achievementToastQueue.set([...queue, unlockedAchievement]);

  // Play sound effect
  const soundRarity = getAchievementSoundRarity(achievement.rarity);
  const soundType = getAchievementSoundType(achievement.rarity);
  playSound(soundType, { rarity: soundRarity });

  // Track analytics event
  trackEvent({
    type: 'achievement_unlock',
    data: {
      achievementId: achievement.id,
      achievementName: achievement.name,
      rarity: achievement.rarity,
      category: achievement.category,
    },
  });

  // Process queue if not already showing a toast
  if (!$currentToast.get()) {
    processToastQueue();
  }
}

/**
 * Process the toast queue (display next achievement)
 */
function processToastQueue(): void {
  const queue = $achievementToastQueue.get();

  if (queue.length === 0) {
    $currentToast.set(null);
    return;
  }

  // Get next achievement from queue
  const [next, ...remaining] = queue;
  $achievementToastQueue.set(remaining);
  $currentToast.set(next);

  // Auto-hide after 4 seconds (longer for rare achievements)
  const duration = next.rarity === 'platinum' || next.rarity === 'gold' ? 5000 : 4000;

  setTimeout(() => {
    hideCurrentToast();
  }, duration);
}

/**
 * Hide the current toast and show next in queue
 */
export function hideCurrentToast(): void {
  $currentToast.set(null);

  // Process next toast in queue after a short delay
  setTimeout(() => {
    processToastQueue();
  }, 300);
}

/**
 * Manually trigger toast for an achievement (for testing)
 */
export function showAchievementToast(achievement: Achievement): void {
  const queue = $achievementToastQueue.get();
  $achievementToastQueue.set([...queue, achievement]);

  if (!$currentToast.get()) {
    processToastQueue();
  }
}

/**
 * Get all achievements
 */
export function getAllAchievements(): Achievement[] {
  return $achievements.get();
}

/**
 * Get unlocked achievements
 */
export function getUnlockedAchievements(): Achievement[] {
  return $achievements.get().filter(a => a.unlockedAt);
}

/**
 * Get achievement by ID
 */
export function getAchievementById(id: string): Achievement | undefined {
  return $achievements.get().find(a => a.id === id);
}

/**
 * Check if achievement is unlocked
 */
export function isAchievementUnlocked(id: string): boolean {
  const achievement = getAchievementById(id);
  return achievement?.unlockedAt !== undefined;
}

/**
 * Get achievement progress
 */
export function getAchievementProgress(id: string): { current: number; max: number } {
  const achievement = getAchievementById(id);
  return {
    current: achievement?.progress ?? 0,
    max: achievement?.maxProgress ?? 1,
  };
}

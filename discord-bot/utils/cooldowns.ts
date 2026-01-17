/**
 * Cooldown Manager
 *
 * Manages pack opening cooldowns for Discord users.
 * Default: 1 pack per hour. Premium users: no cooldown.
 */

import type { DiscordUser, CooldownResult } from '../types/index.js';

export const COOLDOWN_MS = 60 * 60 * 1000; // 1 hour in milliseconds

/**
 * Check if a user can open a pack (cooldown check)
 *
 * @param user - The Discord user to check
 * @param cooldownMs - Cooldown duration in milliseconds (default: 1 hour)
 * @returns CooldownResult with canOpen status and remaining time
 */
export function checkCooldown(user: DiscordUser, cooldownMs: number = COOLDOWN_MS): CooldownResult {
  // Premium users bypass cooldowns
  if (user.isPremium) {
    return { canOpen: true };
  }

  // First-time openers get a free pass
  if (!user.lastPackOpenAt) {
    return { canOpen: true };
  }

  // Check if cooldown has expired
  const now = new Date();
  const lastOpen = new Date(user.lastPackOpenAt);
  const elapsed = now.getTime() - lastOpen.getTime();

  if (elapsed >= cooldownMs) {
    return { canOpen: true };
  }

  // Still on cooldown
  const remaining = cooldownMs - elapsed;
  const minutes = Math.ceil(remaining / 60000);

  return {
    canOpen: false,
    remainingTime: remaining,
    reason: `You can open another pack in ${minutes} minute${minutes !== 1 ? 's' : ''}.`,
  };
}

/**
 * Set cooldown for a user after opening a pack
 *
 * @param user - The Discord user to set cooldown for
 * @param cooldownMs - Cooldown duration in milliseconds
 * @returns Updated user object
 */
export function setCooldown(user: DiscordUser, cooldownMs: number = COOLDOWN_MS): DiscordUser {
  const now = new Date();

  // Premium users don't need cooldowns
  if (user.isPremium) {
    return {
      ...user,
      lastPackOpenAt: now,
      updatedAt: now,
    };
  }

  const cooldownUntil = new Date(now.getTime() + cooldownMs);

  return {
    ...user,
    lastPackOpenAt: now,
    cooldownUntil,
    updatedAt: now,
  };
}

/**
 * Get remaining cooldown time in human-readable format
 *
 * @param remainingTime - Remaining time in milliseconds
 * @returns Formatted string (e.g., "45 minutes")
 */
export function formatCooldown(remainingTime: number): string {
  const minutes = Math.ceil(remainingTime / 60000);

  if (minutes < 60) {
    return `${minutes} minute${minutes !== 1 ? 's' : ''}`;
  }

  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;

  if (remainingMinutes === 0) {
    return `${hours} hour${hours !== 1 ? 's' : ''}`;
  }

  return `${hours} hour${hours !== 1 ? 's' : ''} and ${remainingMinutes} minute${remainingMinutes !== 1 ? 's' : ''}`;
}

/**
 * Get cooldown percentage for UI display
 *
 * @param user - The Discord user to check
 * @param cooldownMs - Cooldown duration in milliseconds
 * @returns Percentage complete (0-100)
 */
export function getCooldownProgress(user: DiscordUser, cooldownMs: number = COOLDOWN_MS): number {
  if (!user.lastPackOpenAt || user.isPremium) {
    return 100;
  }

  const now = new Date();
  const lastOpen = new Date(user.lastPackOpenAt);
  const elapsed = now.getTime() - lastOpen.getTime();

  return Math.min(100, Math.max(0, (elapsed / cooldownMs) * 100));
}

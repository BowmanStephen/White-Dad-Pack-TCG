/**
 * Event Pack Generation Helpers (US099 - Live Events)
 *
 * Integration layer between pack generation and live events system.
 * Provides helper functions to apply event bonuses to pack generation.
 */

import type { PackConfig, Rarity } from '../../types';
import {
  getMythicChanceMultiplier,
  getActiveEventBonuses,
  awardEventCurrency,
  trackPackOpened,
} from '../../stores/events';

/**
 * Apply event bonuses to pack configuration
 *
 * This function modifies the pack config rarity probabilities based on
 * active event bonuses (e.g., 2x mythic chance during weekend events).
 *
 * @param baseConfig - The base pack configuration
 * @returns Modified pack configuration with event bonuses applied
 */
export function applyEventBonuses(baseConfig: PackConfig): PackConfig {
  const bonuses = getActiveEventBonuses();
  if (bonuses.length === 0) {
    return baseConfig;
  }

  // Create a copy of the config to modify
  const modifiedConfig: PackConfig = {
    ...baseConfig,
    raritySlots: baseConfig.raritySlots.map((slot) => ({ ...slot })),
  };

  // Apply each bonus
  for (const bonus of bonuses) {
    switch (bonus.type) {
      case 'mythic_chance':
        applyMythicChanceBonus(modifiedConfig, bonus.multiplier);
        break;
      case 'rarity_boost':
        applyRarityBoostBonus(modifiedConfig, bonus);
        break;
      case 'currency_bonus':
      case 'xp_multiplier':
        // These don't affect pack generation probabilities
        break;
    }
  }

  return modifiedConfig;
}

/**
 * Apply mythic chance multiplier to all rarity slots
 *
 * @param config - Pack config to modify
 * @param multiplier - Mythic chance multiplier (e.g., 2.0 = 2x)
 */
function applyMythicChanceBonus(config: PackConfig, multiplier: number): void {
  for (const slot of config.raritySlots) {
    if (slot.rarityPool && slot.probability) {
      const baseMythicChance = slot.probability.mythic || 0;
      const boostedMythicChance = Math.min(baseMythicChance * multiplier, 0.1);

      // Reduce other rarities proportionally to make room for boosted mythic
      const totalOtherChance = Object.entries(slot.probability)
        .filter(([key]) => key !== 'mythic')
        .reduce((sum, [, value]) => sum + (value || 0), 0);

      if (totalOtherChance > 0) {
        const reductionFactor = (1 - boostedMythicChance) / totalOtherChance;

        for (const [key, value] of Object.entries(slot.probability)) {
          if (key !== 'mythic' && value) {
            slot.probability[key as Rarity] = value * reductionFactor;
          }
        }
      }

      slot.probability.mythic = boostedMythicChance;
    }
  }
}

/**
 * Apply rarity boost bonus to specific rarities
 *
 * @param config - Pack config to modify
 * @param bonus - Rarity boost bonus configuration
 */
function applyRarityBoostBonus(config: PackConfig, bonus: {
  multiplier: number;
  appliesTo?: Rarity[];
}): void {
  const targetRarities = bonus.appliesTo || ['rare', 'epic', 'legendary', 'mythic'];

  for (const slot of config.raritySlots) {
    if (slot.rarityPool && slot.probability) {
      for (const rarity of targetRarities) {
        const baseChance = slot.probability[rarity] || 0;
        if (baseChance > 0) {
          const boostedChance = Math.min(baseChance * bonus.multiplier, 0.5);
          const increase = boostedChance - baseChance;

          // Reduce common chance to make room
          const commonChance = slot.probability.common || 0;
          if (commonChance > 0) {
            slot.probability.common = Math.max(0, commonChance - increase);
          }

          slot.probability[rarity] = boostedChance;
        }
      }
    }
  }
}

/**
 * Get current mythic chance from pack config
 *
 * Calculates the effective mythic chance considering all bonuses.
 *
 * @returns Current mythic chance (0-1)
 */
export function getCurrentMythicChance(): number {
  const bonuses = getActiveEventBonuses();
  const mythicBonus = bonuses.find((b) => b.type === 'mythic_chance');
  const multiplier = mythicBonus?.multiplier || 1.0;

  // Base mythic chance is 0.001 (0.1%) for slots 4-5 and 6
  const baseChance = 0.001;
  return Math.min(baseChance * multiplier, 0.1); // Cap at 10%
}

/**
 * Award event currency for pack opening
 *
 * Called after a pack is successfully generated and opened.
 * Awards event currency based on the active event's earn rate.
 *
 * @param packId - ID of the opened pack
 */
export function awardEventCurrencyForPack(packId: string): void {
  awardEventCurrency(packId);
  trackPackOpened(packId);
}

/**
 * Check if an event is currently active
 *
 * @returns true if an event is active
 */
export function hasActiveEvent(): boolean {
  const bonuses = getActiveEventBonuses();
  return bonuses.length > 0;
}

/**
 * Get all active event bonuses for display
 *
 * @returns Array of active bonus descriptions
 */
export function getActiveBonusDescriptions(): string[] {
  const bonuses = getActiveEventBonuses();
  return bonuses.map((b) => b.description);
}

/**
 * Calculate event-aware pack statistics
 *
 * Returns statistics that consider active event bonuses.
 *
 * @returns Object with event-aware statistics
 */
export function getEventAwareStats(): {
  hasActiveEvent: boolean;
  mythicChanceMultiplier: number;
  currentMythicChance: number;
  bonusDescriptions: string[];
} {
  const bonuses = getActiveEventBonuses();
  const mythicBonus = bonuses.find((b) => b.type === 'mythic_chance');

  return {
    hasActiveEvent: bonuses.length > 0,
    mythicChanceMultiplier: mythicBonus?.multiplier || 1.0,
    currentMythicChance: getCurrentMythicChance(),
    bonusDescriptions: getActiveBonusDescriptions(),
  };
}

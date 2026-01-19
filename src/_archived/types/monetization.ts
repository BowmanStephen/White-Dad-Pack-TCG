/**
 * Monetization Types - REMOVED (FR-001)
 *
 * This file contains premium feature types that have been removed as they
 * conflict with the free-to-play vision of DadDeck™ (see PRD line 34).
 *
 * The PRD clearly states: "No microtransactions in MVP (pure entertainment)"
 *
 * @deprecated All monetization types are removed from MVP. Premium packs,
 * DadPass subscriptions, and referral rewards will be reconsidered for
 * post-MVP monetization strategies.
 */

import type { Rarity, RaritySlot } from './core';

// ============================================================================
// MINIMAL TYPES FOR BACKWARDS COMPATIBILITY
// ============================================================================

/**
 * Pack type - Currently only 'standard' is supported in MVP
 *
 * Premium packs are not part of the MVP. This type exists for
 * forwards compatibility in case premium features are added later.
 */
export type PackType = 'standard' | 'premium';

/**
 * @deprecated Premium packs are not part of MVP
 */
export interface PremiumRaritySlot extends RaritySlot {
  slot: number;
  guaranteedRarity?: Rarity;
  rarityPool?: boolean;
  probability?: Partial<Record<Rarity, number>>;
  boosted?: boolean;
}

// All other monetization types (PremiumPackConfig, DadPass, Referral, etc.)
// have been removed as they don't align with the free-to-play MVP vision.

// Empty exports for any code that might reference these
export const PREMIUM_PACK_CONFIGS: any[] = [];
export const PREMIUM_PACK_RARITY_SLOTS: PremiumRaritySlot[] = [];
export const PREMIUM_PACK_VISUAL_CONFIG = {
  particleCount: 20,
  animationDuration: 2000,
  glowIntensity: 1.5,
};

// DadPass types removed - not part of MVP
export const DEFAULT_DADPASS_CONFIG: any = null;
export const DADPASS_TIERS: any[] = [];

// Referral types removed - not part of MVP
export const DEFAULT_REFERRAL_CONFIG: any = null;

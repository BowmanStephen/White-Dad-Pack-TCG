/**
 * Premium Pack Store - REMOVED (FR-001)
 *
 * This premium feature has been removed as it conflicts with the
 * free-to-play vision of DadDeck™ (see PRD line 34).
 *
 * PREMIUM PACKS are not part of the MVP. The PRD clearly states:
 * "No microtransactions in MVP (pure entertainment)"
 *
 * @deprecated This entire store is removed. Premium packs will be
 * reconsidered for post-MVP monetization strategies.
 */

import { atom } from 'nanostores';
import type { PackType } from '../types';

// Re-export minimal types for backwards compatibility
export type { PackType } from '../types';

/**
 * Stub: Current pack type (always 'standard' in MVP)
 *
 * In MVP, only standard packs are available. This store exists
 * for backwards compatibility with code that expects pack type selection.
 */
export const currentPackType = atom<PackType>('standard');

/**
 * Stub: No premium packs available in MVP
 *
 * All pack opening is free and unlimited in the MVP version.
 * This function exists only to prevent breaking changes if
 * any code references it.
 */
export function hasPremiumPacks(): boolean {
  return false;
}

/**
 * Stub: No premium packs available in MVP
 *
 * Always returns 0 since premium packs are not part of MVP.
 */
export function getPremiumPackCount(): number {
  return 0;
}

/**
 * Stub: Premium pack purchases not available
 *
 * @throws Error with clear message that premium packs are coming later
 */
export function simulatePremiumPackPurchase() {
  throw new Error(
    '💳 Premium packs are not available in the MVP. ' +
    'DadDeck™ is currently 100% free with unlimited standard pack opening. ' +
    'Premium features may be added in the future to support development.'
  );
}

/**
 * Stub: Use a premium pack (not available in MVP)
 *
 * Always returns false since premium packs are not part of MVP.
 *
 * @param _packType - The type of premium pack to use (ignored)
 * @returns false indicating no premium pack was used
 */
export function usePremiumPack(_packType: PackType): boolean {
  return false;
}

/**
 * Stub: Premium inventory (always empty in MVP)
 */
export const premiumInventory = atom<Record<string, number>>({});

/**
 * Stub: Get active premium packs (always empty in MVP)
 */
export function getActivePremiumPacks(): string[] {
  return [];
}

/**
 * Stub: Open purchase modal (no-op in MVP)
 */
export function openPurchaseModal(): void {
  // No-op - premium not available
}

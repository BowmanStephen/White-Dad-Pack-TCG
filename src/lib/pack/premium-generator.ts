/**
 * Premium Pack Generator - REMOVED (FR-001)
 *
 * This premium feature has been removed as it conflicts with the
 * free-to-play vision of DadDeck™ (see PRD line 34).
 *
 * PREMIUM PACKS are not part of the MVP. The PRD clearly states:
 * "No microtransactions in MVP (pure entertainment)"
 *
 * @deprecated This entire generator is removed. Premium packs will be
 * reconsidered for post-MVP monetization strategies.
 */

import type { Pack } from '../../types';

/**
 * Stub: Premium pack generation not available in MVP
 *
 * @throws Error with clear message that premium packs are coming later
 */
export function generatePremiumPack(): Pack {
  throw new Error(
    '💳 Premium packs are not available in the MVP. ' +
    'Use the standard pack generator for free unlimited pack opening. ' +
    'Premium packs may be added in the future to support development.'
  );
}

/**
 * @deprecated Premium pack config not available in MVP
 */
export const PREMIUM_PACK_CONFIG = null;

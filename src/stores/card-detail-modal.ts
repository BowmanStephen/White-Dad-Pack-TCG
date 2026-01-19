import { atom } from 'nanostores';
import type { PackCard } from '../types';

/**
 * Card Detail Modal Store - Manages collection-specific card detail modal (PACK-022)
 *
 * This is separate from the lightbox store because:
 * - Shows collection-specific information (owned count, pack history)
 * - Doesn't need navigation between cards
 * - Focuses on ownership and deck building
 */

// ============================================================================
// STATE
// ============================================================================

// Whether detail modal is open
export const isDetailModalOpen = atom<boolean>(false);

// Current card being viewed in detail modal
export const detailModalCard = atom<PackCard | null>(null);

// ============================================================================
// ACTIONS
// ============================================================================

/**
 * Open detail modal with a specific card
 * @param card - The card to display
 */
export function openDetailModal(card: PackCard) {
  detailModalCard.set(card);
  isDetailModalOpen.set(true);

  // Prevent body scroll when modal is open
  if (typeof document !== 'undefined') {
    document.body.style.overflow = 'hidden';
  }
}

/**
 * Close the detail modal
 */
export function closeDetailModal() {
  isDetailModalOpen.set(false);
  detailModalCard.set(null);

  // Restore body scroll
  if (typeof document !== 'undefined') {
    document.body.style.overflow = '';
  }
}

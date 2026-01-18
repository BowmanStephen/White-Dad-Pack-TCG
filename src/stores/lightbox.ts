import { atom } from 'nanostores';
import type { PackCard } from '../types';

/**
 * Lightbox Store - Manages full-screen card lightbox state (US082)
 *
 * Features:
 * - Open/close lightbox
 * - Navigate between cards (prev/next)
 * - Track current card index
 * - Support card list from any source (gallery, pack results, etc.)
 */

// ============================================================================
// STATE
// ============================================================================

// Whether lightbox is open
export const isLightboxOpen = atom<boolean>(false);

// Current card being viewed
export const currentCard = atom<PackCard | null>(null);

// List of cards available for navigation
export const cardList = atom<PackCard[]>([]);

// Current index in card list
export const currentIndex = atom<number>(0);

// Flip state for card inspection (PACK-036)
export const isCardFlipped = atom<boolean>(false);

// Card view mode for enhanced display (ROUND-3)
export const cardViewMode = atom<'default' | '3d' | 'zoom'>('default');

// Zoom level for interactive viewing (ROUND-3)
export const zoomLevel = atom<number>(1);

// ============================================================================
// ACTIONS
// ============================================================================

/**
 * Open lightbox with a specific card and list of cards
 * @param card - The card to display
 * @param cards - List of cards for navigation
 * @param index - Index of the card in the list
 */
export function openLightbox(
  card: PackCard,
  cards: PackCard[],
  index: number
): void {
  currentCard.set(card);
  cardList.set(cards);
  currentIndex.set(index);
  isLightboxOpen.set(true);

  // Prevent body scroll when lightbox is open
  setBodyScroll(false);
}

/**
 * Close the lightbox
 */
export function closeLightbox(): void {
  isLightboxOpen.set(false);
  currentCard.set(null);
  cardList.set([]);
  currentIndex.set(0);
  isCardFlipped.set(false); // Reset flip state

  // Restore body scroll
  setBodyScroll(true);
}

/**
 * Navigate to the next card
 */
export function nextCard(): void {
  const cards = cardList.get();
  const index = currentIndex.get();

  if (cards.length === 0) return;

  const nextIndex = (index + 1) % cards.length;
  currentIndex.set(nextIndex);
  currentCard.set(cards[nextIndex]);
}

/**
 * Navigate to the previous card
 */
export function prevCard(): void {
  const cards = cardList.get();
  const index = currentIndex.get();

  if (cards.length === 0) return;

  const prevIndex = (index - 1 + cards.length) % cards.length;
  currentIndex.set(prevIndex);
  currentCard.set(cards[prevIndex]);
}

/**
 * Jump to a specific card by index
 * @param index - The index to jump to
 */
export function goToCard(index: number): void {
  const cards = cardList.get();

  if (index < 0 || index >= cards.length) return;

  currentIndex.set(index);
  currentCard.set(cards[index]);
}

/**
 * Check if there's a next card available
 */
export function hasNextCard(): boolean {
  const cards = cardList.get();
  return cards.length > 1;
}

/**
 * Check if there's a previous card available
 */
export function hasPrevCard(): boolean {
  const cards = cardList.get();
  return cards.length > 1;
}

/**
 * Get current progress (e.g., "3 of 12")
 */
export function getProgress(): string {
  const cards = cardList.get();
  const index = currentIndex.get();

  if (cards.length === 0) return '0 of 0';

  return `${index + 1} of ${cards.length}`;
}

/**
 * Toggle card flip state (PACK-036)
 */
export function toggleCardFlip(): void {
  isCardFlipped.set(!isCardFlipped.get());
}

/**
 * Set card flip state (PACK-036)
 */
export function setCardFlip(flipped: boolean): void {
  isCardFlipped.set(flipped);
}

/**
 * Set card view mode (ROUND-3: Enhanced display modes)
 */
export function setCardViewMode(mode: 'default' | '3d' | 'zoom'): void {
  cardViewMode.set(mode);
}

/**
 * Set zoom level (ROUND-3: Interactive zoom)
 */
export function setZoomLevel(level: number): void {
  const clampedLevel = Math.max(1, Math.min(level, 3)); // Clamp between 1 and 3
  zoomLevel.set(clampedLevel);
}

/**
 * Reset view to defaults
 */
export function resetCardView(): void {
  cardViewMode.set('default');
  zoomLevel.set(1);
  isCardFlipped.set(false);
}

function setBodyScroll(enabled: boolean): void {
  if (typeof document === 'undefined') {
    return;
  }

  document.body.style.overflow = enabled ? '' : 'hidden';
}

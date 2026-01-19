import { atom, computed } from 'nanostores';
import type { Card } from '../types';
import { getCardCount } from '../lib/cards/database';
import { onBrowser } from '@/lib/utils/browser';

// ============================================================================
// DISCOVERED CARDS STORAGE (LOCALSTORAGE)
// ============================================================================

const DISCOVERED_CARDS_KEY = 'daddeck-discovered-cards';

// Load discovered cards from LocalStorage
function loadDiscoveredCards(): Set<string> {
  if (typeof window === 'undefined') return new Set();

  try {
    const stored = localStorage.getItem(DISCOVERED_CARDS_KEY);
    if (stored) {
      const array = JSON.parse(stored) as string[];
      return new Set(array);
    }
  } catch (error) {
    console.error('[Discovered] Failed to load from LocalStorage:', error);
  }

  return new Set();
}

// Save discovered cards to LocalStorage
function saveDiscoveredCards(discovered: Set<string>): void {
  if (typeof window === 'undefined') return;

  try {
    const array = Array.from(discovered);
    localStorage.setItem(DISCOVERED_CARDS_KEY, JSON.stringify(array));
  } catch (error) {
    console.error('[Discovered] Failed to save to LocalStorage:', error);
  }
}

// ============================================================================
// DISCOVERED CARDS STORE
// ============================================================================

// Discovered cards atom (set of card IDs)
const initialDiscovered = loadDiscoveredCards();
export const discoveredCards = atom<Set<string>>(initialDiscovered);

// Computed: Total number of unique cards in the game
export const totalCardCount = atom<number>(getCardCount());

// Computed: Number of discovered cards
export const discoveredCount = computed(discoveredCards, (discovered) => discovered.size);

// Computed: Discovery progress (0-1)
export const discoveryProgress = computed(
  [discoveredCards, totalCardCount],
  (discovered, total) => {
    if (total === 0) return 0;
    return discovered.size / total;
  }
);

// Computed: Discovery progress text (e.g., "Discovered: 87/105")
export const discoveryProgressText = computed(
  [discoveredCards, totalCardCount],
  (discovered, total) => `Discovered: ${discovered.size}/${total}`
);

// ============================================================================
// DISCOVERED CARDS OPERATIONS
// ============================================================================

/**
 * Check if a card has been discovered
 */
export function isCardDiscovered(cardId: string): boolean {
  const discovered = discoveredCards.get();
  return discovered.has(cardId);
}

/**
 * Mark a card as discovered (first-time pull)
 */
export function markCardAsDiscovered(card: Card): boolean {
  const discovered = new Set(discoveredCards.get());

  // Only add if not already discovered
  if (!discovered.has(card.id)) {
    discovered.add(card.id);
    discoveredCards.set(discovered);
    saveDiscoveredCards(discovered);
    return true; // Was newly discovered
  }

  return false; // Already discovered
}

/**
 * Mark multiple cards as discovered (batch operation)
 */
export function markCardsAsDiscovered(cards: Card[]): number {
  const discovered = new Set(discoveredCards.get());
  let newDiscoveries = 0;

  for (const card of cards) {
    if (!discovered.has(card.id)) {
      discovered.add(card.id);
      newDiscoveries++;
    }
  }

  if (newDiscoveries > 0) {
    discoveredCards.set(discovered);
    saveDiscoveredCards(discovered);
  }

  return newDiscoveries; // Number of newly discovered cards
}

/**
 * Get all discovered card IDs
 */
export function getDiscoveredCardIds(): string[] {
  return Array.from(discoveredCards.get());
}

/**
 * Reset discovered cards (for testing/debugging)
 */
export function resetDiscoveredCards(): void {
  discoveredCards.set(new Set());
  onBrowser(() => {
    localStorage.removeItem(DISCOVERED_CARDS_KEY);
  });
}

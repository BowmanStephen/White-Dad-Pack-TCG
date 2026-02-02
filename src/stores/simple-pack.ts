import { atom, type WritableAtom } from 'nanostores';
import type { Card, PackCard, Rarity } from '@/types';
import { getAllCards } from '@lib/artwork-mapper';

// Types
export interface Pack {
  id: string;
  cards: PackCard[];
  openedAt: Date;
}

export type PackState = 'idle' | 'opening' | 'revealed';

// Store types
export type PackStateStore = WritableAtom<PackState>;
export type CurrentPackStore = WritableAtom<Pack | null>;

// Simple state
export const packState = atom<PackState>('idle');
export const currentPack = atom<Pack | null>(null);

// Rarity weights
const RARITY_WEIGHTS: Record<Rarity, number> = {
  common: 50,
  uncommon: 30,
  rare: 12,
  epic: 5,
  legendary: 2.5,
  mythic: 0.5,
};

// Generate weighted random rarity
function getRandomRarity(): Rarity {
  const rand = Math.random() * 100;
  let cumulative = 0;

  const rarities: Rarity[] = ['common', 'uncommon', 'rare', 'epic', 'legendary', 'mythic'];

  for (const rarity of rarities) {
    cumulative += RARITY_WEIGHTS[rarity];
    if (rand <= cumulative) return rarity;
  }

  return 'common';
}

// Generate a pack
export function generatePack(): Pack {
  const allCards = getAllCards();
  const packCards: PackCard[] = [];

  // Slots 1-3: Always Common
  for (let i = 0; i < 3; i++) {
    const commonCards = allCards.filter(c => c.rarity === 'common');
    const card = commonCards[Math.floor(Math.random() * commonCards.length)];
    packCards.push({
      ...card,
      isRevealed: true,
      isHolo: Math.random() < 0.16, // 1 in 6 chance
      holoType: 'standard',
    });
  }

  // Slots 4-5: Uncommon+
  for (let i = 0; i < 2; i++) {
    const rarity = getRandomRarity();
    const rarityCards = allCards.filter(c => c.rarity === rarity);
    const card = rarityCards[Math.floor(Math.random() * rarityCards.length)];
    packCards.push({
      ...card,
      isRevealed: true,
      isHolo: Math.random() < 0.16,
      holoType: 'standard',
    });
  }

  // Slot 6: Rare+
  let finalRarity = getRandomRarity();
  if (finalRarity === 'common') finalRarity = 'rare';
  if (finalRarity === 'uncommon') finalRarity = 'rare';

  const finalCards = allCards.filter(c => c.rarity === finalRarity);
  const finalCard = finalCards[Math.floor(Math.random() * finalCards.length)];
  packCards.push({
    ...finalCard,
    isRevealed: true,
    isHolo: Math.random() < 0.16,
    holoType: 'standard',
  });

  return {
    id: `pack-${Date.now()}`,
    cards: packCards,
    openedAt: new Date(),
  };
}

// Open a pack
export async function openPack(): Promise<void> {
  packState.set('opening');

  // Simulate brief delay for "pack opening" feel
  await new Promise(resolve => setTimeout(resolve, 800));

  const pack = generatePack();
  currentPack.set(pack);
  packState.set('revealed');
}

// Reset
export function resetPack(): void {
  packState.set('idle');
  currentPack.set(null);
}

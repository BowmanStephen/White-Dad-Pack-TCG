import { getAllCards, getCardsByRarity } from '../src/lib/cards/database';
import type { Rarity } from '../src/types';

const cards = getAllCards();
console.log(`Total cards: ${cards.length}`);

const rarities: Rarity[] = ['common', 'uncommon', 'rare', 'epic', 'legendary', 'mythic'];

for (const rarity of rarities) {
  const rarityCards = getCardsByRarity(rarity);
  const percentage = ((rarityCards.length / cards.length) * 100).toFixed(1);
  console.log(`${rarity}: ${rarityCards.length} cards (${percentage}%)`);
}

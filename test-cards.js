// Quick test to check if cards are loading
import { getAllCards, getCardsByRarity } from './src/lib/cards/database.ts';

console.log('=== Card Database Test ===');
const allCards = getAllCards();
console.log('Total cards:', allCards.length);
console.log('First card:', allCards[0]);

const counts = {
  common: getCardsByRarity('common').length,
  uncommon: getCardsByRarity('uncommon').length,
  rare: getCardsByRarity('rare').length,
  epic: getCardsByRarity('epic').length,
  legendary: getCardsByRarity('legendary').length,
  mythic: getCardsByRarity('mythic').length,
};
console.log('Cards by rarity:', counts);
console.log('========================');

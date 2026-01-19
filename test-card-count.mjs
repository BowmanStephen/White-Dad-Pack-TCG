import cardsData from './src/data/cards.json';
import seasonalCardsData from './src/data/seasonal-cards.json';

const baseCards = cardsData.cards;
const seasonalCards = seasonalCardsData.cards;
const allCards = [...baseCards, ...seasonalCards];

console.log('Base cards:', baseCards.length);
console.log('Seasonal cards:', seasonalCards.length);
console.log('Total cards:', allCards.length);

// Count by rarity
const rarityCount = {};
for (const card of allCards) {
  rarityCount[card.rarity] = (rarityCount[card.rarity] || 0) + 1;
}

console.log('\nRarity distribution:');
for (const [rarity, count] of Object.entries(rarityCount)) {
  console.log(`  ${rarity}: ${count}`);
}

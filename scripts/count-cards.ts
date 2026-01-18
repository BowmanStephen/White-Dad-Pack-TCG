import cardsData from '../src/data/cards.json';

const cards = cardsData.cards;

const counts: Record<string, number> = {
  common: 0,
  uncommon: 0,
  rare: 0,
  epic: 0,
  legendary: 0,
  mythic: 0,
};

for (const card of cards) {
  counts[card.rarity] = (counts[card.rarity] || 0) + 1;
}

console.log('Card count by rarity:');
for (const [rarity, count] of Object.entries(counts)) {
  console.log(`  ${rarity}: ${count}`);
}

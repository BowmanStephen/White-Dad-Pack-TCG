import cardsData from '../src/data/cards.json';

const cards = cardsData.cards;

const counts = {
  common: 0,
  uncommon: 0,
  rare: 0,
  epic: 0,
  legendary: 0,
  mythic: 0,
};

for (const card of cards) {
  counts[card.rarity]++;
}

console.log('Card count by rarity:');
for (const [rarity, count] of Object.entries(counts)) {
  console.log(`  ${rarity}: ${count}`);
}

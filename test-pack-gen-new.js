import cardData from './src/data/cards.json' assert { type: 'json' };
import seasonalData from './src/data/seasonal-cards.json' assert { type: 'json' };
import newData from './src/data/cards-new.json' assert { type: 'json' };

const allCards = [...cardData.cards, ...seasonalData.cards, ...newData.cards];

console.log('📊 Card Database Status');
console.log('═══════════════════════\n');
console.log(`✓ Base cards:    ${cardData.cards.length}`);
console.log(`✓ Seasonal cards: ${seasonalData.cards.length}`);
console.log(`✓ New cards:     ${newData.cards.length}`);
console.log(`✓ TOTAL:        ${allCards.length}\n`);

// Check new card types
const newTypes = new Set(newData.cards.map(c => c.type));
console.log('New Card Types:');
for (const type of newTypes) {
  const count = newData.cards.filter(c => c.type === type).length;
  console.log(`  - ${type}: ${count}`);
}

// Check rarity distribution
const rarityCount = {};
allCards.forEach(c => {
  rarityCount[c.rarity] = (rarityCount[c.rarity] || 0) + 1;
});
console.log('\nRarity Distribution (ALL CARDS):');
Object.entries(rarityCount).sort().forEach(([r, count]) => {
  console.log(`  ${r.padEnd(12)}: ${count}`);
});

// Verify key cards exist
const keyCardIds = ['001', '002', '003', '016', '018', '026', 'DUNE_001', 'MARVEL_001', 'EVENT_001', 'TERRAIN_001', 'EVOLUTION_001', 'CURSE_001', 'TRAP_001'];
console.log('\nKey Card Verification:');
keyCardIds.forEach(id => {
  const card = allCards.find(c => c.id === id);
  console.log(`  ${id.padEnd(15)}: ${card ? '✓ FOUND' : '✗ MISSING'}`);
});

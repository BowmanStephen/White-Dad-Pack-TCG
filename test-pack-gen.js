// Test pack generation
import { generatePack } from './src/lib/pack/generator.ts';

console.log('=== Pack Generation Test ===');
console.time('Pack generation');

try {
  const pack = generatePack();
  console.timeEnd('Pack generation');
  console.log('Pack generated successfully!');
  console.log('Pack ID:', pack.id);
  console.log('Number of cards:', pack.cards.length);
  console.log('Cards:', pack.cards.map(c => ({ id: c.id, name: c.name, rarity: c.rarity, isHolo: c.isHolo })));
} catch (error) {
  console.timeEnd('Pack generation');
  console.error('Error generating pack:', error);
  console.error('Stack:', error.stack);
}

console.log('========================');

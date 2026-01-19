import { generatePack, DEFAULT_PACK_CONFIG } from '../src/lib/pack/generator';

console.log('Holo chance from config:', DEFAULT_PACK_CONFIG.holoChance);

// Run multiple trials
const trials = 5;
const SAMPLE_SIZE = 5000;

for (let t = 0; t < trials; t++) {
  const packs = Array.from({ length: SAMPLE_SIZE }, () => generatePack());
  let totalHolos = 0;
  let totalCards = 0;

  for (const pack of packs) {
    for (const card of pack.cards) {
      totalCards++;
      if (card.isHolo) totalHolos++;
    }
  }

  const ratio = totalHolos / totalCards;
  console.log(`Trial ${t + 1}: ${(ratio * 100).toFixed(2)}%`);
}

import { generatePack } from '../src/lib/pack/generator';

const SAMPLE_SIZE = 10000;
const packs = Array.from({ length: SAMPLE_SIZE }, () => generatePack());

let totalHolos = 0;
let totalCards = 0;

for (const pack of packs) {
  for (const card of pack.cards) {
    totalCards++;
    if (card.isHolo) {
      totalHolos++;
    }
  }
}

const holoRatio = totalHolos / totalCards;
const expectedRatio = 1 / 6;

console.log(`Total cards: ${totalCards}`);
console.log(`Total holos: ${totalHolos}`);
console.log(`Actual ratio: ${(holoRatio * 100).toFixed(2)}%`);
console.log(`Expected ratio: ${(expectedRatio * 100).toFixed(2)}%`);
console.log(`Difference: ${((holoRatio - expectedRatio) * 100).toFixed(2)}%`);

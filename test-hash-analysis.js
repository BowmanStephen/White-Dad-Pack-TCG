// Quick analysis of hash function behavior
import { hashPackData } from './src/lib/security/pack-validator.ts';

const basePack = {
  id: 'pack-1',
  cards: [
    { id: 'card1', name: 'Card 1', rarity: 'common', isHolo: false, holoType: 'none' },
    { id: 'card2', name: 'Card 2', rarity: 'common', isHolo: false, holoType: 'none' },
  ],
  openedAt: new Date('2024-01-01T00:00:00Z'),
  design: 'standard',
};

const testCases = [
  { name: 'Same pack', pack: { ...basePack } },
  { name: 'Different ID', pack: { ...basePack, id: 'pack-2' } },
  { name: 'Different rarity', pack: { ...basePack, cards: [{ ...basePack.cards[0], rarity: 'rare' }] } },
  { name: 'Different holo', pack: { ...basePack, cards: [{ ...basePack.cards[0], isHolo: true }] } },
  { name: 'Different time', pack: { ...basePack, openedAt: new Date('2024-01-01T00:01:00Z') } },
];

for (const testCase of testCases) {
  const hash = await hashPackData(testCase.pack);
  console.log(`${testCase.name}: ${hash}`);
}

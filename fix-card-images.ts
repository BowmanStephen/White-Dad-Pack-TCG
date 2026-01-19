import cardsData from './src/data/cards.json';
import { writeFileSync } from 'fs';

// Map card IDs to their actual image files
const imageMap: Record<string, string> = {
  '001': 'grill-master-gary.svg',
  '002': 'thermostat-tyrant.svg',
  '003': 'new-balance-nathan.svg',
  '004': 'lawn-legend-larry.svg',
  '005': 'remote-control-randy.svg',
  '006': 'handyman-hank.svg',
  '007': 'bogey-bob.svg',
  '008': 'cargo-shorts-carl.svg',
  '009': 'oil-change-oscar.svg',
  '010': 'tps-report-terry.svg',
  '011': 'skateboard-scott.svg',
  '012': 'soccer-stan.svg',
  '013': 'secret-recipe-rick.svg',
  '014': 'costco-craig.svg',
  '015': 'christmas-clark.svg',
  '016': 'ultimate-dad.svg',
  '017': 'wifi-wizard-walter.svg',
  '018': 'smoker-steve.svg',
  '019': 'minivan-mike.svg',
  '020': 'recliner-randy.svg',
  '021': 'fertilizer-fred.svg',
  '022': 'linkedin-larry.svg',
  '023': 'band-dad-brad.svg',
  '024': 'classic-car-craig.svg',
  '025': 'breakfast-king-keith.svg',
  '026': 'weber-genesis.svg',
  '027': 'lazboy-throne.svg',
  '028': 'craftsman-toolbox.svg',
  '029': 'cargo-shorts.svg',
  '030': 'the-thermostat.svg',
  '031': 'propane-paul.svg',
  '032': 'youtube-tom.svg',
  '033': 'country-club-chad.svg',
  '034': 'little-league-lou.svg',
  '035': 'riding-mower-rex.svg',
  '036': 'worlds-best-mug.svg',
  '037': 'oakley-wraparounds.svg',
  '038': 'phone-holster.svg',
  '039': 'hawaiian-harry.svg',
  '040': 'costco-hotdog.svg',
  '041': 'conference-carl.svg',
  '042': 'sportscenter-sam.svg',
  '043': 'ipa-ian.svg',
  '044': 'vinyl-vince.svg',
  '045': 'kiss-cook-apron.svg',
  '046': 'fourth-july-frank.svg',
  '047': 'home-depot-hero.svg',
  '048': 'smart-home-steve.svg',
  '049': 'white-socks.svg',
  '050': 'new-balance-608.svg',
};

// Update cards with correct image paths
const updatedCards = cardsData.cards.map((card: any) => {
  const imageFile = imageMap[card.id];
  if (imageFile) {
    return {
      ...card,
      artwork: `/cards/${imageFile}`,
    };
  }
  console.warn(`No image found for card ${card.id} (${card.name})`);
  return card;
});

// Write updated cards back to JSON
writeFileSync(
  './src/data/cards.json',
  JSON.stringify({ cards: updatedCards }, null, 2),
  'utf-8'
);

console.log('✅ Card images updated successfully!');

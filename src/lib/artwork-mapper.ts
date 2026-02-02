import cardsData from '@/data/cards.json';
import type { Card } from '@/types';

// Map of card IDs to actual artwork file paths
const ARTWORK_MAP: Record<string, string> = {
  // Core Dad Cards
  '001': '/cards/grill-master-gary.svg',
  '002': '/cards/thermostat-tyrant.svg',
  '003': '/cards/new-balance-nathan.svg',
  '004': '/cards/lawn-legend-larry.svg',
  '005': '/cards/remote-control-randy.svg',
  '006': '/cards/handyman-hank.svg',
  '007': '/cards/bogey-bob.svg',
  '008': '/cards/smoker-steve.svg',
  '009': '/cards/car-captain-carl.svg',
  '010': '/cards/office-oscar.svg',
  '011': '/cards/cool-clint.svg',
  '012': '/cards/coach-casey.svg',
  '013': '/cards/chef-derek.svg',
  '014': '/cards/holiday-hank.svg',
  '015': '/cards/warehouse-willy.svg',
  '016': '/cards/ultimate-dad.svg',
  '017': '/cards/vinyl-vince.svg',
  '018': '/cards/weber-genesis.svg',
  '019': '/cards/white-socks.svg',
  '020': '/cards/worlds-best-mug.svg',
  '021': '/cards/youtube-tom.svg',
  '022': '/cards/wifi-wizard-walter.svg',
  '023': '/cards/the-thermostat.svg',
  '024': '/cards/tps-report-terry.svg',
  '025': '/cards/propane-paul.svg',
  '026': '/cards/oakley-wraparounds.svg',
  '027': '/cards/recliner-randy.svg',
  '028': '/cards/phone-holster.svg',
  '029': '/cards/riding-mower-rex.svg',
  '030': '/cards/secret-recipe-rick.svg',
  '031': '/cards/smart-home-steve.svg',
  '032': '/cards/sportscenter-sam.svg',
  '033': '/cards/oil-change-oscar.svg',
  '034': '/cards/little-league-lou.svg',
  '035': '/cards/ipa-ian.svg',
  '036': '/cards/mower-mike.svg',
  '037': '/cards/kiss-cook-apron.svg',
  '038': '/cards/linkedin-larry.svg',
  '039': '/cards/hawaiian-harry.svg',
  '040': '/cards/minivan-mike.svg',
  '041': '/cards/home-depot-hero.svg',
  '042': '/cards/lazboy-throne.svg',
  '043': '/cards/new-balance-608.svg',
  '044': '/cards/fertilizer-fred.svg',
  '045': '/cards/fourth-july-frank.svg',
  '046': '/cards/classic-car-craig.svg',
  '047': '/cards/breakfast-king-keith.svg',
  '048': '/cards/craftsman-toolbox.svg',
  '049': '/cards/costco-craig.svg',
  '050': '/cards/country-club-chad.svg',
  '051': '/cards/christmas-clark.svg',
  '052': '/cards/cargo-shorts-carl.svg',
  '053': '/cards/conference-carl.svg',
  '054': '/cards/costco-hotdog.svg',
  '055': '/cards/band-dad-brad.svg',
};

// Get card with corrected artwork path
export function getCardWithArtwork(card: Card): Card {
  const mappedPath = ARTWORK_MAP[card.id];
  if (mappedPath) {
    return { ...card, artwork: mappedPath };
  }
  // Fallback: try to guess based on name
  const normalizedName = card.name.toLowerCase().replace(/[^a-z0-9]/g, '-');
  return { ...card, artwork: `/cards/${normalizedName}.svg` };
}

// Get all cards with corrected artwork
export function getAllCards(): Card[] {
  return (cardsData.cards as Card[]).map(getCardWithArtwork);
}

// Get cards by rarity with corrected artwork
export function getCardsByRarity(rarity: string): Card[] {
  return getAllCards().filter(c => c.rarity === rarity);
}

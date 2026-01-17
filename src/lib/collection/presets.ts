import type { SavedSearchPreset } from '../../types';

/**
 * Saved search presets for quick filtering
 * US077 - Card Search - Advanced Filters
 */

/**
 * All saved search presets
 */
export const SAVED_SEARCH_PRESETS: SavedSearchPreset[] = [
  {
    id: 'high_grill_skill',
    name: 'Grill Masters',
    description: 'Cards with Grill Skill 80+',
    icon: '🔥',
    filters: {
      searchTerm: '',
      rarity: null,
      holoVariants: new Set(),
      selectedTypes: new Set(),
      statRanges: {
        grillSkill: { min: 80, max: 100 },
      },
    },
  },
  {
    id: 'tanky_cards',
    name: 'Tanky Dads',
    description: 'High Fix-It + Nap Power (70+ each)',
    icon: '🛡️',
    filters: {
      searchTerm: '',
      rarity: null,
      holoVariants: new Set(),
      selectedTypes: new Set(),
      statRanges: {
        fixIt: { min: 70, max: 100 },
        napPower: { min: 70, max: 100 },
      },
    },
  },
  {
    id: 'glass_cannon',
    name: 'Glass Cannons',
    description: 'High Dad Joke, Low Fix-It',
    icon: '💥',
    filters: {
      searchTerm: '',
      rarity: null,
      holoVariants: new Set(),
      selectedTypes: new Set(),
      statRanges: {
        dadJoke: { min: 80, max: 100 },
        fixIt: { min: 0, max: 40 },
      },
    },
  },
  {
    id: 'rare_holos',
    name: 'Rare Holos',
    description: 'Rare+ cards with holo variants',
    icon: '✨',
    filters: {
      searchTerm: '',
      rarity: 'rare',
      holoVariants: new Set(['standard', 'reverse', 'full_art', 'prismatic']),
      selectedTypes: new Set(),
      statRanges: {},
    },
  },
  {
    id: 'nap_kings',
    name: 'Nap Kings',
    description: 'Nap Power 90+ anywhere',
    icon: '😴',
    filters: {
      searchTerm: '',
      rarity: null,
      holoVariants: new Set(),
      selectedTypes: new Set(),
      statRanges: {
        napPower: { min: 90, max: 100 },
      },
    },
  },
  {
    id: 'bbq_specialists',
    name: 'BBQ Specialists',
    description: 'BBQ Dads with Grill Skill 75+',
    icon: '🍖',
    filters: {
      searchTerm: '',
      rarity: null,
      holoVariants: new Set(),
      selectedTypes: new Set(['BBQ_DAD']),
      statRanges: {
        grillSkill: { min: 75, max: 100 },
      },
    },
  },
  {
    id: 'fashion_icons',
    name: 'Fashion Icons',
    description: 'Sock & Sandal + Thermostat 80+',
    icon: '👟',
    filters: {
      searchTerm: '',
      rarity: null,
      holoVariants: new Set(),
      selectedTypes: new Set(),
      statRanges: {
        sockSandal: { min: 80, max: 100 },
        thermostat: { min: 80, max: 100 },
      },
    },
  },
  {
    id: 'legendary_pulls',
    name: 'Legendary Pulls',
    description: 'Legendary and Mythic cards only',
    icon: '👑',
    filters: {
      searchTerm: '',
      rarity: 'legendary',
      holoVariants: new Set(),
      selectedTypes: new Set(),
      statRanges: {},
    },
  },
  {
    id: 'beer_connoisseurs',
    name: 'Beer Connoisseurs',
    description: 'Beer Snob 85+',
    icon: '🍺',
    filters: {
      searchTerm: '',
      rarity: null,
      holoVariants: new Set(),
      selectedTypes: new Set(),
      statRanges: {
        beerSnob: { min: 85, max: 100 },
      },
    },
  },
  {
    id: 'tech_wizards',
    name: 'Tech Wizards',
    description: 'Tech Dads with Remote Control 75+',
    icon: '💻',
    filters: {
      searchTerm: '',
      rarity: null,
      holoVariants: new Set(),
      selectedTypes: new Set(['TECH_DAD']),
      statRanges: {
        remoteControl: { min: 75, max: 100 },
      },
    },
  },
];

/**
 * Get preset by ID
 */
export function getPresetById(id: string): SavedSearchPreset | undefined {
  return SAVED_SEARCH_PRESETS.find(preset => preset.id === id);
}

/**
 * Get presets matching a search term
 */
export function searchPresets(term: string): SavedSearchPreset[] {
  if (!term.trim()) return SAVED_SEARCH_PRESETS;

  const lowerTerm = term.toLowerCase();
  return SAVED_SEARCH_PRESETS.filter(preset =>
    preset.name.toLowerCase().includes(lowerTerm) ||
    preset.description.toLowerCase().includes(lowerTerm)
  );
}

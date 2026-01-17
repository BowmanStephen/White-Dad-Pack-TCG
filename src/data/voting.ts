/**
 * Community Voting Data (US087 - Community - Card Voting)
 *
 * Monthly voting events where players vote on 3 card concepts.
 * Winning concept becomes a real card next month.
 * Voters receive exclusive foil version.
 */

import type {
  VotingEvent,
  CardConcept,
  VotingStatus,
} from '../types';

// ============================================================================
// CARD CONCEPTS (Sample concepts for voting)
// ============================================================================

const JANUARY_2026_CONCEPTS: CardConcept[] = [
  {
    id: 'concept_jan_2026_001',
    name: 'Grill Sergeant Gary',
    subtitle: 'The BBQ Commander',
    type: 'BBQ_DAD',
    rarity: 'rare',
    conceptDescription: 'A military-themed BBQ dad who treats grilling like a tactical operation. His "meat shield" strategy ensures everyone gets fed.',
    stats: {
      dadJoke: 65,
      grillSkill: 95,
      fixIt: 45,
      napPower: 30,
      remoteControl: 55,
      thermostat: 60,
      sockSandal: 40,
      beerSnob: 70,
    },
    flavorText: '"That burger is MIA. Initiate search and butter protocol."',
    abilities: [
      {
        name: 'Tactical Flip',
        description: 'Once per turn, flip a burger with military precision. Gain +5 Grill Skill.',
      },
      {
        name: 'Meat Shield',
        description: 'Protect your allies from hunger. All adjacent cards gain +3 Nap Power.',
      },
    ],
  },
  {
    id: 'concept_jan_2026_002',
    name: 'Leaf Blower Larry',
    subtitle: 'The Gale Force Gardener',
    type: 'LAWN_DAD',
    rarity: 'rare',
    conceptDescription: 'A suburban lawn warrior who battles leaves with gale-force winds. His legendary blower can clear a driveway in seconds.',
    stats: {
      dadJoke: 75,
      grillSkill: 40,
      fixIt: 50,
      napPower: 35,
      remoteControl: 45,
      thermostat: 55,
      sockSandal: 85,
      beerSnob: 60,
    },
    flavorText: '"The leaves never saw it coming. Neither did my fence."',
    abilities: [
      {
        name: 'Gale Force',
        description: 'Blow away all obstacles. Target card is moved to the bottom of the deck.',
      },
      {
        name: 'Perfect Lines',
        description: 'Your lawn stripes are impeccable. Gain +10 Sock & Sandal confidence.',
      },
    ],
  },
  {
    id: 'concept_jan_2026_003',
    name: ' Spreadsheet Stan',
    subtitle: 'The Data Dad',
    type: 'OFFICE_DAD',
    rarity: 'epic',
    conceptDescription: 'A corporate crusader who has pivoted everything into a spreadsheet. His family budget has 47 tabs and conditional formatting.',
    stats: {
      dadJoke: 50,
      grillSkill: 30,
      fixIt: 45,
      napPower: 40,
      remoteControl: 60,
      thermostat: 55,
      sockSandal: 35,
      beerSnob: 45,
    },
    flavorText: '"I need you to pivot your attitude into column Q and summarize your feelings."',
    abilities: [
      {
        name: 'Auto-Summon',
        description: 'Automatically calculate the best play. Reveal top 3 cards of your deck.',
      },
      {
        name: 'Conditional Formatting',
        description: 'Highlight winning plays. All rare+ cards in hand gain +2 to all stats.',
      },
      {
        name: 'VLOOKUP Victory',
        description: 'Reference past wins. Search your deck for a card with "Victory" in the name.',
      },
    ],
  },
];

const FEBRUARY_2026_CONCEPTS: CardConcept[] = [
  {
    id: 'concept_feb_2026_001',
    name: 'Tax Turbo Ted',
    subtitle: 'The Deduction Dominator',
    type: 'OFFICE_DAD',
    rarity: 'legendary',
    conceptDescription: 'A financial superhero who saves receipts like trading cards. He has a 1040-form shaped hole in his heart that only itemized deductions can fill.',
    stats: {
      dadJoke: 55,
      grillSkill: 35,
      fixIt: 50,
      napPower: 45,
      remoteControl: 65,
      thermostat: 60,
      sockSandal: 40,
      beerSnob: 50,
    },
    flavorText: '"You can\'t put a price on love, but you can depreciate it over 7 years."',
    abilities: [
      {
        name: 'Itemize Everything',
        description: 'Count every receipt. Draw 2 cards for each uncommon in your discard pile.',
      },
      {
        name: 'Standard Deduction Shield',
        description: 'Protect your assets. Negate the next attack against you.',
      },
      {
        name: 'Audit Aura',
        description: 'All opponents must reveal their hands. You may tax one card from each opponent.',
      },
    ],
  },
  {
    id: 'concept_feb_2026_002',
    name: 'Fridge Phil',
    subtitle: 'The Leftover Lord',
    type: 'CHEF_DAD',
    rarity: 'rare',
    conceptDescription: 'A master of meal prep who can identify leftovers by smell alone. His Tupperware organization system is studied by scientists.',
    stats: {
      dadJoke: 70,
      grillSkill: 55,
      fixIt: 40,
      napPower: 35,
      remoteControl: 50,
      thermostat: 85,
      sockSandal: 45,
      beerSnob: 55,
    },
    flavorText: '"This lasagna is from three Tuesdays ago. It\'s only getting better."',
    abilities: [
      {
        name: 'Container Match',
        description: 'Find the perfect lid. Return a card from your graveyard to your hand.',
      },
      {
        name: 'Expiration Date Intuition',
        description: 'You know exactly when food goes bad. Prevent one card from being discarded this turn.',
      },
    ],
  },
  {
    id: 'concept_feb_2026_003',
    name: 'Snow Shovel Sam',
    subtitle: 'The Winter Warrior',
    type: 'HOLIDAY_DAD',
    rarity: 'epic',
    conceptDescription: 'A suburban hero who battles the white fluffy menace every winter. His driveway is always the first clear on the block.',
    stats: {
      dadJoke: 60,
      grillSkill: 40,
      fixIt: 55,
      napPower: 50,
      remoteControl: 45,
      thermostat: 70,
      sockSandal: 75,
      beerSnob: 45,
    },
    flavorText: '"The weatherman said 2 inches. He\'s never been right once."',
    abilities: [
      {
        name: 'Blizzard Buster',
        description: 'Clear the way. All snow-related effects are negated.',
      },
      {
        name: 'Salt Circle',
        description: 'Create a protective barrier. Prevent all damage for one turn.',
      },
    ],
  },
];

// ============================================================================
// VOTING EVENTS (Monthly voting events)
// ============================================================================

/**
 * Generate a voting event ID from year and month
 */
function generateEventId(year: number, month: number): string {
  return `voting_${year}_${month.toString().padStart(2, '0')}`;
}

/**
 * Create a voting event
 */
function createVotingEvent(
  year: number,
  month: number,
  concepts: CardConcept[],
  status: VotingStatus,
  startDate: Date,
  endDate: Date,
  winnerId?: string
): VotingEvent {
  return {
    id: generateEventId(year, month),
    year,
    month,
    status,
    startDate,
    endDate,
    concepts,
    winnerId,
    totalVotes: 0, // Would be calculated from actual votes
  };
}

// Get current date for dynamic events
const now = new Date();
const currentYear = now.getFullYear();
const currentMonth = now.getMonth() + 1; // 1-12

/**
 * Calculate voting event dates
 * - Events start on the 1st of each month
 * - Events last for 7 days (configurable)
 */
function getVotingDates(year: number, month: number): { start: Date; end: Date } {
  const startDate = new Date(year, month - 1, 1); // 1st of month
  const endDate = new Date(year, month - 1, 8); // 8th of month (7 days later)
  return { start: startDate, end: endDate };
}

/**
 * Sample voting events for January-February 2026
 * Past events have winners, current/upcoming events do not
 */
export const VOTING_EVENTS: VotingEvent[] = [
  // January 2026 (completed - winner determined)
  createVotingEvent(
    2026,
    1,
    JANUARY_2026_CONCEPTS,
    'completed',
    new Date(2026, 0, 1),
    new Date(2026, 0, 8),
    'concept_jan_2026_001' // Grill Sergeant Gary won
  ),

  // February 2026 (completed - winner determined)
  createVotingEvent(
    2026,
    2,
    FEBRUARY_2026_CONCEPTS,
    'completed',
    new Date(2026, 1, 1),
    new Date(2026, 1, 8),
    'concept_feb_2026_003' // Snow Shovel Sam won
  ),

  // March 2026 (active - voting open)
  createVotingEvent(
    2026,
    3,
    [
      {
        id: 'concept_mar_2026_001',
        name: 'Basketball Bob',
        subtitle: 'The Bracket Boss',
        type: 'COACH_DAD',
        rarity: 'rare',
        conceptDescription: 'A March Madness enthusiast whose brackets never fail to disappoint. His trash talk game is stronger than his three-pointer.',
        stats: {
          dadJoke: 70,
          grillSkill: 45,
          fixIt: 40,
          napPower: 35,
          remoteControl: 55,
          thermostat: 50,
          sockSandal: 60,
          beerSnob: 65,
        },
        flavorText: '"I had Duke going all the way. Again. Why do I do this to myself?"',
        abilities: [
          {
            name: 'Bracket Buster',
            description: 'When an opponent plays a rare card, you may discard a card to draw a new one.',
          },
          {
            name: 'Full Court Press',
            description: 'Apply pressure. Target opponent must skip their next draw phase.',
          },
        ],
      },
      {
        id: 'concept_mar_2026_002',
        name: 'Drone Dave',
        subtitle: 'The Sky Dad',
        type: 'TECH_DAD',
        rarity: 'epic',
        conceptDescription: 'A drone enthusiast who films everything from above. His neighbors have mixed feelings about the aerial surveillance.',
        stats: {
          dadJoke: 50,
          grillSkill: 40,
          fixIt: 60,
          napPower: 30,
          remoteControl: 85,
          thermostat: 45,
          sockSandal: 50,
          beerSnob: 55,
        },
        flavorText: '"I\'m just getting some B-roll of the neighborhood. Totally normal."',
        abilities: [
          {
            name: 'Aerial Reconnaissance',
            description: 'Reveal the top 5 cards of your deck. You may rearrange them in any order.',
          },
          {
            name: 'Bird\'s Eye View',
            description: 'See everything. All face-down cards on the field are revealed.',
          },
        ],
      },
      {
        id: 'concept_mar_2026_003',
        name: 'Map Master Mike',
        subtitle: 'The Navigator',
        type: 'CAR_DAD',
        rarity: 'rare',
        conceptDescription: 'A dad who refuses to use GPS and insists on paper maps. His sense of direction is legendary, though not always accurate.',
        stats: {
          dadJoke: 65,
          grillSkill: 45,
          fixIt: 50,
          napPower: 40,
          remoteControl: 70,
          thermostat: 45,
          sockSandal: 55,
          beerSnob: 60,
        },
        flavorText: '"I don\'t need a computer telling me where to turn. The map knows."',
        abilities: [
          {
            name: 'Route Planning',
            description: 'Chart the best course. Search your deck for a card and put it on top.',
          },
          {
            name: 'Shortcut',
            description: 'Find a faster way. Your next card costs 1 less resource to play.',
          },
        ],
      },
    ],
    'active',
    new Date(2026, 2, 1),
    new Date(2026, 2, 8)
    // No winner yet - voting is active
  ),

  // April 2026 (upcoming - voting not yet open)
  createVotingEvent(
    2026,
    4,
    [
      {
        id: 'concept_apr_2026_001',
        name: 'Egg Expert Ed',
        subtitle: 'The Omelet Optimizer',
        type: 'CHEF_DAD',
        rarity: 'rare',
        conceptDescription: 'A breakfast specialist who has mastered the art of egg preparation. His sous vide eggs are the stuff of legend.',
        stats: {
          dadJoke: 60,
          grillSkill: 70,
          fixIt: 40,
          napPower: 35,
          remoteControl: 45,
          thermostat: 50,
          sockSandal: 45,
          beerSnob: 55,
        },
        flavorText: '"The secret is a low, slow cook. And patience. Mostly patience."',
        abilities: [
          {
            name: 'Perfect Scramble',
            description: 'Mix things up. Shuffle your deck and draw 2 cards.',
          },
        ],
      },
      {
        id: 'concept_apr_2026_002',
        name: 'Fishing Phil',
        subtitle: 'The Angler Dad',
        type: 'COACH_DAD',
        rarity: 'epic',
        conceptDescription: 'A patient angler who tells stories about "the one that got away." His fishing boat is older than his kids.',
        stats: {
          dadJoke: 75,
          grillSkill: 40,
          fixIt: 55,
          napPower: 60,
          remoteControl: 50,
          thermostat: 45,
          sockSandal: 65,
          beerSnob: 60,
        },
        flavorText: '"It was THIS BIG. No, bigger. Like, REALLY big."',
        abilities: [
          {
            name: 'Catch of the Day',
            description: 'Reel in something good. Draw a card. If it\'s rare or better, draw another.',
          },
        ],
      },
      {
        id: 'concept_apr_2026_003',
        name: 'Rain Gutter Rob',
        subtitle: 'The Water Manager',
        type: 'FIX_IT_DAD',
        rarity: 'uncommon',
        conceptDescription: 'A home maintenance hero who takes gutters VERY seriously. His downspout system is an engineering marvel.',
        stats: {
          dadJoke: 55,
          grillSkill: 35,
          fixIt: 85,
          napPower: 40,
          remoteControl: 45,
          thermostat: 50,
          sockSandal: 60,
          beerSnob: 50,
        },
        flavorText: '"Water damage is the enemy. I am the defender of the foundation."',
        abilities: [
          {
            name: 'Flow Control',
            description: 'Direct the water. Redirect damage from one card to another.',
          },
        ],
      },
    ],
    'upcoming',
    new Date(2026, 3, 1),
    new Date(2026, 3, 8)
    // No winner yet - voting hasn't started
  ),
];

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Get a voting event by ID
 */
export function getVotingEventById(eventId: string): VotingEvent | undefined {
  return VOTING_EVENTS.find((event) => event.id === eventId);
}

/**
 * Get the current active voting event
 */
export function getActiveVotingEvent(): VotingEvent | undefined {
  const now = new Date();
  return VOTING_EVENTS.find(
    (event) =>
      event.status === 'active' &&
      now >= event.startDate &&
      now <= event.endDate
  );
}

/**
 * Get upcoming voting events
 */
export function getUpcomingVotingEvents(): VotingEvent[] {
  const now = new Date();
  return VOTING_EVENTS.filter(
    (event) => event.status === 'upcoming' && event.startDate > now
  );
}

/**
 * Get completed (past) voting events
 */
export function getCompletedVotingEvents(): VotingEvent[] {
  return VOTING_EVENTS.filter(
    (event) => event.status === 'completed'
  );
}

/**
 * Get all voting events for a specific year
 */
export function getVotingEventsForYear(year: number): VotingEvent[] {
  return VOTING_EVENTS.filter((event) => event.year === year);
}

/**
 * Get a card concept by ID
 */
export function getCardConceptById(conceptId: string): CardConcept | undefined {
  for (const event of VOTING_EVENTS) {
    const concept = event.concepts.find((c) => c.id === conceptId);
    if (concept) return concept;
  }
  return undefined;
}

/**
 * Get the winning concept for a completed voting event
 */
export function getWinningConcept(eventId: string): CardConcept | undefined {
  const event = getVotingEventById(eventId);
  if (!event || !event.winnerId) return undefined;

  return event.concepts.find((c) => c.id === event.winnerId);
}

/**
 * Check if voting is currently open
 */
export function isVotingOpen(): boolean {
  const activeEvent = getActiveVotingEvent();
  return activeEvent !== undefined;
}

/**
 * Check if a specific event is accepting votes
 */
export function isEventAcceptingVotes(eventId: string): boolean {
  const event = getVotingEventById(eventId);
  if (!event || event.status !== 'active') return false;

  const now = new Date();
  return now >= event.startDate && now <= event.endDate;
}

/**
 * Calculate remaining time for voting (in hours)
 */
export function getVotingTimeRemaining(eventId: string): number | null {
  const event = getVotingEventById(eventId);
  if (!event || event.status !== 'active') return null;

  const now = new Date();
  if (now < event.startDate) return null; // Not started
  if (now > event.endDate) return 0; // Ended

  const remaining = event.endDate.getTime() - now.getTime();
  return Math.max(0, Math.floor(remaining / (1000 * 60 * 60))); // Hours
}

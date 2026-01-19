import type { Rarity, DadType } from './core';
import type { CardStats, CardAbility } from './card';
import type { SeasonId } from './season';

// ============================================================================
// COMMUNITY VOTING TYPES (US087 - Community - Card Voting)
// ============================================================================

// Voting event status
export type VotingStatus = 'active' | 'completed' | 'upcoming';

// Card concept for voting
export interface CardConcept {
  id: string;                      // Unique concept ID
  name: string;                    // Card name
  subtitle: string;                // Card subtitle/title
  type: DadType;                   // Dad type
  rarity: Rarity;                  // Proposed rarity
  conceptDescription: string;      // Description of the concept
  artworkUrl?: string;             // Concept art (optional)
  stats: CardStats;                // Proposed stats
  flavorText: string;              // Flavor text
  abilities: CardAbility[];        // Proposed abilities
}

// Voting event (monthly)
export interface VotingEvent {
  id: string;                      // Unique voting event ID
  month: number;                   // Month (1-12)
  year: number;                    // Year
  status: VotingStatus;            // Current status
  startDate: Date;                 // When voting opens
  endDate: Date;                   // When voting closes
  concepts: CardConcept[];         // 3 card concepts to vote on
  winnerId?: string;               // ID of winning concept (when completed)
  totalVotes: number;              // Total votes cast
}

// Vote record (tracks user's vote)
export interface Vote {
  eventId: string;                 // Voting event ID
  conceptId: string;               // Concept ID voted for
  votedAt: Date;                   // When vote was cast
  userId: string;                  // User identifier (anonymous)
}

// Voting history entry (tracks voted cards that were released)
export interface VotingHistoryEntry {
  eventId: string;                 // Voting event ID
  eventMonth: number;              // Month of voting event
  eventYear: number;               // Year of voting event
  votedConceptId: string;          // Concept the user voted for
  winningConceptId: string;        // Concept that won
  cardId?: string;                 // Actual card ID (when released)
  cardReleasedAt?: Date;           // When the card was released
  exclusiveFoilReceived: boolean;  // Whether user received exclusive foil
}

// Voting state for UI
export interface VotingState {
  currentEvent: VotingEvent | null; // Current active voting event
  upcomingEvents: VotingEvent[];    // Upcoming voting events
  pastEvents: VotingEvent[];        // Completed voting events
  userVotes: Vote[];                // User's voting history
  votedInCurrentEvent: boolean;     // Whether user voted in current event
  votedConceptId: string | null;    // Concept ID user voted for in current event
  votingHistory: VotingHistoryEntry[]; // Full voting history
}

// Voting configuration
export interface VotingConfig {
  eventsPerYear: number;            // Number of voting events per year (12 = monthly)
  conceptsPerEvent: number;         // Number of concepts per event (3)
  votingDurationDays: number;       // How long each voting event lasts (7)
  exclusiveFoilForVoters: boolean;  // Whether voters get exclusive foil version
  notifyOnCardRelease: boolean;     // Whether to notify when voted cards are released
}

// Default voting configuration
export const DEFAULT_VOTING_CONFIG: VotingConfig = {
  eventsPerYear: 12,
  conceptsPerEvent: 3,
  votingDurationDays: 7,
  exclusiveFoilForVoters: true,
  notifyOnCardRelease: true,
};

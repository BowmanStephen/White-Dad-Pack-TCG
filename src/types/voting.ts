// ============================================================================
// COMMUNITY VOTING TYPES (US087 - Community - Card Voting)
// ============================================================================

import type { Rarity, DadType, CardStats, CardAbility } from './card';

// Voting event status
export type VotingStatus = 'active' | 'completed' | 'upcoming';

// Card concept for voting
export interface CardConcept {
  id: string;
  name: string;
  subtitle: string;
  type: DadType;
  rarity: Rarity;
  conceptDescription: string;
  artworkUrl?: string;
  stats: CardStats;
  flavorText: string;
  abilities: CardAbility[];
}

// Voting event (monthly)
export interface VotingEvent {
  id: string;
  month: number;
  year: number;
  status: VotingStatus;
  startDate: Date;
  endDate: Date;
  concepts: CardConcept[];
  winnerId?: string;
  totalVotes: number;
}

// Vote record (tracks user's vote)
export interface Vote {
  eventId: string;
  conceptId: string;
  votedAt: Date;
  userId: string;
}

// Voting history entry (tracks voted cards that were released)
export interface VotingHistoryEntry {
  eventId: string;
  eventMonth: number;
  eventYear: number;
  votedConceptId: string;
  winningConceptId: string;
  cardId?: string;
  cardReleasedAt?: Date;
  exclusiveFoilReceived: boolean;
}

// Voting state for UI
export interface VotingState {
  currentEvent: VotingEvent | null;
  upcomingEvents: VotingEvent[];
  pastEvents: VotingEvent[];
  userVotes: Vote[];
  votedInCurrentEvent: boolean;
  votedConceptId: string | null;
  votingHistory: VotingHistoryEntry[];
}

// Voting configuration
export interface VotingConfig {
  eventsPerYear: number;
  conceptsPerEvent: number;
  votingDurationDays: number;
  exclusiveFoilForVoters: boolean;
  notifyOnCardRelease: boolean;
}

// Default voting configuration
export const DEFAULT_VOTING_CONFIG: VotingConfig = {
  eventsPerYear: 12,
  conceptsPerEvent: 3,
  votingDurationDays: 7,
  exclusiveFoilForVoters: true,
  notifyOnCardRelease: true,
};

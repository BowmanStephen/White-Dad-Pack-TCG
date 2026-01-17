/**
 * Voting Store (US087 - Community - Card Voting)
 *
 * Manages community voting for card concepts.
 * Players vote on 3 card concepts monthly, winner becomes real card.
 * Voters receive exclusive foil version.
 */

import { atom, computed } from 'nanostores';
import { persistentAtom } from '@nanostores/persistent';
import type {
  VotingEvent,
  VotingState,
  VotingConfig,
  Vote,
  VotingHistoryEntry,
  CardConcept,
} from '../types';
import {
  VOTING_EVENTS,
  getActiveVotingEvent,
  getUpcomingVotingEvents,
  getCompletedVotingEvents,
  getVotingEventById,
  getWinningConcept,
  isVotingOpen,
  isEventAcceptingVotes,
  getVotingTimeRemaining,
  getCardConceptById,
} from '../data/voting';
import { DEFAULT_VOTING_CONFIG } from '../types';

// ============================================================================
// USER IDENTIFICATION (Anonymous but consistent)
// ============================================================================

/**
 * Get or generate anonymous user ID
 * Stored in localStorage to track user's voting history
 */
function getUserId(): string {
  let userId = localStorage.getItem('voting_user_id');
  if (!userId) {
    userId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    localStorage.setItem('voting_user_id', userId);
  }
  return userId;
}

// ============================================================================
// VOTING CONFIGURATION (Persisted)
// ============================================================================

/**
 * Voting configuration (persisted to localStorage)
 */
export const votingConfig = persistentAtom<VotingConfig>('voting-config', DEFAULT_VOTING_CONFIG);

// ============================================================================
// VOTING STATE ATOMS
// ============================================================================

/**
 * All voting events data
 */
export const allVotingEvents = atom<VotingEvent[]>(VOTING_EVENTS);

/**
 * Current active voting event
 */
export const currentVotingEvent = atom<VotingEvent | null>(getActiveVotingEvent() || null);

/**
 * Upcoming voting events
 */
export const upcomingVotingEvents = atom<VotingEvent[]>(getUpcomingVotingEvents());

/**
 * Completed (past) voting events
 */
export const pastVotingEvents = atom<VotingEvent[]>(getCompletedVotingEvents());

/**
 * User's votes (persisted to localStorage)
 * Key: eventId, Value: Vote
 */
export const userVotes = persistentAtom<Record<string, Vote>>('voting-user-votes', {});

/**
 * User's voting history (persisted to localStorage)
 * Tracks when voted cards were released as real cards
 */
export const votingHistory = persistentAtom<VotingHistoryEntry[]>('voting-history', []);

// ============================================================================
// COMPUTED STATE
// ============================================================================

/**
 * Check if user has voted in current event
 */
export const votedInCurrentEvent = computed(
  [currentVotingEvent, userVotes],
  (event, votes) => {
    if (!event) return false;
    const userId = getUserId();
    const vote = votes[event.id];
    return vote?.userId === userId;
  }
);

/**
 * Get the concept ID user voted for in current event
 */
export const votedConceptId = computed(
  [currentVotingEvent, userVotes],
  (event, votes) => {
    if (!event) return null;
    const userId = getUserId();
    const vote = votes[event.id];
    return vote?.userId === userId ? vote.conceptId : null;
  }
);

/**
 * Full voting state (computed for UI components)
 */
export const votingState = computed(
  [
    currentVotingEvent,
    upcomingVotingEvents,
    pastVotingEvents,
    userVotes,
    votedInCurrentEvent,
    votedConceptId,
    votingHistory,
  ],
  (
    current,
    upcoming,
    past,
    votes,
    hasVoted,
    conceptId,
    history
  ): VotingState => ({
    currentEvent: current,
    upcomingEvents: upcoming,
    pastEvents: past,
    userVotes: Object.values(votes),
    votedInCurrentEvent: hasVoted,
    votedConceptId: conceptId,
    votingHistory: history,
  })
);

/**
 * Check if voting is currently open
 */
export const isVotingCurrentlyOpen = computed([currentVotingEvent], (event) => {
  return event !== null && isEventAcceptingVotes(event.id);
});

/**
 * Get remaining voting time in hours
 */
export const votingTimeRemaining = computed([currentVotingEvent], (event) => {
  if (!event) return null;
  return getVotingTimeRemaining(event.id);
});

// ============================================================================
// ACTIONS
// ============================================================================

/**
 * Vote for a card concept in the current active event
 *
 * @param conceptId - ID of the concept to vote for
 * @returns true if vote was successful, false otherwise
 */
export function voteForConcept(conceptId: string): boolean {
  const event = currentVotingEvent.get();
  if (!event) {
    console.error('No active voting event');
    return false;
  }

  // Check if voting is open
  if (!isEventAcceptingVotes(event.id)) {
    console.error('Voting is not currently open for this event');
    return false;
  }

  // Check if concept exists in this event
  const concept = event.concepts.find((c) => c.id === conceptId);
  if (!concept) {
    console.error('Concept not found in current voting event');
    return false;
  }

  // Check if user already voted
  const userId = getUserId();
  const votes = userVotes.get();
  if (votes[event.id]?.userId === userId) {
    console.error('User has already voted in this event');
    return false;
  }

  // Record the vote
  const vote: Vote = {
    eventId: event.id,
    conceptId,
    votedAt: new Date(),
    userId,
  };

  userVotes.set({
    ...votes,
    [event.id]: vote,
  });

  // Update event vote count (in a real app, this would go to a server)
  const allEvents = allVotingEvents.get();
  const updatedEvents = allEvents.map((e) =>
    e.id === event.id ? { ...e, totalVotes: e.totalVotes + 1 } : e
  );
  allVotingEvents.set(updatedEvents);

  // Add to voting history (will be updated when card is released)
  const history = votingHistory.get();
  const historyEntry: VotingHistoryEntry = {
    eventId: event.id,
    eventMonth: event.month,
    eventYear: event.year,
    votedConceptId: conceptId,
    winningConceptId: '', // Will be updated when event completes
    cardId: undefined, // Will be set when card is released
    cardReleasedAt: undefined, // Will be set when card is released
    exclusiveFoilReceived: false, // Will be set when card is obtained
  };
  votingHistory.set([...history, historyEntry]);

  return true;
}

/**
 * Check if user has voted in a specific event
 *
 * @param eventId - ID of the voting event
 * @returns true if user has voted, false otherwise
 */
export function hasUserVoted(eventId: string): boolean {
  const userId = getUserId();
  const votes = userVotes.get();
  return votes[eventId]?.userId === userId;
}

/**
 * Get the concept a user voted for in a specific event
 *
 * @param eventId - ID of the voting event
 * @returns The concept the user voted for, or undefined
 */
export function getUserVoteForEvent(eventId: string): CardConcept | undefined {
  const vote = userVotes.get()[eventId];
  if (!vote) return undefined;

  return getCardConceptById(vote.conceptId);
}

/**
 * Get the user's full voting history
 *
 * @returns Array of all votes the user has cast
 */
export function getUserVotes(): Vote[] {
  const votes = userVotes.get();
  return Object.values(votes).sort((a, b) => b.votedAt.getTime() - a.votedAt.getTime());
}

/**
 * Refresh voting events (check for new active events)
 * Call this periodically to update voting state
 */
export function refreshVotingEvents(): void {
  currentVotingEvent.set(getActiveVotingEvent() || null);
  upcomingVotingEvents.set(getUpcomingVotingEvents());
  pastVotingEvents.set(getCompletedVotingEvents());
}

/**
 * Simulate completing a voting event and selecting a winner
 * In a real app, this would be determined by actual vote counts from a server
 *
 * @param eventId - ID of the voting event to complete
 * @param winnerId - ID of the winning concept
 */
export function completeVotingEvent(eventId: string, winnerId: string): void {
  const allEvents = allVotingEvents.get();
  const updatedEvents = allEvents.map((event) =>
    event.id === eventId
      ? { ...event, status: 'completed' as const, winnerId }
      : event
  );
  allVotingEvents.set(updatedEvents);
  refreshVotingEvents();

  // Update voting history for users who voted for the winner
  const event = getVotingEventById(eventId);
  if (event) {
    const history = votingHistory.get();
    const updatedHistory = history.map((entry) => {
      if (entry.eventId === eventId && entry.votedConceptId === winnerId) {
        return {
          ...entry,
          winningConceptId: winnerId,
          // cardId and cardReleasedAt will be set when card is actually created
        };
      }
      return entry;
    });
    votingHistory.set(updatedHistory);
  }
}

/**
 * Mark a voted card as released and received in collection
 * Called when a winning concept becomes a real card
 *
 * @param eventId - ID of the voting event
 * @param cardId - ID of the released card
 */
export function markVotedCardReleased(eventId: string, cardId: string): void {
  const history = votingHistory.get();
  const updatedHistory = history.map((entry) => {
    if (entry.eventId === eventId && entry.votedConceptId === entry.winningConceptId) {
      return {
        ...entry,
        cardId,
        cardReleasedAt: new Date(),
      };
    }
    return entry;
  });
  votingHistory.set(updatedHistory);
}

/**
 * Mark that user received exclusive foil version of voted card
 *
 * @param eventId - ID of the voting event
 */
export function markExclusiveFoilReceived(eventId: string): void {
  const history = votingHistory.get();
  const updatedHistory = history.map((entry) => {
    if (entry.eventId === eventId && entry.cardId) {
      return {
        ...entry,
        exclusiveFoilReceived: true,
      };
    }
    return entry;
  });
  votingHistory.set(updatedHistory);
}

/**
 * Get voting history entries where user voted for the winner
 *
 * @returns Array of winning votes
 */
export function getWinningVotes(): VotingHistoryEntry[] {
  const history = votingHistory.get();
  return history.filter((entry) => entry.votedConceptId === entry.winningConceptId);
}

/**
 * Get voting statistics for the current user
 *
 * @returns Object containing voting statistics
 */
export function getUserVotingStats(): {
  totalVotes: number;
  winningVotes: number;
  losingVotes: number;
  upcomingEvents: number;
} {
  const votes = getUserVotes();
  const history = votingHistory.get();
  const upcoming = upcomingVotingEvents.get();

  const winning = history.filter((h) => h.votedConceptId === h.winningConceptId).length;

  return {
    totalVotes: votes.length,
    winningVotes: winning,
    losingVotes: votes.length - winning,
    upcomingEvents: upcoming.length,
  };
}

/**
 * Clear all voting data (for testing purposes)
 * WARNING: This will delete all user voting history
 */
export function clearAllVotingData(): void {
  userVotes.set({});
  votingHistory.set([]);
  localStorage.removeItem('voting_user_id');
}

/**
 * Initialize voting store
 * Call this on app startup to set up initial voting state
 */
export function initializeVotingStore(): void {
  // Initialize user ID if not exists
  getUserId();

  // Load config
  const config = votingConfig.get();
  votingConfig.set(config);

  // Refresh voting events
  refreshVotingEvents();
}

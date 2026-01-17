<!--
VotingGallery.svelte (US087 - Community - Card Voting)

Displays a gallery of card concepts for voting.
Shows 3 concepts side-by-side with voting functionality.
-->
<script lang="ts">
  import { onMount } from 'svelte';
  import type { CardConcept, VotingEvent } from '@/types';
  import VotingCard from './VotingCard.svelte';
  import {
    votingTimeRemaining,
    votedInCurrentEvent,
    votedConceptId,
    voteForConcept,
    initializeVotingStore,
    type VotingState,
  } from '@/stores/voting';

  export let event: VotingEvent | undefined = undefined;
  export let compact: boolean = false;

  // Return early if no event
  if (!event) {
    // Could show a loading state or empty state here
  }

  let timeRemaining = $votingTimeRemaining;
  let hasVoted = $votedInCurrentEvent;
  let selectedConceptId = $votedConceptId;

  // Update time remaining every minute
  let interval: ReturnType<typeof setInterval>;

  onMount(() => {
    // Initialize voting store on client side
    initializeVotingStore();

    interval = setInterval(() => {
      timeRemaining = $votingTimeRemaining;
    }, 60000); // Update every minute

    return () => clearInterval(interval);
  });

  function formatTimeRemaining(hours: number | null): string {
    if (hours === null) return 'Voting closed';
    if (hours === 0) return 'Voting ended';
    if (hours < 24) return `${hours}h remaining`;

    const days = Math.floor(hours / 24);
    const remainingHours = hours % 24;
    return `${days}d ${remainingHours}h remaining`;
  }

  function handleVote(conceptId: string) {
    if (!event || hasVoted) return;

    const success = voteForConcept(conceptId);
    if (success) {
      hasVoted = true;
      selectedConceptId = conceptId;

      // Dispatch custom event for parent components
      dispatchEvent(new CustomEvent('vote-cast', {
        detail: { conceptId, eventId: event.id }
      }));
    }
  }

  function getWinnerConceptId(): string | undefined {
    return event?.winnerId;
  }

  $: isCompleted = event?.status === 'completed';
  $: isActive = event?.status === 'active';
  $: isUpcoming = event?.status === 'upcoming';
  $: winnerId = getWinnerConceptId();
</script>

<div class="voting-gallery" class:compact>
  {#if event}
    <!-- Gallery Header -->
    <div class="gallery-header">
      <div class="header-content">
        <h2>Vote for Next Month's Card</h2>
        <p class="subtitle">Choose your favorite concept. Winning card will be added next month!</p>
      </div>

      {#if isActive && timeRemaining !== null}
        <div class="time-remaining">
          <span class="icon">⏰</span>
          <span>{formatTimeRemaining(timeRemaining)}</span>
        </div>
      {/if}

      {#if isCompleted && winnerId}
        <div class="completed-banner">
          <span class="icon">✅</span>
          <span>Voting Complete - Winner Announced!</span>
        </div>
      {/if}

      {#if isUpcoming}
        <div class="upcoming-banner">
          <span class="icon">🔜</span>
          <span>Voting starts {event.startDate.toLocaleDateString()}</span>
        </div>
      {/if}
    </div>

  <!-- Voting Status Message -->
  {#if hasVoted}
    <div class="vote-success-message">
      <span class="icon">✓</span>
      <span>You voted for {event.concepts.find(c => c.id === selectedConceptId)?.name}</span>
    </div>
  {/if}

  <!-- Cards Grid -->
  <div class="cards-grid" class:grid-3={event.concepts.length === 3} class:grid-2={event.concepts.length === 2}>
    {#each event.concepts as concept}
      <VotingCard
        concept={concept}
        isSelected={selectedConceptId === concept.id}
        isWinner={winnerId === concept.id}
        showVoteButton={isActive && !hasVoted}
        disabled={isCompleted || isUpcoming || hasVoted}
        onVote={handleVote}
      />
    {/each}
  </div>

  <!-- Voting Instructions -->
  {#if isActive && !hasVoted}
    <div class="voting-instructions">
      <h3>How to Vote</h3>
      <ol>
        <li>Review the 3 card concepts above</li>
        <li>Click "Vote" on your favorite concept</li>
        <li>You'll receive an exclusive foil version if it wins!</li>
        <li>Winning card will be added to the game next month</li>
      </ol>
    </div>
  {/if}

  <!-- Completed Event Info -->
  {#if isCompleted && winnerId}
    {@const winner = event.concepts.find(c => c.id === winnerId)}
    {#if winner}
      <div class="winner-announcement">
        <h3>🎉 Winner: {winner.name} 🎉</h3>
        <p>{winner.name} won with {event.totalVotes} total votes!</p>
        <p class="winner-note">
          This card will be added to the game next month.
          {#if hasVoted && selectedConceptId === winnerId}
            <strong>You voted for the winner!</strong> You'll receive an exclusive foil version.
          {/if}
        </p>
      </div>
    {/if}
  {/if}
  {/if}
</div>

<style>
  .voting-gallery {
    width: 100%;
    max-width: 1400px;
    margin: 0 auto;
    padding: 20px;
  }

  .voting-gallery.compact {
    padding: 16px;
  }

  .gallery-header {
    text-align: center;
    margin-bottom: 32px;
  }

  .header-content h2 {
    margin: 0 0 8px 0;
    font-size: 2rem;
    font-weight: bold;
    color: #1f2937;
  }

  .subtitle {
    margin: 0;
    font-size: 1.125rem;
    color: #6b7280;
  }

  .time-remaining,
  .completed-banner,
  .upcoming-banner {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    padding: 8px 16px;
    border-radius: 20px;
    font-weight: 600;
    margin-top: 16px;
  }

  .time-remaining {
    background: #dbeafe;
    color: #1e40af;
  }

  .completed-banner {
    background: #d1fae5;
    color: #065f46;
  }

  .upcoming-banner {
    background: #f3f4f6;
    color: #4b5563;
  }

  .icon {
    font-size: 1.2em;
  }

  .vote-success-message {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    padding: 12px 24px;
    background: #d1fae5;
    color: #065f46;
    border-radius: 8px;
    font-weight: 600;
    margin-bottom: 24px;
  }

  .vote-success-message .icon {
    font-size: 1.5em;
  }

  .cards-grid {
    display: grid;
    gap: 24px;
    margin-bottom: 32px;
  }

  .cards-grid.grid-3 {
    grid-template-columns: repeat(3, 1fr);
  }

  .cards-grid.grid-2 {
    grid-template-columns: repeat(2, 1fr);
  }

  .voting-instructions {
    background: #f9fafb;
    padding: 24px;
    border-radius: 12px;
    border-left: 4px solid #3b82f6;
  }

  .voting-instructions h3 {
    margin: 0 0 16px 0;
    font-size: 1.25rem;
    color: #1f2937;
  }

  .voting-instructions ol {
    margin: 0;
    padding-left: 20px;
  }

  .voting-instructions li {
    margin-bottom: 8px;
    color: #4b5563;
    line-height: 1.5;
  }

  .winner-announcement {
    background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
    padding: 24px;
    border-radius: 12px;
    text-align: center;
    border: 2px solid #fbbf24;
  }

  .winner-announcement h3 {
    margin: 0 0 12px 0;
    font-size: 1.5rem;
    color: #92400e;
  }

  .winner-announcement p {
    margin: 8px 0;
    color: #78350f;
  }

  .winner-note {
    font-weight: 500;
  }

  .winner-note strong {
    color: #92400e;
  }

  @media (max-width: 1024px) {
    .cards-grid.grid-3 {
      grid-template-columns: repeat(2, 1fr);
    }
  }

  @media (max-width: 640px) {
    .voting-gallery {
      padding: 16px;
    }

    .header-content h2 {
      font-size: 1.5rem;
    }

    .subtitle {
      font-size: 1rem;
    }

    .cards-grid.grid-3,
    .cards-grid.grid-2 {
      grid-template-columns: 1fr;
    }

    .voting-instructions {
      padding: 16px;
    }

    .winner-announcement {
      padding: 16px;
    }

    .winner-announcement h3 {
      font-size: 1.25rem;
    }
  }
</style>

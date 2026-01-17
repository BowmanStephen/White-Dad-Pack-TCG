<!--
VotingHistory.svelte (US087 - Community - Card Voting)

Displays the user's voting history including:
- Past votes and winners
- Status of voted cards (released/upcoming)
- Exclusive foil status
-->
<script lang="ts">
  import { onMount } from 'svelte';
  import type { VotingHistoryEntry, VotingEvent } from '@/types';
  import { getUserVotes, getWinningVotes, votingHistory } from '@/stores/voting';
  import { getVotingEventById, getCardConceptById } from '@/data/voting';

  let userVotes = getUserVotes();
  let winningVotes = getWinningVotes();
  let history = $votingHistory;

  onMount(() => {
    // Refresh history when component mounts
    history = $votingHistory;
  });

  function getConceptForHistory(entry: VotingHistoryEntry) {
    return getCardConceptById(entry.votedConceptId);
  }

  function getEventForHistory(entry: VotingHistoryEntry) {
    return getVotingEventById(entry.eventId);
  }

  function formatDate(date: Date | undefined): string {
    if (!date) return 'TBD';
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  }

  function getStatusBadge(entry: VotingHistoryEntry): { text: string; color: string } {
    if (entry.exclusiveFoilReceived) {
      return { text: 'Foil Received', color: '#ec4899' }; // pink
    }
    if (entry.cardReleasedAt) {
      return { text: 'Released', color: '#10b981' }; // green
    }
    if (entry.cardId) {
      return { text: 'In Production', color: '#fbbf24' }; // yellow
    }
    if (entry.winningConceptId === entry.votedConceptId) {
      return { text: 'Winner - Coming Soon', color: '#a855f7' }; // purple
    }
    return { text: 'Did Not Win', color: '#6b7280' }; // gray
  }

  $: stats = {
    total: userVotes.length,
    winners: winningVotes.length,
    winRate: userVotes.length > 0 ? Math.round((winningVotes.length / userVotes.length) * 100) : 0
  };
</script>

<div class="voting-history">
  <!-- Stats Summary -->
  <div class="stats-summary">
    <div class="stat-card">
      <div class="stat-value">{stats.total}</div>
      <div class="stat-label">Total Votes</div>
    </div>
    <div class="stat-card">
      <div class="stat-value">{stats.winners}</div>
      <div class="stat-label">Winning Votes</div>
    </div>
    <div class="stat-card">
      <div class="stat-value">{stats.winRate}%</div>
      <div class="stat-label">Win Rate</div>
    </div>
  </div>

  <!-- History List -->
  <div class="history-list">
    <h2>Your Voting History</h2>

    {#if history.length === 0}
      <div class="empty-state">
        <span class="icon">📊</span>
        <p>No voting history yet. Vote in the current event to get started!</p>
      </div>
    {:else}
      <div class="history-entries">
        {#each history as entry (entry.eventId)}
          {@const concept = getConceptForHistory(entry)}
          {@const event = getEventForHistory(entry)}
          {@const status = getStatusBadge(entry)}

          {#if concept && event}
            <div class="history-entry" class:winner={entry.winningConceptId === entry.votedConceptId}>
              <!-- Entry Header -->
              <div class="entry-header">
                <div class="event-info">
                  <span class="event-date">
                    {new Date(event.startDate).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                  </span>
                  <span class="event-name">{event.month}/{event.year} Voting Event</span>
                </div>
                <div
                  class="status-badge"
                  style:background-color={status.color}
                >
                  {status.text}
                </div>
              </div>

              <!-- Concept Info -->
              <div class="concept-info">
                <div class="concept-details">
                  <h3>{concept.name}</h3>
                  <p class="subtitle">{concept.subtitle}</p>
                  <p class="description">{concept.conceptDescription}</p>
                </div>

                <!-- Status Details -->
                {#if entry.winningConceptId === entry.votedConceptId}
                  <div class="winner-banner">
                    <span class="trophy">🏆</span>
                    <div class="winner-info">
                      <strong>You voted for the winner!</strong>
                      {#if entry.cardReleasedAt}
                        <p>Card released on {formatDate(entry.cardReleasedAt)}</p>
                      {:else}
                        <p>Card coming soon</p>
                      {/if}
                    </div>
                  </div>
                {:else}
                  <div class="loser-banner">
                    <p>This concept did not win the vote</p>
                  </div>
                {/if}

                <!-- Foil Status -->
                {#if entry.exclusiveFoilReceived}
                  <div class="foil-banner">
                    <span class="sparkle">✨</span>
                    <div class="foil-info">
                      <strong>Exclusive Foil Received!</strong>
                      <p>Check your collection for your special foil version</p>
                    </div>
                  </div>
                {/if}
              </div>
            </div>
          {/if}
        {/each}
      </div>
    {/if}
  </div>
</div>

<style>
  .voting-history {
    width: 100%;
    max-width: 900px;
    margin: 0 auto;
    padding: 20px;
  }

  .stats-summary {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 16px;
    margin-bottom: 32px;
  }

  .stat-card {
    background: white;
    padding: 20px;
    border-radius: 12px;
    text-align: center;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  }

  .stat-value {
    font-size: 2.5rem;
    font-weight: bold;
    color: #3b82f6;
    line-height: 1;
    margin-bottom: 8px;
  }

  .stat-label {
    font-size: 0.875rem;
    color: #6b7280;
    font-weight: 500;
  }

  .history-list {
    background: white;
    border-radius: 12px;
    padding: 24px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  }

  .history-list h2 {
    margin: 0 0 24px 0;
    font-size: 1.5rem;
    color: #1f2937;
  }

  .empty-state {
    text-align: center;
    padding: 48px 24px;
    color: #6b7280;
  }

  .empty-state .icon {
    display: block;
    font-size: 3em;
    margin-bottom: 16px;
  }

  .empty-state p {
    font-size: 1rem;
  }

  .history-entries {
    display: flex;
    flex-direction: column;
    gap: 16px;
  }

  .history-entry {
    border: 2px solid #e5e7eb;
    border-radius: 12px;
    overflow: hidden;
    transition: all 0.2s ease;
  }

  .history-entry:hover {
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  }

  .history-entry.winner {
    border-color: #fbbf24;
    background: linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%);
  }

  .entry-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 16px;
    background: #f9fafb;
    border-bottom: 1px solid #e5e7eb;
  }

  .event-info {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  .event-date {
    font-size: 0.875rem;
    font-weight: 600;
    color: #3b82f6;
  }

  .event-name {
    font-size: 0.875rem;
    color: #6b7280;
  }

  .status-badge {
    padding: 6px 12px;
    border-radius: 20px;
    color: white;
    font-size: 0.75rem;
    font-weight: 600;
    white-space: nowrap;
  }

  .concept-info {
    padding: 16px;
  }

  .concept-details h3 {
    margin: 0 0 4px 0;
    font-size: 1.125rem;
    color: #1f2937;
  }

  .subtitle {
    margin: 0 0 8px 0;
    font-size: 0.875rem;
    color: #6b7280;
  }

  .description {
    margin: 0 0 16px 0;
    font-size: 0.875rem;
    color: #4b5563;
    line-height: 1.5;
  }

  .winner-banner,
  .loser-banner,
  .foil-banner {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 12px;
    border-radius: 8px;
    margin-top: 8px;
  }

  .winner-banner {
    background: #fef3c7;
    border: 1px solid #fbbf24;
  }

  .loser-banner {
    background: #f3f4f6;
    border: 1px solid #d1d5db;
  }

  .foil-banner {
    background: linear-gradient(135deg, #fce7f3 0%, #fbcfe8 100%);
    border: 1px solid #ec4899;
  }

  .trophy {
    font-size: 1.5em;
  }

  .sparkle {
    font-size: 1.5em;
  }

  .winner-info strong,
  .foil-info strong {
    display: block;
    color: #92400e;
    margin-bottom: 4px;
  }

  .foil-info strong {
    color: #be185d;
  }

  .winner-info p,
  .foil-info p {
    margin: 0;
    font-size: 0.875rem;
  }

  .winner-info p {
    color: #78350f;
  }

  .foil-info p {
    color: #9d174d;
  }

  .loser-banner p {
    margin: 0;
    font-size: 0.875rem;
    color: #6b7280;
  }

  @media (max-width: 640px) {
    .voting-history {
      padding: 16px;
    }

    .stats-summary {
      grid-template-columns: 1fr;
    }

    .stat-card {
      padding: 16px;
    }

    .stat-value {
      font-size: 2rem;
    }

    .history-list {
      padding: 16px;
    }

    .entry-header {
      flex-direction: column;
      align-items: flex-start;
      gap: 8px;
    }
  }
</style>

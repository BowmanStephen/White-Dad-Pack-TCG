<!--
VotingCard.svelte (US087 - Community - Card Voting)

Displays a card concept available for voting.
Shows the concept's stats, abilities, and allows users to vote.
-->
<script lang="ts">
  import { RARITY_CONFIG, type CardConcept } from '@/types';
  import { STAT_NAMES, STAT_ICONS, DAD_TYPE_NAMES } from '@/types';

  export let concept: CardConcept;
  export let isSelected: boolean = false;
  export let isWinner: boolean = false;
  export let showVoteButton: boolean = true;
  export let disabled: boolean = false;

  // Emit vote event when user clicks vote button
  export let onVote: ((conceptId: string) => void) | undefined = undefined;

  function handleVote() {
    if (!disabled && onVote) {
      onVote(concept.id);
    }
  }

  function getStatWidth(stat: number): string {
    return `${stat}%`;
  }
</script>

<div
  class="voting-card {isSelected ? 'selected' : ''} {isWinner ? 'winner' : ''} {disabled ? 'disabled' : ''}"
  class:border-rarity={concept.rarity}
  role="button"
  tabindex={!disabled ? 0 : undefined}
  onkeypress={(e) => e.key === 'Enter' && handleVote()}
  onclick={!disabled ? handleVote : undefined}
>
  <!-- Winner Badge -->
  {#if isWinner}
    <div class="winner-badge">
      <span class="trophy">🏆</span>
      <span>Winner</span>
    </div>
  {/if}

  <!-- Card Header -->
  <div class="card-header" style:background-color={RARITY_CONFIG[concept.rarity].color}>
    <div class="card-type">
      <span class="type-icon">{DAD_TYPE_NAMES[concept.type]}</span>
      <span class="rarity-badge">{RARITY_CONFIG[concept.rarity].name}</span>
    </div>
    <div class="card-name">
      <h3>{concept.name}</h3>
      <p class="subtitle">{concept.subtitle}</p>
    </div>
  </div>

  <!-- Card Body -->
  <div class="card-body">
    <!-- Concept Description -->
    <div class="concept-description">
      <p>{concept.conceptDescription}</p>
    </div>

    <!-- Stats Grid -->
    <div class="stats-grid">
      {#each Object.entries(concept.stats) as [statKey, statValue]}
        {@const statName = STAT_NAMES[statKey as keyof typeof STAT_NAMES]}
        {@const statIcon = STAT_ICONS[statKey as keyof typeof STAT_ICONS]}
        <div class="stat-row">
          <span class="stat-icon">{statIcon}</span>
          <span class="stat-name">{statName}</span>
          <div class="stat-bar">
            <div
              class="stat-fill"
              style="width: {getStatWidth(statValue)}; background-color: {RARITY_CONFIG[concept.rarity].color}"
            ></div>
          </div>
          <span class="stat-value">{statValue}</span>
        </div>
      {/each}
    </div>

    <!-- Abilities -->
    {#if concept.abilities.length > 0}
      <div class="abilities-section">
        <h4>Abilities</h4>
        {#each concept.abilities as ability}
          <div class="ability">
            <span class="ability-name">{ability.name}</span>
            <p class="ability-description">{ability.description}</p>
          </div>
        {/each}
      </div>
    {/if}

    <!-- Flavor Text -->
    <div class="flavor-text">
      <p>"{concept.flavorText}"</p>
    </div>

    <!-- Vote Button -->
    {#if showVoteButton && !disabled}
      <button
        class="vote-button {isSelected ? 'voted' : ''}"
          disabled={isSelected || disabled}
        type="button"
      >
        {#if isSelected}
          ✓ Voted
        {:else}
          Vote for {concept.name}
        {/if}
      </button>
    {/if}
    {#if showVoteButton && disabled && isWinner}
      <div class="winner-message">
        <span>🎉</span>
        <span>Winning Card - Coming Next Month!</span>
      </div>
    {/if}
  </div>
</div>

<style>
  .voting-card {
    background: white;
    border-radius: 12px;
    overflow: hidden;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    transition: all 0.3s ease;
    cursor: pointer;
    position: relative;
    border: 3px solid transparent;
  }

  .voting-card:hover:not(.disabled) {
    transform: translateY(-4px);
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
  }

  .voting-card.selected {
    border-color: #10b981;
    box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.2);
  }

  .voting-card.winner {
    border-color: #fbbf24;
    box-shadow: 0 0 0 3px rgba(251, 191, 36, 0.3);
  }

  .voting-card.disabled {
    cursor: default;
    opacity: 0.8;
  }

  .voting-card.border-rarity-common {
    border-color: #9ca3af;
  }

  .voting-card.border-rarity-uncommon {
    border-color: #60a5fa;
  }

  .voting-card.border-rarity-rare {
    border-color: #fbbf24;
  }

  .voting-card.border-rarity-epic {
    border-color: #a855f7;
  }

  .voting-card.border-rarity-legendary {
    border-color: #f97316;
  }

  .voting-card.border-rarity-mythic {
    border-color: #ec4899;
  }

  .winner-badge {
    position: absolute;
    top: 12px;
    right: 12px;
    background: linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%);
    color: white;
    padding: 6px 12px;
    border-radius: 20px;
    font-weight: bold;
    font-size: 0.875rem;
    display: flex;
    align-items: center;
    gap: 4px;
    box-shadow: 0 2px 8px rgba(251, 191, 36, 0.4);
    z-index: 10;
  }

  .winner-badge .trophy {
    font-size: 1.2em;
  }

  .card-header {
    padding: 16px;
    color: white;
  }

  .card-type {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 8px;
    font-size: 0.875rem;
  }

  .type-icon {
    font-weight: 500;
  }

  .rarity-badge {
    background: rgba(255, 255, 255, 0.2);
    padding: 2px 8px;
    border-radius: 12px;
    font-size: 0.75rem;
  }

  .card-name h3 {
    margin: 0;
    font-size: 1.25rem;
    font-weight: bold;
    line-height: 1.2;
  }

  .subtitle {
    margin: 4px 0 0 0;
    font-size: 0.875rem;
    opacity: 0.9;
  }

  .card-body {
    padding: 16px;
  }

  .concept-description {
    margin-bottom: 16px;
    padding: 12px;
    background: #f9fafb;
    border-radius: 8px;
    border-left: 3px solid #6b7280;
  }

  .concept-description p {
    margin: 0;
    font-size: 0.875rem;
    line-height: 1.5;
    color: #374151;
  }

  .stats-grid {
    display: flex;
    flex-direction: column;
    gap: 8px;
    margin-bottom: 16px;
  }

  .stat-row {
    display: grid;
    grid-template-columns: 24px 100px 1fr 32px;
    align-items: center;
    gap: 8px;
  }

  .stat-icon {
    font-size: 1.2em;
  }

  .stat-name {
    font-size: 0.75rem;
    font-weight: 500;
    color: #6b7280;
  }

  .stat-bar {
    height: 8px;
    background: #e5e7eb;
    border-radius: 4px;
    overflow: hidden;
  }

  .stat-fill {
    height: 100%;
    transition: width 0.3s ease;
    border-radius: 4px;
  }

  .stat-value {
    font-size: 0.75rem;
    font-weight: bold;
    text-align: right;
  }

  .abilities-section {
    margin-bottom: 16px;
  }

  .abilities-section h4 {
    margin: 0 0 8px 0;
    font-size: 0.875rem;
    font-weight: 600;
    color: #374151;
  }

  .ability {
    padding: 8px 12px;
    background: #fef3c7;
    border-radius: 6px;
    margin-bottom: 8px;
    border-left: 3px solid #fbbf24;
  }

  .ability-name {
    display: block;
    font-weight: 600;
    font-size: 0.875rem;
    color: #92400e;
    margin-bottom: 4px;
  }

  .ability-description {
    margin: 0;
    font-size: 0.75rem;
    color: #78350f;
    line-height: 1.4;
  }

  .flavor-text {
    padding: 12px;
    background: #f3f4f6;
    border-radius: 8px;
    margin-bottom: 16px;
    font-style: italic;
  }

  .flavor-text p {
    margin: 0;
    font-size: 0.875rem;
    color: #6b7280;
    text-align: center;
  }

  .vote-button {
    width: 100%;
    padding: 12px 24px;
    background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
    color: white;
    border: none;
    border-radius: 8px;
    font-size: 1rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .vote-button:hover:not(:disabled) {
    background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%);
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(37, 99, 235, 0.3);
  }

  .vote-button:active:not(:disabled) {
    transform: translateY(0);
  }

  .vote-button:disabled {
    background: #10b981;
    cursor: default;
    opacity: 0.8;
  }

  .vote-button.voted {
    background: #10b981;
  }

  .winner-message {
    text-align: center;
    padding: 12px;
    background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
    border-radius: 8px;
    color: #92400e;
    font-weight: 600;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
  }

  .winner-message span:first-child {
    font-size: 1.5em;
  }

  @media (max-width: 640px) {
    .stat-row {
      grid-template-columns: 20px 1fr 32px;
      gap: 4px;
    }

    .stat-name {
      font-size: 0.7rem;
    }

    .ability-name {
      font-size: 0.8rem;
    }

    .ability-description {
      font-size: 0.7rem;
    }
  }
</style>

<script lang="ts">
  import type { PackCard } from '@/types';
  import { RARITY_CONFIG, RARITY_ORDER } from '@/types';

  // Props
  export let card: PackCard;
  export let ownedCount: number = 1;
  export let seriesTotal: number = 50;

  // Get rarity config
  $: rarityConfig = RARITY_CONFIG[card.rarity];

  // Calculate set completion percentage
  $: setCompletion = Math.round((card.cardNumber / seriesTotal) * 100);

  /**
   * Get visual width percentage for progress bar
   */
  function getProgressPercentage(cardNumber: number, total: number): number {
    return (cardNumber / total) * 100;
  }

  /**
   * Format card number with proper display
   */
  function formatCardNumber(num: number, total: number): string {
    return `${num.toString().padStart(3, '0')}/${total.toString().padStart(3, '0')}`;
  }

  /**
   * Get holo variant display name
   */
  function getHoloVariantName(holoType: string): string {
    const names: Record<string, string> = {
      none: 'Non-Holo',
      standard: 'Standard Holo',
      reverse: 'Reverse Holo',
      full_art: 'Full Art Holo',
      prismatic: 'Prismatic Holo',
    };
    return names[holoType] || holoType;
  }

  /**
   * Get holo variant emoji
   */
  function getHoloVariantEmoji(holoType: string): string {
    const emojis: Record<string, string> = {
      none: '◆',
      standard: '✨',
      reverse: '⬆️',
      full_art: '🖼️',
      prismatic: '🌈',
    };
    return emojis[holoType] || '◆';
  }

  /**
   * Get rarity tier color for display
   */
  function getRarityColor(rarity: typeof RARITY_ORDER[number]): string {
    return RARITY_CONFIG[rarity].color;
  }

  /**
   * Get rarity progression - shows which rarities exist in series
   */
  function getRarityProgression(): Array<{
    rarity: typeof RARITY_ORDER[number];
    isOwned: boolean;
    color: string;
  }> {
    // In a real implementation, this would check if we own any cards
    // of each rarity in this series. For now, we'll show all rarities
    // and highlight the current card's rarity
    return RARITY_ORDER.map(rarity => ({
      rarity,
      isOwned: rarity === card.rarity,
      color: RARITY_CONFIG[rarity].color,
    }));
  }
</script>

<!-- Card Set Information Panel -->
<div class="card-set-info">
  <!-- Set Number and Progress -->
  <div class="set-number-section">
    <div class="set-number-label">
      <span class="set-label">Collector #</span>
      <span class="set-number">{formatCardNumber(card.cardNumber, seriesTotal)}</span>
    </div>

    <!-- Progress Bar -->
    <div class="progress-track">
      <div
        class="progress-fill"
        style="
          width: {getProgressPercentage(card.cardNumber, seriesTotal)}%;
          background: linear-gradient(90deg, {rarityConfig.color}, {rarityConfig.glowColor});
        "
      >
        <div class="progress-shimmer"></div>
      </div>
    </div>

    <!-- Progress Text -->
    <div class="progress-text">
      <span class="progress-current">{card.cardNumber}</span>
      <span class="progress-total">of {seriesTotal}</span>
    </div>
  </div>

  <!-- Rarity Tier Progression -->
  <div class="rarity-progression-section">
    <div class="section-title">Rarity Tiers in Series</div>

    <div class="rarity-tiers">
      {#each getRarityProgression() as tier}
        <div
          class="rarity-tier"
          class:is-current={tier.isOwned}
          style="border-color: {tier.color};"
          title="{RARITY_CONFIG[tier.rarity].name} tier"
        >
          <div class="tier-dot" style="background-color: {tier.color};"></div>
          <div class="tier-name">{RARITY_CONFIG[tier.rarity].name}</div>
        </div>
      {/each}
    </div>

    <!-- Legend -->
    <div class="rarity-legend">
      <div class="legend-item">
        <div class="legend-dot current"></div>
        <span class="legend-text">Current card rarity</span>
      </div>
      <div class="legend-item">
        <div class="legend-dot owned"></div>
        <span class="legend-text">Other rarities in series</span>
      </div>
    </div>
  </div>

  <!-- Holographic Variant Information -->
  {#if card.isHolo}
    <div class="holo-section">
      <div class="section-title">Holographic Variant</div>

      <div class="holo-info">
        <div class="holo-type-badge" style="border-color: {rarityConfig.color}; background: {rarityConfig.color}11;">
          <span class="holo-emoji">{getHoloVariantEmoji(card.holoType)}</span>
          <span class="holo-name">{getHoloVariantName(card.holoType)}</span>
        </div>

        <!-- Holo Descriptions -->
        <div class="holo-description">
          {#if card.holoType === 'standard'}
            <p>Standard holographic finish with classic shimmer pattern</p>
          {:else if card.holoType === 'reverse'}
            <p>Reverse holo: Background shimmers, card face remains standard</p>
          {:else if card.holoType === 'full_art'}
            <p>Full art holographic: Entire card surface shimmers beautifully</p>
          {:else if card.holoType === 'prismatic'}
            <p>Prismatic rainbow holo (Mythic only): Premium multi-color sparkle effect</p>
          {/if}
        </div>

        <!-- Rarity Bonus -->
        <div class="rarity-bonus">
          <span class="bonus-label">Rarity Bonus:</span>
          <span class="bonus-value">{RARITY_CONFIG[card.rarity].name} Holographic</span>
        </div>
      </div>
    </div>
  {/if}

  <!-- Edition / Season Information -->
  {#if card.seasonId}
    <div class="edition-section">
      <div class="section-title">Set Information</div>

      <div class="edition-info">
        <div class="edition-item">
          <span class="edition-label">Series:</span>
          <span class="edition-value">Series {card.series}</span>
        </div>

        <div class="edition-item">
          <span class="edition-label">Season:</span>
          <span class="edition-value season-badge" style="border-color: {getSeasonColor(card.seasonId)};">
            Season {card.seasonId}
          </span>
        </div>

        <div class="edition-item">
          <span class="edition-label">Artist:</span>
          <span class="edition-value">{card.artist}</span>
        </div>

        <div class="edition-item">
          <span class="edition-label">Print Run:</span>
          <span class="edition-value">Limited Edition</span>
        </div>
      </div>
    </div>
  {:else}
    <div class="edition-section">
      <div class="section-title">Set Information</div>

      <div class="edition-info">
        <div class="edition-item">
          <span class="edition-label">Series:</span>
          <span class="edition-value">Series {card.series}</span>
        </div>

        <div class="edition-item">
          <span class="edition-label">Artist:</span>
          <span class="edition-value">{card.artist}</span>
        </div>

        <div class="edition-item">
          <span class="edition-label">Print Run:</span>
          <span class="edition-value">Limited Edition</span>
        </div>
      </div>
    </div>
  {/if}

  <!-- Owned Copies Section -->
  <div class="owned-section">
    <div class="section-title">Your Collection</div>

    <div class="owned-info">
      <div class="owned-count">
        <div class="owned-number">{ownedCount}</div>
        <div class="owned-label">Owned</div>
      </div>

      <div class="owned-status">
        {#if ownedCount === 1}
          <p class="status-text">You own 1 copy of this card</p>
        {:else if ownedCount > 1}
          <p class="status-text">You own {ownedCount} copies of this card</p>
          <p class="status-hint">Consider trading extras or keeping for deck variants</p>
        {:else}
          <p class="status-text">You don't own this card yet</p>
        {/if}
      </div>
    </div>
  </div>

  <!-- Missing Cards in Series -->
  {#if card.cardNumber < seriesTotal * 0.5}
    <div class="missing-section">
      <div class="section-title">Series Completion</div>

      <div class="missing-cards-hint">
        <div class="completion-bar">
          <div
            class="completion-fill"
            style="
              width: {setCompletion}%;
              background: linear-gradient(90deg, {rarityConfig.color}, {rarityConfig.glowColor});
            "
          ></div>
        </div>
        <p class="missing-text">
          <span class="completion-percent">{setCompletion}%</span> through series
        </p>
        <p class="missing-hint">
          {seriesTotal - card.cardNumber} more cards to complete the set
        </p>
      </div>
    </div>
  {/if}
</div>

<!-- Helper function: get season color -->
<script>
  function getSeasonColor(seasonId: number): string {
    const seasonColors: Record<number, string> = {
      1: '#1e40af',
      2: '#dc2626',
      3: '#d97706',
      4: '#0284c7',
      5: '#16a34a',
      6: '#9333ea',
      7: '#ec4899',
      8: '#f59e0b',
      9: '#10b981',
      10: '#6366f1',
    };
    return seasonColors[seasonId] || '#9ca3af';
  }
</script>

<style>
  .card-set-info {
    display: flex;
    flex-direction: column;
    gap: 24px;
    padding: 24px;
    background: linear-gradient(135deg, rgba(15, 23, 42, 0.8), rgba(30, 41, 59, 0.8));
    border-radius: 16px;
    border: 1px solid rgba(148, 163, 184, 0.2);
    backdrop-filter: blur(8px);
  }

  /* Set Number Section */
  .set-number-section {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .set-number-label {
    display: flex;
    justify-content: space-between;
    align-items: baseline;
    padding-bottom: 8px;
  }

  .set-label {
    font-size: 12px;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    color: rgba(255, 255, 255, 0.6);
  }

  .set-number {
    font-size: 24px;
    font-weight: 900;
    color: white;
    font-family: 'Courier New', monospace;
  }

  /* Progress Bar */
  .progress-track {
    position: relative;
    height: 12px;
    background: rgba(0, 0, 0, 0.3);
    border-radius: 6px;
    overflow: hidden;
    border: 1px solid rgba(255, 255, 255, 0.1);
  }

  .progress-fill {
    height: 100%;
    border-radius: 6px;
    transition: width 0.6s ease-out;
    position: relative;
  }

  .progress-shimmer {
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(
      90deg,
      transparent,
      rgba(255, 255, 255, 0.3),
      transparent
    );
    animation: shimmer 2s infinite;
  }

  @keyframes shimmer {
    0% {
      left: -100%;
    }
    100% {
      left: 100%;
    }
  }

  .progress-text {
    display: flex;
    justify-content: space-between;
    font-size: 12px;
    color: rgba(255, 255, 255, 0.7);
  }

  .progress-current {
    font-weight: 600;
    color: white;
  }

  .progress-total {
    opacity: 0.7;
  }

  /* Rarity Progression Section */
  .rarity-progression-section {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .section-title {
    font-size: 13px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    color: rgba(255, 255, 255, 0.6);
    margin-bottom: 4px;
  }

  .rarity-tiers {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(70px, 1fr));
    gap: 8px;
  }

  .rarity-tier {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 6px;
    padding: 8px 6px;
    border: 2px solid;
    border-radius: 8px;
    background: rgba(0, 0, 0, 0.2);
    transition: all 0.2s ease;
    opacity: 0.6;
  }

  .rarity-tier.is-current {
    opacity: 1;
    background: rgba(255, 255, 255, 0.05);
    transform: scale(1.05);
  }

  .rarity-tier:hover {
    opacity: 0.8;
    transform: translateY(-2px);
  }

  .tier-dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    box-shadow: 0 0 8px currentColor;
  }

  .tier-name {
    font-size: 10px;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.3px;
    color: rgba(255, 255, 255, 0.8);
    text-align: center;
    line-height: 1.2;
  }

  .rarity-legend {
    display: flex;
    flex-direction: column;
    gap: 6px;
    margin-top: 8px;
    padding-top: 8px;
    border-top: 1px solid rgba(255, 255, 255, 0.1);
  }

  .legend-item {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 11px;
    color: rgba(255, 255, 255, 0.6);
  }

  .legend-dot {
    width: 6px;
    height: 6px;
    border-radius: 50%;
  }

  .legend-dot.current {
    background: rgba(255, 255, 255, 0.9);
    box-shadow: 0 0 6px rgba(255, 255, 255, 0.5);
  }

  .legend-dot.owned {
    background: rgba(255, 255, 255, 0.3);
  }

  /* Holo Section */
  .holo-section {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .holo-info {
    display: flex;
    flex-direction: column;
    gap: 10px;
  }

  .holo-type-badge {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 10px 12px;
    border: 2px solid;
    border-radius: 8px;
    justify-self: start;
  }

  .holo-emoji {
    font-size: 18px;
  }

  .holo-name {
    font-size: 12px;
    font-weight: 700;
    color: white;
    text-transform: uppercase;
    letter-spacing: 0.3px;
  }

  .holo-description {
    padding: 8px 10px;
    background: rgba(0, 0, 0, 0.2);
    border-radius: 6px;
    border-left: 2px solid rgba(255, 255, 255, 0.2);
  }

  .holo-description p {
    font-size: 11px;
    color: rgba(255, 255, 255, 0.7);
    line-height: 1.4;
    margin: 0;
  }

  .rarity-bonus {
    display: flex;
    justify-content: space-between;
    font-size: 11px;
    padding-top: 6px;
    border-top: 1px solid rgba(255, 255, 255, 0.1);
  }

  .bonus-label {
    color: rgba(255, 255, 255, 0.6);
    font-weight: 600;
  }

  .bonus-value {
    color: white;
    font-weight: 700;
  }

  /* Edition Section */
  .edition-section {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .edition-info {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 10px;
  }

  .edition-item {
    display: flex;
    flex-direction: column;
    gap: 4px;
    padding: 8px;
    background: rgba(0, 0, 0, 0.2);
    border-radius: 6px;
  }

  .edition-label {
    font-size: 10px;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.3px;
    color: rgba(255, 255, 255, 0.6);
  }

  .edition-value {
    font-size: 12px;
    font-weight: 700;
    color: white;
  }

  .season-badge {
    display: inline-block;
    padding: 4px 8px;
    border: 1px solid;
    border-radius: 4px;
    background: rgba(255, 255, 255, 0.05);
  }

  /* Owned Section */
  .owned-section {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .owned-info {
    display: flex;
    gap: 16px;
    align-items: flex-start;
    padding: 12px;
    background: rgba(0, 0, 0, 0.2);
    border-radius: 8px;
  }

  .owned-count {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 4px;
  }

  .owned-number {
    font-size: 32px;
    font-weight: 900;
    color: white;
  }

  .owned-label {
    font-size: 10px;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.3px;
    color: rgba(255, 255, 255, 0.6);
  }

  .owned-status {
    flex: 1;
  }

  .status-text {
    font-size: 12px;
    color: white;
    font-weight: 600;
    margin: 0;
  }

  .status-hint {
    font-size: 11px;
    color: rgba(255, 255, 255, 0.6);
    margin-top: 4px;
    margin-bottom: 0;
  }

  /* Missing Section */
  .missing-section {
    display: flex;
    flex-direction: column;
    gap: 12px;
    padding: 12px;
    background: rgba(251, 191, 36, 0.05);
    border-radius: 8px;
    border: 1px solid rgba(251, 191, 36, 0.2);
  }

  .missing-cards-hint {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .completion-bar {
    position: relative;
    height: 8px;
    background: rgba(0, 0, 0, 0.3);
    border-radius: 4px;
    overflow: hidden;
  }

  .completion-fill {
    height: 100%;
    border-radius: 4px;
    transition: width 0.6s ease-out;
  }

  .missing-text {
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-size: 12px;
    color: white;
    margin: 0;
  }

  .completion-percent {
    font-weight: 900;
    font-size: 14px;
  }

  .missing-hint {
    font-size: 11px;
    color: rgba(255, 255, 255, 0.6);
    margin: 0;
  }

  /* Animations */
  @keyframes slideUp {
    from {
      opacity: 0;
      transform: translateY(8px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  .section-title {
    animation: slideUp 0.4s ease-out;
  }

  /* Accessibility */
  @media (prefers-reduced-motion: reduce) {
    .progress-fill,
    .completion-fill,
    .rarity-tier {
      transition: none;
    }

    .progress-shimmer {
      animation: none;
    }

    .section-title {
      animation: none;
    }
  }

  /* Mobile Optimizations */
  @media (max-width: 640px) {
    .card-set-info {
      gap: 16px;
      padding: 16px;
    }

    .rarity-tiers {
      grid-template-columns: repeat(3, 1fr);
    }

    .edition-info {
      grid-template-columns: 1fr;
    }

    .owned-info {
      flex-direction: column;
      text-align: center;
    }
  }
</style>

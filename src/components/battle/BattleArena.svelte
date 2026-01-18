<script lang="ts">
  import { collection } from '../../stores/collection';
  import type { Card as CardType, PackCard } from '../../types';
  import { RARITY_CONFIG } from '../../types';
  import type { StatusEffect } from '../../lib/mechanics/combat';

  type DuelResult = {
    winner: CardType;
    loser: CardType;
    turns: number;
    log: string[];
  };
  import Card from '../card/Card.svelte';
  import BattleLog from './BattleLog.svelte';
  import BattleTutorial from './BattleTutorial.svelte';
  import StatusIcon from './StatusIcon.svelte';
  import { simulateBattle } from '../../lib/mechanics/combat';
  import type { BattleLogEntry } from './BattleLog.svelte';

  let availableCards = $state<PackCard[]>([]);
  let selectedCard = $state<PackCard | null>(null);
  let opponentCard = $state<PackCard | null>(null);
  let battleResult = $state<DuelResult | null>(null);
  let battleLog = $state<BattleLogEntry[]>([]);
  let currentTurn = $state(0);
  let isBattling = $state(false);

  // PACK-011: Status effects tracking
  let playerStatusEffects = $state<StatusEffect[]>([]);
  let opponentStatusEffects = $state<StatusEffect[]>([]);

  // Animation states
  let playerAttackAnimation = $state(false);
  let opponentAttackAnimation = $state(false);
  let damageNumbers = $state<Array<{ id: string; value: number; isPlayer: boolean; isCrit: boolean }>>([]);
  let showVictoryScreen = $state(false);
  let battlePhase = $state<'idle' | 'player_attack' | 'opponent_attack' | 'complete'>('idle');

  // PACK-012: Enhanced animation states
  let screenShake = $state(false);
  let criticalHitActive = $state(false);
  let statusEffectParticles = $state<Array<{ id: string; effectType: string; x: number; y: number }>>([]);
  let showConfetti = $state(false);
  let isSkipping = $state(false);
  let canSkip = $state(false);
  let canReplay = $state(false);
  let battleReplayData = $state<DuelResult | null>(null);

  // Tutorial state
  let showTutorial = $state(false);
  let tutorialCompleted = $state(false);

  // Check if user has seen tutorial
  function checkTutorialStatus() {
    const seen = localStorage.getItem('battle-tutorial-completed');
    if (!seen && !tutorialCompleted) {
      // Auto-show tutorial for first-time visitors
      setTimeout(() => {
        showTutorial = true;
      }, 1000);
    }
  }

  // Run on mount
  $effect(() => {
    if (availableCards.length > 0 && !tutorialCompleted) {
      checkTutorialStatus();
    }
  });

  function handleTutorialComplete() {
    tutorialCompleted = true;
    localStorage.setItem('battle-tutorial-completed', 'true');
    showTutorial = false;
  }

  function handleTutorialSkip() {
    showTutorial = false;
  }

  $effect(() => {
    const collectionData = collection.get();
    const cards: PackCard[] = [];
    for (const pack of collectionData.packs) {
      cards.push(...pack.cards);
    }
    availableCards = cards;

    if (selectedCard && !cards.find((card) => card.id === selectedCard?.id)) {
      selectedCard = null;
    }
    if (opponentCard && !cards.find((card) => card.id === opponentCard?.id)) {
      opponentCard = null;
    }
  });

  function getRarityColor(rarity: string): string {
    return RARITY_CONFIG[rarity as keyof typeof RARITY_CONFIG]?.color || '#9ca3af';
  }

  function selectPlayerCard(card: PackCard) {
    selectedCard = card;
    battleResult = null;
    battleLog = [];
    currentTurn = 0;

    if (opponentCard?.id === card.id) {
      opponentCard = null;
    }
  }

  function rollOpponent() {
    if (!selectedCard) return;

    const pool = availableCards.filter((card) => card.id !== selectedCard?.id);
    if (pool.length === 0) return;

    opponentCard = pool[Math.floor(Math.random() * pool.length)];
    battleResult = null;
    battleLog = [];
    currentTurn = 0;
  }

  $effect(() => {
    if (selectedCard && !opponentCard && availableCards.length > 1) {
      rollOpponent();
    }
  });

  function parseBattleLog(logs: string[]): BattleLogEntry[] {
    const parsedLogs: BattleLogEntry[] = [];
    let currentTurn = 0;

    for (const log of logs) {
      // Battle start
      if (log.includes('⚔️ BATTLE:')) {
        parsedLogs.push({
          turn: 0,
          action: 'Battle Started',
          actor: 'system',
          detail: log.replace('⚔️ BATTLE: ', ''),
          type: 'info'
        });
        continue;
      }

      // Power display
      if (log.includes('power:')) {
        const [cardName, power] = log.split(': ');
        parsedLogs.push({
          turn: 0,
          action: cardName + ' Power',
          actor: 'system',
          detail: power + ' HP',
          type: 'info'
        });
        continue;
      }

      // Type advantage
      if (log.includes('has advantage over')) {
        parsedLogs.push({
          turn: 0,
          action: 'Type Advantage',
          actor: 'system',
          detail: log.split('!')[0] + '!',
          type: 'info'
        });
        continue;
      }

      if (log.includes('at disadvantage against')) {
        parsedLogs.push({
          turn: 0,
          action: 'Type Disadvantage',
          actor: 'system',
          detail: log.split('!')[0] + '!',
          type: 'info'
        });
        continue;
      }

      // Synergy
      if (log.includes('💥 SYNERGY:')) {
        const synergyName = log.match(/SYNERGY: (.+?)!/)?.[1];
        parsedLogs.push({
          turn: currentTurn,
          action: 'Synergy Activated',
          actor: 'system',
          detail: synergyName || 'Unknown synergy',
          type: 'synergy'
        });
        continue;
      }

      // Turn actions
      if (log.startsWith('Turn ')) {
        const turnMatch = log.match(/Turn (\d+):/);
        if (turnMatch) {
          currentTurn = parseInt(turnMatch[1]);
        }

        const actionText = log.substring(log.indexOf(': ') + 2);
        const isPlayerAction = selectedCard && actionText.includes(selectedCard.name);
        const actor = isPlayerAction ? 'player' : 'opponent';

        parsedLogs.push({
          turn: currentTurn,
          action: 'Attack',
          actor,
          detail: actionText,
          type: 'attack'
        });
        continue;
      }

      // Damage
      if (log.includes('→') && log.includes('damage')) {
        const damageMatch = log.match(/→ (\d+) damage/);
        const isCritical = log.includes('CRITICAL');

        if (damageMatch) {
          const damage = parseInt(damageMatch[1]);
          const actor = parsedLogs.length > 0 && parsedLogs[parsedLogs.length - 1].actor === 'player'
            ? 'opponent'
            : 'player';

          parsedLogs.push({
            turn: currentTurn,
            action: 'Damage Dealt',
            actor,
            damage,
            isCritical,
            type: actor === 'player' ? 'counter' : 'attack'
          });
        }
        continue;
      }

      // Status effects
      if (log.includes('Status effects:')) {
        const effects = log.replace('  → Status effects:', '').trim().split(', ');
        const actor = parsedLogs.length > 0 ? parsedLogs[parsedLogs.length - 1].actor : 'player';

        parsedLogs.push({
          turn: currentTurn,
          action: 'Status Effects Applied',
          actor,
          statusEffects: effects,
          type: 'status'
        });
        continue;
      }

      // Counter attack
      if (log.includes('Counter:')) {
        const damageMatch = log.match(/hits back for (\d+) damage/);
        if (damageMatch) {
          parsedLogs.push({
            turn: currentTurn,
            action: 'Counter Attack',
            actor: 'opponent',
            detail: 'Opponent strikes back',
            damage: parseInt(damageMatch[1]),
            type: 'counter'
          });
        }
        continue;
      }

      // HP display
      if (log.includes('HP:')) {
        parsedLogs.push({
          turn: currentTurn,
          action: 'Health Status',
          actor: 'system',
          detail: log.replace('  HP: ', ''),
          type: 'info'
        });
        continue;
      }

      // Victory/Defeat
      if (log.includes('🏆') && log.includes('WINS')) {
        const winnerName = log.match(/🏆 (.+?) WINS/)?.[1];
        const turns = log.match(/in (\d+) turns/)?.[1];
        const isPlayerVictory = selectedCard && winnerName === selectedCard.name;

        parsedLogs.push({
          turn: currentTurn,
          action: 'Battle Ended',
          actor: 'system',
          detail: winnerName + ' wins in ' + turns + ' turns!',
          type: isPlayerVictory ? 'victory' : 'defeat'
        });
        continue;
      }

      // Time's up
      if (log.includes("Time's up!")) {
        const winnerName = log.match(/Time's up! (.+?) wins/)?.[1];
        const isPlayerVictory = selectedCard && winnerName === selectedCard.name;

        parsedLogs.push({
          turn: currentTurn,
          action: 'Time Limit Reached',
          actor: 'system',
          detail: winnerName + ' wins by HP!',
          type: isPlayerVictory ? 'victory' : 'defeat'
        });
        continue;
      }
    }

    return parsedLogs;
  }

  // PACK-012: Trigger screen shake
  function triggerScreenShake(isCritical = false) {
    screenShake = true;
    criticalHitActive = isCritical;

    // Shake for longer if critical hit
    const shakeDuration = isCritical ? 600 : 300;
    setTimeout(() => {
      screenShake = false;
      criticalHitActive = false;
    }, shakeDuration);
  }

  // PACK-012: Create status effect particles
  function createStatusParticles(effectType: string) {
    const particles: Array<{ id: string; effectType: string; x: number; y: number }> = [];

    for (let i = 0; i < 8; i++) {
      particles.push({
        id: `${effectType}-${i}-${Date.now()}`,
        effectType,
        x: Math.random() * 100,
        y: Math.random() * 100,
      });
    }

    statusEffectParticles = [...statusEffectParticles, ...particles];

    // Clear particles after animation
    setTimeout(() => {
      statusEffectParticles = statusEffectParticles.filter(p => !particles.find(pt => pt.id === p.id));
    }, 1500);
  }

  // PACK-012: Trigger confetti on victory
  function triggerConfetti() {
    showConfetti = true;
    setTimeout(() => {
      showConfetti = false;
    }, 3000);
  }

  // PACK-012: Skip animations
  function skipAnimations() {
    isSkipping = true;
    canSkip = false;

    // Fast-forward to end state
    setTimeout(() => {
      battlePhase = 'complete';
      showVictoryScreen = true;
      isBattling = false;
      isSkipping = false;
      canReplay = true;
    }, 100);
  }

  // PACK-012: Replay battle
  function replayBattle() {
    if (!battleReplayData || !selectedCard || !opponentCard) return;

    canReplay = false;
    battleResult = null;
    battleLog = [];
    currentTurn = 0;
    damageNumbers = [];
    showVictoryScreen = false;
    playerStatusEffects = [];
    opponentStatusEffects = [];

    // Re-run battle with same cards
    startDuel();
  }

  async function startDuel() {
    if (!selectedCard || !opponentCard || isBattling) return;

    isBattling = true;
    battlePhase = 'player_attack';
    battleResult = null;
    battleLog = [];
    currentTurn = 0;
    damageNumbers = [];
    showVictoryScreen = false;
    canSkip = true;
    canReplay = false;

    // Player card attacks
    playerAttackAnimation = true;
    await sleep(400);
    playerAttackAnimation = false;

    // Parse battle log for damage numbers
    const result = simulateBattle(selectedCard, opponentCard);
    battleReplayData = result; // Store for replay
    const parsedLogs = parseBattleLog(result.log);
    battleLog = parsedLogs;
    battleResult = result;

    // Update current turn
    if (parsedLogs.length > 0) {
      const lastLog = parsedLogs[parsedLogs.length - 1];
      currentTurn = lastLog.turn;
    }

    // Extract damage numbers and check for critical hits
    const damagePattern = /→ (\d+) damage/g;
    let match;
    let isPlayerTurn = true;
    let hasCriticalHit = false;

    while ((match = damagePattern.exec(result.log.join('\n'))) !== null) {
      const damage = parseInt(match[1]);
      const isCrit = result.log.some(log =>
        log.includes(`${damage} damage`) && log.includes('CRITICAL')
      );

      if (isCrit) hasCriticalHit = true;

      damageNumbers.push({
        id: Math.random().toString(36),
        value: damage,
        isPlayer: isPlayerTurn,
        isCrit
      });
      isPlayerTurn = !isPlayerTurn;
    }

    // PACK-012: Trigger screen shake and critical hit effects
    if (!isSkipping) {
      triggerScreenShake(hasCriticalHit);
      await sleep(hasCriticalHit ? 600 : 300);
    }

    // PACK-012: Check for status effects and create particles
    const statusEffects = result.log.filter(log => log.includes('Status effects:'));
    if (statusEffects.length > 0 && !isSkipping) {
      statusEffects.forEach(statusLog => {
        const effects = statusLog.replace('  → Status effects:', '').trim().split(', ');
        effects.forEach(effect => createStatusParticles(effect));
      });
      await sleep(500);
    }

    // Opponent attacks back
    if (!isSkipping) {
      await sleep(300);
    }
    battlePhase = 'opponent_attack';
    opponentAttackAnimation = true;
    await sleep(400);
    opponentAttackAnimation = false;

    // Show result
    await sleep(500);
    battlePhase = 'complete';
    showVictoryScreen = true;

    // PACK-012: Trigger confetti on victory
    if (playerWins && !isSkipping) {
      triggerConfetti();
    }

    // Clear damage numbers after animation
    setTimeout(() => {
      damageNumbers = [];
    }, 3000);

    isBattling = false;
    canSkip = false;
    canReplay = true;
  }

  function sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  function resetDuel() {
    battleResult = null;
    battleLog = [];
    currentTurn = 0;
    battlePhase = 'idle';
    showVictoryScreen = false;
    damageNumbers = [];
    playerAttackAnimation = false;
    opponentAttackAnimation = false;
    // PACK-011: Clear status effects
    playerStatusEffects = [];
    opponentStatusEffects = [];
  }

  let hasEnoughCards = $derived(availableCards.length > 1);
  let canRollOpponent = $derived(!!selectedCard && availableCards.length > 1);
  let canStartDuel = $derived(!!selectedCard && !!opponentCard && !isBattling);
  let playerWins = $derived(!!battleResult && !!selectedCard && battleResult.winner.id === selectedCard.id);
</script>

<div class="duel-container">
  <div class="duel-header">
    <h1 class="duel-title">Card Duel</h1>
    <p class="duel-subtitle">Pick a card from your collection and run a quick battle.</p>
    <button class="tutorial-trigger" on:click={() => showTutorial = true}>
      <span class="tutorial-icon">?</span>
      <span>How to Battle</span>
    </button>
  </div>

  {#if !hasEnoughCards}
    <div class="empty-state">
      <p>You need cards before you can duel.</p>
      <a class="primary-link" href="/pack">Open Packs</a>
    </div>
  {:else}
    <div class="duel-stage">
      <div class="duel-slot">
        <h2>Your Card</h2>
        <div class="card-container" class:attack-animation={playerAttackAnimation}>
          {#if selectedCard}
            <Card card={selectedCard} size="sm" interactive={false} showBack={false} />
            {#each damageNumbers.filter(d => d.isPlayer) as damage}
              <div class="damage-number" class:critical={damage.isCrit}>
                {damage.isCrit ? '💥 ' : ''}{damage.value}
              </div>
            {/each}
          {:else}
            <div class="card-placeholder">Select a card</div>
          {/if}
        </div>
        <!-- PACK-011: Status effects display -->
        {#if playerStatusEffects.length > 0}
          <div class="status-effects-container">
            {#each playerStatusEffects as effect (effect.type)}
              <StatusIcon {effect} size="sm" />
            {/each}
          </div>
        {/if}
      </div>

      <div class="duel-divider">
        <span>VS</span>
        <div class="divider-glow"></div>
      </div>

      <div class="duel-slot">
        <h2>Opponent</h2>
        <div class="card-container" class:attack-animation={opponentAttackAnimation}>
          {#if opponentCard}
            <Card card={opponentCard} size="sm" interactive={false} showBack={false} />
            {#each damageNumbers.filter(d => !d.isPlayer) as damage}
              <div class="damage-number" class:critical={damage.isCrit}>
                {damage.isCrit ? '💥 ' : ''}{damage.value}
              </div>
            {/each}
          {:else}
            <div class="card-placeholder">Roll opponent</div>
          {/if}
        </div>
        <!-- PACK-011: Status effects display -->
        {#if opponentStatusEffects.length > 0}
          <div class="status-effects-container">
            {#each opponentStatusEffects as effect (effect.type)}
              <StatusIcon {effect} size="sm" />
            {/each}
          </div>
        {/if}
      </div>
    </div>

    <div class="duel-controls">
      <button class="secondary-button" disabled={!canRollOpponent} on:click={rollOpponent}>
        Roll Opponent
      </button>
      <button class="primary-button" disabled={!canStartDuel} on:click={startDuel}>
        Start Duel
      </button>

      <!-- PACK-012: Skip button during battle -->
      {#if canSkip && isBattling}
        <button class="skip-button" on:click={skipAnimations}>
          Skip ⏩
        </button>
      {/if}

      {#if battleResult}
        <button class="ghost-button" on:click={resetDuel}>Reset</button>
      {/if}

      <!-- PACK-012: Replay button -->
      {#if canReplay && selectedCard && opponentCard}
        <button class="replay-button" on:click={replayBattle}>
          🔄 Replay
        </button>
      {/if}
    </div>

    <!-- PACK-012: Confetti effect on victory -->
    {#if showConfetti}
      <div class="confetti-container">
        {#each Array(50) as _, i}
          <div
            class="confetti"
            style="left: {Math.random() * 100}%; animation-delay: {Math.random() * 2}s; animation-duration: {2 + Math.random() * 2}s;"
          ></div>
        {/each}
      </div>
    {/if}

    <!-- PACK-012: Status effect particles -->
    {#if statusEffectParticles.length > 0}
      <div class="status-particles-container">
        {#each statusEffectParticles as particle}
          <div
            class="status-particle"
            style="left: {particle.x}%; top: {particle.y}%;"
          >
            <StatusIcon effect={{ type: particle.effectType as any, duration: 0, stacks: 1 }} size="xs" />
          </div>
        {/each}
      </div>
    {/if}

    <!-- PACK-012: Screen shake effect -->
    {#if screenShake}
      <div class="screen-shake" class:critical={criticalHitActive}></div>
    {/if}

    {#if battleResult}
      <div class="duel-results" class:win={playerWins} class:loss={!playerWins}>
        <h3>{playerWins ? 'Victory' : 'Defeat'}</h3>
        <p>{battleResult.winner.name} wins in {battleResult.turns} turns.</p>
      </div>

      <BattleLog
        logs={battleLog}
        {currentTurn}
        playerCard={selectedCard}
        opponentCard={opponentCard}
        maxHeight="400px"
      />
    {/if}

    {#if showVictoryScreen && battleResult}
      <div class="victory-screen" class:win={playerWins} class:loss={!playerWins}>
        <div class="victory-content">
          <div class="victory-icon">
            {#if playerWins}
              <svg width="120" height="120" viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="60" cy="60" r="55" fill="url(#victory-gradient)" />
                <path d="M35 60L55 80L85 40" stroke="white" stroke-width="8" stroke-linecap="round" stroke-linejoin="round"/>
                <defs>
                  <linearGradient id="victory-gradient" x1="0" y1="0" x2="120" y2="120">
                    <stop offset="0%" stop-color="#fbbf24" />
                    <stop offset="100%" stop-color="#f59e0b" />
                  </linearGradient>
                </defs>
              </svg>
            {:else}
              <svg width="120" height="120" viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="60" cy="60" r="55" fill="url(#defeat-gradient)" />
                <path d="M35 40L85 80M85 40L35 80" stroke="white" stroke-width="8" stroke-linecap="round" stroke-linejoin="round"/>
                <defs>
                  <linearGradient id="defeat-gradient" x1="0" y1="0" x2="120" y2="120">
                    <stop offset="0%" stop-color="#ef4444" />
                    <stop offset="100%" stop-color="#dc2626" />
                  </linearGradient>
                </defs>
              </svg>
            {/if}
          </div>
          <!-- PACK-012: Enhanced victory/defeat titles with animations -->
          <h2 class="victory-title" class:win-title={playerWins} class:defeat-title={!playerWins}>
            {playerWins ? '🏆 VICTORY! 🏆' : '💀 DEFEAT 💀'}
          </h2>
          <p class="victory-subtitle">
            {battleResult.winner.name} wins in {battleResult.turns} turns!
          </p>
          <div class="victory-buttons">
            <button class="victory-button" on:click={resetDuel}>Battle Again</button>
            {#if canReplay}
              <button class="victory-button replay-victory-button" on:click={replayBattle}>
                🔄 Watch Replay
              </button>
            {/if}
          </div>
        </div>
      </div>
    {/if}

    <div class="card-picker">
      <h3>Your Collection</h3>
      <div class="picker-grid">
        {#each availableCards as card (card.id)}
          <button
            class="picker-card"
            class:selected={selectedCard?.id === card.id}
            style:border-color={getRarityColor(card.rarity)}
            on:click={() => selectPlayerCard(card)}
          >
            <span class="picker-name">{card.name}</span>
            <span class="picker-rarity" style:color={getRarityColor(card.rarity)}>
              {RARITY_CONFIG[card.rarity].name}
            </span>
          </button>
        {/each}
      </div>
    </div>
  {/if}
</div>

<!-- Battle Tutorial Overlay -->
<BattleTutorial
  isOpen={showTutorial}
  onComplete={handleTutorialComplete}
  onSkip={handleTutorialSkip}
/>

<style>
  .duel-container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 2rem 1rem 3rem;
  }

  .duel-header {
    text-align: center;
    margin-bottom: 2rem;
  }

  .duel-title {
    font-size: clamp(2rem, 3vw, 2.8rem);
    font-weight: 800;
    letter-spacing: -0.02em;
    margin-bottom: 0.5rem;
  }

  .duel-subtitle {
    color: #94a3b8;
    font-size: 1.05rem;
  }

  .tutorial-trigger {
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    margin-top: 1rem;
    padding: 0.65rem 1.25rem;
    border-radius: 999px;
    background: rgba(59, 130, 246, 0.15);
    border: 1px solid rgba(59, 130, 246, 0.4);
    color: #60a5fa;
    font-weight: 600;
    font-size: 0.9rem;
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .tutorial-trigger:hover {
    background: rgba(59, 130, 246, 0.25);
    border-color: rgba(59, 130, 246, 0.6);
    transform: translateY(-2px);
  }

  .tutorial-icon {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 24px;
    height: 24px;
    border-radius: 50%;
    background: rgba(59, 130, 246, 0.3);
    font-weight: 700;
    font-size: 0.9rem;
  }

  .empty-state {
    text-align: center;
    padding: 3rem 1rem;
    background: rgba(15, 23, 42, 0.6);
    border-radius: 1rem;
  }

  .primary-link {
    display: inline-block;
    margin-top: 1rem;
    padding: 0.65rem 1.6rem;
    border-radius: 999px;
    background: linear-gradient(135deg, #fbbf24, #f59e0b);
    color: #0f172a;
    font-weight: 700;
    text-decoration: none;
  }

  .duel-stage {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
    gap: 1.5rem;
    align-items: center;
    background: radial-gradient(circle at top, rgba(30, 41, 59, 0.9), rgba(15, 23, 42, 0.7));
    border-radius: 1.25rem;
    padding: 2rem;
    border: 1px solid rgba(148, 163, 184, 0.15);
  }

  .duel-slot {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
    align-items: center;
  }

  .duel-slot h2 {
    font-size: 1.1rem;
    font-weight: 700;
  }

  /* PACK-011: Status effects container */
  .status-effects-container {
    display: flex;
    gap: 0.5rem;
    flex-wrap: wrap;
    justify-content: center;
    margin-top: 0.5rem;
    min-height: 2rem;
  }

  .duel-divider {
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.5rem;
    font-weight: 700;
    color: #fbbf24;
  }

  .divider-glow {
    position: absolute;
    width: 120px;
    height: 120px;
    border-radius: 50%;
    background: radial-gradient(circle, rgba(251, 191, 36, 0.35) 0%, transparent 65%);
    filter: blur(4px);
    animation: pulse-glow 2.5s ease-in-out infinite;
  }

  .card-placeholder {
    width: 190px;
    height: 270px;
    border-radius: 1rem;
    border: 2px dashed rgba(148, 163, 184, 0.4);
    display: flex;
    align-items: center;
    justify-content: center;
    color: #94a3b8;
    text-align: center;
    padding: 1rem;
  }

  .duel-controls {
    display: flex;
    flex-wrap: wrap;
    gap: 0.75rem;
    justify-content: center;
    margin: 1.75rem 0 2rem;
  }

  .primary-button,
  .secondary-button,
  .ghost-button {
    padding: 0.7rem 1.75rem;
    border-radius: 999px;
    font-weight: 600;
    border: none;
    cursor: pointer;
    transition: transform 0.2s ease, box-shadow 0.2s ease;
  }

  .primary-button {
    background: linear-gradient(135deg, #fbbf24, #f59e0b);
    color: #0f172a;
    box-shadow: 0 10px 25px rgba(251, 191, 36, 0.25);
  }

  .secondary-button {
    background: #1e293b;
    color: #e2e8f0;
  }

  .ghost-button {
    background: transparent;
    border: 1px solid rgba(148, 163, 184, 0.4);
    color: #e2e8f0;
  }

  .primary-button:disabled,
  .secondary-button:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    box-shadow: none;
  }

  .primary-button:not(:disabled):hover,
  .secondary-button:not(:disabled):hover,
  .ghost-button:hover {
    transform: translateY(-2px);
  }

  .duel-results {
    text-align: center;
    padding: 1.5rem;
    border-radius: 1rem;
    background: rgba(15, 23, 42, 0.7);
    margin-bottom: 1.5rem;
    border: 1px solid transparent;
  }

  .duel-results.win {
    border: 1px solid rgba(34, 197, 94, 0.4);
  }

  .duel-results.loss {
    border: 1px solid rgba(248, 113, 113, 0.4);
  }

  .duel-results h3 {
    font-size: 1.5rem;
    margin-bottom: 0.5rem;
  }

  .card-picker {
    background: rgba(15, 23, 42, 0.6);
    border-radius: 1rem;
    padding: 1.5rem;
    border: 1px solid rgba(148, 163, 184, 0.15);
  }

  .card-picker h3 {
    margin-bottom: 1rem;
    font-weight: 700;
  }

  .picker-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
    gap: 0.75rem;
    max-height: 360px;
    overflow-y: auto;
  }

  .picker-card {
    border: 2px solid transparent;
    border-radius: 0.75rem;
    padding: 0.75rem;
    background: rgba(15, 23, 42, 0.8);
    color: #e2e8f0;
    text-align: left;
    transition: transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease;
    cursor: pointer;
  }

  .picker-card:hover {
    border-color: rgba(251, 191, 36, 0.35);
  }

  .picker-card.selected {
    box-shadow: 0 0 0 2px rgba(251, 191, 36, 0.6);
  }

  .picker-card:hover {
    transform: translateY(-2px);
  }

  .picker-name {
    display: block;
    font-weight: 600;
    margin-bottom: 0.25rem;
  }

  .picker-rarity {
    font-size: 0.75rem;
    font-weight: 600;
  }

  @keyframes pulse-glow {
    0%, 100% {
      opacity: 0.7;
      transform: scale(0.9);
    }
    50% {
      opacity: 1;
      transform: scale(1.05);
    }
  }

  /* Card container for positioning damage numbers */
  .card-container {
    position: relative;
    display: flex;
    justify-content: center;
    align-items: center;
  }

  /* Attack animation - lunge forward */
  .attack-animation {
    animation: attack-lunge 0.4s ease-out;
  }

  @keyframes attack-lunge {
    0% {
      transform: translateX(0);
    }
    50% {
      transform: translateX(30px) scale(1.1);
    }
    100% {
      transform: translateX(0);
    }
  }

  /* Damage number popup */
  .damage-number {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    font-size: 2rem;
    font-weight: 800;
    color: #ef4444;
    text-shadow:
      0 0 10px rgba(239, 68, 68, 0.8),
      0 0 20px rgba(239, 68, 68, 0.6),
      2px 2px 0 rgba(0, 0, 0, 0.5);
    animation: damage-popup 2s ease-out forwards;
    pointer-events: none;
    z-index: 10;
  }

  .damage-number.critical {
    font-size: 2.5rem;
    color: #fbbf24;
    text-shadow:
      0 0 15px rgba(251, 191, 36, 1),
      0 0 30px rgba(251, 191, 36, 0.8),
      0 0 45px rgba(251, 191, 36, 0.6),
      2px 2px 0 rgba(0, 0, 0, 0.5);
    animation: critical-popup 2.5s ease-out forwards;
  }

  @keyframes damage-popup {
    0% {
      opacity: 0;
      transform: translate(-50%, -50%) scale(0.5);
    }
    20% {
      opacity: 1;
      transform: translate(-50%, -80%) scale(1.2);
    }
    40% {
      transform: translate(-50%, -100%) scale(1);
    }
    100% {
      opacity: 0;
      transform: translate(-50%, -150%) scale(0.8);
    }
  }

  @keyframes critical-popup {
    0% {
      opacity: 0;
      transform: translate(-50%, -50%) scale(0.3);
    }
    15% {
      opacity: 1;
      transform: translate(-50%, -80%) scale(1.5);
    }
    30% {
      transform: translate(-50%, -100%) scale(1.3) rotate(-5deg);
    }
    50% {
      transform: translate(-50%, -120%) scale(1.2) rotate(5deg);
    }
    100% {
      opacity: 0;
      transform: translate(-50%, -180%) scale(0.9) rotate(0deg);
    }
  }

  /* Victory/Defeat screen overlay */
  .victory-screen {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    background: rgba(0, 0, 0, 0.85);
    backdrop-filter: blur(8px);
    z-index: 1000;
    animation: fade-in 0.5s ease-out;
  }

  @keyframes fade-in {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }

  .victory-content {
    text-align: center;
    animation: scale-in 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  }

  @keyframes scale-in {
    from {
      opacity: 0;
      transform: scale(0.5);
    }
    to {
      opacity: 1;
      transform: scale(1);
    }
  }

  .victory-icon {
    animation: bounce-in 0.8s cubic-bezier(0.68, -0.55, 0.265, 1.55);
  }

  @keyframes bounce-in {
    0% {
      opacity: 0;
      transform: scale(0);
    }
    50% {
      transform: scale(1.2);
    }
    100% {
      opacity: 1;
      transform: scale(1);
    }
  }

  .victory-title {
    font-size: clamp(2.5rem, 6vw, 4rem);
    font-weight: 900;
    margin: 1.5rem 0 1rem;
    letter-spacing: 0.05em;
    animation: title-pop 0.8s ease-out 0.3s both;
  }

  .victory-screen.win .victory-title {
    background: linear-gradient(135deg, #fbbf24 0%, #f59e0b 50%, #d97706 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    text-shadow: none;
    filter: drop-shadow(0 4px 12px rgba(251, 191, 36, 0.5));
  }

  .victory-screen.loss .victory-title {
    background: linear-gradient(135deg, #ef4444 0%, #dc2626 50%, #b91c1c 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    text-shadow: none;
    filter: drop-shadow(0 4px 12px rgba(239, 68, 68, 0.5));
  }

  @keyframes title-pop {
    0% {
      opacity: 0;
      transform: scale(0.8) translateY(20px);
    }
    100% {
      opacity: 1;
      transform: scale(1) translateY(0);
    }
  }

  .victory-subtitle {
    font-size: 1.25rem;
    color: #e2e8f0;
    margin-bottom: 2rem;
    animation: fade-slide-up 0.6s ease-out 0.5s both;
  }

  @keyframes fade-slide-up {
    0% {
      opacity: 0;
      transform: translateY(20px);
    }
    100% {
      opacity: 1;
      transform: translateY(0);
    }
  }

  .victory-button {
    padding: 1rem 2.5rem;
    font-size: 1.1rem;
    font-weight: 700;
    border: none;
    border-radius: 999px;
    background: linear-gradient(135deg, #fbbf24, #f59e0b);
    color: #0f172a;
    cursor: pointer;
    transition: all 0.3s ease;
    box-shadow: 0 10px 30px rgba(251, 191, 36, 0.4);
    animation: button-appear 0.5s ease-out 0.7s both;
  }

  .victory-button:hover {
    transform: translateY(-3px) scale(1.05);
    box-shadow: 0 15px 40px rgba(251, 191, 36, 0.6);
  }

  .victory-button:active {
    transform: translateY(-1px) scale(1.02);
  }

  @keyframes button-appear {
    0% {
      opacity: 0;
      transform: scale(0.8);
    }
    100% {
      opacity: 1;
      transform: scale(1);
    }
  }

  .victory-screen.win {
    background: radial-gradient(circle at center, rgba(251, 191, 36, 0.2) 0%, rgba(0, 0, 0, 0.85) 70%);
  }

  .victory-screen.loss {
    background: radial-gradient(circle at center, rgba(239, 68, 68, 0.2) 0%, rgba(0, 0, 0, 0.85) 70%);
  }

  /* PACK-012: Enhanced victory/defeat title styling */
  .victory-title.win-title {
    animation: victory-pulse 1.5s ease-in-out infinite;
  }

  .victory-title.defeat-title {
    animation: defeat-shake 0.5s ease-in-out;
  }

  @keyframes victory-pulse {
    0%, 100% {
      transform: scale(1);
      filter: brightness(1);
    }
    50% {
      transform: scale(1.05);
      filter: brightness(1.2);
    }
  }

  @keyframes defeat-shake {
    0%, 100% {
      transform: translateX(0);
    }
    10%, 30%, 50%, 70%, 90% {
      transform: translateX(-5px);
    }
    20%, 40%, 60%, 80% {
      transform: translateX(5px);
    }
  }

  .victory-buttons {
    display: flex;
    gap: 1rem;
    justify-content: center;
    flex-wrap: wrap;
  }

  .replay-victory-button {
    background: linear-gradient(135deg, #3b82f6, #2563eb);
    box-shadow: 0 10px 30px rgba(59, 130, 246, 0.4);
  }

  .replay-victory-button:hover {
    box-shadow: 0 15px 40px rgba(59, 130, 246, 0.6);
  }

  /* PACK-012: Skip button styling */
  .skip-button {
    padding: 0.7rem 1.75rem;
    border-radius: 999px;
    font-weight: 600;
    border: 2px solid rgba(251, 191, 36, 0.6);
    background: rgba(251, 191, 36, 0.15);
    color: #fbbf24;
    cursor: pointer;
    transition: all 0.2s ease;
    animation: skip-pulse 2s ease-in-out infinite;
  }

  .skip-button:hover {
    background: rgba(251, 191, 36, 0.25);
    border-color: rgba(251, 191, 36, 0.8);
    transform: translateY(-2px);
  }

  @keyframes skip-pulse {
    0%, 100% {
      box-shadow: 0 0 0 0 rgba(251, 191, 36, 0.4);
    }
    50% {
      box-shadow: 0 0 0 8px rgba(251, 191, 36, 0);
    }
  }

  /* PACK-012: Replay button styling */
  .replay-button {
    padding: 0.7rem 1.75rem;
    border-radius: 999px;
    font-weight: 600;
    border: 2px solid rgba(59, 130, 246, 0.6);
    background: rgba(59, 130, 246, 0.15);
    color: #60a5fa;
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .replay-button:hover {
    background: rgba(59, 130, 246, 0.25);
    border-color: rgba(59, 130, 246, 0.8);
    transform: translateY(-2px);
  }

  /* PACK-012: Screen shake effect */
  .screen-shake {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    pointer-events: none;
    z-index: 9999;
    animation: shake 0.3s ease-in-out;
  }

  .screen-shake.critical {
    animation: critical-shake 0.6s ease-in-out;
  }

  @keyframes shake {
    0%, 100% {
      transform: translateX(0);
    }
    10%, 30%, 50%, 70%, 90% {
      transform: translateX(-4px);
    }
    20%, 40%, 60%, 80% {
      transform: translateX(4px);
    }
  }

  @keyframes critical-shake {
    0%, 100% {
      transform: translateX(0) translateY(0);
    }
    10%, 30%, 50%, 70%, 90% {
      transform: translateX(-8px) translateY(-2px);
    }
    20%, 40%, 60%, 80% {
      transform: translateX(8px) translateY(2px);
    }
    25%, 75% {
      transform: rotate(-1deg);
    }
    50% {
      transform: rotate(1deg);
    }
  }

  /* PACK-012: Confetti animation */
  .confetti-container {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    pointer-events: none;
    z-index: 9998;
    overflow: hidden;
  }

  .confetti {
    position: absolute;
    width: 10px;
    height: 10px;
    top: -10px;
    background: linear-gradient(135deg, #fbbf24, #f59e0b);
    animation: confetti-fall linear forwards;
    opacity: 0.8;
  }

  .confetti:nth-child(3n) {
    background: linear-gradient(135deg, #ef4444, #dc2626);
  }

  .confetti:nth-child(3n+1) {
    background: linear-gradient(135deg, #3b82f6, #2563eb);
  }

  .confetti:nth-child(3n+2) {
    background: linear-gradient(135deg, #22c55e, #16a34a);
  }

  @keyframes confetti-fall {
    0% {
      top: -10px;
      transform: translateX(0) rotate(0deg);
      opacity: 1;
    }
    100% {
      top: 100vh;
      transform: translateX(100px) rotate(720deg);
      opacity: 0;
    }
  }

  /* PACK-012: Status effect particles */
  .status-particles-container {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    pointer-events: none;
    z-index: 9997;
  }

  .status-particle {
    position: absolute;
    animation: particle-float 1.5s ease-out forwards;
    opacity: 0;
  }

  @keyframes particle-float {
    0% {
      opacity: 0;
      transform: translate(-50%, -50%) scale(0.5);
    }
    20% {
      opacity: 1;
      transform: translate(-50%, -50%) scale(1.2);
    }
    80% {
      opacity: 0.8;
      transform: translate(-50%, -100%) scale(1);
    }
    100% {
      opacity: 0;
      transform: translate(-50%, -150%) scale(0.5);
    }
  }

  /* PACK-012: Defeat greyed out effect */
  .victory-screen.loss .victory-content {
    filter: grayscale(0.8);
  }

  .victory-screen.loss .victory-icon {
    filter: grayscale(1) brightness(0.7);
  }

  /* PACK-012: Performance optimizations for 60fps */
  .duel-stage,
  .victory-screen,
  .confetti-container,
  .status-particles-container,
  .screen-shake {
    will-change: transform, opacity;
  }

  .attack-animation,
  .damage-number,
  .confetti,
  .status-particle {
    will-change: transform, opacity;
    transform: translateZ(0);
    backface-visibility: hidden;
  }

  @media (max-width: 720px) {
    .duel-stage {
      padding: 1.5rem;
    }

    .duel-divider {
      font-size: 1.25rem;
    }

    /* PACK-012: Reduce animations on mobile for better performance */
    @media (prefers-reduced-motion: no-preference) {
      .confetti {
        animation-duration: 1.5s;
      }

      .status-particle {
        animation-duration: 1s;
      }
    }
  }

  /* PACK-012: Respect prefers-reduced-motion */
  @media (prefers-reduced-motion: reduce) {
    .attack-animation,
    .damage-number,
    .screen-shake,
    .confetti,
    .status-particle,
    .victory-title,
    .victory-icon {
      animation: none;
      transition: none;
    }

    .skip-button {
      animation: none;
    }
  }
</style>

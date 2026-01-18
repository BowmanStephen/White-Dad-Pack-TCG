<script lang="ts">
  import type { Card as CardType } from '../../types';

  export interface BattleLogEntry {
    turn: number;
    action: string;
    actor: 'player' | 'opponent' | 'system';
    detail?: string;
    isCritical?: boolean;
    damage?: number;
    statusEffects?: string[];
    type: 'attack' | 'counter' | 'synergy' | 'status' | 'victory' | 'defeat' | 'info';
  }

  interface Props {
    logs?: BattleLogEntry[];
    currentTurn?: number;
    playerCard?: CardType | null;
    opponentCard?: CardType | null;
    maxHeight?: string;
  }

  let { logs = [], currentTurn = 0, playerCard = null, opponentCard = null, maxHeight = '400px' }: Props = $props();

  // Auto-scroll to bottom when new logs are added
  let logContainer: HTMLElement;
  let highlightedLogId: string | null = null;

  $effect(() => {
    if (logs.length > 0 && logContainer) {
      // Scroll to bottom
      logContainer.scrollTop = logContainer.scrollHeight;

      // Highlight latest log
      highlightedLogId = logs[logs.length - 1]?.turn.toString() + '-' + logs[logs.length - 1]?.type;

      // Remove highlight after animation
      setTimeout(() => {
        highlightedLogId = null;
      }, 2000);
    }
  });

  function getLogIcon(type: BattleLogEntry['type']): string {
    switch (type) {
      case 'attack': return '⚔️';
      case 'counter': return '🔄';
      case 'synergy': return '💥';
      case 'status': return '✨';
      case 'victory': return '🏆';
      case 'defeat': return '💀';
      case 'info': return 'ℹ️';
      default: return '•';
    }
  }

  function getActorClass(actor: BattleLogEntry['actor']): string {
    switch (actor) {
      case 'player': return 'actor-player';
      case 'opponent': return 'actor-opponent';
      case 'system': return 'actor-system';
      default: return '';
    }
  }

  function getTypeClass(type: BattleLogEntry['type']): string {
    switch (type) {
      case 'attack': return 'type-attack';
      case 'counter': return 'type-counter';
      case 'synergy': return 'type-synergy';
      case 'status': return 'type-status';
      case 'victory': return 'type-victory';
      case 'defeat': return 'type-defeat';
      case 'info': return 'type-info';
      default: return '';
    }
  }

  function getLogId(log: BattleLogEntry, index: number): string {
    return `${log.turn}-${log.type}-${index}`;
  }

  function isLogHighlighted(logId: string): boolean {
    return logId === highlightedLogId;
  }
</script>

<div class="battle-log-container">
  <div class="battle-log-header">
    <h3>Battle Log</h3>
    {#if logs.length > 0}
      <span class="log-count">{logs.length} actions</span>
    {/if}
  </div>

  {#if logs.length === 0}
    <div class="battle-log-empty">
      <p>No battle actions yet</p>
      <p class="empty-subtext">Start a battle to see the action log</p>
    </div>
  {:else}
    <div
      bind:this={logContainer}
      class="battle-log-entries"
      style:max-height={maxHeight}
    >
      {#each logs as log, index (log.turn + '-' + log.type + '-' + index)}
        <div
          class="battle-log-entry {getActorClass(log.actor)} {getTypeClass(log.type)}"
          class:highlighted={isLogHighlighted(getLogId(log, index))}
          class:current-turn={log.turn === currentTurn}
        >
          <div class="log-icon">{getLogIcon(log.type)}</div>
          <div class="log-content">
            <div class="log-header">
              {#if log.turn > 0}
                <span class="log-turn">Turn {log.turn}</span>
              {/if}
              <span class="log-action">{log.action}</span>
            </div>

            {#if log.detail}
              <div class="log-detail">{log.detail}</div>
            {/if}

            {#if log.damage !== undefined}
              <div class="log-damage" class:critical={log.isCritical}>
                {log.isCritical ? '💥 ' : ''}{log.damage} damage
              </div>
            {/if}

            {#if log.statusEffects && log.statusEffects.length > 0}
              <div class="log-status-effects">
                {#each log.statusEffects as effect}
                  <span class="status-effect-badge">{effect}</span>
                {/each}
              </div>
            {/if}
          </div>
        </div>
      {/each}
    </div>
  {/if}
</div>

<style>
  .battle-log-container {
    background: rgba(15, 23, 42, 0.7);
    border-radius: 1rem;
    border: 1px solid rgba(148, 163, 184, 0.15);
    overflow: hidden;
  }

  .battle-log-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 1rem 1.25rem;
    border-bottom: 1px solid rgba(148, 163, 184, 0.15);
    background: rgba(30, 41, 59, 0.4);
  }

  .battle-log-header h3 {
    font-size: 1.1rem;
    font-weight: 700;
    margin: 0;
  }

  .log-count {
    font-size: 0.8rem;
    font-weight: 600;
    color: #94a3b8;
    background: rgba(148, 163, 184, 0.1);
    padding: 0.25rem 0.6rem;
    border-radius: 999px;
  }

  .battle-log-empty {
    padding: 3rem 1.5rem;
    text-align: center;
    color: #94a3b8;
  }

  .battle-log-empty p {
    margin: 0;
  }

  .empty-subtext {
    font-size: 0.9rem;
    margin-top: 0.5rem;
    opacity: 0.8;
  }

  .battle-log-entries {
    padding: 1rem;
    overflow-y: auto;
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  /* Custom scrollbar */
  .battle-log-entries::-webkit-scrollbar {
    width: 8px;
  }

  .battle-log-entries::-webkit-scrollbar-track {
    background: rgba(15, 23, 42, 0.5);
    border-radius: 4px;
  }

  .battle-log-entries::-webkit-scrollbar-thumb {
    background: rgba(148, 163, 184, 0.3);
    border-radius: 4px;
  }

  .battle-log-entries::-webkit-scrollbar-thumb:hover {
    background: rgba(148, 163, 184, 0.5);
  }

  .battle-log-entry {
    display: flex;
    gap: 0.75rem;
    padding: 0.75rem 1rem;
    border-radius: 0.75rem;
    background: rgba(30, 41, 59, 0.6);
    transition: all 0.3s ease;
    position: relative;
  }

  .battle-log-entry:hover {
    background: rgba(30, 41, 59, 0.8);
    transform: translateX(2px);
  }

  /* Highlight animation for new entries */
  .battle-log-entry.highlighted {
    animation: log-highlight 2s ease-out;
  }

  @keyframes log-highlight {
    0% {
      background: rgba(251, 191, 36, 0.3);
      transform: translateX(-10px);
    }
    10% {
      background: rgba(251, 191, 36, 0.2);
      transform: translateX(5px);
    }
    20% {
      background: rgba(251, 191, 36, 0.15);
      transform: translateX(-2px);
    }
    30% {
      background: rgba(251, 191, 36, 0.1);
      transform: translateX(0);
    }
    100% {
      background: rgba(30, 41, 59, 0.6);
    }
  }

  /* Current turn indicator */
  .battle-log-entry.current-turn {
    border: 1px solid rgba(251, 191, 36, 0.4);
    box-shadow: 0 0 0 1px rgba(251, 191, 36, 0.2);
  }

  .log-icon {
    font-size: 1.25rem;
    line-height: 1;
    flex-shrink: 0;
    width: 28px;
    height: 28px;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .log-content {
    flex: 1;
    min-width: 0;
  }

  .log-header {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    flex-wrap: wrap;
    margin-bottom: 0.25rem;
  }

  .log-turn {
    font-size: 0.7rem;
    font-weight: 700;
    color: #94a3b8;
    background: rgba(148, 163, 184, 0.15);
    padding: 0.15rem 0.4rem;
    border-radius: 4px;
    text-transform: uppercase;
  }

  .log-action {
    font-weight: 600;
    color: #e2e8f0;
  }

  .log-detail {
    font-size: 0.85rem;
    color: #cbd5e1;
    line-height: 1.4;
  }

  .log-damage {
    display: inline-block;
    font-weight: 700;
    color: #ef4444;
    font-size: 0.9rem;
    margin-top: 0.25rem;
  }

  .log-damage.critical {
    color: #fbbf24;
    font-size: 1rem;
  }

  .log-status-effects {
    display: flex;
    flex-wrap: wrap;
    gap: 0.35rem;
    margin-top: 0.5rem;
  }

  .status-effect-badge {
    font-size: 0.75rem;
    font-weight: 600;
    padding: 0.2rem 0.5rem;
    border-radius: 4px;
    background: rgba(139, 92, 246, 0.2);
    color: #c4b5fd;
    border: 1px solid rgba(139, 92, 246, 0.3);
  }

  /* Actor-specific styles */
  .actor-player {
    border-left: 3px solid #22c55e;
  }

  .actor-opponent {
    border-left: 3px solid #ef4444;
  }

  .actor-system {
    border-left: 3px solid #94a3b8;
  }

  /* Type-specific styles */
  .type-synergy {
    background: rgba(251, 191, 36, 0.1);
  }

  .type-synergy .log-action {
    color: #fbbf24;
  }

  .type-victory {
    background: rgba(34, 197, 94, 0.15);
  }

  .type-victory .log-action {
    color: #22c55e;
  }

  .type-defeat {
    background: rgba(239, 68, 68, 0.15);
  }

  .type-defeat .log-action {
    color: #ef4444;
  }

  /* Responsive design */
  @media (max-width: 640px) {
    .battle-log-entries {
      padding: 0.75rem;
    }

    .battle-log-entry {
      padding: 0.6rem 0.75rem;
    }

    .log-icon {
      width: 24px;
      height: 24px;
      font-size: 1rem;
    }
  }
</style>

<script lang="ts">
  /**
   * FriendFinder.svelte
   *
   * Modal for searching and adding friends by username or friend code.
   */

  import { friendState, getMyFriendCode, searchPlayers, sendFriendRequest } from '@/stores/friends';
  import { setFriendFinderOpen } from '@/stores/friends';
  import { profile } from '@/stores/profile';
  import { AVATARS } from '@/types';

  let searchQuery = '';
  let selectedPlayer = $state<typeof $friendState.searchResults[number] | null>(null);
  let requestMessage = '';

  // Close modal
  function close() {
    setFriendFinderOpen(false);
    searchQuery = '';
    selectedPlayer = null;
    requestMessage = '';
  }

  // Search for players
  async function handleSearch() {
    if (searchQuery.trim().length < 3) return;
    await searchPlayers(searchQuery.trim());
  }

  // Send friend request
  async function handleSendRequest() {
    if (!selectedPlayer) return;

    const success = await sendFriendRequest(selectedPlayer.playerId, requestMessage);
    if (success) {
      close();
    }
  }

  // Copy friend code
  function copyFriendCode() {
    const code = getMyFriendCode();
    navigator.clipboard.writeText(code);
  }

  // Select a player from search results
  function selectPlayer(player: typeof $friendState.searchResults[number]) {
    selectedPlayer = player;
  }
</script>

{#if $friendState.isFinderOpen}
  <div class="modal-overlay" on:click={close}>
    <div class="modal-content" on:click|stopPropagation>
      <!-- Header -->
      <div class="modal-header">
        <h2>Add Friends</h2>
        <button class="btn-close" on:click={close}>✕</button>
      </div>

      <!-- Your Friend Code -->
      <div class="friend-code-section">
        <h3>Your Friend Code</h3>
        <div class="code-display">
          <code>{getMyFriendCode()}</code>
          <button class="btn-copy" on:click={copyFriendCode}>📋 Copy</button>
        </div>
        <p class="hint">Share this code with friends so they can add you!</p>
      </div>

      <!-- Search Section -->
      <div class="search-section">
        <h3>Find Players</h3>
        <div class="search-input-group">
          <input
            type="text"
            class="search-input"
            placeholder="Search by username or paste friend code..."
            bind:value={searchQuery}
            on:keydown={(e) => e.key === 'Enter' && handleSearch()}
          />
          <button class="btn-search" on:click={handleSearch}>🔍</button>
        </div>

        <!-- Search Results -->
        {#if $friendState.searchResults.length > 0}
          <div class="search-results">
            {#each $friendState.searchResults as player (player.playerId)}
              <div
                class="player-result"
                class:selected={selectedPlayer?.playerId === player.playerId}
                on:click={() => selectPlayer(player)}
              >
                <div class="player-avatar">
                  {AVATARS[player.avatarId]?.emoji || '👤'}
                </div>
                <div class="player-info">
                  <h4>{player.username}</h4>
                  <p>{player.bio || 'No bio'}</p>
                </div>
                <div class="player-stats">
                  <span>📦 {player.stats.totalPacksOpened}</span>
                  <span>💎 {player.stats.uniqueCards}</span>
                </div>
              </div>
            {/each}
          </div>
        {:else if searchQuery.length >= 3}
          <p class="no-results">No players found. Try a different search.</p>
        {/if}
      </div>

      <!-- Selected Player & Send Request -->
      {#if selectedPlayer}
        <div class="request-section">
          <h3>Send Friend Request</h3>
          <div class="selected-player">
            <div class="player-avatar large">
              {AVATARS[selectedPlayer.avatarId]?.emoji || '👤'}
            </div>
            <div class="player-info">
              <h4>{selectedPlayer.username}</h4>
              <p>{selectedPlayer.bio || 'No bio'}</p>
            </div>
          </div>

          <textarea
            class="request-message"
            placeholder="Add a message (optional)"
            bind:value={requestMessage}
            maxlength="200"
          ></textarea>
          <p class="char-count">{requestMessage.length}/200</p>

          <button class="btn-send" on:click={handleSendRequest}>
            Send Friend Request 📨
          </button>
        </div>
      {/if}

      <!-- Footer Hint -->
      <div class="modal-footer">
        <p>💡 Tip: You can also add friends by username directly!</p>
      </div>
    </div>
  </div>
{/if}

<style>
  .modal-overlay {
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.8);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
    padding: 1rem;
  }

  .modal-content {
    background: linear-gradient(135deg, #1e3a8a 0%, #1e40af 100%);
    border: 2px solid #3b82f6;
    border-radius: 1rem;
    padding: 1.5rem;
    max-width: 500px;
    width: 100%;
    max-height: 90vh;
    overflow-y: auto;
  }

  .modal-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1.5rem;
  }

  .modal-header h2 {
    font-size: 1.5rem;
    font-weight: 700;
    color: #ffffff;
    margin: 0;
  }

  .btn-close {
    background: transparent;
    border: none;
    color: #9ca3af;
    font-size: 1.5rem;
    cursor: pointer;
    padding: 0.25rem;
    line-height: 1;
    transition: color 0.2s ease;
  }

  .btn-close:hover {
    color: #ffffff;
  }

  .friend-code-section {
    background: rgba(0, 0, 0, 0.3);
    border-radius: 0.75rem;
    padding: 1rem;
    margin-bottom: 1.5rem;
    text-align: center;
  }

  .friend-code-section h3 {
    font-size: 1rem;
    color: #d1d5db;
    margin: 0 0 0.75rem 0;
  }

  .code-display {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.75rem;
    margin-bottom: 0.5rem;
  }

  .code-display code {
    font-size: 1.5rem;
    font-weight: 700;
    color: #fbbf24;
    font-family: monospace;
    letter-spacing: 0.125em;
  }

  .btn-copy {
    background: #3b82f6;
    border: none;
    border-radius: 0.375rem;
    padding: 0.5rem 0.75rem;
    color: #ffffff;
    font-size: 0.875rem;
    font-weight: 500;
    cursor: pointer;
    transition: background 0.2s ease;
  }

  .btn-copy:hover {
    background: #2563eb;
  }

  .hint {
    font-size: 0.875rem;
    color: #9ca3af;
    margin: 0;
  }

  .search-section {
    margin-bottom: 1.5rem;
  }

  .search-section h3 {
    font-size: 1rem;
    color: #d1d5db;
    margin: 0 0 0.75rem 0;
  }

  .search-input-group {
    display: flex;
    gap: 0.5rem;
    margin-bottom: 1rem;
  }

  .search-input {
    flex: 1;
    background: rgba(0, 0, 0, 0.3);
    border: 1px solid #3b82f6;
    border-radius: 0.375rem;
    padding: 0.75rem 1rem;
    color: #ffffff;
    font-size: 1rem;
  }

  .search-input::placeholder {
    color: #6b7280;
  }

  .search-input:focus {
    outline: none;
    border-color: #60a5fa;
    box-shadow: 0 0 0 3px rgba(96, 165, 250, 0.2);
  }

  .btn-search {
    background: #3b82f6;
    border: none;
    border-radius: 0.375rem;
    padding: 0.75rem 1rem;
    color: #ffffff;
    font-size: 1.25rem;
    cursor: pointer;
    transition: background 0.2s ease;
  }

  .btn-search:hover {
    background: #2563eb;
  }

  .search-results {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    max-height: 200px;
    overflow-y: auto;
  }

  .player-result {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    background: rgba(0, 0, 0, 0.2);
    border: 1px solid #3b82f6;
    border-radius: 0.5rem;
    padding: 0.75rem;
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .player-result:hover {
    background: rgba(59, 130, 246, 0.2);
    border-color: #60a5fa;
  }

  .player-result.selected {
    background: rgba(59, 130, 246, 0.3);
    border-color: #fbbf24;
  }

  .player-avatar {
    width: 2.5rem;
    height: 2.5rem;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.5rem;
    background: rgba(255, 255, 255, 0.1);
    border-radius: 50%;
    flex-shrink: 0;
  }

  .player-avatar.large {
    width: 4rem;
    height: 4rem;
    font-size: 2.5rem;
  }

  .player-info {
    flex: 1;
    min-width: 0;
  }

  .player-info h4 {
    font-size: 1rem;
    font-weight: 600;
    color: #ffffff;
    margin: 0 0 0.25rem 0;
  }

  .player-info p {
    font-size: 0.875rem;
    color: #9ca3af;
    margin: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .player-stats {
    display: flex;
    gap: 0.75rem;
    font-size: 0.875rem;
    color: #d1d5db;
  }

  .no-results {
    text-align: center;
    color: #9ca3af;
    font-size: 0.875rem;
    margin: 1rem 0;
  }

  .request-section {
    background: rgba(0, 0, 0, 0.3);
    border-radius: 0.75rem;
    padding: 1rem;
  }

  .request-section h3 {
    font-size: 1rem;
    color: #d1d5db;
    margin: 0 0 1rem 0;
  }

  .selected-player {
    display: flex;
    align-items: center;
    gap: 1rem;
    margin-bottom: 1rem;
  }

  .request-message {
    width: 100%;
    background: rgba(0, 0, 0, 0.3);
    border: 1px solid #3b82f6;
    border-radius: 0.375rem;
    padding: 0.75rem;
    color: #ffffff;
    font-size: 0.875rem;
    font-family: inherit;
    resize: vertical;
    min-height: 80px;
    margin-bottom: 0.25rem;
  }

  .request-message:focus {
    outline: none;
    border-color: #60a5fa;
  }

  .char-count {
    text-align: right;
    font-size: 0.75rem;
    color: #6b7280;
    margin-bottom: 1rem;
  }

  .btn-send {
    width: 100%;
    background: #22c55e;
    border: none;
    border-radius: 0.375rem;
    padding: 0.875rem;
    color: #ffffff;
    font-size: 1rem;
    font-weight: 600;
    cursor: pointer;
    transition: background 0.2s ease;
  }

  .btn-send:hover {
    background: #16a34a;
  }

  .modal-footer {
    margin-top: 1.5rem;
    padding-top: 1rem;
    border-top: 1px solid rgba(59, 130, 246, 0.3);
  }

  .modal-footer p {
    text-align: center;
    font-size: 0.875rem;
    color: #9ca3af;
    margin: 0;
  }

  @media (max-width: 640px) {
    .modal-content {
      padding: 1rem;
      max-height: 95vh;
    }

    .modal-header h2 {
      font-size: 1.25rem;
    }

    .code-display code {
      font-size: 1.25rem;
    }
  }
</style>

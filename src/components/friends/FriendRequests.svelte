<script lang="ts">
  /**
   * FriendRequests.svelte
   *
   * Displays incoming friend requests with accept/reject actions.
   */

  import { friendState, acceptFriendRequest, rejectFriendRequest, getPendingRequestCount } from '@/stores/friends';
  import { AVATARS } from '@/types';

  // Handle accept request
  async function handleAccept(requestId: string) {
    await acceptFriendRequest(requestId);
  }

  // Handle reject request
  async function handleReject(requestId: string) {
    await rejectFriendRequest(requestId);
  }
</script>

<div class="friend-requests">
  {#if $friendState.pendingRequests.length === 0}
    <div class="empty-state">
      <div class="empty-icon">📭</div>
      <h3>No Pending Requests</h3>
      <p>When someone sends you a friend request, it will appear here.</p>
    </div>
  {:else}
    <div class="requests-list">
      {#each $friendState.pendingRequests as request (request.id)}
        {#if request.status === 'pending'}
          <div class="request-card">
            <!-- Sender info -->
            <div class="request-sender">
              <div class="sender-avatar">
                {AVATARS[request.fromAvatarId]?.emoji || '👤'}
              </div>
              <div class="sender-info">
                <h4>{request.fromUsername}</h4>
                {#if request.message}
                  <p class="request-message">"{request.message}"</p>
                {/if}
                <p class="request-time">
                  Requested {new Date(request.createdAt).toLocaleDateString()}
                </p>
              </div>
            </div>

            <!-- Actions -->
            <div class="request-actions">
              <button
                class="btn-accept"
                on:click={() => handleAccept(request.id)}
                title="Accept friend request"
              >
                ✓ Accept
              </button>
              <button
                class="btn-reject"
                on:click={() => handleReject(request.id)}
                title="Decline friend request"
              >
                ✕ Decline
              </button>
            </div>
          </div>
        {/if}
      {/each}
    </div>
  {/if}
</div>

<style>
  .friend-requests {
    width: 100%;
  }

  .empty-state {
    text-align: center;
    padding: 3rem 1rem;
    color: #9ca3af;
  }

  .empty-icon {
    font-size: 4rem;
    margin-bottom: 1rem;
    opacity: 0.5;
  }

  .empty-state h3 {
    font-size: 1.5rem;
    color: #ffffff;
    margin-bottom: 0.5rem;
  }

  .empty-state p {
    font-size: 0.875rem;
    margin: 0;
  }

  .requests-list {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
  }

  .request-card {
    background: linear-gradient(135deg, #1e3a8a 0%, #1e40af 100%);
    border: 2px solid #fbbf24;
    border-radius: 0.75rem;
    padding: 1rem;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 1rem;
  }

  .request-sender {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    flex: 1;
    min-width: 0;
  }

  .sender-avatar {
    width: 3rem;
    height: 3rem;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.75rem;
    background: rgba(255, 255, 255, 0.1);
    border-radius: 50%;
    border: 2px solid #fbbf24;
    flex-shrink: 0;
  }

  .sender-info {
    min-width: 0;
  }

  .sender-info h4 {
    font-size: 1rem;
    font-weight: 600;
    color: #ffffff;
    margin: 0 0 0.25rem 0;
  }

  .request-message {
    font-size: 0.875rem;
    color: #fbbf24;
    font-style: italic;
    margin: 0 0 0.25rem 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .request-time {
    font-size: 0.75rem;
    color: #9ca3af;
    margin: 0;
  }

  .request-actions {
    display: flex;
    gap: 0.5rem;
    flex-shrink: 0;
  }

  .request-actions button {
    padding: 0.625rem 1rem;
    border: none;
    border-radius: 0.375rem;
    font-size: 0.875rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s ease;
    white-space: nowrap;
  }

  .btn-accept {
    background: #22c55e;
    color: #ffffff;
  }

  .btn-accept:hover {
    background: #16a34a;
    transform: scale(1.05);
  }

  .btn-reject {
    background: #dc2626;
    color: #ffffff;
  }

  .btn-reject:hover {
    background: #b91c1c;
    transform: scale(1.05);
  }

  @media (max-width: 640px) {
    .request-card {
      flex-direction: column;
      align-items: stretch;
    }

    .request-sender {
      width: 100%;
    }

    .request-actions {
      width: 100%;
    }

    .request-actions button {
      flex: 1;
    }
  }
</style>

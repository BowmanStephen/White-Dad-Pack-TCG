<script lang="ts">
  import { profile, viewMode, updateUsername, updateAvatar, updateBio, updateFavoriteCard, getAllAvatars, getAvatar } from '@/stores/profile';
  import { collection } from '@/stores/collection';
  import { getAllCards } from '@/lib/cards/database';
  import type { AvatarId, Card } from '@/types';
  import { AVATARS } from '@/types';

  // Get all cards for favorite card selection
  const allCards = getAllCards();

  // Local state for form inputs
  let username = $profile?.username || '';
  let bio = $profile?.bio || '';
  let selectedAvatar = $profile?.avatarId || 'grill_master';
  let selectedFavoriteCardId = $profile?.favoriteCardId || null;

  // Character counter for bio
  $: bioCharsRemaining = 140 - bio.length;
  $: bioIsValid = bioCharsRemaining >= 0;

  // Get all avatars
  const allAvatars = getAllAvatars();

  // Get unique cards from collection for favorite card selection
  $: uniqueCards = getUniqueCardsFromCollection();

  function getUniqueCardsFromCollection(): Card[] {
    if (!$collection) return [];
    const uniqueIds = $collection.metadata.uniqueCards;
    return allCards.filter((card) => uniqueIds.includes(card.id));
  }

  // Handle save
  function handleSave() {
    if (!username.trim()) {
      alert('Please enter a username');
      return;
    }

    if (!bioIsValid) {
      alert('Bio must be 140 characters or less');
      return;
    }

    updateUsername(username);
    updateAvatar(selectedAvatar);
    updateBio(bio);
    updateFavoriteCard(selectedFavoriteCardId);

    viewMode.set('view');
  }

  // Handle cancel
  function handleCancel() {
    // Reset to current profile values
    username = $profile?.username || '';
    bio = $profile?.bio || '';
    selectedAvatar = $profile?.avatarId || 'grill_master';
    selectedFavoriteCardId = $profile?.favoriteCardId || null;
    viewMode.set('view');
  }

  // Handle avatar selection
  function selectAvatar(avatarId: AvatarId) {
    selectedAvatar = avatarId;
  }

  // Handle favorite card selection
  function selectFavoriteCard(cardId: string | null) {
    selectedFavoriteCardId = cardId;
  }
</script>

<div class="profile-editor">
  <div class="editor-header mb-6">
    <h2 class="text-2xl font-bold text-white mb-1">Edit Profile</h2>
    <p class="text-gray-400 text-sm">Customize your dad identity</p>
  </div>

  <!-- Username Input -->
  <div class="form-group mb-6">
    <label class="block text-sm font-medium text-gray-300 mb-2">
      Username
    </label>
    <input
      type="text"
      bind:value={username}
      placeholder="Enter your username"
      class="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
      maxlength={30}
    />
    <p class="text-xs text-gray-500 mt-1">{username.length}/30 characters</p>
  </div>

  <!-- Avatar Selection -->
  <div class="form-group mb-6">
    <label class="block text-sm font-medium text-gray-300 mb-3">
      Select Your Avatar
    </label>
    <div class="avatar-grid grid grid-cols-5 gap-3">
      {#each allAvatars as avatar}
        <button
          class="avatar-option {selectedAvatar === avatar.id ? 'selected' : ''}"
          on:click={() => selectAvatar(avatar.id)}
          title={avatar.name}
        >
          <div class="avatar-emoji text-4xl">{avatar.emoji}</div>
          <div class="avatar-name text-xs mt-1">{avatar.name}</div>
        </button>
      {/each}
    </div>
  </div>

  <!-- Bio Input -->
  <div class="form-group mb-6">
    <label class="block text-sm font-medium text-gray-300 mb-2">
      Bio
    </label>
    <textarea
      bind:value={bio}
      placeholder="Tell other dads about yourself..."
      class="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all resize-none"
      rows={3}
      maxlength={140}
    ></textarea>
    <p class="text-xs {bioIsValid ? 'text-gray-500' : 'text-red-400'} mt-1">
      {bioCharsRemaining} characters remaining
    </p>
  </div>

  <!-- Favorite Card Selection -->
  <div class="form-group mb-6">
    <label class="block text-sm font-medium text-gray-300 mb-3">
      Favorite Card
    </label>
    {#if uniqueCards.length > 0}
      <div class="favorite-cards-grid grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
        <!-- None option -->
        <button
          class="favorite-card-option {selectedFavoriteCardId === null ? 'selected' : ''}"
          on:click={() => selectFavoriteCard(null)}
        >
          <div class="card-placeholder flex items-center justify-center h-24 rounded-lg bg-white/5 border border-white/10">
            <span class="text-gray-500 text-sm">None</span>
          </div>
        </button>

        {#each uniqueCards as card}
          <button
            class="favorite-card-option {selectedFavoriteCardId === card.id ? 'selected' : ''}"
            on:click={() => selectFavoriteCard(card.id)}
            title={card.name}
          >
            <div class="card-thumbnail h-24 rounded-lg bg-gradient-to-br from-blue-500/20 to-purple-500/20 border border-white/10 overflow-hidden">
              <img
                src={card.artwork}
                alt={card.name}
                class="w-full h-full object-cover"
                loading="lazy"
              />
            </div>
            <div class="card-name text-xs mt-1 truncate">{card.name}</div>
          </button>
        {/each}
      </div>
    {:else}
      <div class="empty-favorites p-4 rounded-lg bg-white/5 border border-white/10 text-center">
        <p class="text-gray-400 text-sm">Open some packs to unlock cards for your favorite!</p>
      </div>
    {/if}
  </div>

  <!-- Action Buttons -->
  <div class="form-actions flex gap-3">
    <button
      on:click={handleSave}
      class="flex-1 px-6 py-3 rounded-lg bg-gradient-to-r from-orange-500 to-red-500 text-white font-semibold hover:from-orange-600 hover:to-red-600 transition-all transform hover:scale-105 active:scale-95"
    >
      Save Changes
    </button>
    <button
      on:click={handleCancel}
      class="px-6 py-3 rounded-lg bg-white/5 border border-white/10 text-white font-semibold hover:bg-white/10 transition-all"
    >
      Cancel
    </button>
  </div>
</div>

<style>
  .profile-editor {
    animation: slideIn 0.3s ease-out;
  }

  @keyframes slideIn {
    from {
      opacity: 0;
      transform: translateY(10px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  .avatar-option {
    @apply p-3 rounded-lg bg-white/5 border border-white/10 transition-all hover:bg-white/10 hover:scale-105;
  }

  .avatar-option.selected {
    @apply bg-orange-500/20 border-orange-500 ring-2 ring-orange-500/50;
  }

  .avatar-emoji {
    filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.3));
  }

  .favorite-card-option {
    @apply transition-all hover:scale-105;
  }

  .favorite-card-option.selected .card-thumbnail {
    @apply ring-2 ring-orange-500;
  }

  .card-thumbnail :global(img) {
    transition: transform 0.3s ease;
  }

  .card-thumbnail:hover :global(img) {
    transform: scale(1.1);
  }
</style>

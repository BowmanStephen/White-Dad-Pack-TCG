<script lang="ts">
  import type { PlayerProfile, AvatarId, ProfileSettings } from '@/types';
  import { AVATARS } from '@/types';

  interface Props {
    profile: PlayerProfile;
    onSave: (settings: Partial<PlayerProfile>) => void;
    onCancel: () => void;
  }

  let { profile, onSave, onCancel }: Props = $props();

  let username = $state(profile.username);
  let pseudonym = $state(profile.pseudonym);
  let bio = $state(profile.bio);
  let avatarId = $state(profile.avatarId);
  let selectedAvatar = $state(avatarId);

  function handleSave() {
    const settings: ProfileSettings = {
      username: username.trim(),
      avatarId: selectedAvatar,
      bio: bio.trim(),
      favoriteCardId: profile.favoriteCardId,
    };

    onSave({
      username: settings.username,
      avatarId: settings.avatarId,
      bio: settings.bio,
      favoriteCardId: settings.favoriteCardId,
      pseudonym: pseudonym.trim(),
    });
  }

  function selectAvatar(id: AvatarId) {
    selectedAvatar = id;
  }
</script>

<div class="profile-editor">
  <div class="editor-header">
    <h2>Edit Profile</h2>
    <button class="close-btn" on:click={onCancel} aria-label="Close">✕</button>
  </div>

  <form on:submit|preventDefault={handleSave} class="editor-form">
    <!-- Avatar Selection -->
    <section class="form-section">
      <h3>Choose Your Avatar</h3>
      <div class="avatar-grid">
        {#each Object.entries(AVATARS) as [id, avatar]}
          {@const isSelected = selectedAvatar === id}
          <button
            type="button"
            class="avatar-option"
            class:selected={isSelected}
            on:click={() => selectAvatar(id as AvatarId)}
            aria-label={avatar.name}
            aria-pressed={isSelected}
          >
            <span class="avatar-emoji">{avatar.emoji}</span>
            <span class="avatar-name">{avatar.name}</span>
          </button>
        {/each}
      </div>
    </section>

    <!-- Username -->
    <section class="form-section">
      <label for="username">
        Username
        <span class="label-hint">@</span>
      </label>
      <input
        id="username"
        type="text"
        bind:value={username}
        placeholder="Dad_123456"
        required
        minlength="3"
        maxlength="20"
        pattern="[a-zA-Z0-9_]+"
        class="input-field"
      />
      <span class="field-hint">3-20 characters, letters, numbers, and underscores only</span>
    </section>

    <!-- Display Name -->
    <section class="form-section">
      <label for="pseudonym">
        Display Name
      </label>
      <input
        id="pseudonym"
        type="text"
        bind:value={pseudonym}
        placeholder="Grillmaster Gary"
        required
        minlength="2"
        maxlength="30"
        class="input-field"
      />
      <span class="field-hint">This is how other players will see you</span>
    </section>

    <!-- Bio -->
    <section class="form-section">
      <label for="bio">Bio</label>
      <textarea
        id="bio"
        bind:value={bio}
        placeholder="Tell us about yourself..."
        maxlength="150"
        rows="4"
        class="textarea-field"
      ></textarea>
      <span class="field-hint">{bio.length} / 150 characters</span>
    </section>

    <!-- Actions -->
    <div class="form-actions">
      <button type="button" class="btn-cancel" on:click={onCancel}>
        Cancel
      </button>
      <button type="submit" class="btn-save" disabled={username.trim().length < 3 || pseudonym.trim().length < 2}>
        Save Changes
      </button>
    </div>
  </form>
</div>

<style>
  .profile-editor {
    padding: 2rem;
  }

  .editor-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 2rem;
    padding-bottom: 1rem;
    border-bottom: 2px solid #e5e7eb;
  }

  .editor-header h2 {
    font-size: 1.75rem;
    font-weight: 700;
    margin: 0;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }

  .close-btn {
    width: 36px;
    height: 36px;
    border: none;
    background: #f3f4f6;
    border-radius: 50%;
    font-size: 1.25rem;
    cursor: pointer;
    transition: all 0.2s;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .close-btn:hover {
    background: #e5e7eb;
    transform: rotate(90deg);
  }

  .editor-form {
    display: flex;
    flex-direction: column;
    gap: 2rem;
  }

  .form-section {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
  }

  .form-section h3 {
    font-size: 1.1rem;
    font-weight: 600;
    margin: 0;
    color: #374151;
  }

  label {
    font-size: 0.95rem;
    font-weight: 600;
    color: #374151;
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  .label-hint {
    font-weight: 400;
    color: #9ca3af;
  }

  .input-field,
  .textarea-field {
    width: 100%;
    padding: 0.75rem;
    border: 2px solid #e5e7eb;
    border-radius: 8px;
    font-size: 1rem;
    font-family: inherit;
    transition: border-color 0.2s, box-shadow 0.2s;
  }

  .input-field:focus,
  .textarea-field:focus {
    outline: none;
    border-color: #667eea;
    box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
  }

  .textarea-field {
    resize: vertical;
    min-height: 100px;
  }

  .field-hint {
    font-size: 0.875rem;
    color: #6b7280;
  }

  /* Avatar Grid */
  .avatar-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
    gap: 0.75rem;
  }

  .avatar-option {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.5rem;
    padding: 1rem;
    border: 2px solid #e5e7eb;
    border-radius: 12px;
    background: white;
    cursor: pointer;
    transition: all 0.2s;
  }

  .avatar-option:hover {
    border-color: #667eea;
    transform: translateY(-2px);
    box-shadow: 0 4px 8px rgba(102, 126, 234, 0.2);
  }

  .avatar-option.selected {
    border-color: #667eea;
    background: linear-gradient(135deg, rgba(102, 126, 234, 0.1), rgba(118, 75, 162, 0.1));
    box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.2);
  }

  .avatar-option .avatar-emoji {
    font-size: 2.5rem;
    line-height: 1;
  }

  .avatar-option .avatar-name {
    font-size: 0.85rem;
    font-weight: 600;
    color: #374151;
    text-align: center;
  }

  /* Form Actions */
  .form-actions {
    display: flex;
    gap: 1rem;
    justify-content: flex-end;
    padding-top: 1rem;
    border-top: 2px solid #e5e7eb;
  }

  .btn-cancel,
  .btn-save {
    padding: 0.75rem 1.5rem;
    font-size: 1rem;
    font-weight: 600;
    border: none;
    border-radius: 8px;
    cursor: pointer;
    transition: all 0.2s;
  }

  .btn-cancel {
    background: #f3f4f6;
    color: #374151;
  }

  .btn-cancel:hover {
    background: #e5e7eb;
  }

  .btn-save {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
  }

  .btn-save:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 4px 8px rgba(102, 126, 234, 0.4);
  }

  .btn-save:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  /* Responsive */
  @media (max-width: 640px) {
    .avatar-grid {
      grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
    }

    .form-actions {
      flex-direction: column-reverse;
    }

    .btn-cancel,
    .btn-save {
      width: 100%;
    }
  }
</style>

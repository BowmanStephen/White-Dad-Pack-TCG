<script lang="ts">
  import { RARITY_CONFIG } from '@/types';

  interface Props {
    label?: string;
    checked?: boolean;
    disabled?: boolean;
    error?: string;
    size?: 'sm' | 'md' | 'lg';
    rarity?: keyof typeof RARITY_CONFIG;
    onchange?: (checked: boolean) => void;
  }

  let {
    label = '',
    checked = $bindable(false),
    disabled = false,
    error = '',
    size = 'md',
    rarity,
    onchange,
  }: Props = $props();

  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6',
  };

  const labelSizeClasses = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base',
  };

  const rarityColor = rarity ? RARITY_CONFIG[rarity].color : '#fbbf24';

  function handleChange(e: Event) {
    const target = e.target as HTMLInputElement;
    checked = target.checked;
    onchange?.(checked);
  }
</script>

<div class="checkbox-container" class:has-error={error}>
  <div class="checkbox-wrapper">
    <input
      type="checkbox"
      class="checkbox-input {sizeClasses[size]}"
      bind:checked={checked}
      disabled={disabled}
      on:change={handleChange}
      style="--rarity-color: {rarityColor};"
    />
    <span class="checkbox-box {sizeClasses[size]}" aria-hidden="true">
      {#if checked}
        <span class="checkbox-tick">✓</span>
      {/if}
    </span>
  </div>

  {#if label}
    <label class="checkbox-label {labelSizeClasses[size]}">
      {label}
      {#if error}
        <span class="checkbox-error-badge" aria-label="error">!</span>
      {/if}
    </label>
  {/if}

  {#if error}
    <div class="checkbox-error">{error}</div>
  {/if}
</div>

<style>
  .checkbox-container {
    display: flex;
    flex-direction: column;
    gap: 0.375rem;
    align-items: flex-start;
  }

  .checkbox-wrapper {
    position: relative;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
  }

  .checkbox-input {
    position: absolute;
    opacity: 0;
    cursor: pointer;
    width: 100%;
    height: 100%;
    margin: 0;
    padding: 0;
  }

  .checkbox-input:disabled {
    cursor: not-allowed;
  }

  .checkbox-input:disabled + .checkbox-box {
    opacity: 0.5;
  }

  .checkbox-box {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    background: rgba(15, 23, 42, 0.6);
    border: 1.5px solid rgba(71, 85, 105, 0.3);
    border-radius: 0.375rem;
    transition: all 0.2s cubic-bezier(0.34, 1.56, 0.64, 1);
    flex-shrink: 0;
  }

  .checkbox-wrapper:hover .checkbox-box {
    border-color: rgba(71, 85, 105, 0.5);
    background: rgba(15, 23, 42, 0.8);
  }

  .checkbox-input:checked + .checkbox-box {
    background: linear-gradient(135deg, var(--rarity-color), var(--rarity-color)dd);
    border-color: var(--rarity-color);
    box-shadow:
      0 0 0 3px rgba(71, 85, 105, 0.1),
      inset 0 0 0 1px var(--rarity-color)33;
  }

  .checkbox-input:focus + .checkbox-box {
    border-color: var(--rarity-color);
    box-shadow:
      0 0 0 3px rgba(71, 85, 105, 0.1),
      inset 0 0 0 1px var(--rarity-color)33;
  }

  .checkbox-container.has-error .checkbox-box {
    border-color: #ef4444;
  }

  .checkbox-container.has-error .checkbox-input:checked + .checkbox-box {
    background: linear-gradient(135deg, #ef4444, #dc2626);
    border-color: #ef4444;
    box-shadow:
      0 0 0 3px rgba(239, 68, 68, 0.1),
      inset 0 0 0 1px #ef444433;
  }

  .checkbox-tick {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    color: white;
    font-weight: 700;
    font-size: 0.625rem;
    animation: popIn 0.2s cubic-bezier(0.34, 1.56, 0.64, 1);
  }

  @keyframes popIn {
    0% {
      opacity: 0;
      transform: scale(0);
    }
    100% {
      opacity: 1;
      transform: scale(1);
    }
  }

  .checkbox-label {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-weight: 500;
    color: #e2e8f0;
    user-select: none;
    cursor: pointer;
  }

  .checkbox-error-badge {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 1rem;
    height: 1rem;
    background: #ef4444;
    color: white;
    border-radius: 50%;
    font-size: 0.5rem;
    font-weight: 700;
  }

  .checkbox-error {
    font-size: 0.75rem;
    color: #ef4444;
    font-weight: 500;
    padding: 0 0 0 1.75rem;
  }

  /* Accessibility */
  @media (prefers-reduced-motion: reduce) {
    .checkbox-box,
    .checkbox-input:checked + .checkbox-box,
    .checkbox-tick {
      transition: none !important;
      animation: none !important;
    }
  }

  @media (prefers-color-scheme: dark) {
    .checkbox-label {
      color: #cbd5e1;
    }
  }
</style>

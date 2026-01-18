<script lang="ts">
  import { RARITY_CONFIG } from '@/types';

  interface Props {
    label?: string;
    placeholder?: string;
    value?: string;
    type?: string;
    disabled?: boolean;
    error?: string;
    helperText?: string;
    size?: 'sm' | 'md' | 'lg';
    iconLeft?: string;
    iconRight?: string;
    rarity?: keyof typeof RARITY_CONFIG;
    onchange?: (value: string) => void;
    onblur?: () => void;
    onfocus?: () => void;
  }

  let {
    label = '',
    placeholder = '',
    value = $bindable(''),
    type = 'text',
    disabled = false,
    error = '',
    helperText = '',
    size = 'md',
    iconLeft = '',
    iconRight = '',
    rarity,
    onchange,
    onblur,
    onfocus,
  }: Props = $props();

  let isFocused = $state(false);

  const sizeClasses = {
    sm: 'h-8 text-sm px-2.5',
    md: 'h-10 text-base px-3',
    lg: 'h-12 text-lg px-4',
  };

  function handleInput(e: Event) {
    const target = e.target as HTMLInputElement;
    value = target.value;
    onchange?.(value);
  }

  function handleFocus() {
    isFocused = true;
    onfocus?.();
  }

  function handleBlur() {
    isFocused = false;
    onblur?.();
  }

  const rarityColor = rarity ? RARITY_CONFIG[rarity].color : '#fbbf24';
</script>

<div class="form-input-container">
  {#if label}
    <label class="form-label-enhanced">
      {label}
      {#if error}
        <span class="form-error-badge">!</span>
      {/if}
    </label>
  {/if}

  <div class="input-wrapper" class:has-error={error} class:is-focused={isFocused}>
    {#if iconLeft}
      <span class="input-icon-left" aria-hidden="true">{iconLeft}</span>
    {/if}

    <input
      type={type}
      placeholder={placeholder}
      value={value}
      disabled={disabled}
      class="form-input {sizeClasses[size]}"
      style="--rarity-color: {rarityColor};"
      on:input={handleInput}
      on:focus={handleFocus}
      on:blur={handleBlur}
    />

    {#if iconRight}
      <span class="input-icon-right" aria-hidden="true">{iconRight}</span>
    {/if}
  </div>

  {#if error || helperText}
    <div class="form-hint-text" class:is-error={error}>
      {error || helperText}
    </div>
  {/if}
</div>

<style>
  .form-input-container {
    display: flex;
    flex-direction: column;
    gap: 0.375rem;
    width: 100%;
  }

  .input-wrapper {
    position: relative;
    display: flex;
    align-items: center;
    background: rgba(15, 23, 42, 0.6);
    border: 1.5px solid rgba(71, 85, 105, 0.3);
    border-radius: 0.5rem;
    transition: all 0.2s cubic-bezier(0.34, 1.56, 0.64, 1);
    overflow: hidden;
  }

  .input-wrapper:hover:not(:disabled) {
    border-color: rgba(71, 85, 105, 0.5);
    background: rgba(15, 23, 42, 0.8);
  }

  .input-wrapper.is-focused {
    border-color: var(--rarity-color);
    background: rgba(15, 23, 42, 0.95);
    box-shadow: 0 0 0 3px rgba(71, 85, 105, 0.1);
  }

  .input-wrapper.has-error {
    border-color: #ef4444;
  }

  .input-icon-left {
    margin-left: 0.75rem;
    margin-right: 0.25rem;
    color: #64748b;
  }

  .input-icon-right {
    margin-right: 0.75rem;
    margin-left: 0.25rem;
    color: #64748b;
  }

  .form-input {
    flex: 1;
    background: transparent;
    border: none;
    color: white;
    font-size: inherit;
    padding: 0 0.375rem;
    outline: none;
  }

  .form-input::placeholder {
    color: #475569;
  }

  .form-input:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
</style>

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

const sizeIconClasses = {
  sm: 'w-4 h-4 text-xs',
  md: 'w-5 h-5 text-sm',
  lg: 'w-6 h-6 text-base',
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

const rarityColor = $derived.by(() => (rarity ? RARITY_CONFIG[rarity].color : '#fbbf24'));
const inputId = `input-${Math.random().toString(36).slice(2)}`;
</script>

<div class="form-input-container">
  {#if label}
    <label class="form-label" for={inputId}>
      {label}
      {#if error}
        <span class="form-error-badge">!</span>
      {/if}
    </label>
  {/if}

  <div class="input-wrapper" class:has-error={error} class:is-focused={isFocused}>
    {#if iconLeft}
      <span class="input-icon input-icon-left {sizeIconClasses[size]}" aria-hidden="true">
        {iconLeft}
      </span>
    {/if}

    <input
      id={inputId}
      {type}
      {placeholder}
      {value}
      {disabled}
      class="form-input {sizeClasses[size]}"
      style="--rarity-color: {rarityColor};"
      oninput={handleInput}
      onfocus={handleFocus}
      onblur={handleBlur}
    />

    {#if iconRight}
      <span class="input-icon input-icon-right {sizeIconClasses[size]}" aria-hidden="true">
        {iconRight}
      </span>
    {/if}

    {#if error}
      <span class="input-error-indicator" aria-hidden="true">✕</span>
    {/if}
  </div>

  {#if error || helperText}
    <div class="form-hint" class:is-error={error}>
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

.form-label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
  font-weight: 600;
  color: #94a3b8;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  user-select: none;
  cursor: text;
}

.form-error-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 1.125rem;
  height: 1.125rem;
  background: #ef4444;
  color: white;
  border-radius: 50%;
  font-size: 0.625rem;
  font-weight: 700;
  animation: shake 0.3s cubic-bezier(0.36, 0, 0.66, -0.56);
}

@keyframes shake {
  0%,
  100% {
    transform: translateX(0);
  }
  25% {
    transform: translateX(-4px);
  }
  75% {
    transform: translateX(4px);
  }
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
  box-shadow:
    0 0 0 3px rgba(71, 85, 105, 0.1),
    inset 0 0 0 1px var(--rarity-color) 33;
}

.input-wrapper.has-error {
  border-color: #ef4444;
}

.input-wrapper.has-error.is-focused {
  box-shadow:
    0 0 0 3px rgba(239, 68, 68, 0.1),
    inset 0 0 0 1px #ef444433;
}

.input-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: #64748b;
  flex-shrink: 0;
}

.input-icon-left {
  margin-left: 0.75rem;
  margin-right: 0.25rem;
}

.input-icon-right {
  margin-right: 0.75rem;
  margin-left: 0.25rem;
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

.form-input:autofill,
.form-input:-webkit-autofill {
  -webkit-box-shadow: inset 0 0 0 1000px rgba(15, 23, 42, 0.8) !important;
  -webkit-text-fill-color: white !important;
}

.input-error-indicator {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 1.25rem;
  height: 1.25rem;
  margin-right: 0.5rem;
  color: #ef4444;
  font-weight: 700;
  font-size: 0.875rem;
  flex-shrink: 0;
}

.form-hint {
  font-size: 0.75rem;
  color: #64748b;
  padding: 0 0.5rem;
  transition: color 0.2s;
}

.form-hint.is-error {
  color: #ef4444;
  font-weight: 500;
}

/* Accessibility */
@media (prefers-reduced-motion: reduce) {
  .form-input-container,
  .input-wrapper,
  .form-label {
    transition: none !important;
    animation: none !important;
  }
}

/* Dark mode (already in place) */
@media (prefers-color-scheme: dark) {
  .form-label {
    color: #cbd5e1;
  }

  .input-wrapper {
    background: rgba(15, 23, 42, 0.8);
  }
}
</style>

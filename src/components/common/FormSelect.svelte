<script lang="ts">
import { RARITY_CONFIG } from '@/types';

interface Option {
  value: string;
  label: string;
  icon?: string;
  disabled?: boolean;
}

interface Props {
  label?: string;
  options: Option[];
  value?: string;
  disabled?: boolean;
  error?: string;
  helperText?: string;
  size?: 'sm' | 'md' | 'lg';
  rarity?: keyof typeof RARITY_CONFIG;
  onchange?: (value: string) => void;
}

let {
  label = '',
  options = [],
  value = $bindable(''),
  disabled = false,
  error = '',
  helperText = '',
  size = 'md',
  rarity,
  onchange,
}: Props = $props();

let isOpen = $state(false);
let searchQuery = $state('');

const sizeClasses = {
  sm: 'h-8 text-sm px-2.5',
  md: 'h-10 text-base px-3',
  lg: 'h-12 text-lg px-4',
};

const selectedOption = $derived(options.find(o => o.value === value));
const filteredOptions = $derived(
  options.filter(o => o.label.toLowerCase().includes(searchQuery.toLowerCase()))
);

const rarityColor = $derived.by(() => (rarity ? RARITY_CONFIG[rarity].color : '#fbbf24'));
const selectId = `select-${Math.random().toString(36).slice(2)}`;
const labelId = `${selectId}-label`;

function handleSelect(optionValue: string) {
  value = optionValue;
  onchange?.(optionValue);
  isOpen = false;
  searchQuery = '';
}

function toggleDropdown() {
  if (!disabled) {
    isOpen = !isOpen;
    searchQuery = '';
  }
}

function handleClickOutside(e: MouseEvent) {
  const target = e.target as HTMLElement;
  if (!target.closest('.select-container')) {
    isOpen = false;
  }
}

function handleKeyDown(e: KeyboardEvent) {
  if (!isOpen) {
    if (e.key === 'Enter' || e.key === ' ') {
      toggleDropdown();
    }
    return;
  }

  if (e.key === 'Escape') {
    isOpen = false;
    searchQuery = '';
  }
}
</script>

<svelte:window onclick={handleClickOutside} />

<div class="form-input-container">
  {#if label}
    <span class="form-label" id={labelId}>
      {label}
      {#if error}
        <span class="form-error-badge">!</span>
      {/if}
    </span>
  {/if}

  <div class="select-container" class:has-error={error} class:is-open={isOpen}>
    <button
      type="button"
      id={selectId}
      class="select-button {sizeClasses[size]}"
      class:is-open={isOpen}
      {disabled}
      style="--rarity-color: {rarityColor};"
      onclick={toggleDropdown}
      onkeydown={handleKeyDown}
      aria-haspopup="listbox"
      aria-expanded={isOpen}
      aria-labelledby={label ? labelId : undefined}
      aria-label={label ? undefined : 'Select an option'}
    >
      <span class="select-button-content">
        {#if selectedOption?.icon}
          <span class="select-icon" aria-hidden="true">{selectedOption.icon}</span>
        {/if}
        <span class="select-button-text">
          {selectedOption?.label || 'Select an option'}
        </span>
      </span>
      <span class="select-chevron" class:is-rotated={isOpen} aria-hidden="true"> ▼ </span>
    </button>

    {#if isOpen}
      <div class="select-dropdown">
        <div class="select-list" role="listbox">
          {#each filteredOptions as option}
            <button
              type="button"
              role="option"
              class="select-option"
              class:is-selected={option.value === value}
              disabled={option.disabled}
              onclick={() => handleSelect(option.value)}
              aria-selected={option.value === value ? 'true' : 'false'}
            >
              {#if option.icon}
                <span class="option-icon" aria-hidden="true">{option.icon}</span>
              {/if}
              <span class="option-label">{option.label}</span>
            </button>
          {/each}

          {#if filteredOptions.length === 0}
            <div class="select-empty">No options found</div>
          {/if}
        </div>
      </div>
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
}

.select-container {
  position: relative;
  width: 100%;
}

.select-button {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  background: rgba(15, 23, 42, 0.6);
  border: 1.5px solid rgba(71, 85, 105, 0.3);
  border-radius: 0.5rem;
  color: white;
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.34, 1.56, 0.64, 1);
  font-size: inherit;
  text-align: left;
}

.select-button:hover:not(:disabled) {
  border-color: rgba(71, 85, 105, 0.5);
  background: rgba(15, 23, 42, 0.8);
}

.select-button.is-open {
  border-color: var(--rarity-color);
  background: rgba(15, 23, 42, 0.95);
  box-shadow:
    0 0 0 3px rgba(71, 85, 105, 0.1),
    inset 0 0 0 1px var(--rarity-color) 33;
}

.select-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.select-container.has-error .select-button {
  border-color: #ef4444;
}

.select-container.has-error .select-button.is-open {
  box-shadow:
    0 0 0 3px rgba(239, 68, 68, 0.1),
    inset 0 0 0 1px #ef444433;
}

.select-button-content {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex: 1;
  min-width: 0;
}

.select-icon {
  flex-shrink: 0;
  font-size: 1rem;
}

.select-button-text {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.select-chevron {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 1.25rem;
  height: 1.25rem;
  margin-left: 0.5rem;
  font-size: 0.625rem;
  color: #94a3b8;
  transition: transform 0.2s cubic-bezier(0.34, 1.56, 0.64, 1);
  flex-shrink: 0;
}

.select-chevron.is-rotated {
  transform: rotateZ(180deg);
}

.select-dropdown {
  position: absolute;
  top: calc(100% + 0.5rem);
  left: 0;
  right: 0;
  background: rgba(15, 23, 42, 0.98);
  border: 1px solid rgba(71, 85, 105, 0.5);
  border-radius: 0.5rem;
  overflow: hidden;
  z-index: 100;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.4);
  animation: slideDown 0.15s cubic-bezier(0.34, 1.56, 0.64, 1);
}

@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateY(-8px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.select-list {
  max-height: 200px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
}

.select-option {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  width: 100%;
  padding: 0.75rem 1rem;
  background: transparent;
  border: none;
  color: white;
  cursor: pointer;
  text-align: left;
  font-size: 0.875rem;
  transition: background 0.15s;
  border-bottom: 1px solid rgba(71, 85, 105, 0.2);
}

.select-option:last-child {
  border-bottom: none;
}

.select-option:hover:not(:disabled) {
  background: rgba(71, 85, 105, 0.1);
}

.select-option:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.select-option.is-selected {
  background: rgba(251, 191, 36, 0.1);
  color: #fbbf24;
  font-weight: 600;
}

.option-icon {
  flex-shrink: 0;
  font-size: 1rem;
}

.option-label {
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.select-empty {
  padding: 1rem;
  text-align: center;
  color: #64748b;
  font-size: 0.875rem;
}

.input-error-indicator {
  position: absolute;
  right: 0.75rem;
  top: 50%;
  transform: translateY(-50%);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: #ef4444;
  font-weight: 700;
  font-size: 0.875rem;
}

.form-hint {
  font-size: 0.75rem;
  color: #64748b;
  padding: 0 0.5rem;
}

.form-hint.is-error {
  color: #ef4444;
  font-weight: 500;
}

/* Accessibility */
@media (prefers-reduced-motion: reduce) {
  .select-button,
  .select-chevron,
  .select-dropdown {
    transition: none !important;
    animation: none !important;
  }
}
</style>

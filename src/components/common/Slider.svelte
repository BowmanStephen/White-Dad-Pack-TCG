<script lang="ts">
  import type { Snippet } from 'svelte';

  interface Props {
    value: number;
    min?: number;
    max?: number;
    step?: number;
    label?: string;
    icon?: Snippet;
    showValue?: boolean;
    disabled?: boolean;
    ariaLabel?: string;
  }

  let {
    value,
    min = 0,
    max = 100,
    step = 1,
    label,
    icon,
    showValue = true,
    disabled = false,
    ariaLabel,
  }: Props = $props();

  // Local state for display percentage
  const displayValue = $derived(Math.round(value));
  const percentage = $derived((value - min) / (max - min) * 100);

  function handleInput(e: Event) {
    const target = e.target as HTMLInputElement;
    value = parseFloat(target.value);
  }

  function handleChange(e: Event) {
    const target = e.target as HTMLInputElement;
    value = parseFloat(target.value);
    // Dispatch custom event for parent components
    dispatch('change', { detail: value });
  }

  function formatLabel(val: number): string {
    return `${Math.round(val)}%`;
  }
</script>

<div class="slider-container" class:disabled={disabled}>
  {#if label || icon}
    <div class="slider-header">
      {#if icon}
        <div class="slider-icon">
          {@render icon()}
        </div>
      {/if}
      {#if label}
        <label for="slider" class="slider-label">
          {label}
        </label>
      {/if}
      {#if showValue}
        <span class="slider-value" aria-live="polite">{formatLabel(displayValue)}</span>
      {/if}
    </div>
  {/if}

  <div class="slider-track-container">
    <div class="slider-track-fill" style="width: {percentage}%"></div>
    <input
      id="slider"
      type="range"
      {min}
      {max}
      {step}
      {value}
      {disabled}
      oninput={handleInput}
      onchange={handleChange}
      class="slider-input"
      aria-label={ariaLabel || label}
      aria-valuenow={displayValue}
      aria-valuemin={min}
      aria-valuemax={max}
    />
  </div>
</div>

<style>
  .slider-container {
    --slider-track-height: 8px;
    --slider-thumb-size: 20px;
    --slider-track-bg: #334155;
    --slider-track-fill: #fbbf24;
    --slider-thumb-bg: #f8fafc;
    --slider-thumb-shadow: 0 2px 6px rgba(0, 0, 0, 0.3);
  }

  .slider-header {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    margin-bottom: 0.75rem;
  }

  .slider-icon {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 1.5rem;
    height: 1.5rem;
    color: #94a3b8;
  }

  .slider-icon :global(svg) {
    width: 100%;
    height: 100%;
  }

  .slider-label {
    flex: 1;
    font-size: 0.875rem;
    font-weight: 500;
    color: #f8fafc;
    user-select: none;
  }

  .slider-value {
    font-size: 0.875rem;
    font-weight: 600;
    color: #fbbf24;
    min-width: 3rem;
    text-align: right;
    font-feature-settings: 'tnum';
    font-variant-numeric: tabular-nums;
  }

  .slider-track-container {
    position: relative;
    width: 100%;
    height: var(--slider-track-height);
    background: var(--slider-track-bg);
    border-radius: 9999px;
    overflow: visible;
  }

  .slider-track-fill {
    position: absolute;
    top: 0;
    left: 0;
    height: 100%;
    background: linear-gradient(90deg, #fbbf24, #f59e0b);
    border-radius: 9999px;
    pointer-events: none;
    transition: width 0.1s ease;
    box-shadow: 0 0 10px rgba(251, 191, 36, 0.3);
  }

  .slider-input {
    position: absolute;
    top: 50%;
    left: 0;
    width: 100%;
    height: 100%;
    transform: translateY(-50%);
    opacity: 0;
    cursor: pointer;
    z-index: 1;
  }

  /* Custom thumb styling using webkit-slider-thumb */
  .slider-input::-webkit-slider-thumb {
    -webkit-appearance: none;
    appearance: none;
    width: var(--slider-thumb-size);
    height: var(--slider-thumb-size);
    background: var(--slider-thumb-bg);
    border-radius: 50%;
    cursor: pointer;
    box-shadow: var(--slider-thumb-shadow);
    transition: transform 0.2s ease, box-shadow 0.2s ease;
    position: relative;
    z-index: 2;
  }

  .slider-input::-moz-range-thumb {
    width: var(--slider-thumb-size);
    height: var(--slider-thumb-size);
    background: var(--slider-thumb-bg);
    border: none;
    border-radius: 50%;
    cursor: pointer;
    box-shadow: var(--slider-thumb-shadow);
    transition: transform 0.2s ease, box-shadow 0.2s ease;
    position: relative;
    z-index: 2;
  }

  .slider-input::-webkit-slider-thumb:hover {
    transform: scale(1.1);
    box-shadow: 0 4px 12px rgba(251, 191, 36, 0.4);
  }

  .slider-input::-moz-range-thumb:hover {
    transform: scale(1.1);
    box-shadow: 0 4px 12px rgba(251, 191, 36, 0.4);
  }

  .slider-input:active::-webkit-slider-thumb {
    transform: scale(1.15);
    box-shadow: 0 6px 16px rgba(251, 191, 36, 0.5);
  }

  .slider-input:active::-moz-range-thumb {
    transform: scale(1.15);
    box-shadow: 0 6px 16px rgba(251, 191, 36, 0.5);
  }

  /* Focus styles */
  .slider-input:focus-visible {
    outline: none;
  }

  .slider-input:focus-visible::-webkit-slider-thumb {
    box-shadow: 0 0 0 3px rgba(251, 191, 36, 0.3), 0 4px 12px rgba(251, 191, 36, 0.4);
  }

  .slider-input:focus-visible::-moz-range-thumb {
    box-shadow: 0 0 0 3px rgba(251, 191, 36, 0.3), 0 4px 12px rgba(251, 191, 36, 0.4);
  }

  /* Disabled state */
  .slider-container.disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .slider-container.disabled .slider-input {
    cursor: not-allowed;
  }

  .slider-container.disabled .slider-track-fill {
    background: #475569;
    box-shadow: none;
  }
</style>

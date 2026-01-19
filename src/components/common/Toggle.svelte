<script lang="ts">
  interface Props {
    checked: boolean;
    label?: string;
    disabled?: boolean;
    ariaLabel?: string;
    size?: 'sm' | 'md' | 'lg';
  }

  let {
    checked,
    label,
    disabled = false,
    ariaLabel,
    size = 'md',
  }: Props = $props();

  const sizes = {
    sm: { track: 'w-8 h-5', thumb: 'w-3 h-3' },
    md: { track: 'w-11 h-6', thumb: 'w-4 h-4' },
    lg: { track: 'w-14 h-8', thumb: 'w-5 h-5' },
  };

  function handleChange() {
    if (!disabled) {
      checked = !checked;
      dispatch('change', { detail: checked });
    }
  }

  function handleKeydown(e: KeyboardEvent) {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleChange();
    }
  }
</script>

<button
  class="toggle-container"
  class:disabled={disabled}
  class:size-sm={size === 'sm'}
  class:size-md={size === 'md'}
  class:size-lg={size === 'lg'}
  onclick={handleChange}
  onkeydown={handleKeydown}
  disabled={disabled}
  role="switch"
  aria-checked={checked}
  aria-label={ariaLabel || label}
  type="button"
>
  <span class="toggle-track {sizes[size].track}" class:checked>
    <span class="toggle-thumb {sizes[size].thumb}" class:checked></span>
  </span>

  {#if label}
    <span class="toggle-label">{label}</span>
  {/if}
</button>

<style>
  .toggle-container {
    display: inline-flex;
    align-items: center;
    gap: 0.75rem;
    padding: 0;
    background: transparent;
    border: none;
    cursor: pointer;
    transition: opacity 0.2s ease;
  }

  .toggle-container:hover:not(.disabled) .toggle-track {
    background: #475569;
  }

  .toggle-container:hover:not(.disabled) .toggle-track.checked {
    background: #f59e0b;
  }

  .toggle-container:active:not(.disabled) .toggle-thumb {
    transform: scale(0.95);
  }

  .toggle-track {
    position: relative;
    display: inline-flex;
    align-items: center;
    border-radius: 9999px;
    background: #334155;
    transition: background 0.2s ease, transform 0.2s ease;
    flex-shrink: 0;
  }

  .toggle-track.checked {
    background: linear-gradient(135deg, #fbbf24, #f59e0b);
    box-shadow: 0 0 10px rgba(251, 191, 36, 0.3);
  }

  .toggle-thumb {
    position: absolute;
    left: 2px;
    background: #f8fafc;
    border-radius: 50%;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
    transition: transform 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  }

  .toggle-thumb.checked {
    transform: translateX(calc(100% + 4px));
  }

  /* Size variants */
  .size-sm .toggle-thumb {
    transform: translateX(calc(100% + 2px));
  }

  .size-md .toggle-thumb {
    transform: translateX(calc(100% + 4px));
  }

  .size-lg .toggle-thumb {
    transform: translateX(calc(100% + 6px));
  }

  .size-sm .toggle-thumb.checked {
    transform: translateX(calc(100% + 2px));
  }

  .size-md .toggle-thumb.checked {
    transform: translateX(calc(100% + 4px));
  }

  .size-lg .toggle-thumb.checked {
    transform: translateX(calc(100% + 6px));
  }

  .toggle-label {
    font-size: 0.875rem;
    font-weight: 500;
    color: #f8fafc;
    user-select: none;
  }

  /* Focus styles */
  .toggle-container:focus-visible {
    outline: none;
  }

  .toggle-container:focus-visible .toggle-track {
    box-shadow: 0 0 0 3px rgba(251, 191, 36, 0.3);
  }

  .toggle-container:focus-visible .toggle-track.checked {
    box-shadow: 0 0 0 3px rgba(251, 191, 36, 0.3), 0 0 10px rgba(251, 191, 36, 0.3);
  }

  /* Disabled state */
  .toggle-container.disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .toggle-container.disabled .toggle-track {
    background: #1e293b;
  }

  .toggle-container.disabled .toggle-track.checked {
    background: #64748b;
    box-shadow: none;
  }
</style>

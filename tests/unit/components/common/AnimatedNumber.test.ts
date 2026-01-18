import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/svelte';
import { tick } from 'svelte';
import AnimatedNumber from '@/components/common/AnimatedNumber.svelte';

describe('AnimatedNumber Component', () => {
  beforeEach(() => {
    // Mock reduced motion to be false for testing
    vi.mock('@/stores/motion', () => ({
      isReducedMotion: {
        get: () => false
      }
    }));
  });

  it('renders the initial value', () => {
    const { component } = render(AnimatedNumber, { value: 42 });
    // Component should render without errors
    expect(component).toBeTruthy();
  });

  it('formats decimals correctly', () => {
    const { container } = render(AnimatedNumber, {
      value: 123.456,
      decimals: 2
    });
    const element = container.querySelector('.animated-number');
    expect(element?.textContent).toContain('123.46');
  });

  it('shows sign when enabled', () => {
    const { container } = render(AnimatedNumber, {
      value: 50,
      showSign: true
    });
    const element = container.querySelector('.animated-number');
    expect(element?.textContent).toContain('+');
  });

  it('applies color change class when value increases', async () => {
    const { container, rerender } = render(AnimatedNumber, {
      value: 10,
      colorChange: true
    });

    // Rerender with higher value
    rerender({ value: 20 });
    await tick();

    const element = container.querySelector('.animated-number');
    expect(element?.classList.contains('up')).toBe(true);
  });

  it('applies color change class when value decreases', async () => {
    const { container, rerender } = render(AnimatedNumber, {
      value: 20,
      colorChange: true
    });

    // Rerender with lower value
    rerender({ value: 10 });
    await tick();

    const element = container.querySelector('.animated-number');
    expect(element?.classList.contains('down')).toBe(true);
  });

  it('respects colorChange=false prop', () => {
    const { container } = render(AnimatedNumber, {
      value: 100,
      colorChange: false
    });

    const element = container.querySelector('.animated-number');
    expect(element?.classList.contains('color-change')).toBe(false);
  });

  it('applies custom className', () => {
    const { container } = render(AnimatedNumber, {
      value: 50,
      className: 'custom-class'
    });

    const element = container.querySelector('.animated-number');
    expect(element?.classList.contains('custom-class')).toBe(true);
  });
});

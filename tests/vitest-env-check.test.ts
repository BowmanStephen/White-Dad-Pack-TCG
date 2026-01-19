import { describe, it, expect } from 'vitest';

describe('Vitest Environment Test', () => {
  it('should have document defined', () => {
    expect(typeof document).toBe('object');
    expect(document.body).toBeTruthy();
  });

  it('should have window defined', () => {
    expect(typeof window).toBe('object');
    expect(window.location).toBeTruthy();
  });

  it('should have navigator defined', () => {
    expect(typeof navigator).toBe('object');
  });
});

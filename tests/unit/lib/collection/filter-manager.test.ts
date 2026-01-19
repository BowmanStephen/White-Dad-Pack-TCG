import { describe, it, expect } from 'vitest';
import { FilterManager, DEFAULT_FILTER_STATE } from '@/lib/collection/filter-manager';
import type { CollectionDisplayCard, Rarity, DadType } from '@/types';

describe('FilterManager', () => {
  it('should initialize with default state', () => {
    const manager = new FilterManager();
    const state = manager.getState();

    expect(state.searchTerm).toBe('');
    expect(state.rarity).toBeNull();
    expect(state.types.size).toBe(0);
    expect(state.holoOnly).toBe(false);
    expect(state.sort).toBe('rarity_desc');
  });

  it('should initialize with custom state', () => {
    const manager = new FilterManager({
      searchTerm: 'test',
      rarity: 'rare' as Rarity,
    });
    const state = manager.getState();

    expect(state.searchTerm).toBe('test');
    expect(state.rarity).toBe('rare');
  });

  it('should update state', () => {
    const manager = new FilterManager();
    manager.updateState({ searchTerm: 'new term' });

    const state = manager.getState();
    expect(state.searchTerm).toBe('new term');
  });

  it('should detect active filters', () => {
    const manager1 = new FilterManager();
    expect(manager1.hasActiveFilters()).toBe(false);

    const manager2 = new FilterManager({ searchTerm: 'test' });
    expect(manager2.hasActiveFilters()).toBe(true);

    const manager3 = new FilterManager({ holoOnly: true });
    expect(manager3.hasActiveFilters()).toBe(true);
  });

  it('should reset to default state', () => {
    const manager = new FilterManager({
      searchTerm: 'test',
      rarity: 'epic' as Rarity,
      holoOnly: true,
    });

    manager.reset();
    const state = manager.getState();

    expect(state.searchTerm).toBe('');
    expect(state.rarity).toBeNull();
    expect(state.holoOnly).toBe(false);
  });

  it('should generate URL params', () => {
    const manager = new FilterManager({
      rarity: 'rare' as Rarity,
      sort: 'name_asc' as any,
    });

    const params = manager.getURLParams();
    expect(params.rarity).toBe('rare');
    expect(params.sort).toBe('name_asc');
  });

  it('should apply filters to empty card array', () => {
    const manager = new FilterManager();
    const filtered = manager.applyFilters([]);

    expect(filtered).toHaveLength(0);
  });

  it('should preserve immutability of state', () => {
    const manager = new FilterManager();
    const state1 = manager.getState();
    manager.updateState({ searchTerm: 'test' });
    const state2 = manager.getState();

    expect(state1).not.toBe(state2);
    expect(state1.searchTerm).toBe('');
    expect(state2.searchTerm).toBe('test');
  });
});

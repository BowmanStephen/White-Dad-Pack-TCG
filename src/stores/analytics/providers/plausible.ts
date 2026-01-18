import type { AnalyticsProvider, AnyAnalyticsEvent, AnalyticsConfig } from '@/types';
import { analyticsConfig } from '../../analytics';

// ============================================================================
// PLAUSIBLE ANALYTICS PROVIDER
// ============================================================================

class PlausibleProvider implements AnalyticsProvider {
  name = 'Plausible';
  initialized = false;
  private domain: string | null = null;
  private apiEndpoint: string = 'https://plausible.io/api/event';

  async initialize(config: AnalyticsConfig): Promise<void> {
    if (!config.providers.plausible?.enabled) {
      return;
    }

    this.domain = config.providers.plausible.domain;

    if (!this.domain) {
      console.warn('[Plausible] Domain not provided, skipping initialization');
      return;
    }

    // Custom Plausible instance support
    if (typeof window !== 'undefined' && (window as any).PLAUSIBLE_BASE_URL) {
      this.apiEndpoint = `${(window as any).PLAUSIBLE_BASE_URL}/api/event`;
    }

    this.initialized = true;
    console.log('[Plausible] Initialized with domain:', this.domain);
  }

  async trackEvent(event: AnyAnalyticsEvent): Promise<void> {
    if (!this.initialized) {
      return;
    }

    try {
      // Convert analytics event to Plausible event format
      const plausibleEvent = this.convertToPlausibleEvent(event);

      // Send to Plausible using their custom event API
      await this.sendEventToPlausible(plausibleEvent);
    } catch (error) {
      console.error('[Plausible] Failed to track event:', error);
    }
  }

  private async sendEventToPlausible(event: {
    name: string;
    props: Record<string, string | number>;
  }): Promise<void> {
    if (typeof window === 'undefined') return;

    // Check if Plausible script is loaded (uses window.plausible)
    if ((window as any).plausible) {
      (window as any).plausible(event.name, { props: event.props });
      return;
    }

    // Fallback: Send directly to Plausible API
    // This works even if the Plausible script isn't loaded
    await fetch(this.apiEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: event.name,
        url: window.location.href,
        domain: this.domain,
        props: event.props,
      }),
    });
  }

  private convertToPlausibleEvent(event: AnyAnalyticsEvent): {
    name: string;
    props: Record<string, string | number>;
  } {
    const baseProps = {
      event_id: event.id,
      timestamp: event.timestamp,
    };

    switch (event.type) {
      case 'pack_open':
        return {
          name: 'Pack Open',
          props: {
            ...baseProps,
            pack_id: event.data.packId,
            card_count: event.data.cardCount,
          },
        };

      case 'card_reveal':
        return {
          name: 'Card Reveal',
          props: {
            ...baseProps,
            pack_id: event.data.packId,
            card_position: event.data.cardIndex + 1,
            card_rarity: event.data.rarity,
            is_holo: event.data.isHolo ? 'yes' : 'no',
            holo_type: event.data.holoType,
            reveal_method: event.data.autoRevealed ? 'auto' : 'manual',
          },
        };

      case 'pack_complete':
        return {
          name: 'Pack Complete',
          props: {
            ...baseProps,
            pack_id: event.data.packId,
            card_count: event.data.cardCount,
            best_rarity: event.data.bestRarity,
            holo_count: event.data.holoCount,
            duration_ms: event.data.duration,
            was_skipped: event.data.skipped ? 'yes' : 'no',
          },
        };

      case 'share':
        return {
          name: 'Share',
          props: {
            ...baseProps,
            platform: event.data.platform,
            pack_id: event.data.packId,
            card_count: event.data.cardCount,
          },
        };

      case 'collection_view':
        return {
          name: 'Collection View',
          props: {
            ...baseProps,
            total_packs: event.data.totalPacks,
            total_cards: event.data.totalCards,
            unique_cards: event.data.uniqueCards,
          },
        };

      case 'collection_filter':
        return {
          name: 'Collection Filter',
          props: {
            ...baseProps,
            filter_type: event.data.filterType,
            filter_value: event.data.filterValue,
          },
        };

      case 'collection_sort':
        return {
          name: 'Collection Sort',
          props: {
            ...baseProps,
            sort_option: event.data.sortOption,
          },
        };

      case 'settings_open':
        return {
          name: 'Settings Open',
          props: {
            ...baseProps,
            source: event.data.source,
          },
        };

      case 'settings_change':
        return {
          name: 'Settings Change',
          props: {
            ...baseProps,
            setting_name: event.data.setting,
            previous_value: String(event.data.previousValue),
            new_value: String(event.data.newValue),
          },
        };

      case 'modal_open':
        return {
          name: 'Modal Open',
          props: {
            ...baseProps,
            modal_type: event.data.modalType,
            trigger: event.data.trigger,
          },
        };

      case 'modal_close':
        return {
          name: 'Modal Close',
          props: {
            ...baseProps,
            modal_type: event.data.modalType,
            duration_ms: event.data.duration,
          },
        };

      case 'battle_played':
        return {
          name: 'Battle Played',
          props: {
            ...baseProps,
            result: event.data.result,
            opponent_type: event.data.opponentType,
            deck_size: event.data.deckSize,
            battle_duration: event.data.battleDuration,
            total_damage: event.data.totalDamage,
            total_damage_taken: event.data.totalDamageTaken,
          },
        };

      case 'deck_created':
        return {
          name: 'Deck Created',
          props: {
            ...baseProps,
            deck_size: event.data.deckSize,
            average_rarity: event.data.averageRarity,
            deck_type: event.data.deckType,
            card_count: event.data.cardCount,
            total_power: event.data.totalPower,
          },
        };

      default:
        return {
          name: 'Unknown Event',
          props: baseProps,
        };
    }
  }

  async flush(): Promise<void> {
    // Plausible sends events immediately, no batching needed
    // This method exists for interface compatibility
  }

  /**
   * Send multiple events in batch
   */
  async sendEvents(events: AnyAnalyticsEvent[]): Promise<void> {
    for (const event of events) {
      await this.trackEvent(event);
    }
  }
}

// Export singleton instance
const plausibleProvider = new PlausibleProvider();

// Auto-initialize if Plausible is configured
const config = analyticsConfig.get();
if (config.providers.plausible?.enabled) {
  plausibleProvider.initialize(config);
}

export default plausibleProvider;

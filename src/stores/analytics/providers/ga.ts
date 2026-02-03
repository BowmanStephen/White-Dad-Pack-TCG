import type { AnalyticsProvider, AnyAnalyticsEvent, AnalyticsConfig } from '@/types';
import { analyticsConfig } from '../../analytics';

// ============================================================================
// GOOGLE ANALYTICS 4 (GA4) PROVIDER
// ============================================================================

class GoogleAnalyticsProvider implements AnalyticsProvider {
  name = 'Google Analytics';
  initialized = false;
  private measurementId: string | null = null;

  async initialize(config: AnalyticsConfig): Promise<void> {
    if (!config.providers.googleAnalytics?.enabled) {
      return;
    }

    this.measurementId = config.providers.googleAnalytics.measurementId;

    if (!this.measurementId) {
      console.warn('[GA] Measurement ID not provided, skipping initialization');
      return;
    }

    // Load gtag.js script
    await this.loadScript();

    // Initialize gtag
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('js', new Date());
      window.gtag('config', this.measurementId, {
        send_page_view: false, // We'll handle page views manually
        anonymize_ip: true, // Privacy-compliant: anonymize IP addresses
        allow_google_signals: false, // Disable advertising features
      });

      this.initialized = true;
      console.log('[GA] Initialized with measurement ID:', this.measurementId);
    }
  }

  private async loadScript(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (typeof window === 'undefined') {
        reject(new Error('Window not available'));
        return;
      }

      // Check if already loaded
      if (document.querySelector(`script[src*="gtag/js"]`)) {
        resolve();
        return;
      }

      const script = document.createElement('script');
      script.async = true;
      script.src = `https://www.googletagmanager.com/gtag/js?id=${this.measurementId}`;
      script.onload = () => resolve();
      script.onerror = () => reject(new Error('Failed to load GA script'));
      document.head.appendChild(script);
    });
  }

  async trackEvent(event: AnyAnalyticsEvent): Promise<void> {
    if (!this.initialized || typeof window === 'undefined' || !window.gtag) {
      return;
    }

    try {
      // Convert analytics event to GA4 event format
      const gaEvent = this.convertToGAEvent(event);

      window.gtag('event', gaEvent.name, gaEvent.params);
    } catch (error) {
      console.error('[GA] Failed to track event:', error);
    }
  }

  private convertToGAEvent(event: AnyAnalyticsEvent): { name: string; params: Record<string, string | number> } {
    const baseParams = {
      event_id: event.id,
      session_id: event.sessionId,
      timestamp: event.timestamp,
    };

    switch (event.type) {
      case 'pack_open':
        return {
          name: 'pack_open',
          params: {
            ...baseParams,
            pack_id: event.data.packId,
            card_count: event.data.cardCount,
          },
        };

      case 'card_reveal':
        return {
          name: 'card_reveal',
          params: {
            ...baseParams,
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
          name: 'pack_complete',
          params: {
            ...baseParams,
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
          name: 'share',
          params: {
            ...baseParams,
            platform: event.data.platform,
            pack_id: event.data.packId,
            card_count: event.data.cardCount,
          },
        };

      case 'collection_view':
        return {
          name: 'collection_view',
          params: {
            ...baseParams,
            total_packs: event.data.totalPacks,
            total_cards: event.data.totalCards,
            unique_cards: event.data.uniqueCards,
          },
        };

      case 'collection_filter':
        return {
          name: 'collection_filter',
          params: {
            ...baseParams,
            filter_type: event.data.filterType,
            filter_value: event.data.filterValue,
          },
        };

      case 'collection_sort':
        return {
          name: 'collection_sort',
          params: {
            ...baseParams,
            sort_option: event.data.sortOption,
          },
        };

      case 'settings_open':
        return {
          name: 'settings_open',
          params: {
            ...baseParams,
            source: event.data.source,
          },
        };

      case 'settings_change':
        return {
          name: 'settings_change',
          params: {
            ...baseParams,
            setting_name: event.data.setting,
            previous_value: String(event.data.previousValue),
            new_value: String(event.data.newValue),
          },
        };

      case 'modal_open':
        return {
          name: 'modal_open',
          params: {
            ...baseParams,
            modal_type: event.data.modalType,
            trigger: event.data.trigger,
          },
        };

      case 'modal_close':
        return {
          name: 'modal_close',
          params: {
            ...baseParams,
            modal_type: event.data.modalType,
            duration_ms: event.data.duration,
          },
        };

      case 'battle_played':
        return {
          name: 'battle_played',
          params: {
            ...baseParams,
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
          name: 'deck_created',
          params: {
            ...baseParams,
            deck_size: event.data.deckSize,
            average_rarity: event.data.averageRarity,
            deck_type: event.data.deckType,
            card_count: event.data.cardCount,
            total_power: event.data.totalPower,
          },
        };

      default:
        return {
          name: 'unknown_event',
          params: baseParams,
        };
    }
  }

  async flush(): Promise<void> {
    // GA4 sends events immediately via gtag, no batching needed
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
const gaProvider = new GoogleAnalyticsProvider();

// Auto-initialize if GA is configured
const config = analyticsConfig.get();
if (config.providers.googleAnalytics?.enabled) {
  gaProvider.initialize(config);
}

export default gaProvider;

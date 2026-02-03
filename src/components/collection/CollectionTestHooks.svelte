<script lang="ts">
  import { onMount } from 'svelte';
  import { collection, collectionHydrated } from '@/stores/collection';
  import type { Collection } from '@/types';

  declare global {
    interface Window {
      render_game_to_text?: () => string;
      __daddeck_collection_state?: Record<string, unknown>;
    }
  }

  let current = $state<Collection>(collection.get());
  let hydrated = $state<boolean>(collectionHydrated.get());
  let payload = $state<Record<string, unknown>>({});

  function buildPayload(): Record<string, unknown> {
    const metadata = current?.metadata;
    return {
      route: typeof window !== 'undefined' ? window.location.pathname : '/collection',
      collectionPackCount: current?.packs?.length ?? 0,
      uniqueCards: metadata?.uniqueCards?.length ?? 0,
      rarePulls: metadata?.rarePulls ?? 0,
      holoPulls: metadata?.holoPulls ?? 0,
      lastOpenedAt: metadata?.lastOpenedAt ?? null,
      hydrated,
    };
  }

  onMount(() => {
    payload = buildPayload();
    window.__daddeck_collection_state = payload;
    window.render_game_to_text = () => JSON.stringify(payload);

    const unsubCollection = collection.subscribe((value) => {
      current = value;
      payload = buildPayload();
      window.__daddeck_collection_state = payload;
    });

    const unsubHydrated = collectionHydrated.subscribe((value) => {
      hydrated = value;
      payload = buildPayload();
      window.__daddeck_collection_state = payload;
    });

    return () => {
      unsubCollection();
      unsubHydrated();
      if (window.render_game_to_text) {
        delete window.render_game_to_text;
      }
    };
  });
</script>

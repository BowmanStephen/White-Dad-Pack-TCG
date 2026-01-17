<script lang="ts">
/**
 * Translatable.svelte
 * Reactive translation component for Svelte
 */

import { onMount } from 'svelte';
import { t, localeStore } from '@/i18n';

export let key: string;
export let fallback: string;

let translation: string = fallback || key;

onMount(() => {
  // Update translation when locale changes
  const updateTranslation = () => {
    translation = t(key);
  };

  // Initial translation
  updateTranslation();

  // Subscribe to locale changes
  const unsubscribe = localeStore.subscribe(updateTranslation);

  return () => unsubscribe();
});

// Also update when the key prop changes
$: if (key) {
  translation = t(key);
}
</script>

<span>{translation}</span>

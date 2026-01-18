<script lang="ts">
  import { onMount } from 'svelte';
  import { t } from '@/i18n';

  // Breadcrumb item interface
  interface BreadcrumbItem {
    label: string;
    href: string;
    current: boolean;
  }

  // Route label mappings (translated)
  function getRouteLabels(): Record<string, string> {
    return {
      'pack': t('nav.packs'),
      'collection': t('nav.collection'),
      'deck-builder': t('nav.deck'),
      'upgrade': t('nav.upgrade'),
      'crafting': t('nav.crafting'),
      'trade': t('nav.trade'),
      'battle': t('battle.title'),
      'achievements': t('achievements.title'),
      'leaderboard': t('nav.leaderboard'),
    };
  }

  let breadcrumbs: BreadcrumbItem[] = $state([]);

  // Generate breadcrumbs from current path
  function generateBreadcrumbs(path: string): BreadcrumbItem[] {
    const segments = path.split('/').filter(Boolean);

    // Always start with Home
    const items: BreadcrumbItem[] = [
      {
        label: t('nav.home'),
        href: '/',
        current: segments.length === 0,
      },
    ];

    // Build breadcrumb items from path segments
    let currentPath = '';
    for (let i = 0; i < segments.length; i++) {
      const segment = segments[i];
      currentPath += `/${segment}`;

      // Get translated label for this segment
      const labels = getRouteLabels();
      const label = labels[segment] || segment;

      items.push({
        label,
        href: currentPath,
        current: i === segments.length - 1,
      });
    }

    return items;
  }

  // Update breadcrumbs on mount and route changes
  onMount(() => {
    breadcrumbs = generateBreadcrumbs(window.location.pathname);

    // Listen for route changes
    const handleRouteChange = () => {
      breadcrumbs = generateBreadcrumbs(window.location.pathname);
    };

    window.addEventListener('popstate', handleRouteChange);

    return () => {
      window.removeEventListener('popstate', handleRouteChange);
    };
  });
</script>

{#if breadcrumbs.length > 1}
  <nav class="breadcrumbs" role="navigation" aria-label="Breadcrumb">
    <ol class="breadcrumb-list" itemscope itemtype="https://schema.org/BreadcrumbList">
      {#each breadcrumbs as item, index (item.href)}
        <li
          class="breadcrumb-item"
          class:current={item.current}
          itemprop="itemListElement"
          itemscope
          itemtype="https://schema.org/ListItem"
        >
          {#if index > 0}
            <span class="breadcrumb-separator" aria-hidden="true">/</span>
          {/if}

          {#if item.current}
            <span
              class="breadcrumb-label current"
              itemprop="name"
              aria-current="page"
            >
              {item.label}
            </span>
          {:else}
            <a
              href={item.href}
              class="breadcrumb-label"
              itemprop="item"
            >
              <span itemprop="name">{item.label}</span>
            </a>
          {/if}

          <meta itemprop="position" content={String(index + 1)} />
        </li>
      {/each}
    </ol>
  </nav>
{/if}

<style>
  .breadcrumbs {
    padding: 1rem 0;
    max-width: 72rem;
    margin: 0 auto;
    padding-left: 1rem;
    padding-right: 1rem;
  }

  .breadcrumb-list {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    list-style: none;
    margin: 0;
    padding: 0;
    gap: 0.5rem;
  }

  .breadcrumb-item {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-size: 0.875rem;
  }

  .breadcrumb-separator {
    color: #64748b;
    user-select: none;
  }

  .breadcrumb-label {
    color: #64748b;
    text-decoration: none;
    transition: color 0.2s ease;
    font-weight: 500;
  }

  .breadcrumb-label:hover {
    color: #fbbf24;
  }

  .breadcrumb-label:focus {
    outline: 2px solid #fbbf24;
    outline-offset: 2px;
    border-radius: 0.25rem;
  }

  .breadcrumb-label.current {
    color: #f8fafc;
    font-weight: 600;
    cursor: default;
  }

  /* Dark mode support */
  :global(.dark) .breadcrumbs {
    background: transparent;
  }

  :global(.dark) .breadcrumb-separator {
    color: #64748b;
  }

  :global(.dark) .breadcrumb-label {
    color: #94a3b8;
  }

  :global(.dark) .breadcrumb-label:hover {
    color: #fbbf24;
  }

  :global(.dark) .breadcrumb-label.current {
    color: #f8fafc;
  }

  /* Mobile optimization */
  @media (max-width: 640px) {
    .breadcrumbs {
      padding: 0.75rem 1rem;
      font-size: 0.8125rem;
    }

    .breadcrumb-item {
      gap: 0.375rem;
    }

    .breadcrumb-separator {
      margin: 0 0.125rem;
    }
  }
</style>

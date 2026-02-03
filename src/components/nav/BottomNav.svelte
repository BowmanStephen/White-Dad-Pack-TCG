<script lang="ts">
  import { onMount } from 'svelte';

  interface NavItem {
    href: string;
    label: string;
    icon: string;
    shortcut?: string;
  }

  const navItems: NavItem[] = [
    {
      href: '/',
      label: 'Home',
      icon: 'M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z',
      shortcut: 'O',
    },
    {
      href: '/collection',
      label: 'Collection',
      icon: 'M19 11H5m14 0a2 2 0 0 1 2 2v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-6a2 2 0 0 1 2-2m14 0V9a2 2 0 0 0-2-2M5 11V9a2 2 0 0 1 2-2m0 0V5a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v2M7 7h10',
      shortcut: 'C',
    },
    {
      href: '/deck-builder',
      label: 'Deck',
      icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5.586a1 1 0 0 1 .707.293l5.414 5.414a1 1 0 0 1 .293.707V19a2 2 0 0 1-2 2z',
      shortcut: 'D',
    },
    {
      href: '/achievements',
      label: 'Profile',
      icon: 'M16 7a4 4 0 1 1-8 0 4 4 0 0 1 8 0zM12 14a7 7 0 0 0-7 7h14a7 7 0 0 0-7-7z'
    }
  ];

  let currentPath = $state('/');

  onMount(() => {
    currentPath = window.location.pathname;

    const handleRouteChange = () => {
      currentPath = window.location.pathname;
    };

    window.addEventListener('popstate', handleRouteChange);

    return () => {
      window.removeEventListener('popstate', handleRouteChange);
    };
  });

  function isActive(href: string): boolean {
    if (href === '/') {
      return currentPath === '/';
    }
    return currentPath.startsWith(href);
  }
</script>

<nav
  class="bottom-nav"
  aria-label="Bottom navigation"
>
  {#each navItems as item}
    <a
      href={item.href}
      class="nav-item"
      class:active={isActive(item.href)}
      aria-label={item.label}
      aria-current={isActive(item.href) ? 'page' : undefined}
    >
      <svg
        class="nav-icon"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d={item.icon}
        />
      </svg>
      <span class="nav-label">{item.label}</span>
      {#if item.shortcut}
        <kbd class="nav-shortcut" aria-label="Keyboard shortcut: {item.shortcut}">
          {item.shortcut}
        </kbd>
      {/if}
    </a>
  {/each}
</nav>

<style>
  .bottom-nav {
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    display: flex;
    justify-content: space-around;
    align-items: center;
    background: linear-gradient(
      to top,
      rgba(15, 23, 42, 0.98),
      rgba(15, 23, 42, 0.95)
    );
    backdrop-filter: blur(12px);
    -webkit-backdrop-filter: blur(12px);
    border-top: 1px solid rgba(71, 85, 105, 0.3);
    padding: 0.5rem 0;
    padding-bottom: env(safe-area-inset-bottom, 0.5rem);
    z-index: 999;
    box-shadow: 0 -4px 20px rgba(0, 0, 0, 0.2);
  }

  .nav-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 0.25rem;
    padding: 0.5rem 1rem;
    text-decoration: none;
    color: #94a3b8;
    transition: color 0.2s ease;
    position: relative;
    min-width: 4rem;
  }

  .nav-item:active {
    transform: scale(0.95);
  }

  .nav-icon {
    width: 1.5rem;
    height: 1.5rem;
    transition: stroke 0.2s ease, transform 0.2s ease;
  }

  .nav-label {
    font-size: 0.75rem;
    font-weight: 500;
    letter-spacing: 0.025em;
  }

  .nav-shortcut {
    position: absolute;
    top: 0.25rem;
    right: 0.25rem;
    display: none;
    align-items: center;
    justify-content: center;
    min-width: 1rem;
    height: 1rem;
    padding: 0 0.25rem;
    background: rgba(251, 191, 36, 0.9);
    color: #0f172a;
    font-family: 'Courier New', monospace;
    font-size: 0.625rem;
    font-weight: 700;
    border-radius: 0.25rem;
    line-height: 1;
  }

  /* Show shortcuts on desktop */
  @media (min-width: 769px) {
    .nav-shortcut {
      display: inline-flex;
    }
  }

  /* Active State */
  .nav-item.active {
    color: #fbbf24;
  }

  .nav-item.active .nav-icon {
    transform: scale(1.1);
    filter: drop-shadow(0 0 8px rgba(251, 191, 36, 0.5));
  }

  /* Active indicator - glow effect */
  .nav-item.active::before {
    content: '';
    position: absolute;
    top: -2px;
    left: 50%;
    transform: translateX(-50%);
    width: 2rem;
    height: 3px;
    background: linear-gradient(90deg, #fbbf24, #f59e0b);
    border-radius: 0 0 3px 3px;
    box-shadow: 0 2px 8px rgba(251, 191, 36, 0.6);
    animation: glow-pulse 2s ease-in-out infinite;
  }

  @keyframes glow-pulse {
    0%, 100% {
      opacity: 1;
      box-shadow: 0 2px 8px rgba(251, 191, 36, 0.6);
    }
    50% {
      opacity: 0.8;
      box-shadow: 0 2px 12px rgba(251, 191, 36, 0.8);
    }
  }

  /* Hover effect (for touch devices) */
  @media (hover: hover) {
    .nav-item:hover {
      color: #f8fafc;
      background: rgba(251, 191, 36, 0.05);
    }

    .nav-item.active:hover {
      color: #fbbf24;
      background: rgba(251, 191, 36, 0.1);
    }
  }

  /* Hide on desktop */
  @media (min-width: 769px) {
    .bottom-nav {
      display: none;
    }
  }

  /* Show only on mobile/tablet */
  @media (max-width: 768px) {
    .bottom-nav {
      display: flex;
    }
  }
</style>

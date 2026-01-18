<script lang="ts">
  import { onMount } from 'svelte';
  import { muted, toggleMute } from '../../stores/audio';
  import ThemeToggle from './ThemeToggle.svelte';
  import MotionToggle from './MotionToggle.svelte';
  import LanguageSelector from './LanguageSelector.svelte';

  interface NavLink {
    href: string;
    label: string;
    isCta?: boolean;
    isTutorialTarget?: boolean;
  }

  let isMuted = $state(false);

  // Subscribe to muted state
  $effect(() => {
    const unsubscribe = muted.subscribe((value) => {
      isMuted = value;
    });
    return unsubscribe;
  });

  const links: NavLink[] = [
    { href: '/', label: 'Home' },
    { href: '/pack', label: 'Open Pack', isCta: true },
    { href: '/collection', label: 'My Collection', isTutorialTarget: true },
    { href: '/battle', label: 'Battle' },
  ];

  let isMenuOpen = false;
  let currentPath = '/';

  onMount(() => {
    currentPath = window.location.pathname;

    // Close menu on route change
    const handleRouteChange = () => {
      currentPath = window.location.pathname;
      isMenuOpen = false;
    };

    window.addEventListener('popstate', handleRouteChange);

    return () => {
      window.removeEventListener('popstate', handleRouteChange);
    };
  });

  function toggleMenu() {
    isMenuOpen = !isMenuOpen;
  }

  function closeMenu() {
    isMenuOpen = false;
  }


  function handleKeydown(event: KeyboardEvent) {
    if (event.key === 'Escape' && isMenuOpen) {
      closeMenu();
      // Return focus to menu toggle button
      const hamburger = document.querySelector('.hamburger') as HTMLButtonElement;
      hamburger?.focus();
    }
  }

  function isActive(href: string): boolean {
    if (href === '/') {
      return currentPath === '/';
    }
    return currentPath.startsWith(href);
  }
</script>

<header
  class="nav-header"
  class:scrolled={false}
  on:keydown={handleKeydown}
  role="banner"
>
  <div class="nav-container">
    <!-- Logo -->
    <a href="/" class="nav-logo" on:click={closeMenu}>
      <span class="logo-dad">Dad</span><span class="logo-deck">Deck</span
      ><span class="logo-tm">TM</span>
    </a>

    <!-- Desktop Navigation -->
    <nav class="desktop-nav" role="navigation" aria-label="Main navigation">
      {#each links as link}
        <a
          href={link.href}
          class="nav-link"
          class:active={isActive(link.href)}
          class:cta={link.isCta}
          data-tutorial={link.isTutorialTarget ? 'collection-link' : undefined}
        >
          {link.label}
        </a>
      {/each}

      <!-- Mute button -->
      <button
        class="mute-button"
        on:click={toggleMute}
        aria-label={isMuted ? 'Unmute sounds' : 'Mute sounds'}
        aria-pressed={isMuted}
        type="button"
      >
        {#if isMuted}
          <!-- Muted icon -->
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" />
          </svg>
        {:else}
          <!-- Sound on icon -->
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
          </svg>
        {/if}
      </button>

      <!-- Theme Toggle -->
      <ThemeToggle />

      <!-- Motion Toggle (PACK-057) -->
      <MotionToggle />

      <!-- Language Selector -->
      <LanguageSelector />

    </nav>

    <!-- Mobile Menu Button -->
    <button
      class="hamburger"
      class:open={isMenuOpen}
      on:click={toggleMenu}
      aria-label="Toggle menu"
      aria-expanded={isMenuOpen}
    >
      <span class="hamburger-line"></span>
      <span class="hamburger-line"></span>
      <span class="hamburger-line"></span>
    </button>
  </div>

  <!-- Mobile Menu -->
  <nav
    class="mobile-nav"
    class:open={isMenuOpen}
    role="navigation"
    aria-label="Mobile navigation"
  >
    <div class="mobile-nav-inner">
      {#each links as link}
        <a
          href={link.href}
          class="mobile-link"
          class:active={isActive(link.href)}
          class:cta={link.isCta}
          data-tutorial={link.isTutorialTarget ? 'collection-link' : undefined}
          on:click={closeMenu}
        >
          <span class="mobile-link-text">{link.label}</span>
          {#if isActive(link.href)}
            <span class="active-indicator"></span>
          {/if}
        </a>
      {/each}

      <!-- Mute button in mobile menu -->
      <button
        class="mobile-link"
        on:click={() => {
          toggleMute();
          closeMenu();
        }}
        aria-label={isMuted ? 'Unmute sounds' : 'Mute sounds'}
        aria-pressed={isMuted}
        type="button"
      >
        <span class="mobile-link-text">
          {#if isMuted}
            <span class="flex items-center gap-2">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" />
              </svg>
              Unmute Sounds
            </span>
          {:else}
            <span class="flex items-center gap-2">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
              </svg>
              Mute Sounds
            </span>
          {/if}
        </span>
      </button>

      <!-- Language Selector in mobile menu -->
      <div class="px-4 py-3">
        <LanguageSelector />
      </div>

    </div>
  </nav>

  <!-- Mobile Menu Overlay -->
  {#if isMenuOpen}
    <div class="mobile-overlay" on:click={closeMenu}></div>
  {/if}
</header>

<style>
  .nav-header {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    z-index: 1000;
    background: linear-gradient(
      to bottom,
      rgba(15, 23, 42, 0.95),
      rgba(15, 23, 42, 0.85)
    );
    backdrop-filter: blur(12px);
    -webkit-backdrop-filter: blur(12px);
    border-bottom: 1px solid rgba(71, 85, 105, 0.3);
    /* Performance: Only animate background and box-shadow, not all properties */
    transition: background 0.3s cubic-bezier(0.4, 0, 0.2, 1),
                box-shadow 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    will-change: background, box-shadow;
  }

  .nav-header.scrolled {
    background: rgba(15, 23, 42, 0.98);
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
  }

  .nav-container {
    max-width: 72rem;
    margin: 0 auto;
    padding: 1rem 1rem;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 1rem;
  }

  /* Logo */
  .nav-logo {
    font-size: 1.25rem;
    font-weight: 800;
    letter-spacing: -0.025em;
    text-decoration: none;
    transition: transform 0.2s ease;
  }

  .nav-logo:hover {
    transform: scale(1.02);
  }

  .nav-logo:active {
    transform: scale(0.98);
  }

  .logo-dad {
    color: #fbbf24;
    text-shadow: 0 0 20px rgba(251, 191, 36, 0.3);
  }

  .logo-deck {
    color: #f8fafc;
  }

  .logo-tm {
    font-size: 0.5rem;
    color: #fbbf24;
    vertical-align: super;
    margin-left: 0.125rem;
  }

  /* Desktop Navigation */
  .desktop-nav {
    display: flex;
    align-items: center;
    gap: 1.5rem;
  }

  .nav-link {
    position: relative;
    color: #94a3b8;
    font-size: 0.875rem;
    font-weight: 500;
    text-decoration: none;
    padding: 0.5rem 0;
    /* Performance: Only animate color and transform */
    transition: color 0.2s ease;
    will-change: color;
  }

  .nav-link::after {
    content: '';
    position: absolute;
    bottom: 0;
    left: 50%;
    transform: translateX(-50%) scaleX(0);
    width: 100%;
    height: 2px;
    background: linear-gradient(90deg, #fbbf24, #f59e0b);
    /* Performance: Only animate transform */
    transition: transform 0.2s ease;
    will-change: transform;
  }

  .nav-link:hover {
    color: #f8fafc;
  }

  .nav-link:hover::after {
    transform: translateX(-50%) scaleX(1);
  }

  .nav-link.active {
    color: #fbbf24;
  }

  .nav-link.active::after {
    transform: translateX(-50%) scaleX(1);
    background: #fbbf24;
    box-shadow: 0 0 10px rgba(251, 191, 36, 0.5);
  }

  .nav-link.cta {
    background: linear-gradient(135deg, #fbbf24, #f59e0b);
    color: #0f172a;
    padding: 0.5rem 1rem;
    border-radius: 0.5rem;
    font-weight: 700;
    box-shadow: 0 4px 12px rgba(251, 191, 36, 0.3);
    /* Performance: Only animate transform and box-shadow */
    transition: transform 0.2s ease, box-shadow 0.2s ease;
    will-change: transform, box-shadow;
  }

  .nav-link.cta:hover {
    transform: translateY(-1px);
    box-shadow: 0 6px 16px rgba(251, 191, 36, 0.4);
  }

  .nav-link.cta:active {
    transform: translateY(0);
  }

  .nav-link.cta::after {
    display: none;
  }

  /* Mute Button */
  .mute-button {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 2.5rem;
    height: 2.5rem;
    padding: 0.5rem;
    background: transparent;
    border: none;
    color: #94a3b8;
    cursor: pointer;
    border-radius: 0.5rem;
    transition: color 0.2s ease, background 0.2s ease;
  }

  .mute-button:hover {
    color: #f8fafc;
    background: rgba(251, 191, 36, 0.1);
  }

  .mute-button:active {
    transform: scale(0.95);
  }

  /* Settings Button */
  .settings-button {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 2.5rem;
    height: 2.5rem;
    padding: 0.5rem;
    background: transparent;
    border: none;
    color: #94a3b8;
    cursor: pointer;
    border-radius: 0.5rem;
    transition: color 0.2s ease, background 0.2s ease, transform 0.2s ease;
  }

  .settings-button:hover {
    color: #fbbf24;
    background: rgba(251, 191, 36, 0.1);
    transform: rotate(45deg);
  }

  .settings-button:active {
    transform: rotate(45deg) scale(0.95);
  }

  /* Hamburger Button */
  .hamburger {
    display: none;
    flex-direction: column;
    justify-content: center;
    gap: 0.375rem;
    width: 2.5rem;
    height: 2.5rem;
    padding: 0.5rem;
    background: transparent;
    border: none;
    cursor: pointer;
    position: relative;
    z-index: 1002;
  }

  .hamburger-line {
    width: 1.25rem;
    height: 2px;
    background: #f8fafc;
    border-radius: 1px;
    /* Performance: Only animate transform, opacity, and background */
    transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1),
                opacity 0.3s cubic-bezier(0.4, 0, 0.2, 1),
                background 0.2s ease;
    will-change: transform, opacity, background;
    transform-origin: center;
  }

  .hamburger:hover .hamburger-line {
    background: #fbbf24;
  }

  .hamburger.open .hamburger-line:nth-child(1) {
    transform: rotate(45deg) translate(0.25rem, 0.25rem);
  }

  .hamburger.open .hamburger-line:nth-child(2) {
    opacity: 0;
    transform: scaleX(0);
  }

  .hamburger.open .hamburger-line:nth-child(3) {
    transform: rotate(-45deg) translate(0.25rem, -0.25rem);
  }

  /* Mobile Navigation */
  .mobile-nav {
    display: none;
    position: fixed;
    top: 0;
    right: 0;
    bottom: 0;
    width: 100%;
    max-width: 20rem;
    background: linear-gradient(
      to bottom left,
      rgba(15, 23, 42, 0.98),
      rgba(30, 41, 59, 0.98)
    );
    backdrop-filter: blur(20px);
    -webkit-backdrop-filter: blur(20px);
    border-left: 1px solid rgba(71, 85, 105, 0.3);
    transform: translateX(100%);
    /* Performance: Only animate transform */
    transition: transform 0.4s cubic-bezier(0.4, 0, 0.2, 1);
    will-change: transform;
    /* GPU acceleration hint */
    transform: translateZ(0) translateX(100%);
    z-index: 1001;
    overflow-y: auto;
  }

  .mobile-nav.open {
    transform: translateZ(0) translateX(0);
  }

  .mobile-nav-inner {
    padding: 5rem 1.5rem 2rem;
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .mobile-link {
    position: relative;
    display: flex;
    align-items: center;
    justify-content: space-between;
    color: #94a3b8;
    font-size: 1.125rem;
    font-weight: 600;
    text-decoration: none;
    padding: 1rem;
    border-radius: 0.75rem;
    /* Performance: Only animate color, background, and transform */
    transition: color 0.2s ease,
                background 0.2s ease,
                transform 0.2s ease;
    will-change: color, background, transform;
    gap: 1rem;
  }

  .mobile-link:hover {
    background: rgba(251, 191, 36, 0.1);
    color: #f8fafc;
  }

  .mobile-link.active {
    color: #fbbf24;
    background: rgba(251, 191, 36, 0.15);
    box-shadow: inset 3px 0 0 #fbbf24;
  }

  .mobile-link.cta {
    background: linear-gradient(135deg, #fbbf24, #f59e0b);
    color: #0f172a;
    margin-top: 1rem;
  }

  .mobile-link.cta:hover {
    transform: translateX(0.25rem);
  }

  .mobile-link-text {
    flex: 1;
  }

  .active-indicator {
    width: 0.5rem;
    height: 0.5rem;
    background: #fbbf24;
    border-radius: 50%;
    box-shadow: 0 0 8px rgba(251, 191, 36, 0.6);
    animation: pulse 2s ease-in-out infinite;
    will-change: transform, opacity;
  }

  @keyframes pulse {
    0%, 100% {
      opacity: 1;
      transform: scale(1);
    }
    50% {
      opacity: 0.7;
      transform: scale(1.1);
    }
  }

  /* Mobile Overlay */
  .mobile-overlay {
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.5);
    backdrop-filter: blur(4px);
    z-index: 1000;
    animation: fadeIn 0.3s ease;
    will-change: opacity;
  }

  @keyframes fadeIn {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }

  /* Mobile Responsive */
  @media (max-width: 768px) {
    .desktop-nav {
      display: none;
    }

    .hamburger {
      display: flex;
    }

    .mobile-nav {
      display: block;
    }
  }

  /* Body scroll lock when menu is open */
  :global(body.menu-open) {
    overflow: hidden;
  }
</style>

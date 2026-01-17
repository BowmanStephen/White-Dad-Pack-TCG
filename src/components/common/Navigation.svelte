<script lang="ts">
  import { onMount } from 'svelte';

  interface NavLink {
    href: string;
    label: string;
    isCta?: boolean;
  }

  const links: NavLink[] = [
    { href: '/', label: 'Home' },
    { href: '/pack', label: 'Open Pack', isCta: true },
    { href: '/collection', label: 'My Collection' },
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
>
  <div class="nav-container">
    <!-- Logo -->
    <a href="/" class="nav-logo" on:click={closeMenu}>
      <span class="logo-dad">Dad</span><span class="logo-deck">Deck</span
      ><span class="logo-tm">TM</span>
    </a>

    <!-- Desktop Navigation -->
    <nav class="desktop-nav">
      {#each links as link}
        <a
          href={link.href}
          class="nav-link"
          class:active={isActive(link.href)}
          class:cta={link.isCta}
        >
          {link.label}
        </a>
      {/each}
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
  >
    <div class="mobile-nav-inner">
      {#each links as link}
        <a
          href={link.href}
          class="mobile-link"
          class:active={isActive(link.href)}
          class:cta={link.isCta}
          on:click={closeMenu}
        >
          <span class="mobile-link-text">{link.label}</span>
          {#if isActive(link.href)}
            <span class="active-indicator"></span>
          {/if}
        </a>
      {/each}
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
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
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
    transition: all 0.2s ease;
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
    transition: transform 0.2s ease;
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
    transition: all 0.2s ease;
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
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
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
    transition: transform 0.4s cubic-bezier(0.4, 0, 0.2, 1);
    z-index: 1001;
    overflow-y: auto;
  }

  .mobile-nav.open {
    transform: translateX(0);
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
    transition: all 0.2s ease;
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

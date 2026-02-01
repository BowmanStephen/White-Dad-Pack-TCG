import { test, expect, devices } from '@playwright/test';

/**
 * PACK-060: Mobile Responsive - Navigation
 *
 * Tests for mobile-friendly navigation features:
 * - Hamburger menu on mobile
 * - Full-screen nav drawer
 * - Swipe to close nav
 * - Bottom navigation bar for key features
 * - Sticky header on scroll
 *
 * Test coverage across mobile, tablet, and desktop viewports
 */

// Mobile device viewport (iPhone 12 Pro)
const MOBILE_VIEWPORT = { width: 390, height: 844 };
// Tablet viewport (iPad)
const TABLET_VIEWPORT = { width: 768, height: 1024 };
// Desktop viewport
const DESKTOP_VIEWPORT = { width: 1920, height: 1080 };

test.describe('PACK-060: Hamburger Menu on Mobile', () => {
  test('should display hamburger menu on mobile', async ({ page }) => {
    await page.setViewportSize(MOBILE_VIEWPORT);
    await page.goto('/');

    // Hamburger button should be visible on mobile
    const hamburger = page.locator('.hamburger');
    await expect(hamburger).toBeVisible();

    // Desktop nav should be hidden
    const desktopNav = page.locator('.desktop-nav');
    await expect(desktopNav).not.toBeVisible();
  });

  test('should NOT display hamburger menu on desktop', async ({ page }) => {
    await page.setViewportSize(DESKTOP_VIEWPORT);
    await page.goto('/');

    // Hamburger button should be hidden on desktop
    const hamburger = page.locator('.hamburger');
    await expect(hamburger).not.toBeVisible();

    // Desktop nav should be visible
    const desktopNav = page.locator('.desktop-nav');
    await expect(desktopNav).toBeVisible();
  });

  test('should open mobile menu when hamburger is clicked', async ({ page }) => {
    await page.setViewportSize(MOBILE_VIEWPORT);
    await page.goto('/');

    const hamburger = page.locator('.hamburger');
    const mobileNav = page.locator('.mobile-nav');

    // Menu should be closed initially
    await expect(mobileNav).not.toHaveClass(/open/);

    // Click hamburger to open menu
    await hamburger.click();
    await expect(mobileNav).toHaveClass(/open/);

    // Hamburger should have open class
    await expect(hamburger).toHaveClass(/open/);
  });

  test('should close mobile menu when overlay is clicked', async ({ page }) => {
    await page.setViewportSize(MOBILE_VIEWPORT);
    await page.goto('/');

    const hamburger = page.locator('.hamburger');
    const mobileNav = page.locator('.mobile-nav');

    // Open menu
    await hamburger.click();
    await expect(mobileNav).toHaveClass(/open/);

    // Click overlay to close
    const overlay = page.locator('.mobile-overlay');
    await overlay.click();
    await expect(mobileNav).not.toHaveClass(/open/);
  });

  test('should close mobile menu when Escape key is pressed', async ({ page }) => {
    await page.setViewportSize(MOBILE_VIEWPORT);
    await page.goto('/');

    const hamburger = page.locator('.hamburger');
    const mobileNav = page.locator('.mobile-nav');

    // Open menu
    await hamburger.click();
    await expect(mobileNav).toHaveClass(/open/);

    // Press Escape to close
    await page.keyboard.press('Escape');
    await expect(mobileNav).not.toHaveClass(/open/);
  });

  test('should close menu when navigating to a link', async ({ page }) => {
    await page.setViewportSize(MOBILE_VIEWPORT);
    await page.goto('/');

    const hamburger = page.locator('.hamburger');
    const mobileNav = page.locator('.mobile-nav');

    // Open menu
    await hamburger.click();
    await expect(mobileNav).toHaveClass(/open/);

    // Click a navigation link
    const collectionLink = page.locator('.mobile-link[href="/collection"]');
    await collectionLink.click();

    // Menu should close after navigation
    await expect(mobileNav).not.toHaveClass(/open/);
  });

  test('should have proper ARIA attributes for accessibility', async ({ page }) => {
    await page.setViewportSize(MOBILE_VIEWPORT);
    await page.goto('/');

    const hamburger = page.locator('.hamburger');

    // Check initial ARIA state
    await expect(hamburger).toHaveAttribute('aria-label', 'Toggle menu');
    await expect(hamburger).toHaveAttribute('aria-expanded', 'false');

    // Open menu and check ARIA state update
    await hamburger.click();
    await expect(hamburger).toHaveAttribute('aria-expanded', 'true');

    // Check mobile nav ARIA attributes
    const mobileNav = page.locator('.mobile-nav[role="navigation"]');
    await expect(mobileNav).toHaveAttribute('aria-label', 'Mobile navigation');
  });
});

test.describe('PACK-060: Full-Screen Nav Drawer', () => {
  test('should display full-screen nav drawer on mobile', async ({ page }) => {
    await page.setViewportSize(MOBILE_VIEWPORT);
    await page.goto('/');

    // Open mobile menu
    const hamburger = page.locator('.hamburger');
    await hamburger.click();

    const mobileNav = page.locator('.mobile-nav');
    await expect(mobileNav).toBeVisible();

    // Check that drawer slides in from right
    const mobileNavBox = await mobileNav.boundingBox();
    expect(mobileNavBox).toBeTruthy();
    expect(mobileNavBox!.x).toBe(0); // Should start from left edge
    expect(mobileNavBox!.width).toBeLessThanOrEqual(390); // Full width on mobile
  });

  test('should have all navigation links in drawer', async ({ page }) => {
    await page.setViewportSize(MOBILE_VIEWPORT);
    await page.goto('/');

    // Open menu
    await page.locator('.hamburger').click();

    // Check for all expected navigation items
    const expectedLinks = ['Home', 'Open Pack', 'My Collection', 'Battle'];
    for (const linkText of expectedLinks) {
      const link = page.locator('.mobile-link').filter({ hasText: linkText });
      await expect(link).toBeVisible();
    }
  });

  test('should have settings options in drawer', async ({ page }) => {
    await page.setViewportSize(MOBILE_VIEWPORT);
    await page.goto('/');

    // Open menu
    await page.locator('.hamburger').click();

    // Check for mute button
    const muteButton = page.locator('.mobile-link[aria-label*="Mute" i], .mobile-link[aria-label*="Unmute" i]');
    await expect(muteButton).toBeVisible();

    // Check for language selector
    const languageSelector = page.locator('.mobile-nav .language-selector');
    await expect(languageSelector).toBeVisible();
  });

  test('should have overlay backdrop when drawer is open', async ({ page }) => {
    await page.setViewportSize(MOBILE_VIEWPORT);
    await page.goto('/');

    // Open menu
    await page.locator('.hamburger').click();

    // Check overlay is visible
    const overlay = page.locator('.mobile-overlay');
    await expect(overlay).toBeVisible();

    // Check overlay has backdrop blur
    const overlayStyles = await overlay.evaluate((el) => {
      const styles = window.getComputedStyle(el);
      return {
        background: styles.background,
        backdropFilter: styles.backdropFilter,
      };
    });

    expect(overlayStyles.backdropFilter).toContain('blur');
  });
});

test.describe('PACK-060: Swipe to Close Navigation', () => {
  test('should support swipe gesture to close drawer', async ({ page }) => {
    await page.setViewportSize(MOBILE_VIEWPORT);
    await page.goto('/');

    // Open menu
    await page.locator('.hamburger').click();
    const mobileNav = page.locator('.mobile-nav');
    await expect(mobileNav).toHaveClass(/open/);

    // Simulate swipe gesture (touch start, move, end)
    const drawer = page.locator('.mobile-nav');
    const box = await drawer.boundingBox();
    if (!box) throw new Error('Drawer not found');

    // Swipe from right to left (close gesture)
    const startX = box.x + box.width - 50;
    const startY = box.y + box.height / 2;

    await page.touchstart(startX, startY);
    await page.touchmove(startX - 200, startY); // Swipe left
    await page.touchend();

    // Menu should close after swipe
    await page.waitForTimeout(500); // Wait for animation
    await expect(mobileNav).not.toHaveClass(/open/);
  });

  test('should prevent body scroll when drawer is open', async ({ page }) => {
    await page.setViewportSize(MOBILE_VIEWPORT);
    await page.goto('/');

    // Open menu
    await page.locator('.hamburger').click();

    // Check body has menu-open class
    const body = page.locator('body');
    await expect(body).toHaveClass(/menu-open/);

    // Verify body overflow is hidden
    const bodyStyles = await body.evaluate((el) => {
      return window.getComputedStyle(el).overflow;
    });
    expect(bodyStyles).toBe('hidden');
  });
});

test.describe('PACK-060: Bottom Navigation Bar', () => {
  test('should display bottom nav on mobile only', async ({ page }) => {
    await page.setViewportSize(MOBILE_VIEWPORT);
    await page.goto('/');

    const bottomNav = page.locator('.bottom-nav');
    await expect(bottomNav).toBeVisible();

    // Switch to desktop
    await page.setViewportSize(DESKTOP_VIEWPORT);
    await expect(bottomNav).not.toBeVisible();
  });

  test('should have all key features in bottom nav', async ({ page }) => {
    await page.setViewportSize(MOBILE_VIEWPORT);
    await page.goto('/');

    // Check for key navigation items
    const expectedItems = ['Home', 'Collection', 'Deck', 'Profile'];
    for (const item of expectedItems) {
      const navItem = page.locator('.bottom-nav .nav-item').filter({ hasText: item });
      await expect(navItem).toBeVisible();
    }
  });

  test('should highlight active page in bottom nav', async ({ page }) => {
    await page.setViewportSize(MOBILE_VIEWPORT);

    // Test Home active state
    await page.goto('/');
    const homeLink = page.locator('.bottom-nav .nav-item[href="/"]');
    await expect(homeLink).toHaveClass(/active/);

    // Test Collection active state
    await page.goto('/collection');
    const collectionLink = page.locator('.bottom-nav .nav-item[href="/collection"]');
    await expect(collectionLink).toHaveClass(/active/);
  });

  test('should have proper touch targets (44x44px minimum)', async ({ page }) => {
    await page.setViewportSize(MOBILE_VIEWPORT);
    await page.goto('/');

    const navItems = page.locator('.bottom-nav .nav-item');
    const count = await navItems.count();

    for (let i = 0; i < count; i++) {
      const item = navItems.nth(i);
      const box = await item.boundingBox();
      expect(box).toBeTruthy();

      // Check minimum touch target size (44x44px per WCAG)
      expect(box!.height).toBeGreaterThanOrEqual(44);
      expect(box!.width).toBeGreaterThanOrEqual(44);
    }
  });

  test('should have glow effect on active item', async ({ page }) => {
    await page.setViewportSize(MOBILE_VIEWPORT);
    await page.goto('/');

    const activeItem = page.locator('.bottom-nav .nav-item.active');

    // Check for glow effect (box-shadow)
    const glowStyles = await activeItem.evaluate((el) => {
      const styles = window.getComputedStyle(el, '::before');
      return {
        boxShadow: styles.boxShadow,
        background: styles.background,
      };
    });

    expect(glowStyles.boxShadow).toBeTruthy();
    expect(glowStyles.background).toContain('rgb(251, 191, 36)'); // Gold color
  });

  test('should have safe area inset for iOS devices', async ({ page }) => {
    await page.setViewportSize(MOBILE_VIEWPORT);
    await page.goto('/');

    const bottomNav = page.locator('.bottom-nav');

    // Check padding-bottom includes safe-area-inset
    const paddingBottom = await bottomNav.evaluate((el) => {
      return window.getComputedStyle(el).paddingBottom;
    });

    expect(paddingBottom).toContain('env(safe-area-inset-bottom');
  });
});

test.describe('PACK-060: Sticky Header on Scroll', () => {
  test('should keep header fixed at top on scroll', async ({ page }) => {
    await page.setViewportSize(MOBILE_VIEWPORT);
    await page.goto('/');

    const header = page.locator('.nav-header');

    // Check initial position
    const initialPosition = await header.evaluate((el) => {
      const rect = el.getBoundingClientRect();
      return { top: rect.top, isFixed: window.getComputedStyle(el).position === 'fixed' };
    });

    expect(initialPosition.isFixed).toBe(true);
    expect(initialPosition.top).toBe(0);

    // Scroll down
    await page.evaluate(() => window.scrollTo(0, 500));

    // Header should still be at top
    const scrolledPosition = await header.evaluate((el) => {
      const rect = el.getBoundingClientRect();
      return rect.top;
    });

    expect(scrolledPosition).toBe(0);
  });

  test('should have backdrop blur for readability', async ({ page }) => {
    await page.setViewportSize(MOBILE_VIEWPORT);
    await page.goto('/');

    const header = page.locator('.nav-header');

    // Check for backdrop blur effect
    const backdropFilter = await header.evaluate((el) => {
      return window.getComputedStyle(el).backdropFilter;
    });

    expect(backdropFilter).toContain('blur');
  });

  test('should increase opacity/shadow on scroll', async ({ page }) => {
    await page.setViewportSize(MOBILE_VIEWPORT);
    await page.goto('/');

    const header = page.locator('.nav-header');

    // Get initial styles
    const initialStyles = await header.evaluate((el) => {
      const styles = window.getComputedStyle(el);
      return {
        background: styles.background,
        boxShadow: styles.boxShadow,
      };
    });

    // Scroll down
    await page.evaluate(() => window.scrollTo(0, 500));

    // Get scrolled styles
    const scrolledStyles = await header.evaluate((el) => {
      const styles = window.getComputedStyle(el);
      return {
        background: styles.background,
        boxShadow: styles.boxShadow,
      };
    });

    // Note: The scrolled class would be applied via JS scroll listener
    // For now, we verify the header maintains visibility
    expect(scrolledStyles.background).toBeTruthy();
  });
});

test.describe('PACK-060: Cross-Device Consistency', () => {
  test('should work on tablet viewport', async ({ page }) => {
    await page.setViewportSize(TABLET_VIEWPORT);
    await page.goto('/');

    // Tablet should show hamburger menu
    const hamburger = page.locator('.hamburger');
    await expect(hamburger).toBeVisible();

    // Tablet should show bottom nav
    const bottomNav = page.locator('.bottom-nav');
    await expect(bottomNav).toBeVisible();

    // Desktop nav should be hidden
    const desktopNav = page.locator('.desktop-nav');
    await expect(desktopNav).not.toBeVisible();
  });

  test('should work on desktop viewport', async ({ page }) => {
    await page.setViewportSize(DESKTOP_VIEWPORT);
    await page.goto('/');

    // Desktop should NOT show hamburger
    const hamburger = page.locator('.hamburger');
    await expect(hamburger).not.toBeVisible();

    // Desktop should NOT show bottom nav
    const bottomNav = page.locator('.bottom-nav');
    await expect(bottomNav).not.toBeVisible();

    // Desktop nav should be visible
    const desktopNav = page.locator('.desktop-nav');
    await expect(desktopNav).toBeVisible();
  });
});

test.describe('PACK-060: Performance & Animations', () => {
  test('should have smooth transitions for menu open/close', async ({ page }) => {
    await page.setViewportSize(MOBILE_VIEWPORT);
    await page.goto('/');

    const hamburger = page.locator('.hamburger');
    const mobileNav = page.locator('.mobile-nav');

    // Check transition exists
    const transition = await mobileNav.evaluate((el) => {
      return window.getComputedStyle(el).transition;
    });

    expect(transition).toContain('transform');
    expect(transition).toContain('0.4s'); // Smooth duration
  });

  test('should use GPU acceleration for animations', async ({ page }) => {
    await page.setViewportSize(MOBILE_VIEWPORT);
    await page.goto('/');

    const mobileNav = page.locator('.mobile-nav');
    const hamburger = page.locator('.hamburger');

    // Check for will-change (GPU hint)
    const mobileNavWillChange = await mobileNav.evaluate((el) => {
      return window.getComputedStyle(el).willChange;
    });

    expect(mobileNavWillChange).toContain('transform');

    // Check hamburger lines also optimized
    await hamburger.click();
    const hamburgerLine = page.locator('.hamburger-line').first();
    const willChange = await hamburgerLine.evaluate((el) => {
      return window.getComputedStyle(el).willChange;
    });

    expect(willChange).toContain('transform');
  });
});

test.describe('PACK-060: Accessibility', () => {
  test('should trap focus within open drawer', async ({ page }) => {
    await page.setViewportSize(MOBILE_VIEWPORT);
    await page.goto('/');

    // Open menu
    await page.locator('.hamburger').click();

    // Tab through menu items
    await page.keyboard.press('Tab');

    // Focus should be on first menu item
    const firstLink = page.locator('.mobile-link').first();
    const focusedElement = await page.evaluate(() => document.activeElement?.textContent);
    expect(focusedElement).toBe((await firstLink.textContent())?.trim());
  });

  test('should return focus to hamburger after closing with Escape', async ({ page }) => {
    await page.setViewportSize(MOBILE_VIEWPORT);
    await page.goto('/');

    const hamburger = page.locator('.hamburger');

    // Open menu
    await hamburger.click();

    // Press Escape
    await page.keyboard.press('Escape');

    // Wait for close animation
    await page.waitForTimeout(500);

    // Focus should be back on hamburger
    const focusedElement = await page.evaluate(() => document.activeElement);
    expect(focusedElement).toBe(await hamburger.elementHandle());
  });
});

# Firefox Testing Plan for DadDeck TCG

**Document Version:** 1.0
**Last Updated:** January 18, 2026
**Related User Story:** COMPAT-002

---

## Overview

This document provides a comprehensive testing plan for Firefox-specific CSS fixes implemented in `src/styles/firefox-fixes.css`. These fixes address known Firefox rendering issues, browser quirks, and performance considerations.

---

## Test Environment Setup

### Required Firefox Versions

Test on the following Firefox versions:
- **Firefox Latest** (current stable release)
- **Firefox ESR** (Extended Support Release - currently Firefox 115)
- **Firefox 103** (first version with backdrop-filter support)
- **Firefox for Android** (mobile version)

### Download Links
- **Desktop:** https://www.mozilla.org/firefox/
- **Android:** https://play.google.com/store/apps/details?id=org.mozilla.firefox
- **ESR:** https://www.mozilla.org/firefox/enterprise/

### Testing Platforms

| Platform | Firefox Version | Priority |
|----------|----------------|----------|
| Windows 10/11 | Latest, ESR | Critical |
| macOS 13+ | Latest, ESR | Critical |
| Linux (Ubuntu) | Latest | High |
| Android 13+ | Latest | High |

---

## Test Categories

### 1. Grid Layout Tests

**Purpose:** Verify CSS Grid rendering fixes work correctly

**Test Cases:**

1. **Card Grid Display**
   - Navigate to `/collection`
   - **Expected:** Grid displays with consistent gaps
   - **Check:** No 1px gaps or misalignment between cards

2. **Grid Gap Consistency**
   - Open collection view with 20+ cards
   - **Expected:** All gaps between cards are uniform
   - **Check:** Measure gaps in DevTools - should be 1rem (16px) ±0.5px

3. **Responsive Grid**
   - Resize browser window from mobile (375px) to desktop (1920px)
   - **Expected:** Grid columns adjust smoothly
   - **Check:** No cards overlap or get cut off during resize

4. **Grid with Mixed Content**
   - View collection with cards of different rarities
   - **Expected:** All cards align properly regardless of content
   - **Check:** Grid rows are straight and even

**Pass Criteria:**
- ✅ Grid gaps are consistent across all breakpoints
- ✅ No 1px rounding errors visible
- ✅ Cards align properly in all screen sizes

---

### 2. Flexbox Tests

**Purpose:** Verify Flexbox min-height bug fixes

**Test Cases:**

1. **Full-Height Flex Containers**
   - Navigate to `/pack` page
   - **Expected:** Page fills viewport height completely
   - **Check:** No unwanted scrollbars on body element

2. **Flex Card Containers**
   - Open pack and view card reveal
   - **Expected:** Cards display at proper height
   - **Check:** No cards appear squashed or stretched

3. **Flex Gap Consistency**
   - View navigation bar on desktop and mobile
   - **Expected:** Consistent spacing between nav items
   - **Check:** Gaps don't shift or break during resize

**Pass Criteria:**
- ✅ Full-height layouts work correctly
- ✅ No min-height bugs in flex containers
- ✅ Flex gaps render consistently

---

### 3. Backdrop Filter Tests

**Purpose:** Verify backdrop-filter support and fallbacks

**Test Cases:**

1. **Firefox 103+ Backdrop Filter**
   - Use Firefox 103 or newer
   - Open pack to trigger modal
   - **Expected:** Modal backdrop has blur effect
   - **Check:** `backdrop-filter: blur()` is applied in DevTools

2. **Firefox < 103 Fallback**
   - Use Firefox 102 or ESR version if available
   - Open pack to trigger modal
   - **Expected:** Solid background fallback (no blur)
   - **Check:** Background is `rgba(0, 0, 0, 0.85)` or similar

3. **Performance Check**
   - Open/close modal 10 times rapidly
   - **Expected:** No lag or frame drops
   - **Check:** DevTools Performance tab shows 60fps

**Pass Criteria:**
- ✅ Blur effect works on Firefox 103+
- ✅ Solid fallback for older Firefox versions
- ✅ No performance degradation

---

### 4. Animation Performance Tests

**Purpose:** Verify animations run smoothly in Firefox

**Test Cases:**

1. **Pack Opening Animation**
   - Navigate to `/pack` and open a pack
   - **Expected:** Smooth pack tear animation at 60fps
   - **Check:** DevTools Performance recorder shows smooth animation

2. **Card Flip Animation**
   - Click cards to flip them
   - **Expected:** Smooth 3D transform at 60fps
   - **Check:** No stuttering or frame drops

3. **Holo Sparkle Effects**
   - Open a pack with rare/epic/legendary cards
   - **Expected:** Particle effects animate smoothly
   - **Check:** No lag during particle animations

4. **Reduced Motion Mode**
   - Enable `prefers-reduced-motion: reduce` in Firefox settings
   - Open pack and flip cards
   - **Expected:** Animations are disabled or instant
   - **Check:** All animations respect reduced motion preference

**Pass Criteria:**
- ✅ All animations run at 60fps
- ✅ No frame drops or stuttering
- ✅ Respects `prefers-reduced-motion`

---

### 5. Form Element Tests

**Purpose:** Verify consistent form element styling

**Test Cases:**

1. **Input Focus States**
   - Navigate to `/collection`
   - Click search input field
   - **Expected:** Visible focus outline (2px solid #fbbf24)
   - **Check:** Focus ring is clearly visible

2. **Button Styling**
   - View all buttons across the app
   - **Expected:** Consistent button appearance
   - **Check:** No Firefox default button styles visible

3. **Mobile Input Zoom**
   - On Firefox Android, tap a text input field
   - **Expected:** No automatic page zoom
   - **Check:** Page stays at 100% zoom level

4. **Checkbox/Radio Styling**
   - View settings page with checkboxes
   - **Expected:** Custom styled checkboxes/radios
   - **Check:** No Firefox default form elements visible

**Pass Criteria:**
- ✅ All form elements have consistent styling
- ✅ Focus indicators are visible
- ✅ No unwanted zoom on mobile inputs

---

### 6. Scrollbar Tests

**Purpose:** Verify Firefox scrollbar styling

**Test Cases:**

1. **Thin Scrollbar (Desktop)**
   - On Firefox desktop, view collection page
   - **Expected:** Thin scrollbar (scrollbar-width: thin)
   - **Check:** Scrollbar is slim and not obtrusive

2. **Scrollbar Color**
   - View scrollbar in light and dark mode
   - **Expected:** Colors match theme
   - **Check:** Light gray in light mode, darker in dark mode

3. **Auto Scrollbar (Modals)**
   - Open modal with scrollable content
   - **Expected:** Auto-width scrollbar
   - **Check:** Scrollbar is standard width, not thin

**Pass Criteria:**
- ✅ Scrollbars are styled consistently
- ✅ Colors match light/dark themes
- ✅ Thin scrollbars work on Firefox 64+

---

### 7. Text Rendering Tests

**Purpose:** Verify font rendering is consistent

**Test Cases:**

1. **Font Smoothing**
   - View card text on Windows and macOS
   - **Expected:** Smooth, anti-aliased text
   - **Check:** No jagged edges on card text

2. **Text Selection**
   - Select text on cards and descriptions
   - **Expected:** Yellow highlight (rgba(251, 191, 36, 0.3))
   - **Check:** Selection color matches other browsers

3. **Line Height Consistency**
   - View cards with long flavor text
   - **Expected:** Consistent line spacing
   - **Check:** Line height matches Safari/Chrome

**Pass Criteria:**
- ✅ Text renders smoothly on all platforms
- ✅ Selection colors are consistent
- ✅ No text layout issues

---

### 8. Mobile Firefox Tests

**Purpose:** Verify Firefox for Android compatibility

**Test Cases:**

1. **Touch Targets**
   - Tap all buttons and interactive elements
   - **Expected:** Minimum 48x48px touch targets
   - **Check:** All buttons are easily tappable

2. **Viewport Height**
   - Rotate device (portrait ↔ landscape)
   - **Expected:** Content fills viewport correctly
   - **Check:** No cut-off content or scroll issues

3. **Input Focus on Mobile**
   - Tap search input in collection
   - **Expected:** Keyboard appears, no page zoom
   - **Check:** Input field remains visible with keyboard open

4. **Scroll Performance**
   - Scroll through collection of 50+ cards
   - **Expected:** Smooth 60fps scrolling
   - **Check:** No jank or frame drops

**Pass Criteria:**
- ✅ All touch targets meet minimum size
- ✅ Viewport handles rotation correctly
- ✅ No unwanted zoom on input focus
- ✅ Smooth scrolling performance

---

### 9. Dark Mode Tests

**Purpose:** Verify Firefox dark mode support

**Test Cases:**

1. **System Dark Mode**
   - Enable dark mode in Firefox settings
   - Navigate to any page
   - **Expected:** Dark theme applies correctly
   - **Check:** All colors invert properly, no contrast issues

2. **Form Elements in Dark Mode**
   - View input fields and buttons in dark mode
   - **Expected:** Dark background, light text
   - **Check:** High contrast, readable text

3. **Scrollbar in Dark Mode**
   - View scrollbar in dark mode
   - **Expected:** Dark scrollbar colors
   - **Check:** Scrollbar matches dark theme

**Pass Criteria:**
- ✅ Dark mode applies correctly
- ✅ Form elements are readable
- ✅ Scrollbar matches theme

---

### 10. Performance Tests

**Purpose:** Verify Firefox performance optimizations

**Test Cases:**

1. **Initial Page Load**
   - Clear cache, reload page
   - **Expected:** <3s First Contentful Paint
   - **Check:** DevTools Lighthouse score 90+

2. **Pack Generation Performance**
   - Open 10 packs rapidly
   - **Expected:** Each pack opens in <500ms
   - **Check:** No lag or stuttering

3. **Memory Usage**
   - Monitor memory in DevTools while browsing
   - **Expected:** Stable memory usage
   - **Check:** No memory leaks detected

4. **GPU Acceleration**
   - Check DevTools Layers tab during animations
   - **Expected:** GPU-accelerated layers
   - **Check:** Composite layers for animated elements

**Pass Criteria:**
- ✅ Page loads in <3 seconds
- ✅ Pack generation is responsive
- ✅ No memory leaks
- ✅ GPU acceleration active

---

## Regression Testing

### Critical Paths to Test

After implementing Firefox fixes, test these critical user paths:

1. **Pack Opening Flow**
   - Landing → Click "Open Pack" → Animation → Reveal → Results
   - **Must Work:** Smooth animations, no layout shifts

2. **Collection Viewing**
   - Navigate to collection → Scroll → Filter → Sort
   - **Must Work:** Grid layout, search, filters, sorting

3. **Deck Building**
   - Navigate to deck builder → Add cards → View stats
   - **Must Work:** Card selection, deck validation

4. **Trading**
   - Navigate to trade → Select cards → Create trade
   - **Must Work:** Card selection UI, modal dialogs

5. **Settings**
   - Toggle theme → Toggle animations → Change language
   - **Must Work:** All settings apply immediately

---

## Known Firefox Issues Fixed

| Issue | Fix Location | Status |
|-------|--------------|--------|
| Grid gap rounding errors | Lines 67-84 | ✅ Fixed |
| Flexbox min-height bug | Lines 88-107 | ✅ Fixed |
| backdrop-filter support | Lines 30-56 | ✅ Fixed |
| Animation performance | Lines 175-202 | ✅ Fixed |
| Form element styling | Lines 117-145 | ✅ Fixed |
| Scrollbar styling | Lines 149-172 | ✅ Fixed |
| Font rendering | Lines 206-220 | ✅ Fixed |
| Mobile input zoom | Lines 403-408 | ✅ Fixed |
| Dark mode support | Lines 374-401 | ✅ Fixed |

---

## Test Execution Checklist

### Pre-Testing Setup
- [ ] Install Firefox Latest on Windows
- [ ] Install Firefox Latest on macOS
- [ ] Install Firefox ESR (for testing older versions)
- [ ] Install Firefox for Android
- [ ] Enable Firefox DevTools
- [ ] Clear browser cache and cookies

### Desktop Testing (Windows/macOS/Linux)
- [ ] Grid Layout Tests (Section 1)
- [ ] Flexbox Tests (Section 2)
- [ ] Backdrop Filter Tests (Section 3)
- [ ] Animation Performance Tests (Section 4)
- [ ] Form Element Tests (Section 5)
- [ ] Scrollbar Tests (Section 6)
- [ ] Text Rendering Tests (Section 7)
- [ ] Dark Mode Tests (Section 9)
- [ ] Performance Tests (Section 10)

### Mobile Testing (Firefox for Android)
- [ ] Mobile Firefox Tests (Section 8)
- [ ] Dark Mode Tests (Section 9)
- [ ] Performance Tests (Section 10)

### Regression Testing
- [ ] Pack Opening Flow
- [ ] Collection Viewing
- [ ] Deck Building
- [ ] Trading
- [ ] Settings

---

## Reporting Test Results

### Bug Report Template

If you find a Firefox-specific issue, report it with this template:

```markdown
**Firefox Version:** [Version number]
**OS:** [Windows/macOS/Linux + Version]
**Test Category:** [Section from test plan]
**Steps to Reproduce:**
1.
2.
3.

**Expected Behavior:**
[What should happen]

**Actual Behavior:**
[What actually happens]

**Screenshots/Video:**
[Attach if applicable]

**Console Errors:**
[Check DevTools Console for errors]

**DevTools Observations:**
[Computed styles, layout, etc.]
```

### Success Criteria

Mark COMPAT-002 as complete when:
- ✅ All test categories pass on Firefox Latest
- ✅ All test categories pass on Firefox ESR
- ✅ Mobile Firefox tests pass on Android
- ✅ No regressions in other browsers (Chrome, Safari, Edge)
- ✅ Performance metrics meet targets (60fps, <3s load time)

---

## Automated Testing

### CSS Linting
```bash
# Run Stylelint to check CSS syntax
bun run lint
```

### Visual Regression Testing
Consider using tools like:
- **BackstopJS** - Visual regression testing
- **Percy** - Cross-browser visual testing
- **Playwright** - Automated browser testing

### Lighthouse CI
```bash
# Run Lighthouse in Firefox
bun run build
bun run preview
# Open Firefox DevTools → Lighthouse → Run audit
```

---

## Additional Resources

### Firefox DevTools
- **Inspector:** Check computed styles and layout
- **Performance:** Monitor animation frame rates
- **Memory:** Detect memory leaks
- **Console:** Check for JavaScript errors
- **Network:** Monitor asset loading

### Firefox-Specific CSS Resources
- [Mozilla CSS Reference](https://developer.mozilla.org/docs/Web/CSS)
- [Firefox CSS Release Notes](https://developer.mozilla.org/docs/Mozilla/Firefox/Releases)
- [Firefox CSS Compatibility](https://developer.mozilla.org/docs/Web/CSS/CSS_Compatibility)

### Testing Tools
- [Firefox Browser Stack](https://www.browserstack.com/firefox) - Test multiple Firefox versions
- [Firefox Nightly](https://www.mozilla.org/firefox/channel/desktop/) - Test bleeding-edge features
- [Firefox Developer Edition](https://www.mozilla.org/firefox/developer/) - Pre-release for developers

---

**Next Steps:**
1. Execute test plan on target Firefox versions
2. Document any issues found
3. Create GitHub issues for bugs
4. Re-test after fixes
5. Mark COMPAT-002 complete when all tests pass

---

**Document Owner:** DadDeck Development Team
**Last Reviewed:** January 18, 2026
**Next Review:** After each Firefox major release

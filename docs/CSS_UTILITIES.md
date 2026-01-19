# CSS Utilities & Component Classes

## Overview

This document describes the reusable CSS utility classes created to consolidate duplicate Tailwind classes across the DadDeck™ codebase.

## Purpose

**Problem**: Components were repeating the same long Tailwind class strings, leading to:
- Larger HTML/Svelte output
- Harder to maintain consistent styling
- More verbose component code
- Difficulty updating common patterns

**Solution**: Create semantic component classes using Tailwind's `@apply` directive.

---

## Component Classes

### Buttons

#### `.btn-primary`
Primary action buttons with gradient background.

**Use for**: Main CTAs, pack opening, confirm actions

**Tailwind classes**:
```css
px-6 py-3 bg-gradient-to-r from-amber-500 to-orange-500
text-white font-bold rounded-lg shadow-lg
hover:from-amber-400 hover:to-orange-400
active:scale-95 transition-all duration-200
focus:outline-none focus:ring-2 focus:ring-amber-400
focus:ring-offset-2 focus:ring-offset-slate-900
```

**Example**:
```html
<button class="btn-primary">Open Pack</button>
```

---

#### `.btn-secondary`
Secondary action buttons with solid background.

**Use for**: Cancel, go back, alternative actions

**Tailwind classes**:
```css
px-6 py-3 bg-slate-700 text-white font-medium rounded-lg
hover:bg-slate-600 active:scale-95 transition-all duration-200
focus:outline-none focus:ring-2 focus:ring-slate-400
focus:ring-offset-2 focus:ring-offset-slate-900
```

**Example**:
```html
<button class="btn-secondary">Cancel</button>
```

---

#### `.btn-icon`
Icon-only buttons with hover states.

**Use for**: Close buttons, settings, toggle controls

**Tailwind classes**:
```css
p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300
rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700
transition-colors min-w-[48px] min-h-[48px]
```

**Example**:
```html
<button class="btn-icon" aria-label="Close">
  <svg class="w-6 h-6">...</svg>
</button>
```

---

#### `.btn-cta`
Large call-to-action buttons for prominent actions.

**Use for**: Welcome screen main CTAs, upgrade prompts

**Tailwind classes**:
```css
flex-1 px-8 py-4 bg-gradient-to-r from-yellow-400 to-orange-500
text-white rounded-xl font-bold text-lg
hover:from-yellow-500 hover:to-orange-600
transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5
```

**Example**:
```html
<button class="btn-cta">Start Opening Packs</button>
```

---

### Modals

#### `.modal-container`
Full-screen flex-centered wrapper for modals.

**Use for**: Modal/dialog outer container

**Tailwind classes**:
```css
fixed inset-0 z-50 flex items-center justify-center p-4
```

**Example**:
```html
<div class="modal-container">
  <div class="modal-backdrop"></div>
  <div class="modal-content">...</div>
</div>
```

---

#### `.modal-backdrop`
Backdrop overlay with blur effect.

**Use for**: Modal backdrop to dim background

**Tailwind classes**:
```css
absolute inset-0 bg-black/70 backdrop-blur-sm
```

**Example**:
```html
<div class="modal-container">
  <div class="modal-backdrop"></div>
  <!-- Content -->
</div>
```

---

#### `.modal-content`
Modal content container with responsive sizing.

**Use for**: Modal content wrapper

**Tailwind classes**:
```css
relative z-10 w-full max-w-2xl bg-white dark:bg-gray-800
rounded-3xl shadow-2xl
```

**Example**:
```html
<div class="modal-content p-8">
  <h2>Modal Title</h2>
  <p>Modal content goes here...</p>
</div>
```

---

#### `.modal-close-btn`
Positioned close button for modals.

**Use for**: Modal close button (top-right)

**Tailwind classes**:
```css
absolute top-4 right-4 btn-icon
```

**Example**:
```html
<div class="modal-content">
  <button class="modal-close-btn" aria-label="Close modal">
    <svg class="w-6 h-6">...</svg>
  </button>
  <!-- Content -->
</div>
```

---

### Feature Cards

#### `.feature-card`
Feature showcase cards for onboarding/landing pages.

**Use for**: Feature highlights, tutorial steps, benefits

**Tailwind classes**:
```css
flex flex-col items-center text-center
p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl
```

**Example**:
```html
<div class="feature-card">
  <div class="icon-container">...</div>
  <h3 class="text-feature-title">Feature Name</h3>
  <p class="text-feature-desc">Feature description</p>
</div>
```

---

#### `.icon-container`
Circular icon containers with colored backgrounds.

**Use for**: Feature icons, stat icons, badge icons

**Tailwind classes**:
```css
w-12 h-12 bg-blue-100 dark:bg-blue-900/30
rounded-full flex items-center justify-center
```

**Variants**: Change `bg-blue-100` to other colors (purple, green, etc.)

**Example**:
```html
<div class="icon-container bg-purple-100 dark:bg-purple-900/30">
  <svg class="w-6 h-6 text-purple-600">...</svg>
</div>
```

---

#### `.text-feature-title`
Typography for feature card titles.

**Use for**: Feature card headings

**Tailwind classes**:
```css
font-semibold text-gray-900 dark:text-white mb-1
```

**Example**:
```html
<h3 class="text-feature-title">Open Packs</h3>
```

---

#### `.text-feature-desc`
Typography for feature card descriptions.

**Use for**: Feature card descriptions

**Tailwind classes**:
```css
text-sm text-gray-600 dark:text-gray-400
```

**Example**:
```html
<p class="text-feature-desc">
  Open digital packs to collect hilarious dad cards
</p>
```

---

## Design Tokens

### Colors

#### Brand Colors
- `dad-blue`: #1a365d - Primary brand color
- `dad-gold`: #d69e2e - Secondary accent
- `dad-green`: #276749 - Success states
- `dad-brown`: #744210 - Earth tones

#### Rarity Colors
- `rarity-common`: #9ca3af - Grey
- `rarity-uncommon`: #60a5fa - Blue
- `rarity-rare`: #fbbf24 - Gold
- `rarity-epic`: #a855f7 - Purple
- `rarity-legendary`: #f97316 - Orange
- `rarity-mythic`: #ec4899 - Pink

#### Gradient Colors
- `gradient-start`: #fbbf24 - Yellow-400
- `gradient-end`: #f97316 - Orange-500

### Typography

#### Font Families
- `font-display`: system-ui, sans-serif - UI text
- `font-card`: Georgia, serif - Card text

### Animations

#### Custom Keyframes
- `pack-glow`: Pulsing glow for unopened packs
- `card-flip`: 3D card rotation
- `legendary-burst`: Particle burst effect
- `slide-in-right`: Slide from right entrance
- `particle-float`: Floating particle animation
- `shimmer`: Shimmer/glimmer effect
- `pulse-glow`: Pulsing opacity and scale
- `float-slow/medium/fast`: Floating animations

#### Animation Classes
- `.animate-pack-glow`: Apply pack glow animation
- `.animate-card-flip`: Apply card flip animation
- `.animate-legendary-burst`: Apply burst effect
- `.animate-slide-in-right`: Apply slide entrance
- `.animate-particle`: Apply particle float
- `.animate-shimmer`: Apply shimmer effect
- `.animate-float-slow`: Apply slow float (6s)
- `.animate-float-medium`: Apply medium float (5s)
- `.animate-float-fast`: Apply fast float (4s)
- `.animate-pulse-glow`: Apply pulse glow
- `.animate-shake`: Apply screen shake

---

## Usage Guidelines

### When to Use Component Classes

✅ **DO use component classes for**:
- Common UI patterns (buttons, modals, cards)
- Repeated layouts (flex containers, grids)
- Consistent spacing/typography patterns
- Complex hover/focus states

❌ **DON'T use component classes for**:
- One-off layout tweaks
- Component-specific positioning
- Overrides for unique situations

### Extending Component Classes

**Use Tailwind utilities alongside component classes**:

```html
<!-- Add padding to modal content -->
<div class="modal-content p-8">...</div>

<!-- Change button size -->
<button class="btn-primary px-12 py-6">Large Button</button>

<!-- Change icon container color -->
<div class="icon-container bg-green-100 dark:bg-green-900/30">
  <svg class="w-6 h-6 text-green-600">...</svg>
</div>
```

### Creating New Component Classes

**Follow this pattern** when identifying new duplicate patterns:

1. **Find the duplication**:
   ```bash
   # Search for repeated class strings
   grep -r "flex flex-col items-center text-center" src/components
   ```

2. **Create semantic name**:
   - Use noun-based naming: `.feature-card`, `.modal-content`
   - Avoid action names: `.open-modal`, `.click-button`

3. **Add to global.css**:
   ```css
   .my-new-class {
     @apply /* repeated classes here */;
   }
   ```

4. **Document here**: Add section to this file

5. **Replace in components**: Find and replace usage

---

## Migration Guide

### Before (Duplicate Classes)

```html
<!-- WelcomeModal.svelte -->
<div class="fixed inset-0 z-50 flex items-center justify-center p-4">
  <div class="absolute inset-0 bg-black/70 backdrop-blur-sm"></div>
  <div class="relative z-10 w-full max-w-2xl bg-white dark:bg-gray-800 rounded-3xl shadow-2xl">
    <button class="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 rounded-lg">✕</button>
  </div>
</div>

<!-- TutorialComplete.svelte -->
<div class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
  <div class="relative bg-gradient-to-br from-yellow-400 to-orange-500 rounded-3xl p-8">
    <!-- Different content -->
  </div>
</div>
```

### After (Component Classes)

```html
<!-- WelcomeModal.svelte -->
<div class="modal-container">
  <div class="modal-backdrop"></div>
  <div class="modal-content">
    <button class="modal-close-btn">✕</button>
  </div>
</div>

<!-- TutorialComplete.svelte -->
<div class="modal-container">
  <div class="modal-backdrop"></div>
  <div class="relative bg-gradient-to-br from-yellow-400 to-orange-500 rounded-3xl p-8">
    <!-- Different content -->
  </div>
</div>
```

**Benefits**:
- ✅ 50% less HTML output
- ✅ Clearer component intent
- ✅ Easier to maintain
- ✅ Consistent styling

---

## File Locations

### Configuration
- **Tailwind config**: `tailwind.config.mjs`
- **Global styles**: `src/styles/global.css`
- **Performance utilities**: `src/styles/performance.css`

### Component Usage
All components in `src/components/` can use these classes.

---

## Future Improvements

### Potential Additions
- `.card-grid`: Responsive grid for card collections
- `.stat-badge`: Badge for stat display
- `.progress-bar`: Progress indicator
- `.tooltip`: Tooltip component classes
- `.dropdown`: Dropdown menu classes
- `.toast`: Notification toast classes

### Considerations
- Monitor bundle size impact (should be minimal with Tailwind purge)
- Gather feedback from developers on usability
- Add more variants as patterns emerge
- Consider color variants for buttons (success, warning, danger)

---

**Last updated**: January 18, 2026
**Status**: ✅ Consolidated duplicate classes and documented design tokens

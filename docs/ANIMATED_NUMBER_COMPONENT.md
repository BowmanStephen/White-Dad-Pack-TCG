# AnimatedNumber Component Documentation

## Overview

The `AnimatedNumber` component provides smooth count-up/count-down animations for numeric values in DadDeck™. It's perfect for displaying currency, stats, or any changing numbers with visual feedback.

## Features

✅ **Smooth Animations**: Count up/down with easing (ease-out cubic)
✅ **Color Feedback**: Green for increases, red for decreases
✅ **Decimal Support**: Configurable decimal places
✅ **Optional Signs**: Show +/- prefix for positive numbers
✅ **Accessibility**: Respects `prefers-reduced-motion` setting
✅ **Performant**: Uses `requestAnimationFrame` for 60fps animations

## Installation

The component is located at:
```
src/components/common/AnimatedNumber.svelte
```

## Basic Usage

```svelte
<script>
  import AnimatedNumber from '@/components/common/AnimatedNumber.svelte';

  let coins = $state(100);
</script>

<p>Coins: <AnimatedNumber {coins} /></p>
<button onclick={() => coins += 10}>+10</button>
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `value` | `number` | **Required** | The numeric value to display |
| `duration` | `number` | `500` | Animation duration in milliseconds |
| `decimals` | `number` | `0` | Number of decimal places to show |
| `showSign` | `boolean` | `false` | Show +/- prefix for positive numbers |
| `colorChange` | `boolean` | `true` | Enable color change on value changes |
| `className` | `string` | `''` | Additional CSS classes to apply |

## Examples

### Currency Display

```svelte
<p>
  Balance: $
  <AnimatedNumber
    value={balance}
    decimals={2}
  />
</p>
```

### With Sign Indicator

```svelte
<p>
  Change:
  <AnimatedNumber
    value={statChange}
    showSign={true}
  />
</p>
<!-- Output: +15 or -8 -->
```

### Slow Animation for Dramatic Effect

```svelte
<p>
  Level:
  <AnimatedNumber
    value={level}
    duration={2000}
  />
</p>
```

### No Color Change

```svelte
<p>
  Score:
  <AnimatedNumber
    value={score}
    colorChange={false}
  />
</p>
```

### Custom Styling

```svelte
<p>
  Power:
  <AnimatedNumber
    value={power}
    className="text-2xl font-bold text-purple-500"
  />
</p>
```

## Behavior

### Color Indicators

When `colorChange={true}` (default):
- **Green** (`#22c55e`): Value increased
- **Red** (`#ef4444`): Value decreased
- **Inherit**: No change or `colorChange={false}`

### Animation Timing

- **Default duration**: 500ms
- **Easing function**: Ease-out cubic (1 - (1 - t)³)
- **Frame rate**: 60fps via `requestAnimationFrame`
- **Skipped**: When reduced motion is enabled

### Reduced Motion Support

The component respects user preferences for reduced motion:

1. **System preference**: Follows `prefers-reduced-motion`
2. **Manual override**: Respects DadDeck's motion mode setting
3. **Behavior**: When reduced, animations are skipped and values update instantly

## Integration with DadDeck Stores

### Pack Opening Stats

```svelte
<script>
  import AnimatedNumber from '@/components/common/AnimatedNumber.svelte';
  import { packStore } from '@/stores/pack';

  const packValue = computed(packStore, pack => {
    return pack.cards.reduce((sum, card) => sum + card.value, 0);
  });
</script>

<p>Pack Value: <AnimatedNumber value={$packValue} /></p>
```

### Currency System

```svelte
<script>
  import AnimatedNumber from '@/components/common/AnimatedNumber.svelte';
  import { currency } from '@/stores/currency';
</script>

<p>
  Coins:
  <AnimatedNumber
    value={$currency.coins}
    decimals={0}
  />
</p>
```

### Achievement Tracking

```svelte
<script>
  import AnimatedNumber from '@/components/common/AnimatedNumber.svelte';
  import { achievements } from '@/stores/achievements';
</script>

<p>
  Unlocked:
  <AnimatedNumber
    value={$achievements.unlockedCount}
    showSign={false}
  />
  /
  <AnimatedNumber
    value={$achievements.totalCount}
    showSign={false}
  />
</p>
```

## Performance Considerations

### Optimizing Multiple AnimatedNumbers

When animating many numbers (e.g., leaderboards):

```svelte
{#each players as player}
  <div class="flex justify-between">
    <span>{player.name}</span>
    <!-- Shorter duration for bulk updates -->
    <AnimatedNumber
      value={player.score}
      duration={200}
    />
  </div>
{/each}
```

### Debouncing Rapid Changes

For rapidly changing values (e.g., real-time stats):

```svelte
<script>
  import AnimatedNumber from '@/components/common/AnimatedNumber.svelte';
  import { debounce } from '@/utils/timing';

  let displayValue = $state(0);
  let actualValue = $state(0);

  // Debounce updates to avoid animation jitter
  const updateDisplay = debounce((val) => {
    displayValue = val;
  }, 100);

  $effect(() => {
    updateDisplay(actualValue);
  });
</script>

<AnimatedNumber value={displayValue} />
```

## Accessibility

### Keyboard Navigation

The component itself doesn't require keyboard interaction, but if used in interactive contexts:

```svelte
<button
  onclick={() => value += 1}
  aria-label="Increase value by 1"
>
  <AnimatedNumber {value} />
</button>
```

### Screen Readers

Screen readers announce the final value (not the animation):

```svelte
<!-- Announced as "Your score is 100 points" -->
<p>
  Your score is
  <AnimatedNumber value={score} aria-live="polite" />
  points
</p>
```

### Reduced Motion

Automatically respects:
- System `prefers-reduced-motion` media query
- DadDeck's motion mode setting (`auto` | `reduced` | `full`)

## Testing

### Unit Test Example

```typescript
import { render } from '@testing-library/svelte';
import AnimatedNumber from '@/components/common/AnimatedNumber.svelte';

test('renders initial value', () => {
  const { container } = render(AnimatedNumber, { value: 42 });
  expect(container.textContent).toContain('42');
});

test('formats decimals', () => {
  const { container } = render(AnimatedNumber, {
    value: 123.456,
    decimals: 2
  });
  expect(container.textContent).toContain('123.46');
});
```

### Visual Testing

Use Playwright to screenshot animation states:

```typescript
test(' AnimatedNumber color change', async ({ page }) => {
  await page.goto('/animated-number-demo');

  // Initial state
  await expect(page.locator('.animated-number')).not.toHaveClass(/up/);

  // Trigger increase
  await page.click('button:has-text("+10")');

  // Check for color change
  await expect(page.locator('.animated-number')).toHaveClass(/up/);
});
```

## Troubleshooting

### Animation Not Playing

**Problem**: Numbers change instantly without animation

**Solutions**:
1. Check if reduced motion is enabled: `isReducedMotion.get()`
2. Verify duration isn't 0: `<AnimatedNumber value={x} duration={500} />`
3. Check console for animation frame errors

### Colors Not Changing

**Problem**: Numbers don't show green/red on increase/decrease

**Solutions**:
1. Ensure `colorChange={true}` (default)
2. Verify CSS is loading: check for `.color-change.up` and `.color-change.down` classes
3. Check if value actually changed (no change = no color)

### Performance Issues

**Problem**: Many AnimatedNumbers cause lag

**Solutions**:
1. Reduce duration: `duration={200}` instead of `500`
2. Limit concurrent animations: animate only visible elements
3. Use virtual scrolling for long lists

## Demo Page

Visit `/animated-number-demo` to see live examples:
- Basic counter
- Currency display
- Sign indicators
- Custom durations
- Color change toggle

## See Also

- **Motion Store**: `src/stores/motion.ts` - Reduced motion settings
- **Animation Best Practices**: `docs/ANIMATION_GUIDE.md`
- **CSS Utilities**: `docs/CSS_UTILITIES.md`

## Changelog

### Version 1.0.0 (2026-01-18)
- Initial implementation
- Count up/down animations with easing
- Color change on increase/decrease
- Decimal support
- Sign indicator option
- Reduced motion support
- TypeScript types

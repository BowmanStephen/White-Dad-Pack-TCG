# Form Components Quick Reference

## Overview

Three production-ready form components have been created with consistent styling, animations, and accessibility features.

- **FormInput** - Text input with animated labels
- **FormSelect** - Custom dropdown with keyboard navigation
- **FormCheckbox** - Styled checkbox with animations

All components support rarity-based theming, error states, and helper text.

---

## FormInput

### Basic Usage

```svelte
<script>
  import FormInput from '@/components/common/FormInput.svelte';
  
  let cardName = $state('');
</script>

<FormInput
  label="Card Name"
  placeholder="Enter card name"
  value={cardName}
  onchange={(val) => cardName = val}
/>
```

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `label` | string | `''` | Field label |
| `placeholder` | string | `''` | Placeholder text |
| `value` | string | `''` | Input value (bindable) |
| `type` | string | `'text'` | Input type (text, email, number, etc.) |
| `disabled` | boolean | `false` | Disable input |
| `error` | string | `''` | Error message (shows red state) |
| `helperText` | string | `''` | Helper/hint text below input |
| `size` | 'sm' \| 'md' \| 'lg' | `'md'` | Input size |
| `iconLeft` | string | `''` | Left icon (emoji) |
| `iconRight` | string | `''` | Right icon (emoji) |
| `rarity` | keyof RARITY_CONFIG | `undefined` | Rarity for focus ring color |
| `onchange` | function | `undefined` | Change handler |
| `onblur` | function | `undefined` | Blur handler |
| `onfocus` | function | `undefined` | Focus handler |

### Examples

**With Icons**
```svelte
<FormInput
  label="Search Cards"
  placeholder="Type to search..."
  iconLeft="🔍"
  value={search}
  onchange={(val) => search = val}
/>
```

**With Error**
```svelte
<FormInput
  label="Email"
  placeholder="your@email.com"
  type="email"
  value={email}
  error="Invalid email format"
  onchange={(val) => email = val}
/>
```

**Rarity-Themed**
```svelte
<FormInput
  label="Upgrade Level"
  placeholder="Enter level"
  type="number"
  value={level}
  rarity="legendary"
  helperText="Max level: 10"
  onchange={(val) => level = val}
/>
```

**All Sizes**
```svelte
<FormInput size="sm" ... />   {/* h-8, small text */}
<FormInput size="md" ... />   {/* h-10, normal text */}
<FormInput size="lg" ... />   {/* h-12, large text */}
```

---

## FormSelect

### Basic Usage

```svelte
<script>
  import FormSelect from '@/components/common/FormSelect.svelte';
  
  let selectedRarity = $state('');
  
  const rarityOptions = [
    { value: 'common', label: 'Common' },
    { value: 'uncommon', label: 'Uncommon' },
    { value: 'rare', label: 'Rare' },
  ];
</script>

<FormSelect
  label="Card Rarity"
  options={rarityOptions}
  value={selectedRarity}
  onchange={(val) => selectedRarity = val}
/>
```

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `label` | string | `''` | Field label |
| `options` | Option[] | `[]` | Array of {value, label, icon?, disabled?} |
| `value` | string | `''` | Selected value (bindable) |
| `disabled` | boolean | `false` | Disable select |
| `error` | string | `''` | Error message |
| `helperText` | string | `''` | Helper text |
| `size` | 'sm' \| 'md' \| 'lg' | `'md'` | Select size |
| `rarity` | keyof RARITY_CONFIG | `undefined` | Rarity for focus color |
| `onchange` | function | `undefined` | Change handler |

### Option Structure

```typescript
interface Option {
  value: string;           // Unique value
  label: string;          // Display text
  icon?: string;          // Emoji icon (optional)
  disabled?: boolean;     // Disable option (optional)
}
```

### Examples

**With Icons**
```svelte
<FormSelect
  label="Dad Type"
  options={[
    { value: 'bbq', label: 'BBQ Dad', icon: '🔥' },
    { value: 'fixit', label: 'Fix-It Dad', icon: '🔧' },
    { value: 'golf', label: 'Golf Dad', icon: '⛳' },
  ]}
  value={selectedType}
  onchange={(val) => selectedType = val}
/>
```

**With Disabled Option**
```svelte
<FormSelect
  label="Available Decks"
  options={[
    { value: 'deck1', label: 'My First Deck' },
    { value: 'deck2', label: 'Pending Approval', disabled: true },
    { value: 'deck3', label: 'Battle Ready' },
  ]}
  value={selectedDeck}
  onchange={(val) => selectedDeck = val}
/>
```

**With Error**
```svelte
<FormSelect
  label="Select Rarity"
  options={rarityOptions}
  value={rarity}
  error="Please select a rarity"
  helperText="Higher rarities have better stats"
  onchange={(val) => rarity = val}
/>
```

**Rarity-Themed**
```svelte
<FormSelect
  label="Filter by Rarity"
  options={rarityOptions}
  value={filterRarity}
  rarity="epic"
  onchange={(val) => filterRarity = val}
/>
```

### Keyboard Navigation

- **Tab** - Focus on select
- **Space / Enter** - Open dropdown
- **Arrow Up/Down** - Navigate options
- **Enter** - Select option
- **Escape** - Close dropdown

---

## FormCheckbox

### Basic Usage

```svelte
<script>
  import FormCheckbox from '@/components/common/FormCheckbox.svelte';
  
  let agreeToTerms = $state(false);
</script>

<FormCheckbox
  label="I agree to the terms"
  checked={agreeToTerms}
  onchange={(val) => agreeToTerms = val}
/>
```

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `label` | string | `''` | Checkbox label |
| `checked` | boolean | `false` | Checked state (bindable) |
| `disabled` | boolean | `false` | Disable checkbox |
| `error` | string | `''` | Error message |
| `size` | 'sm' \| 'md' \| 'lg' | `'md'` | Checkbox size |
| `rarity` | keyof RARITY_CONFIG | `undefined` | Rarity for gradient color |
| `onchange` | function | `undefined` | Change handler |

### Examples

**With Error**
```svelte
<FormCheckbox
  label="Include holo cards only"
  checked={holoOnly}
  error="You must select at least one option"
  onchange={(val) => holoOnly = val}
/>
```

**Rarity-Themed**
```svelte
<FormCheckbox
  label="Favorite this card"
  checked={isFavorite}
  size="lg"
  rarity="mythic"
  onchange={(val) => isFavorite = val}
/>
```

**Multiple Checkboxes**
```svelte
<script>
  let filters = $state({
    common: false,
    rare: false,
    epic: false,
  });
</script>

<FormCheckbox
  label="Common"
  checked={filters.common}
  onchange={(val) => filters.common = val}
/>
<FormCheckbox
  label="Rare"
  checked={filters.rare}
  onchange={(val) => filters.rare = val}
/>
<FormCheckbox
  label="Epic"
  checked={filters.epic}
  onchange={(val) => filters.epic = val}
/>
```

### Keyboard Navigation

- **Tab** - Focus on checkbox
- **Space** - Toggle checkbox
- **Tab** - Move to label (if present)

---

## Form Layout Utilities

### Single Field
```svelte
<div class="form-field">
  <FormInput label="Card Name" ... />
</div>
```

### Row Layout (Side-by-Side)
```svelte
<div class="form-group-row">
  <FormInput label="First Name" ... />
  <FormInput label="Last Name" ... />
</div>
```

### Stacked Fields
```svelte
<div class="form-group">
  <FormInput label="Email" ... />
  <FormInput label="Password" type="password" ... />
  <FormSelect label="Rarity" ... />
  <FormCheckbox label="Remember me" ... />
</div>
```

---

## CSS Classes Reference

### Form Structure
```css
.form-field             /* Single field wrapper */
.form-group             /* Stacked fields container */
.form-group-row         /* Side-by-side fields grid */
.form-label-enhanced    /* Field label */
.form-hint-text         /* Helper or error text */
.form-hint-text.is-error /* Error message styling */
```

### Modal Integration
```css
.modal-section          /* Divider for form sections */
.modal-section-title    /* "Form Title" styling */
```

---

## Accessibility Features

### Keyboard Navigation
- ✅ All fields Tab-accessible
- ✅ FormSelect supports arrow keys
- ✅ Space to toggle checkbox
- ✅ Escape to close dropdowns
- ✅ Focus visible on all interactive elements

### Screen Readers
- ✅ Labels properly associated with inputs
- ✅ Error messages announced
- ✅ Helper text read on focus
- ✅ Select options have `role="option"`
- ✅ Disabled state announced

### Color Contrast
- ✅ WCAG AA compliant
- ✅ Works in dark mode
- ✅ Error text clearly visible
- ✅ Focus ring visible on all backgrounds

---

## Animation & Transitions

### Input Focus
- 0.2s transition
- Border color change to rarity color
- Subtle glow effect
- Smooth easing curve

### Select Dropdown
- 0.15s slide-down animation
- Chevron rotates on open
- Options highlight on hover
- Selected option shows gold background

### Checkbox
- Pop-in animation for checkmark
- 0.2s smooth transitions
- Gradient fill on check

### All animations respect `prefers-reduced-motion`

---

## Rarity Color Mapping

```typescript
// Automatically uses RARITY_CONFIG colors
rarity="common"      // Gray
rarity="uncommon"    // Blue
rarity="rare"        // Gold
rarity="epic"        // Purple
rarity="legendary"   // Orange
rarity="mythic"      // Pink
```

---

## Common Patterns

### Validation Form
```svelte
<div class="form-group">
  <FormInput
    label="Card Name"
    value={cardName}
    error={cardName.length < 3 ? "At least 3 characters" : ""}
    onchange={(val) => cardName = val}
  />
  
  <FormSelect
    label="Rarity"
    options={rarityOptions}
    value={rarity}
    error={!rarity ? "Required" : ""}
    onchange={(val) => rarity = val}
  />
  
  <FormCheckbox
    label="I have reviewed this card"
    checked={reviewed}
    error={!reviewed ? "Must review" : ""}
    onchange={(val) => reviewed = val}
  />
</div>
```

### Filter/Search Bar
```svelte
<div class="form-group-row">
  <FormInput
    label="Search"
    placeholder="Search cards..."
    iconLeft="🔍"
    value={search}
    onchange={(val) => search = val}
  />
  
  <FormSelect
    label="Filter by Type"
    options={typeOptions}
    value={typeFilter}
    onchange={(val) => typeFilter = val}
  />
</div>
```

### Deck Import Modal
```svelte
<div class="modal-section">
  <h3 class="modal-section-title">Import Options</h3>
  
  <div class="form-group">
    <FormInput
      label="Deck Code"
      placeholder="Paste deck code here"
      value={deckCode}
      helperText="Format: DAD-XXX-XXX-XXX"
      onchange={(val) => deckCode = val}
    />
    
    <FormCheckbox
      label="Replace current deck"
      checked={replaceMode}
      helperText="Uncheck to merge with existing cards"
      onchange={(val) => replaceMode = val}
    />
  </div>
</div>
```

---

## TypeScript Usage

### Typed Props
```typescript
import type { Props as FormInputProps } from '@/components/common/FormInput.svelte';

const inputProps: FormInputProps = {
  label: 'Card Name',
  value: cardName,
  size: 'md',
  rarity: 'epic',
};
```

### Rarity Typing
```typescript
import { RARITY_CONFIG } from '@/types';

type RarityLevel = keyof typeof RARITY_CONFIG;
let selectedRarity: RarityLevel = 'rare';
```

---

## Performance Notes

- **Zero Layout Shift** - All animations use transform/opacity
- **GPU Accelerated** - No expensive repaints
- **Smooth Scrolling** - Dropdowns scroll smoothly
- **Touch Optimized** - 44px touch targets minimum
- **Mobile Responsive** - Stack to single column on small screens

---

## Browser Support

- Chrome/Edge 88+
- Firefox 85+
- Safari 14+
- Mobile browsers (iOS Safari 14+, Chrome Mobile)

---

## Related Documentation

- [COMPONENT_POLISH_SUMMARY.md](./COMPONENT_POLISH_SUMMARY.md) - Full execution report
- [CLAUDE.md](./CLAUDE.md) - Project guide with component examples
- [src/styles/global.css](./src/styles/global.css) - CSS utilities

---

**Last Updated**: January 18, 2026  
**Status**: ✅ Production Ready

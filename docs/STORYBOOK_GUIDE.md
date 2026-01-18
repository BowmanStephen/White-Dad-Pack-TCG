# Storybook Guide for DadDeck

## Overview

Storybook has been successfully added to the DadDeck project for component development and documentation.

## Installation Details

**Storybook Version:** 8.6.14 (with Svelte support)
**Framework:** @storybook/svelte-vite
**Port:** 6006

## Quick Start

```bash
# Start Storybook development server
bun run storybook

# Build Storybook for production
bun run build-storybook
```

Storybook will be available at **http://localhost:6006/**

## Configuration Files

### `.storybook/main.ts`
Main Storybook configuration including:
- Story file patterns
- Addon configuration
- Framework setup

### `.storybook/preview.ts`
Preview configuration with:
- Global styles (Tailwind CSS)
- Default parameters (controls, backgrounds, viewport)
- Theme configuration

## Available Stories

### Button Stories (`src/components/common/Button.stories.ts`)
- **Primary** - Main call-to-action buttons
- **Secondary** - Secondary action buttons
- **Ghost** - Transparent background buttons
- **Sizes** - Small, Medium, Large variants
- **Disabled** - Disabled state demonstration
- **All Variants** - Side-by-side comparison

### Card Stories (`src/components/card/Card.stories.ts`)
- **Common** - Basic card display
- **Rare Holo** - Holographic rare card
- **Legendary** - Legendary card with full effects
- **Mythic** - Prismatic mythic card
- **All Rarities** - Rarity tier comparison

### Modal Stories (`src/components/common/Modal.stories.ts`)
- **Default** - Standard modal with header, body, footer
- **Small** - Compact modal variant
- **Large** - Large modal for more content
- **Confirmation** - Destructive action confirmation
- **Form Modal** - Modal with form inputs

## Addons Installed

- **@storybook/addon-essentials** - Core addon bundle
- **@storybook/addon-links** - Link stories together
- **@storybook/addon-interactions** - Test interactions
- **@storybook/addon-docs** - Automatic documentation generation
- **@storybook/addon-themes** - Theme switching support
- **@storybook/addon-viewport** - Responsive design testing
- **@storybook/addon-svelte-csf** - Svelte Component Story Format

## Creating New Stories

### Example: Creating a Story for a Component

```typescript
// src/components/your-component/YourComponent.stories.ts
import type { Meta, StoryObj } from '@storybook/svelte';

const meta = {
  title: 'Category/YourComponent',
  tags: ['autodocs'],
  argTypes: {
    // Define controls for component props
    prop1: {
      control: 'text',
      description: 'Description of prop1',
    },
  },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

// Default story
export const Default: Story = {
  args: {
    prop1: 'Default value',
  },
};

// Variant story
export const Variant: Story = {
  args: {
    prop1: 'Variant value',
  },
};
```

## Best Practices

1. **Organize stories by component location**
   - Keep story files next to their components
   - Use the same folder structure as components

2. **Document props with argTypes**
   - Provide clear descriptions
   - Define control types (text, select, boolean, etc.)
   - Specify default values

3. **Create meaningful variants**
   - Show different states (default, hover, active, disabled)
   - Demonstrate all sizes and configurations
   - Include edge cases and error states

4. **Use autodocs tag**
   - All stories with `tags: ['autodocs']` get automatic documentation
   - Displays controls, args, and source code

## Theme Support

Storybook supports both light and dark themes:
- Use the toolbar to switch between themes
- Components automatically adapt to selected theme
- Default theme is dark (matches DadDeck aesthetic)

## Viewport Testing

Test responsive design with preset viewports:
- **Mobile** - 375x667px
- **Tablet** - 768x1024px
- **Desktop** - 1440x900px

## Integration with Tailwind CSS

Global styles from `src/styles/global.css` are automatically imported, ensuring:
- Consistent component classes
- Design tokens availability
- Theme support

## Troubleshooting

### Storybook won't start
```bash
# Check for running processes
ps aux | grep storybook

# Kill existing process
pkill -f storybook

# Clear cache and restart
rm -rf node_modules/.cache
bun run storybook
```

### Stories not appearing
- Verify story files match pattern: `*.stories.@(js|ts|svelte)`
- Check for syntax errors in story files
- Ensure component imports are correct

### Styles not loading
- Confirm Tailwind CSS is imported in `.storybook/preview.ts`
- Check CSS class names match Tailwind utilities
- Verify component classes are properly defined

## Next Steps

1. **Add stories for remaining components**
   - Pack opening components
   - Collection management UI
   - Trading interface
   - Battle system

2. **Create component documentation**
   - Usage guidelines
   - Accessibility notes
   - Performance considerations

3. **Set up Storybook deployment**
   - Build static Storybook with `bun run build-storybook`
   - Deploy to Vercel/Netlify
   - Share with team for design reviews

## Resources

- [Storybook for Svelte Documentation](https://storybook.js.org/docs/svelte)
- [Component Story Format](https://storybook.js.org/docs/api/csf)
- [Addon Documentation](https://storybook.js.org/docs/addons/introduction)

---

**Last Updated:** January 18, 2026

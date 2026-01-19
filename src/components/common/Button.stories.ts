import type { Meta, StoryObj } from '@storybook/svelte';

const meta = {
  title: 'Common/Button',
  tags: ['autodocs'],
  render: (args) => ({
    Component: {
      // Create a simple wrapper for the Astro Button component
      template: `
        <button
          class="inline-flex items-center justify-center font-bold rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 disabled:opacity-50 disabled:cursor-not-allowed
          ${args.variant === 'primary' ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-lg hover:from-amber-400 hover:to-orange-400 active:scale-95 focus:ring-amber-400' : ''}
          ${args.variant === 'secondary' ? 'bg-slate-700 text-white hover:bg-slate-600 active:scale-95 focus:ring-slate-400' : ''}
          ${args.variant === 'ghost' ? 'bg-transparent text-white hover:bg-white/10 active:scale-95 focus:ring-white/50' : ''}
          ${args.size === 'sm' ? 'px-4 py-2 text-sm' : ''}
          ${args.size === 'md' ? 'px-6 py-3 text-base' : ''}
          ${args.size === 'lg' ? 'px-8 py-4 text-lg' : ''}
          ${args.disabled ? 'opacity-50 cursor-not-allowed' : ''}"
          ${args.disabled ? 'disabled' : ''}
        >
          ${args.label}
        </button>
      `,
    },
  }),
  argTypes: {
    variant: {
      control: 'select',
      options: ['primary', 'secondary', 'ghost'],
      description: 'Button visual style variant',
      table: {
        defaultValue: { summary: 'primary' },
        type: { summary: 'primary | secondary | ghost' },
      },
    },
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg'],
      description: 'Button size',
      table: {
        defaultValue: { summary: 'md' },
        type: { summary: 'sm | md | lg' },
      },
    },
    label: {
      control: 'text',
      description: 'Button text content',
    },
    disabled: {
      control: 'boolean',
      description: 'Disable button interaction',
      table: {
        defaultValue: { summary: 'false' },
      },
    },
  },
} satisfies Meta<typeof Button>;

export default meta;
type Story = StoryObj<typeof meta>;

// Primary Button
export const Primary: Story = {
  args: {
    variant: 'primary',
    size: 'md',
    label: 'Open Pack',
    disabled: false,
  },
};

// Secondary Button
export const Secondary: Story = {
  args: {
    variant: 'secondary',
    size: 'md',
    label: 'Cancel',
    disabled: false,
  },
};

// Ghost Button
export const Ghost: Story = {
  args: {
    variant: 'ghost',
    size: 'md',
    label: 'Learn More',
    disabled: false,
  },
};

// Size Variants
export const Small: Story = {
  args: {
    variant: 'primary',
    size: 'sm',
    label: 'Small',
  },
};

export const Medium: Story = {
  args: {
    variant: 'primary',
    size: 'md',
    label: 'Medium',
  },
};

export const Large: Story = {
  args: {
    variant: 'primary',
    size: 'lg',
    label: 'Large',
  },
};

// Disabled State
export const Disabled: Story = {
  args: {
    variant: 'primary',
    size: 'md',
    label: 'Disabled',
    disabled: true,
  },
};

// All Variants
export const AllVariants: Story = {
  render: () => ({
    template: `
      <div class="flex gap-4 items-center">
        <button class="bg-gradient-to-r from-amber-500 to-orange-500 text-white px-6 py-3 rounded-lg font-bold">Primary</button>
        <button class="bg-slate-700 text-white px-6 py-3 rounded-lg font-bold hover:bg-slate-600">Secondary</button>
        <button class="bg-transparent text-white px-6 py-3 rounded-lg font-bold hover:bg-white/10">Ghost</button>
      </div>
    `,
  }),
};

// All Sizes
export const AllSizes: Story = {
  render: () => ({
    template: `
      <div class="flex gap-4 items-center">
        <button class="bg-gradient-to-r from-amber-500 to-orange-500 text-white px-4 py-2 rounded-lg font-bold text-sm">Small</button>
        <button class="bg-gradient-to-r from-amber-500 to-orange-500 text-white px-6 py-3 rounded-lg font-bold text-base">Medium</button>
        <button class="bg-gradient-to-r from-amber-500 to-orange-500 text-white px-8 py-4 rounded-lg font-bold text-lg">Large</button>
      </div>
    `,
  }),
};

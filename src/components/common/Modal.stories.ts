import type { Meta, StoryObj } from '@storybook/svelte';

const meta = {
  title: 'Common/Modal',
  tags: ['autodocs'],
  argTypes: {
    isOpen: {
      control: 'boolean',
      description: 'Modal open state',
      table: {
        defaultValue: { summary: 'true' },
      },
    },
    title: {
      control: 'text',
      description: 'Modal title',
    },
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg', 'xl', 'full'],
      description: 'Modal size',
      table: {
        defaultValue: { summary: 'md' },
        type: { summary: 'sm | md | lg | xl | full' },
      },
    },
    showCloseButton: {
      control: 'boolean',
      description: 'Show close button',
      table: {
        defaultValue: { summary: 'true' },
      },
    },
  },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

// Default Modal
export const Default: Story = {
  args: {
    isOpen: true,
    title: 'Modal Title',
    size: 'md',
    showCloseButton: true,
  },
  render: (args) => ({
    template: `
      <div class="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
        <div class="
          bg-slate-900 border border-slate-700 rounded-lg shadow-2xl
          ${args.size === 'sm' ? 'max-w-sm w-full mx-4' : ''}
          ${args.size === 'md' ? 'max-w-md w-full mx-4' : ''}
          ${args.size === 'lg' ? 'max-w-lg w-full mx-4' : ''}
          ${args.size === 'xl' ? 'max-w-xl w-full mx-4' : ''}
          ${args.size === 'full' ? 'max-w-5xl w-full mx-4' : ''}
        ">
          <!-- Header -->
          <div class="flex items-center justify-between p-6 border-b border-slate-700">
            <h2 class="text-xl font-bold text-white">${args.title}</h2>
            ${args.showCloseButton ? `
              <button class="text-slate-400 hover:text-white transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            ` : ''}
          </div>

          <!-- Body -->
          <div class="p-6">
            <p class="text-slate-300">This is the modal content. You can put any content here, including forms, images, or other components.</p>
          </div>

          <!-- Footer -->
          <div class="flex items-center justify-end gap-3 p-6 border-t border-slate-700">
            <button class="px-4 py-2 bg-slate-700 text-white rounded-lg hover:bg-slate-600 transition-colors">Cancel</button>
            <button class="px-4 py-2 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-lg hover:from-amber-400 hover:to-orange-400 transition-all">Confirm</button>
          </div>
        </div>
      </div>
    `,
  }),
};

// Small Modal
export const Small: Story = {
  args: {
    isOpen: true,
    title: 'Small Modal',
    size: 'sm',
  },
  render: (args) => ({
    template: `
      <div class="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
        <div class="max-w-sm w-full mx-4 bg-slate-900 border border-slate-700 rounded-lg shadow-2xl">
          <div class="flex items-center justify-between p-4 border-b border-slate-700">
            <h2 class="text-lg font-bold text-white">${args.title}</h2>
            <button class="text-slate-400 hover:text-white">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <div class="p-4">
            <p class="text-slate-300 text-sm">Small modal content goes here.</p>
          </div>
        </div>
      </div>
    `,
  }),
};

// Large Modal
export const Large: Story = {
  args: {
    isOpen: true,
    title: 'Large Modal',
    size: 'lg',
  },
  render: (args) => ({
    template: `
      <div class="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
        <div class="max-w-4xl w-full mx-4 bg-slate-900 border border-slate-700 rounded-lg shadow-2xl">
          <div class="flex items-center justify-between p-6 border-b border-slate-700">
            <h2 class="text-2xl font-bold text-white">${args.title}</h2>
            <button class="text-slate-400 hover:text-white">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <div class="p-6">
            <div class="space-y-4">
              <div class="h-4 bg-slate-800 rounded animate-pulse"></div>
              <div class="h-4 bg-slate-800 rounded animate-pulse w-3/4"></div>
              <div class="h-4 bg-slate-800 rounded animate-pulse w-1/2"></div>
              <div class="h-4 bg-slate-800 rounded animate-pulse"></div>
              <div class="h-4 bg-slate-800 rounded animate-pulse w-5/6"></div>
            </div>
          </div>
          <div class="flex items-center justify-end gap-3 p-6 border-t border-slate-700">
            <button class="px-6 py-3 bg-slate-700 text-white rounded-lg hover:bg-slate-600">Close</button>
          </div>
        </div>
      </div>
    `,
  }),
};

// Confirmation Modal
export const Confirmation: Story = {
  args: {
    isOpen: true,
    title: 'Confirm Action',
    size: 'sm',
  },
  render: (args) => ({
    template: `
      <div class="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
        <div class="max-w-sm w-full mx-4 bg-slate-900 border border-red-500/50 rounded-lg shadow-2xl">
          <div class="p-6">
            <div class="flex items-center gap-4 mb-4">
              <div class="flex-shrink-0 w-12 h-12 bg-red-500/20 rounded-full flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <h3 class="text-lg font-bold text-white">${args.title}</h3>
            </div>
            <p class="text-slate-300 mb-6">Are you sure you want to delete this item? This action cannot be undone.</p>
            <div class="flex gap-3">
              <button class="flex-1 px-4 py-2 bg-slate-700 text-white rounded-lg hover:bg-slate-600">Cancel</button>
              <button class="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700">Delete</button>
            </div>
          </div>
        </div>
      </div>
    `,
  }),
};

// Form Modal
export const FormModal: Story = {
  args: {
    isOpen: true,
    title: 'Edit Profile',
    size: 'md',
  },
  render: (args) => ({
    template: `
      <div class="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
        <div class="max-w-md w-full mx-4 bg-slate-900 border border-slate-700 rounded-lg shadow-2xl">
          <div class="flex items-center justify-between p-6 border-b border-slate-700">
            <h2 class="text-xl font-bold text-white">${args.title}</h2>
            <button class="text-slate-400 hover:text-white">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <form class="p-6 space-y-4">
            <div>
              <label class="block text-sm font-medium text-slate-300 mb-2">Name</label>
              <input type="text" class="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-amber-500" placeholder="Enter your name">
            </div>
            <div>
              <label class="block text-sm font-medium text-slate-300 mb-2">Email</label>
              <input type="email" class="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-amber-500" placeholder="Enter your email">
            </div>
            <div>
              <label class="block text-sm font-medium text-slate-300 mb-2">Bio</label>
              <textarea class="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-amber-500" rows="3" placeholder="Tell us about yourself"></textarea>
            </div>
          </form>
          <div class="flex items-center justify-end gap-3 p-6 border-t border-slate-700">
            <button type="button" class="px-4 py-2 bg-slate-700 text-white rounded-lg hover:bg-slate-600">Cancel</button>
            <button type="submit" class="px-4 py-2 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-lg hover:from-amber-400 hover:to-orange-400">Save Changes</button>
          </div>
        </div>
      </div>
    `,
  }),
};

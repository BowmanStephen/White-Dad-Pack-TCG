import type { Meta, StoryObj } from '@storybook/svelte';

const meta = {
  title: 'Card/Card Display',
  tags: ['autodocs'],
  argTypes: {
    rarity: {
      control: 'select',
      options: ['common', 'uncommon', 'rare', 'epic', 'legendary', 'mythic'],
      description: 'Card rarity tier',
      table: {
        defaultValue: { summary: 'common' },
        type: { summary: 'common | uncommon | rare | epic | legendary | mythic' },
      },
    },
    isHolo: {
      control: 'boolean',
      description: 'Has holographic effect',
      table: {
        defaultValue: { summary: 'false' },
      },
    },
    holoType: {
      control: 'select',
      options: ['none', 'standard', 'reverse', 'full_art', 'prismatic'],
      description: 'Holographic variant type',
      table: {
        defaultValue: { summary: 'none' },
      },
    },
    cardName: {
      control: 'text',
      description: 'Card name',
    },
    subtitle: {
      control: 'text',
      description: 'Card subtitle',
    },
    dadType: {
      control: 'select',
      options: ['BBQ_DAD', 'FIX_IT_DAD', 'GOLF_DAD', 'COUCH_DAD', 'LAWN_DAD'],
      description: 'Dad archetype type',
    },
  },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

// Common Card
export const Common: Story = {
  args: {
    rarity: 'common',
    isHolo: false,
    holoType: 'none',
    cardName: 'Grillmaster Gary',
    subtitle: 'The Flame Keeper',
    dadType: 'BBQ_DAD',
  },
  render: (args) => ({
    template: `
      <div class="w-80 h-96 bg-gradient-to-br from-slate-800 to-slate-900 rounded-lg border-2 border-gray-400 p-4 flex flex-col">
        <div class="text-center">
          <h3 class="text-lg font-bold text-gray-300">${args.cardName}</h3>
          <p class="text-sm text-gray-500">${args.subtitle}</p>
        </div>
        <div class="flex-1 bg-slate-700 rounded my-4 flex items-center justify-center">
          <span class="text-gray-500">Card Artwork</span>
        </div>
        <div class="text-center">
          <span class="inline-block px-3 py-1 bg-gray-600 text-white text-sm rounded-full">Common</span>
        </div>
      </div>
    `,
  }),
};

// Rare Card with Holo
export const RareHolo: Story = {
  args: {
    rarity: 'rare',
    isHolo: true,
    holoType: 'standard',
    cardName: 'Grillmaster Gary',
    subtitle: 'The Flame Keeper',
    dadType: 'BBQ_DAD',
  },
  render: (args) => ({
    template: `
      <div class="w-80 h-96 bg-gradient-to-br from-slate-800 to-slate-900 rounded-lg border-2 border-yellow-500 p-4 flex flex-col shadow-lg shadow-yellow-500/20">
        <div class="text-center">
          <h3 class="text-lg font-bold text-yellow-400">${args.cardName}</h3>
          <p class="text-sm text-gray-400">${args.subtitle}</p>
        </div>
        <div class="flex-1 bg-gradient-to-br from-yellow-900/30 to-slate-700 rounded my-4 flex items-center justify-center relative overflow-hidden">
          <div class="absolute inset-0 bg-gradient-to-br from-yellow-400/10 to-transparent animate-pulse"></div>
          <span class="text-yellow-500 font-bold">✨ Holo ✨</span>
        </div>
        <div class="text-center">
          <span class="inline-block px-3 py-1 bg-yellow-600 text-white text-sm rounded-full">Rare Holo</span>
        </div>
      </div>
    `,
  }),
};

// Legendary Card
export const Legendary: Story = {
  args: {
    rarity: 'legendary',
    isHolo: true,
    holoType: 'full_art',
    cardName: 'Grill Emperor Gary',
    subtitle: 'Legendary Pitmaster',
    dadType: 'BBQ_DAD',
  },
  render: (args) => ({
    template: `
      <div class="w-80 h-96 bg-gradient-to-br from-orange-900 to-slate-900 rounded-lg border-4 border-orange-500 p-4 flex flex-col shadow-2xl shadow-orange-500/40">
        <div class="text-center">
          <h3 class="text-xl font-bold text-orange-400 drop-shadow-lg">${args.cardName}</h3>
          <p class="text-sm text-orange-300">${args.subtitle}</p>
        </div>
        <div class="flex-1 bg-gradient-to-br from-orange-600/40 to-yellow-600/40 rounded my-4 flex items-center justify-center relative overflow-hidden">
          <div class="absolute inset-0 bg-gradient-to-tr from-transparent via-orange-400/20 to-transparent animate-pulse"></div>
          <span class="text-orange-400 font-bold text-lg">🔥 LEGENDARY 🔥</span>
        </div>
        <div class="text-center">
          <span class="inline-block px-3 py-1 bg-orange-600 text-white text-sm rounded-full shadow-lg">Legendary</span>
        </div>
      </div>
    `,
  }),
};

// Mythic Card
export const Mythic: Story = {
  args: {
    rarity: 'mythic',
    isHolo: true,
    holoType: 'prismatic',
    cardName: 'Gary Prime',
    subtitle: 'The Original Dad',
    dadType: 'BBQ_DAD',
  },
  render: (args) => ({
    template: `
      <div class="w-80 h-96 bg-gradient-to-br from-pink-900 via-purple-900 to-slate-900 rounded-lg border-4 border-pink-500 p-4 flex flex-col shadow-2xl relative overflow-hidden">
        <div class="absolute inset-0 bg-gradient-to-tr from-pink-500/10 via-purple-500/10 to-cyan-500/10 animate-pulse"></div>
        <div class="text-center relative z-10">
          <h3 class="text-xl font-bold bg-gradient-to-r from-pink-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent">${args.cardName}</h3>
          <p class="text-sm text-pink-300">${args.subtitle}</p>
        </div>
        <div class="flex-1 bg-gradient-to-br from-pink-600/40 via-purple-600/40 to-cyan-600/40 rounded my-4 flex items-center justify-center relative overflow-hidden">
          <div class="absolute inset-0 bg-gradient-to-tr from-pink-400/30 via-purple-400/30 to-cyan-400/30 animate-pulse"></div>
          <span class="text-pink-400 font-bold text-lg relative z-10">💎 MYTHIC 💎</span>
        </div>
        <div class="text-center relative z-10">
          <span class="inline-block px-3 py-1 bg-gradient-to-r from-pink-600 to-purple-600 text-white text-sm rounded-full shadow-lg">Mythic</span>
        </div>
      </div>
    `,
  }),
};

// All Rarities
export const AllRarities: Story = {
  render: () => ({
    template: `
      <div class="flex gap-4 flex-wrap">
        <div class="w-32 h-48 bg-gradient-to-br from-slate-800 to-slate-900 rounded border-2 border-gray-400 flex items-center justify-center">
          <span class="text-gray-400 text-sm">Common</span>
        </div>
        <div class="w-32 h-48 bg-gradient-to-br from-slate-800 to-slate-900 rounded border-2 border-blue-500 flex items-center justify-center">
          <span class="text-blue-400 text-sm">Uncommon</span>
        </div>
        <div class="w-32 h-48 bg-gradient-to-br from-slate-800 to-slate-900 rounded border-2 border-yellow-500 flex items-center justify-center">
          <span class="text-yellow-400 text-sm">Rare</span>
        </div>
        <div class="w-32 h-48 bg-gradient-to-br from-slate-800 to-slate-900 rounded border-2 border-purple-500 flex items-center justify-center">
          <span class="text-purple-400 text-sm">Epic</span>
        </div>
        <div class="w-32 h-48 bg-gradient-to-br from-slate-800 to-slate-900 rounded border-2 border-orange-500 flex items-center justify-center">
          <span class="text-orange-400 text-sm">Legendary</span>
        </div>
        <div class="w-32 h-48 bg-gradient-to-br from-pink-900 to-purple-900 rounded border-2 border-pink-500 flex items-center justify-center">
          <span class="text-pink-400 text-sm">Mythic</span>
        </div>
      </div>
    `,
  }),
};

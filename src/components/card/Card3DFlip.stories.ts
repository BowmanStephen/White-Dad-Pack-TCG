import type { Meta, StoryObj } from '@storybook/svelte';
import Card3DFlip from './Card3DFlip.svelte';
import type { PackCard } from '@/types';

// Mock card data
const mockCard: PackCard = {
  id: 'bbq_dad_001',
  name: 'Grillmaster Gary',
  subtitle: 'The Flame Keeper',
  type: 'BBQ_DAD',
  rarity: 'rare',
  artwork: '/og-image.png',
  stats: {
    dadJoke: 75,
    grillSkill: 95,
    fixIt: 40,
    napPower: 30,
    remoteControl: 50,
    thermostat: 60,
    sockSandal: 45,
    beerSnob: 70,
  },
  flavorText: 'Propane is just a suggestion.',
  abilities: [
    {
      name: 'Perfect Sear',
      description: 'Flip a burger. If it lands rare, gain +10 Grill Skill.',
    },
  ],
  series: 1,
  cardNumber: 1,
  totalInSeries: 50,
  artist: 'AI Assistant',
  isRevealed: true,
  isHolo: true,
  holoType: 'standard',
};

const mockCardNoHolo: PackCard = {
  ...mockCard,
  isHolo: false,
  holoType: 'none',
};

const mockCardMythic: PackCard = {
  ...mockCard,
  rarity: 'mythic',
  isHolo: true,
  holoType: 'prismatic',
  grillSkill: 100,
};

const baseArgs = {
  autoRotate: false,
  interactive: true,
  showParticles: true,
};

const meta = {
  title: 'Card/Card3DFlip',
  component: Card3DFlip,
  tags: ['autodocs'],
  argTypes: {
    autoRotate: {
      control: 'boolean',
      description: 'Enable auto-rotation showcase mode',
    },
    interactive: {
      control: 'boolean',
      description: 'Enable mouse/touch interaction',
    },
    showParticles: {
      control: 'boolean',
      description: 'Show particle effects on flip',
    },
  },
} satisfies Meta<Card3DFlip>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Default 3D card with standard rarity and holographic finish
 */
export const Default: Story = {
  args: {
    card: mockCard,
    ...baseArgs,
  },
};

/**
 * Card without holographic effect
 */
export const NoHolo: Story = {
  args: {
    card: mockCardNoHolo,
    ...baseArgs,
  },
};

/**
 * Mythic rarity with prismatic holographic finish
 */
export const MythicPrismatic: Story = {
  args: {
    card: mockCardMythic,
    ...baseArgs,
  },
};

/**
 * Auto-rotate showcase mode (no interaction)
 */
export const AutoRotate: Story = {
  args: {
    card: mockCard,
    ...baseArgs,
    autoRotate: true,
    interactive: false,
  },
};

/**
 * Non-interactive mode (viewing only)
 */
export const NonInteractive: Story = {
  args: {
    card: mockCard,
    ...baseArgs,
    interactive: false,
    showParticles: false,
  },
};

/**
 * No particle effects
 */
export const NoParticles: Story = {
  args: {
    card: mockCard,
    ...baseArgs,
    showParticles: false,
  },
};

/**
 * Common rarity card
 */
export const CommonRarity: Story = {
  args: {
    card: {
      ...mockCard,
      rarity: 'common',
      isHolo: false,
      holoType: 'none',
    },
    ...baseArgs,
  },
};

/**
 * Epic rarity with full art holo
 */
export const EpicFullArt: Story = {
  args: {
    card: {
      ...mockCard,
      rarity: 'epic',
      isHolo: true,
      holoType: 'full_art',
    },
    ...baseArgs,
  },
};

/**
 * Legendary rarity with reverse holo
 */
export const LegendaryReverse: Story = {
  args: {
    card: {
      ...mockCard,
      rarity: 'legendary',
      isHolo: true,
      holoType: 'reverse',
    },
    ...baseArgs,
  },
};

import type { StorybookConfig } from '@storybook/svelte';

const config: StorybookConfig = {
  stories: [
    '../src/**/*.stories.@(js|ts|svelte)',
  ],
  addons: [
    '@storybook/addon-links',
    '@storybook/addon-essentials',
    '@storybook/addon-interactions',
    '@storybook/addon-themes',
    '@storybook/addon-viewport',
  ],
  framework: {
    name: '@storybook/svelte-vite',
    options: {},
  },
  docs: {
    autodocs: 'tag',
  },
};

export default config;

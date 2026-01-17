// @ts-check
import { defineConfig } from 'astro/config';
import svelte from '@astrojs/svelte';
import tailwind from '@astrojs/tailwind';
import { imagetools } from 'vite-imagetools';

// https://astro.build/config
export default defineConfig({
  integrations: [
    svelte(),
    tailwind(),
  ],
  output: 'static',
  image: {
    // Remote image optimization for card images
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.example.com',
      },
      {
        protocol: 'https',
        hostname: 'dadddeck.com',
      },
    ],
  },
  vite: {
    plugins: [imagetools()],
    ssr: {
      noExternal: []
    },
    build: {
      // Code splitting optimization
      rollupOptions: {
        output: {
          manualChunks: {
            // Split html2canvas into a separate chunk
            'html2canvas': ['html2canvas'],
            // Split Svelte runtime
            'svelte': ['svelte', 'svelte/animate', 'svelte/easing', 'svelte/motion', 'svelte/store', 'svelte/transition'],
          },
        },
      },
      // Optimize chunk size
      chunkSizeWarningLimit: 500,
    },
  },
});

// @ts-check
import { defineConfig } from 'astro/config';
import svelte from '@astrojs/svelte';
import tailwind from '@astrojs/tailwind';
import { imagetools } from 'vite-imagetools';

// https://astro.build/config
export default defineConfig({
  // Site configuration for SEO (canonical URLs, Open Graph, sitemap)
  site: 'https://dadddeck.com',
  integrations: [
    svelte(),
    tailwind(),
  ],
  output: 'static',

  // Build optimizations for performance
  build: {
    // Inline critical CSS for faster initial render
    inlineStylesheets: 'auto',

    // Format for optimized asset filenames
    assets: '_astro',
  },

  // Compress output for faster network transfer
  compressHTML: true,

  // Image optimization configuration
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
    // Add image service configuration for better performance
    service: {
      entrypoint: 'astro/assets/services/sharp',
      config: {
        // Default image quality
        quality: 85,
        // Optimize for performance
        optimize: true,
      },
    },
  },

  // Vite configuration for optimal bundling
  vite: {
    plugins: [imagetools()],
    ssr: {
      noExternal: []
    },
    build: {
      // Optimize CSS code splitting
      cssCodeSplit: true,

      // Code splitting optimization
      rollupOptions: {
        output: {
          manualChunks: (id) => {
            // Split vendor chunks for better caching
            if (id.includes('node_modules')) {
              // Split html2canvas into separate chunk (largest dependency)
              if (id.includes('html2canvas')) {
                return 'vendor-html2canvas';
              }
              // Split Svelte runtime
              if (id.includes('svelte/') || id.includes('svelte/animate') || id.includes('svelte/easing') || id.includes('svelte/motion') || id.includes('svelte/store') || id.includes('svelte/transition')) {
                return 'vendor-svelte';
              }
              // Split nanostores
              if (id.includes('nanostores')) {
                return 'vendor-nanostores';
              }
              // Other node modules
              return 'vendor';
            }
          },
        },
      },

      // Target modern browsers for smaller bundle
      target: 'es2020',

      // Minify chunk size for faster downloads
      minify: 'terser',

      // Terser options for aggressive minification
      terserOptions: {
        compress: {
          drop_console: true, // Remove console.logs in production
          drop_debugger: true,
          pure_funcs: ['console.log', 'console.info', 'console.debug'],
        },
        format: {
          comments: false, // Remove comments
        },
      },
    },

    // Optimize dependencies pre-bundling
    optimizeDeps: {
      include: ['svelte', 'nanostores'],
      exclude: ['html2canvas'], // Don't pre-bundle large dependencies
    },
  },

  // Prefetch and preload strategy
  prefetch: true,

  // Experimental features for better performance
  experimental: {
    // Enable clientPrerender for smoother transitions
    clientPrerender: true,
  },
});

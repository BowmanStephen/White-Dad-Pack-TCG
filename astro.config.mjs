// @ts-check
import { defineConfig } from 'astro/config';
import svelte from '@astrojs/svelte';
import tailwind from '@astrojs/tailwind';
import sentry from '@sentry/astro';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';

// Read package.json for version
const packageJson = JSON.parse(
  readFileSync(fileURLToPath(new URL('./package.json', import.meta.url)), 'utf-8')
);
const APP_VERSION = packageJson.version;

// https://astro.build/config
export default defineConfig({
  // Site configuration for SEO (canonical URLs, Open Graph, sitemap)
  site: 'https://dadddeck.com',
  integrations: [
    svelte(),
    tailwind(),
    sentry({
      sourceMapsUploadOptions: {
        org: 'daddeck', // Replace with your Sentry org slug
        project: 'daddeck-tcg', // Replace with your Sentry project slug
        authToken: process.env.SENTRY_AUTH_TOKEN,
      },
    }),
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
    plugins: [],
    define: {
      // Inject app version for Sentry
      APP_VERSION: JSON.stringify(APP_VERSION),
      __SENTRY_DEBUG__: JSON.stringify(false),
    },
    // Exclude archived components from being processed
    server: {
      watch: {
        ignored: ['**/src/_archived/**']
      }
    },
    ssr: {
      noExternal: []
    },
    build: {
      // Optimize CSS code splitting
      cssCodeSplit: true,

      // Improve chunk size warnings
      chunkSizeWarningLimit: 1000,

      // Code splitting optimization
      rollupOptions: {
        output: {
          // Optimize chunk names for better caching
          chunkFileNames: '_astro/[name].[hash].js',
          entryFileNames: '_astro/[name].[hash].js',
          assetFileNames: '_astro/[name].[hash].[ext]',

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
              // Split analytics libraries (lazy loaded)
              if (id.includes('dompurify') || id.includes('entities')) {
                return 'vendor-security';
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
          pure_funcs: ['console.log', 'console.info', 'console.debug', 'console.warn'],
          dead_code: true, // Remove unreachable code
          conditionals: true, // Optimize if-else statements
          evaluate: true, // Evaluate constant expressions
          inline: 2, // Inline small functions
          passes: 3, // Run compression multiple times
          reduce_funcs: true, // Reduce single-use functions
          reduce_vars: true, // Reduce constant variables
          sequences: true, // Compose sequential statements
          typeofs: true, // Transform typeof expressions
          unused: true, // Remove unused variables
        },
        format: {
          comments: false, // Remove comments
          beautify: false, // Minify output
          ascii_only: true, // Escape non-ASCII characters
        },
        mangle: {
          safari10: true, // Workaround Safari 10 bugs
          properties: {
            regex: /^_/, // Mangle private properties
          },
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

  // Security headers
  headers: {
    // Content Security Policy headers for XSS prevention
    'Content-Security-Policy': [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: blob: https://*",
      "font-src 'self' data:",
      "connect-src 'self' https://api.github.com",
      "frame-src 'none'",
      "object-src 'none'",
      "base-uri 'self'",
      "form-action 'self'",
      "frame-ancestors 'none'",
    ].join('; '),

    // Additional security headers
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'X-XSS-Protection': '1; mode=block',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    'Permissions-Policy': 'geolocation=(), microphone=(), camera=()',
  },
});

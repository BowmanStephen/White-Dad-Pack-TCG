import { defineConfig } from 'vitest/config';
import { resolve } from 'path';
import { svelte } from '@sveltejs/vite-plugin-svelte';
import { svelteTesting } from '@testing-library/svelte/vite';

export default defineConfig({
  plugins: [
    svelte({
      compilerOptions: {
        // Force client-side compilation for tests
        generate: 'dom',
        hydratable: false,
      },
    }),
    // Temporarily disable svelteTesting() to debug environment issues
    // svelteTesting()
  ],
  test: {
    environmentOptions: {
      // Custom jsdom environment options
      url: 'http://localhost',
      pretendToBeVisual: true,
      resources: 'usable',
    },
    environment: 'happy-dom',
    globals: true,
    setupFiles: ['./tests/setup.ts'],
    include: [
      'tests/**/*.test.ts',
      '!tests/_archived/**/*.test.ts',
      '!tests/integration/**/*.spec.ts',  // Exclude Playwright spec files
      '!tests/e2e/**/*.spec.ts',         // Exclude E2E spec files
      '!tests/visual/**/*.test.ts',        // Exclude visual tests
    ],
    exclude: ['node_modules', 'dist', '**/*.spec.ts', 'tests/integration', 'tests/visual', 'tests/e2e', 'tests/_archived/**'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      include: ['src/**/*.ts', 'src/**/*.svelte'],
      exclude: [
        'src/**/*.test.ts',
        'src/**/*.spec.ts',
        'src/types/**',
        'src/i18n/**',
        'src/data/**',
        'node_modules/**',
        'dist/**',
      ],
      thresholds: {
        lines: 60,
        functions: 60,
        branches: 55,
        statements: 60,
        perFile: false,
      },
    },
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
      '@components': resolve(__dirname, './src/components'),
      '@lib': resolve(__dirname, './src/lib'),
      '@stores': resolve(__dirname, './src/stores'),
      '@data': resolve(__dirname, './src/data'),
      '@mocks': resolve(__dirname, './tests/mocks'),
    },
  },
});

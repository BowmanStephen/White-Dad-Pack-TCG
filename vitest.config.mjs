import { defineConfig } from 'vitest/config';
import { resolve } from 'path';
import { svelte } from '@sveltejs/vite-plugin-svelte';

export default defineConfig({
  plugins: [
    svelte({
      // Don't specify compilerOptions - vite-plugin-svelte handles this
    }),
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
    exclude: [
      'node_modules',
      'dist',
      '**/*.spec.ts',
      'tests/integration',
      'tests/visual',
      'tests/e2e',
      'tests/_archived/**',
    ],
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
        'src/_archived/**',
        'node_modules/**',
        'dist/**',
      ],
      // TEMP: Disable thresholds due to vitest 4.x + Svelte 5 coverage bug
      // https://github.com/vitest-dev/vitest/issues/6546
      // Coverage reports 0% for Svelte files - tests pass but coverage doesn't work
      thresholds: {
        lines: 0,
        functions: 0,
        branches: 0,
        statements: 0,
        perFile: false,
      },
    },
  },
  resolve: {
    conditions: ['browser', 'svelte'],
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

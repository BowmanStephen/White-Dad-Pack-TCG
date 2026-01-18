import { defineConfig } from 'vitest/config';
import { resolve } from 'path';
import { svelte } from '@sveltejs/vite-plugin-svelte';
import { svelteTesting } from '@testing-library/svelte/vite';

export default defineConfig({
  plugins: [svelte(), svelteTesting()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./tests/setup.ts'],
    include: ['tests/**/*.test.ts'],
    exclude: ['node_modules', 'dist', '**/*.spec.ts', 'tests/integration', 'tests/visual', 'tests/e2e'],
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
      // Coverage thresholds (set to 60% for now, will increase to 80% after Phase 1)
      thresholds: {
        lines: 60,
        functions: 60,
        branches: 55,
        statements: 60,
        perFile: false, // Enforce thresholds across all files combined
      },
    },
    ssr: {
      noExternal: ['svelte'],
    },
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
      '@components': resolve(__dirname, './src/components'),
      '@lib': resolve(__dirname, './src/lib'),
      '@stores': resolve(__dirname, './src/stores'),
      '@data': resolve(__dirname, './src/data'),
    },
  },
});

import { defineWorkspace } from 'vitest/config';

export default defineWorkspace([
  {
    test: {
      environment: 'jsdom',
      globals: true,
      setupFiles: ['./tests/setup.ts'],
    }
  }
]);

import js from '@eslint/js';
import tsParser from '@typescript-eslint/parser';
import tsPlugin from '@typescript-eslint/eslint-plugin';
import svelte from 'eslint-plugin-svelte';
import prettier from 'eslint-config-prettier';

export default [
  js.configs.recommended,
  prettier,

  {
    ignores: [
      '.astro/',
      'dist/',
      'node_modules/',
      'coverage/',
      '.DS_Store',
      'build-storybook/',
      'storybook-static/',
      '*.config.js',
      '*.config.ts',
      '*.config.mjs',
      'public/sw.js',
      'public/api/**/*.js',
      '.prettierrc.*',
      'analyze-lighthouse.cjs',
      'scripts/**/*',
      'fix-card-images.ts',
      'test-*.js',
      'test-*.mjs',
      'vitest.config.mjs',
      'playwright.config.ts',
      '**/*.stories.ts',
      '**/*.stories.tsx',
      '.storybook/**/*',
    ],
  },

  // TypeScript files
  {
    files: ['**/*.ts', '**/*.tsx'],
    plugins: {
      '@typescript-eslint': tsPlugin,
    },
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
        projectService: true,
      },
      globals: {
        console: 'readonly',
        process: 'readonly',
        Buffer: 'readonly',
        __dirname: 'readonly',
        __filename: 'readonly',
      },
    },
    rules: {
      'no-unused-vars': 'off',
      '@typescript-eslint/no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
      ],
      '@typescript-eslint/no-explicit-any': 'warn',
      'no-undef': 'off',
      'no-constant-condition': 'off',
    },
  },

  // Svelte files - exclude from TypeScript parsing
  {
    files: ['**/*.svelte'],
    plugins: {
      svelte,
    },
    languageOptions: {
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
      },
      globals: { console: 'readonly' },
    },
    rules: {
      'svelte/no-at-html-tags': 'error',
      'svelte/no-target-blank': 'error',
      'svelte/valid-compile': 'error',
      'svelte/no-extra-reactive-curlies': 'warn',
      'no-undef': 'off',
      'no-unused-vars': 'off',
      '@typescript-eslint/no-unused-vars': 'off',
    },
  },

  // Astro files
  {
    files: ['**/*.astro'],
    rules: { 'no-undef': 'off' },
  },

  // Test files
  {
    files: ['tests/**/*.ts', 'tests/**/*.tsx'],
    rules: {
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-unused-vars': 'off',
      'no-constant-condition': 'off',
    },
  },

  // Type definition files (relax rules)
  {
    files: ['src/types/**/*.ts'],
    rules: {
      '@typescript-eslint/no-unused-vars': 'off',
    },
  },

  // Store files (relax rules for reactivity)
  {
    files: ['src/stores/**/*.ts'],
    rules: {
      '@typescript-eslint/no-unused-vars': 'off',
    },
  },
];

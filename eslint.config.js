import js from '@eslint/js';
import tsParser from '@typescript-eslint/parser';
import tsPlugin from '@typescript-eslint/eslint-plugin';
import sveltePlugin from 'eslint-plugin-svelte';
import svelteParser from 'svelte-eslint-parser';
import astroParser from 'astro-eslint-parser';
import prettier from 'eslint-config-prettier';

export default [
  js.configs.recommended,
  prettier,

  {
    ignores: [
      '.tmp/**',
      '.astro/',
      'discord-bot/**',
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
      'src/_archived/**',
      'scripts/**/*',
      'fix-card-images.ts',
      'test-*.js',
      'test-*.mjs',
      'vitest.config.mjs',
      'playwright.config.ts',
      'playwright-report/**',
      '**/*.stories.ts',
      '**/*.stories.tsx',
      '.storybook/**/*',
      '.tmp/**',
      'src/_archived/**',
      'discord-bot/**',
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

  // Svelte files with proper parser
  {
    files: ['**/*.svelte'],
    plugins: {
      svelte: sveltePlugin,
    },
    languageOptions: {
      parser: svelteParser,
      parserOptions: {
        parser: tsParser,
        ecmaVersion: 'latest',
        sourceType: 'module',
      },
      globals: { console: 'readonly' },
    },
    rules: {
      ...sveltePlugin.configs.recommended.rules,
      'svelte/no-at-html-tags': 'error',
      'svelte/no-target-blank': 'error',
      'svelte/valid-compile': 'warn', // Downgrade to warn—many are a11y/reactivity best practices
      'svelte/no-extra-reactive-curlies': 'warn',
      'no-undef': 'off',
      'no-unused-vars': 'off',
      '@typescript-eslint/no-unused-vars': 'off',
    },
  },

  // Astro files with proper parser
  {
    files: ['**/*.astro'],
    languageOptions: {
      parser: astroParser,
      parserOptions: {
        parser: tsParser,
        ecmaVersion: 'latest',
        sourceType: 'module',
      },
      globals: { console: 'readonly' },
    },
    rules: {
      'no-undef': 'off',
      'no-unused-vars': 'off',
    },
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

  // Allow sanitized HTML usage in specific components
  {
    files: [
      'src/components/onboarding/TutorialOverlay.svelte',
      'src/components/card/AbilityTooltip.svelte',
    ],
    rules: {
      'svelte/no-at-html-tags': 'off',
    },
  },
];

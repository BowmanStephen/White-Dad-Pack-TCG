/**
 * Prettier Configuration for DadDeck™ TCG
 *
 * Extends default Prettier settings with Svelte support
 * and project-specific formatting rules.
 */
module.exports = {
  // Use Svelte plugin for .svelte files
  plugins: ['prettier-plugin-svelte'],

  // Override settings for Svelte files
  overrides: [
    {
      files: '*.svelte',
      options: {
        parser: 'svelte',
      },
    },
    {
      files: '*.astro',
      options: {
        parser: 'astro',
      },
    },
  ],

  // Base formatting settings
  printWidth: 100,
  tabWidth: 2,
  useTabs: false,
  semi: true,
  singleQuote: true,
  quoteProps: 'as-needed',
  trailingComma: 'es5',
  bracketSpacing: true,
  bracketSameLine: false,
  arrowParens: 'avoid',
  proseWrap: 'preserve',
  htmlWhitespaceSensitivity: 'css',
  endOfLine: 'lf',

  // Svelte-specific settings
  svelteSortOrder: 'options-scripts-markup-styles',
  svelteAllowShorthand: true,
  svelteIndentScriptAndStyle: false,
};

#!/usr/bin/env node
/**
 * Environment Variable Validation Script
 *
 * Validates required and optional environment variables before build.
 * Missing variables are logged as warnings (build continues with defaults).
 */

import { readFileSync } from 'fs';
import { resolve } from 'path';

// ANSI color codes for terminal output
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  green: '\x1b[32m',
  blue: '\x1b[34m',
  gray: '\x1b[90m',
};

// Environment variable definitions
const envVars = {
  // Analytics (Optional)
  PUBLIC_GOOGLE_ANALYTICS_ID: {
    required: false,
    description: 'Google Analytics tracking ID (G-XXXXXXXXXX)',
    format: 'G-XXXXXXXXXX or UA-XXXXXXXXX-X',
  },
  PUBLIC_PLAUSIBLE_DOMAIN: {
    required: false,
    description: 'Plausible Analytics domain',
    format: 'https://plausible.io/js/script.js',
  },

  // Error Tracking (Optional)
  PUBLIC_SENTRY_DSN: {
    required: false,
    description: 'Sentry DSN for error tracking',
    format: 'https://xxxxxxxxxxxxx@o1234.ingest.sentry.io/123456',
  },
  PUBLIC_SENTRY_ENVIRONMENT: {
    required: false,
    description: 'Sentry environment identifier',
    format: 'development, staging, production',
    defaultValue: 'production',
  },

  // Deployment (Optional)
  PUBLIC_DEPLOYMENT_PLATFORM: {
    required: false,
    description: 'Deployment platform name',
    format: 'vercel, netlify, cloudflare, local',
    defaultValue: 'local',
  },

  // Features (Optional)
  PUBLIC_DEBUG_MODE: {
    required: false,
    description: 'Enable debug mode (logs, metrics)',
    format: 'true, false',
    defaultValue: 'false',
  },
  PUBLIC_ANALYTICS_ENABLED: {
    required: false,
    description: 'Enable analytics tracking',
    format: 'true, false',
    defaultValue: 'true',
  },

  // API Configuration (Future)
  PUBLIC_API_URL: {
    required: false,
    description: 'API base URL for server-side features',
    format: 'https://dadddeck.com/api',
    defaultValue: 'https://dadddeck.com/api',
  },
  PUBLIC_DISCORD_CLIENT_ID: {
    required: false,
    description: 'Discord bot client ID',
    format: 'Discord application client ID',
  },
};

/**
 * Log a message with color
 */
function log(message, color = colors.reset) {
  console.log(`${color}${message}${colors.reset}`);
}

/**
 * Validate environment variables
 */
function validateEnv() {
  log('\n🔍 Environment Variable Validation', colors.blue);
  log('═'.repeat(50), colors.gray);

  let hasWarnings = false;
  let hasErrors = false;

  // Get all PUBLIC_ variables from process.env
  const publicEnvVars = Object.keys(process.env)
    .filter(key => key.startsWith('PUBLIC_'))
    .reduce((obj, key) => {
      obj[key] = process.env[key];
      return obj;
    }, {});

  // Check each defined environment variable
  for (const [varName, config] of Object.entries(envVars)) {
    const value = publicEnvVars[varName];

    if (!value || value.trim() === '') {
      // Variable is missing
      if (config.required) {
        // Required but missing - ERROR
        log(`❌ Missing: ${varName}`, colors.red);
        log(`   Description: ${config.description}`, colors.gray);
        log(`   Format: ${config.format}`, colors.gray);
        hasErrors = true;
      } else {
        // Optional but missing - WARNING
        const defaultValue = config.defaultValue ? ` (using default: "${config.defaultValue}")` : '';
        log(`⚠️  Not set: ${varName}${defaultValue}`, colors.yellow);
        log(`   Description: ${config.description}`, colors.gray);
        log(`   Format: ${config.format}`, colors.gray);
        hasWarnings = true;
      }
    } else {
      // Variable is set - validate format
      let isValid = true;
      let validationError = null;

      // Format validation
      if (varName === 'PUBLIC_GOOGLE_ANALYTICS_ID') {
        if (!value.match(/^G-[A-Z0-9]+$/i) && !value.match(/^UA-\d+-\d+$/i)) {
          isValid = false;
          validationError = 'Must match format G-XXXXXXXXXX or UA-XXXXXXXXX-X';
        }
      } else if (varName === 'PUBLIC_SENTRY_DSN') {
        if (!value.match(/^https:\/\/.+@.+/)) {
          isValid = false;
          validationError = 'Must be a valid Sentry DSN URL';
        }
      } else if (varName === 'PUBLIC_DEBUG_MODE' || varName === 'PUBLIC_ANALYTICS_ENABLED') {
        if (value !== 'true' && value !== 'false') {
          isValid = false;
          validationError = 'Must be "true" or "false"';
        }
      }

      if (isValid) {
        log(`✅ Set: ${varName}`, colors.green);
        log(`   Value: ${value}`, colors.gray);
      } else {
        log(`❌ Invalid: ${varName}`, colors.red);
        log(`   Value: ${value}`, colors.gray);
        log(`   Error: ${validationError}`, colors.red);
        hasErrors = true;
      }
    }

    log('', colors.reset);
  }

  // Summary
  log('═'.repeat(50), colors.gray);

  if (hasErrors) {
    log('❌ Validation FAILED - Invalid environment variables', colors.red);
    log('   Please fix the errors above before deploying.', colors.red);
    process.exit(1);
  } else if (hasWarnings) {
    log('⚠️  Validation COMPLETE - Some optional variables missing', colors.yellow);
    log('   The build will continue with safe defaults.', colors.yellow);
    log('   Add these variables to enable additional features.', colors.yellow);
  } else {
    log('✅ Validation PASSED - All environment variables set', colors.green);
  }

  log('', colors.reset);
}

// Run validation
validateEnv();

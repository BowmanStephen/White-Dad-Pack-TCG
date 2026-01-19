# Environment Variables Guide

**Last Updated:** January 18, 2026
**Version:** 1.0.0
**Status:** Production Ready

---

## Table of Contents

1. [Overview](#overview)
2. [Quick Start](#quick-start)
3. [Available Variables](#available-variables)
4. [Configuration by Platform](#configuration-by-platform)
5. [Validation](#validation)
6. [Best Practices](#best-practices)
7. [Troubleshooting](#troubleshooting)

---

## Overview

DadDeck uses environment variables to configure optional features like analytics, error tracking, and deployment settings. **All variables are optional** - the application works perfectly without any environment variables configured.

### Key Principles

1. **Security First**: All `PUBLIC_` variables are exposed to the browser. Never put secrets in them.
2. **Defaults Work**: Missing variables use safe defaults. The build won't fail.
3. **Validation**: Format validation ensures correct values before build.
4. **Warnings Only**: Missing optional variables show warnings, not errors.

---

## Quick Start

### Local Development

1. **Create .env.local** (already gitignored):
   ```bash
   cp .env.example .env.local
   ```

2. **Add your values** (optional):
   ```bash
   # .env.local
   PUBLIC_GOOGLE_ANALYTICS_ID=G-XXXXXXXXXX
   PUBLIC_SENTRY_DSN=https://xxxxxxxx@o1234.ingest.sentry.io/123456
   ```

3. **Start dev server**:
   ```bash
   bun run dev
   ```

### Validate Configuration

```bash
# Validate environment variables
bun run validate:env
```

**Output Example:**
```
🔍 Environment Variable Validation
══════════════════════════════════════════════════
✅ Set: PUBLIC_GOOGLE_ANALYTICS_ID
   Value: G-XXXXXXXXXX

⚠️  Not set: PUBLIC_SENTRY_DSN (using default: "")
   Description: Sentry DSN for error tracking
   Format: https://xxxxxxxxxxxxx@o1234.ingest.sentry.io/123456

══════════════════════════════════════════════════
⚠️  Validation COMPLETE - Some optional variables missing
   The build will continue with safe defaults.
   Add these variables to enable additional features.
```

---

## Available Variables

### Analytics Variables

#### PUBLIC_GOOGLE_ANALYTICS_ID
- **Description**: Google Analytics 4 tracking ID
- **Format**: `G-XXXXXXXXXX` or `UA-XXXXXXXXX-X`
- **Required**: No
- **Default**: None (analytics disabled)
- **Get it**: https://analytics.google.com/

**Example:**
```bash
PUBLIC_GOOGLE_ANALYTICS_ID=G-ABCD1234EF
```

#### PUBLIC_PLAUSIBLE_DOMAIN
- **Description**: Plausible Analytics domain (self-hosted or cloud)
- **Format**: Full URL to Plausible script
- **Required**: No
- **Default**: None (Plausible disabled)
- **Get it**: https://plausible.io/

**Example:**
```bash
PUBLIC_PLAUSIBLE_DOMAIN=https://plausible.io/js/script.js
```

### Error Tracking Variables

#### PUBLIC_SENTRY_DSN
- **Description**: Sentry Data Source Name for error tracking
- **Format**: `https://xxxxxxxxxxxxx@o1234.ingest.sentry.io/123456`
- **Required**: No
- **Default**: None (Sentry disabled)
- **Get it**: https://sentry.io/

**Example:**
```bash
PUBLIC_SENTRY_DSN=https://abc123@o456.ingest.sentry.io/789
```

#### PUBLIC_SENTRY_ENVIRONMENT
- **Description**: Environment identifier for Sentry
- **Format**: `development`, `staging`, or `production`
- **Required**: No
- **Default**: `production`

**Example:**
```bash
PUBLIC_SENTRY_ENVIRONMENT=staging
```

### Deployment Variables

#### PUBLIC_DEPLOYMENT_PLATFORM
- **Description**: Deployment platform name
- **Format**: `vercel`, `netlify`, `cloudflare`, or `local`
- **Required**: No
- **Default**: `local`

**Example:**
```bash
PUBLIC_DEPLOYMENT_PLATFORM=vercel
```

### Feature Flags

#### PUBLIC_DEBUG_MODE
- **Description**: Enable debug mode (shows logs and metrics)
- **Format**: `true` or `false`
- **Required**: No
- **Default**: `false` (automatically `true` in development)

**Example:**
```bash
PUBLIC_DEBUG_MODE=true
```

#### PUBLIC_ANALYTICS_ENABLED
- **Description**: Enable analytics tracking globally
- **Format**: `true` or `false`
- **Required**: No
- **Default**: `true`

**Example:**
```bash
PUBLIC_ANALYTICS_ENABLED=false
```

### API Configuration (Future Use)

#### PUBLIC_API_URL
- **Description**: API base URL for future server-side features
- **Format**: Valid HTTPS URL
- **Required**: No
- **Default**: `https://dadddeck.com/api`

**Example:**
```bash
PUBLIC_API_URL=https://api.dadddeck.com
```

#### PUBLIC_DISCORD_CLIENT_ID
- **Description**: Discord application client ID for bot integration
- **Format**: Discord client ID (numeric string)
- **Required**: No
- **Default**: None
- **Get it**: https://discord.com/developers/applications

**Example:**
```bash
PUBLIC_DISCORD_CLIENT_ID=123456789012345678
```

---

## Configuration by Platform

### Vercel

1. **Go to Project Settings**: https://vercel.com/dashboard
2. **Navigate to**: Settings → Environment Variables
3. **Add variables**:
   - Name: `PUBLIC_GOOGLE_ANALYTICS_ID`
   - Value: `G-XXXXXXXXXX`
   - Environments: Production, Preview, Development

4. **Redeploy**: Variables apply automatically on next deployment

### Netlify

1. **Go to Site Settings**: https://app.netlify.com
2. **Navigate to**: Site Settings → Environment Variables
3. **Add variables**:
   - Key: `PUBLIC_GOOGLE_ANALYTICS_ID`
   - Value: `G-XXXXXXXXXX`

4. **Redeploy**: Variables apply automatically on next deployment

### Cloudflare Pages

1. **Go to Project Settings**: https://dash.cloudflare.com
2. **Navigate to**: Settings → Environment Variables
3. **Add variables**:
   - Variable name: `PUBLIC_GOOGLE_ANALYTICS_ID`
   - Value: `G-XXXXXXXXXX`

4. **Redeploy**: Variables apply automatically on next deployment

### Local Development

Create `.env.local` in project root:

```bash
# .env.local
PUBLIC_GOOGLE_ANALYTICS_ID=G-XXXXXXXXXX
PUBLIC_SENTRY_DSN=https://xxxxxxxx@o1234.ingest.sentry.io/123456
```

**Important**: `.env.local` is already gitignored.

---

## Validation

### Running Validation

```bash
bun run validate:env
```

### Validation Rules

1. **Google Analytics ID**: Must match `G-XXXXXXXXXX` or `UA-XXXXXXXXX-X`
2. **Sentry DSN**: Must be valid HTTPS URL
3. **Boolean Flags**: Must be `true` or `false`
4. **URLs**: Must be valid HTTPS URLs

### Validation Exit Codes

- **0**: All variables valid (or missing with defaults)
- **1**: Invalid variable format (build should fail)

### Pre-Build Validation (Optional)

Add to `package.json` scripts:

```json
{
  "scripts": {
    "prebuild": "bun run validate:env && bun run optimize:images && bun run generate-sitemap"
  }
}
```

---

## Best Practices

### 1. Never Commit Secrets

**❌ BAD:**
```bash
# .env (committed to git)
PUBLIC_SENTRY_DSN=https://secret@o1234.ingest.sentry.io/123456
```

**✅ GOOD:**
```bash
# .env.local (gitignored)
PUBLIC_SENTRY_DSN=https://secret@o1234.ingest.sentry.io/123456
```

### 2. Use Platform-Specific Variables

**Vercel:**
- Use Vercel dashboard for production variables
- Use `.env.local` for local development

**Netlify:**
- Use Netlify dashboard for production variables
- Use `.env.local` for local development

### 3. Document Custom Variables

If you add new environment variables:

1. Update `.env.example` with description
2. Update `scripts/validate-env.mjs` with validation rules
3. Update this documentation

### 4. Test Before Deploying

```bash
# Validate environment variables
bun run validate:env

# Test build locally
bun run build

# Preview production build
bun run preview
```

### 5. Use Separate Files for Different Environments

```
.env.local          # Local development (gitignored)
.env.example        # Example template (committed)
.env.production     # Production secrets (gitignored)
```

---

## Troubleshooting

### Build Fails with "Invalid Environment Variable"

**Problem**: Validation script detects invalid format.

**Solution**:
1. Check variable format matches requirements
2. Run `bun run validate:env` to see specific error
3. Fix the invalid variable
4. Re-run build

### Environment Variables Not Working

**Problem**: Variables set but not being used.

**Solutions**:

1. **Check prefix**: All public variables must start with `PUBLIC_`
   ```bash
   # ❌ WRONG
   GOOGLE_ANALYTICS_ID=G-XXXXXXXXXX

   # ✅ CORRECT
   PUBLIC_GOOGLE_ANALYTICS_ID=G-XXXXXXXXXX
   ```

2. **Restart dev server**: Environment variables loaded on startup
   ```bash
   # Stop server (Ctrl+C)
   # Restart
   bun run dev
   ```

3. **Check platform settings**: Ensure variables set in deployment platform dashboard

### Analytics Not Tracking

**Problem**: Analytics configured but no data showing up.

**Solutions**:

1. **Check variable is set**:
   ```bash
   bun run validate:env
   ```

2. **Check browser console** for errors:
   - Open DevTools → Console
   - Look for analytics-related errors

3. **Verify analytics ID is correct**:
   - Google Analytics: Check GA4 property ID
   - Plausible: Check domain matches

4. **Check ad blockers**: Some ad blockers block analytics

### Sentry Not Reporting Errors

**Problem**: Sentry configured but errors not showing up.

**Solutions**:

1. **Check DSN format**:
   ```bash
   # Must be valid Sentry DSN
   PUBLIC_SENTRY_DSN=https://abc123@o456.ingest.sentry.io/789
   ```

2. **Check environment**:
   ```bash
   # Should match Sentry project environment
   PUBLIC_SENTRY_ENVIRONMENT=production
   ```

3. **Test error manually**:
   ```javascript
   // In browser console
   throw new Error('Test Sentry error');
   ```

4. **Check Sentry dashboard**:
   - Verify project is active
   - Check error filters

---

## Advanced Usage

### Programmatic Access (Astro Components)

```astro
---
const googleAnalyticsId = import.meta.env.PUBLIC_GOOGLE_ANALYTICS_ID;
const sentryDsn = import.meta.env.PUBLIC_SENTRY_DSN;
---

<!-- Use in template -->
{googleAnalyticsId && (
  <script async src={`https://www.googletagmanager.com/gtag/js?id=${googleAnalyticsId}`}></script>
)}
```

### Programmatic Access (Svelte Components)

```svelte
<script lang="ts">
  const debugMode = import.meta.env.PUBLIC_DEBUG_MODE === 'true';
  const analyticsEnabled = import.meta.env.PUBLIC_ANALYTICS_ENABLED !== 'false';

  if (debugMode) {
    console.log('Debug mode enabled');
  }
</script>
```

### Conditional Imports

```typescript
// Analytics provider with lazy loading
async function loadAnalytics() {
  if (import.meta.env.PUBLIC_GOOGLE_ANALYTICS_ID) {
    await import('./analytics/providers/ga');
  }

  if (import.meta.env.PUBLIC_SENTRY_DSN) {
    await import('./analytics/providers/sentry');
  }
}
```

---

## Related Documentation

- **[Deployment Guide](./DEPLOYMENT_GUIDE.md)** - Full deployment instructions
- **[CLAUDE.md](../CLAUDE.md)** - Project overview and development workflows
- **[.env.example](../.env.example)** - Template for environment variables

---

## Support

For issues or questions:

1. **Check this guide** - Most issues are documented here
2. **Run validation** - `bun run validate:env` to check configuration
3. **Check deployment platform docs** - Vercel/Netlify/Cloudflare specific setup
4. **Open an issue** - https://github.com/your-repo/issues

---

**Last Updated**: January 18, 2026
**Version**: 1.0.0

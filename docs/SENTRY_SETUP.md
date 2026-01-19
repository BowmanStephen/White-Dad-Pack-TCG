# Sentry Error Tracking Setup

## Overview

DadDeck™ integrates Sentry for production error tracking and performance monitoring. This helps identify and fix bugs in production environments.

## Features

✅ **Automatic Error Capture** - Catches unhandled exceptions and promise rejections
✅ **Performance Monitoring** - Tracks page load times and transaction performance
✅ **Session Replay** - Records user sessions to debug errors (100% on error, 1% normal)
✅ **Source Maps** - Automatic upload for readable stack traces
✅ **Release Tracking** - Tags errors with app version (from package.json)
✅ **Environment Filtering** - Only active in production, not development

## Quick Setup

### 1. Create Sentry Account

1. Go to [sentry.io](https://sentry.io/) and sign up
2. Create a new project: **JavaScript** → **Astro**
3. Copy your **DSN** (Data Source Name)

### 2. Configure Environment Variables

Add to `.env.local` (or your deployment platform's environment variables):

```bash
# Required: Sentry DSN
PUBLIC_SENTRY_DSN=https://examplePublicKey@o0.ingest.sentry.io/0

# Required: Source maps upload (production only)
SENTRY_AUTH_TOKEN=sntrys_yourTokenHere
```

**Create Sentry Auth Token:**
1. Go to: https://sentry.io/settings/auth-tokens/
2. Create new token with scopes: `project:releases`, `project:write`

### 3. Update Sentry Configuration

Edit `astro.config.mjs` (lines 23-29):

```javascript
sentry({
  sourceMapsUploadOptions: {
    org: 'your-org-slug',      // Replace with your Sentry org slug
    project: 'daddeck-tcg',    // Replace with your Sentry project slug
    authToken: process.env.SENTRY_AUTH_TOKEN,
  },
}),
```

Find your org/project slugs in Sentry Settings → General.

### 4. Deploy

```bash
# Build and deploy
bun run build
vercel --prod
```

Source maps are automatically uploaded during build if `SENTRY_AUTH_TOKEN` is set.

## Testing

### Local Testing

Visit `/sentry-test` page to trigger test errors:

```bash
bun run dev
# Navigate to http://localhost:4321/sentry-test
```

**Test Scenarios:**
1. ✅ Simple Error - Basic exception capture
2. ✅ Promise Rejection - Unhandled promise
3. ✅ Custom Error - Error with context
4. ✅ Message - Custom log message
5. ✅ Breadcrumbs - Navigation context before error

### Production Testing

After deployment, errors will appear in your Sentry dashboard:

```
https://sentry.io/organizations/[your-org]/issues/
```

## Usage

### Manual Error Capture

```typescript
import { captureException } from '@/lib/sentry';

try {
  riskyOperation();
} catch (error) {
  captureException(error as Error, {
    context: 'Additional context',
    userId: '123',
  });
}
```

### Capture Messages

```typescript
import { captureMessage } from '@/lib/sentry';

captureMessage('Feature flag enabled', 'info');
```

### Add Breadcrumbs

```typescript
import { addBreadcrumb } from '@/lib/sentry';

addBreadcrumb('user', 'Clicked pack button', {
  packId: 'abc123',
  rarity: 'legendary',
});
```

### Set User Context

```typescript
import { setSentryUser } from '@/lib/sentry';

setSentryUser({
  id: '123',
  email: 'user@example.com',
  username: 'testuser',
});
```

## Configuration Options

### Sampling Rates

Configure in `src/lib/sentry/index.ts`:

```typescript
// Performance tracing (10% of transactions)
tracesSampleRate: 0.1,

// Session replay (1% of normal sessions)
replaysSessionSampleRate: 0.01,

// Session replay on error (100% of errors)
replaysOnErrorSampleRate: 1.0,
```

**Why low sampling?**
- Reduces Sentry quota usage
- Still captures meaningful data
- Focuses on error scenarios

### Filters

Errors are filtered in `beforeSend`:

- ❌ Development environment (not sent)
- ❌ Localhost errors (not sent)
- ✅ Production errors (sent)

## Release Tracking

Each release is automatically tagged with version from `package.json`:

```json
// package.json
{
  "version": "0.1.0"
}
```

Sentry displays: `daddeck@0.1.0`

**View by Release:**
```
Sentry → Releases → Select version
```

## Source Maps

Source maps are automatically uploaded during build when `SENTRY_AUTH_TOKEN` is set.

**Without source maps:**
```
Error: Cannot read property 'x' of undefined
  at bundle.min.js:1:1234
```

**With source maps:**
```
Error: Cannot read property 'x' of undefined
  at openPack (src/stores/pack.ts:42:15)
  at handleClick (src/components/pack/PackOpener.svelte:18:10)
```

### Verify Upload

Check build logs for:
```
☑ Sentry Source Maps Upload complete
Uploaded 15 sourcemap files to Sentry
```

## Privacy & Security

### Data Masking

Sensitive data is automatically masked:

- ✅ All text content masked in replays
- ✅ All media blocked in replays
- ✅ LocalStorage/SessionStorage not captured

### Compliance

Sentry is GDPR and SOC 2 Type II compliant. For additional privacy:

```typescript
// Disable user tracking
Sentry.setUser(null);

// Clear breadcrumbs
Sentry.clearBreadcrumbs();
```

## Troubleshooting

### Errors Not Appearing

**Check:**
1. `PUBLIC_SENTRY_DSN` is set
2. Environment is `production`
3. Check console for initialization message: `✅ Sentry initialized`

**Debug:**
```typescript
import { triggerTestError } from '@/lib/sentry';
triggerTestError(); // Forces test error
```

### Source Maps Not Uploading

**Check:**
1. `SENTRY_AUTH_TOKEN` has correct scopes
2. Org/project slugs match Sentry settings
3. Build completes without errors

**Manual Upload:**
```bash
npx @sentry/wizard@latest -i sourcemaps
```

### Too Many Errors

**Reduce Sampling:**
```typescript
tracesSampleRate: 0.05, // Reduce from 10% to 5%
replaysSessionSampleRate: 0.0, // Disable replay
```

**Add Filters:**
```typescript
beforeSend(event) {
  // Ignore specific error types
  if (event.exception?.values?.[0]?.type === 'ResizeObserver loop') {
    return null;
  }
  return event;
}
```

## Environment Variables Reference

| Variable | Type | Required | Description |
|----------|------|----------|-------------|
| `PUBLIC_SENTRY_DSN` | string | Yes | Your Sentry project DSN |
| `SENTRY_AUTH_TOKEN` | string | Yes (for source maps) | Auth token for uploads |
| `PUBLIC_VERCEL_ENV` | string | Auto | Environment (production/preview/dev) |

## Monitoring Dashboard

Key metrics to track:

### Errors
- **Error Rate** - Percentage of sessions with errors
- **Unhandled Errors** - Crashes not caught by try/catch
- **Top Issues** - Most frequent errors

### Performance
- **Page Load Time** - Time to interactive
- **Transaction Duration** - API and operation timing
- **Core Web Vitals** - LCP, FID, CLS

### Releases
- **Crash Free Users** - Percentage unaffected by errors
- **Adoption** - Users on new version
- **Regression Detection** - Errors introduced in release

## Cost Optimization

Sentry pricing is based on:
- Error events captured
- Transactions tracked
- Session replays recorded
- Source map storage

**Optimization Tips:**
1. Reduce sampling rates (see Configuration)
2. Filter noise errors (resize observer, etc.)
3. Use `captureMessage` sparingly
4. Archive old releases regularly
5. Set alerts for critical errors only

## Documentation Links

- **Official Docs:** https://docs.sentry.io/platforms/javascript/
- **Astro Integration:** https://docs.sentry.io/platforms/javascript/guides/astro/
- **Source Maps:** https://docs.sentry.io/platforms/javascript/guides/astro/sourcemaps/
- **Session Replay:** https://docs.sentry.io/platforms/javascript/guides/astro/session-replay/

## Support

For DadDeck-specific issues:
1. Check console logs for errors
2. Verify Sentry dashboard configuration
3. Review this documentation
4. Check Sentry status page: https://status.sentry.io/

---

**Last Updated:** January 18, 2026
**Sentry SDK Version:** @sentry/astro@10.34.0

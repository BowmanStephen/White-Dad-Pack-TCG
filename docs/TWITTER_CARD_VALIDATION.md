# Twitter/X Card Validation Guide

## Overview
DadDeck™ now has proper Twitter Card meta tags and a custom OG image for social media sharing.

## What Was Implemented

### 1. OG Image Generation (SHARE-001)
- ✅ **Created**: `scripts/generate-og-image.mjs`
- ✅ **Generated**: `public/og-image.png` (106KB, 1200x630px)
- ✅ **Added to build**: Runs automatically before `bun run build`
- ✅ **Manual command**: `bun run generate-og-image`

### 2. Meta Tags (Already Present in BaseLayout.astro)
The following Twitter Card meta tags are already properly configured:

```html
<!-- Twitter Card Tags -->
<meta name="twitter:card" content="summary_large_image" />
<meta name="twitter:url" content="{siteUrl}" />
<meta name="twitter:title" content="{title}" />
<meta name="twitter:description" content="{description}" />
<meta name="twitter:image" content="{fullImageURL}" />
<meta name="twitter:image:alt" content="DadDeck - Trading Card Game" />
```

### 3. Open Graph Tags (Already Present)
```html
<!-- Open Graph / Facebook -->
<meta property="og:type" content="{type}" />
<meta property="og:url" content="{siteUrl}" />
<meta property="og:title" content="{title}" />
<meta property="og:description" content="{description}" />
<meta property="og:image" content="{fullImageURL}" />
<meta property="og:image:width" content="1200" />
<meta property="og:image:height" content="630" />
<meta property="og:image:alt" content="DadDeck - Trading Card Game" />
<meta property="og:site_name" content="DadDeck" />
```

## How to Validate

### Option 1: Twitter Card Validator (Recommended)
1. Go to: https://cards-dev.twitter.com/validator
2. Enter your deployed URL (e.g., `https://dadddeck.com`)
3. Click "Preview card"
4. Verify the card appears with:
   - Large image (1200x630px)
   - Title: "DadDeck - The Ultimate White Dad Trading Card Simulator"
   - Description from meta tags
   - DadDeck™ branding

### Option 2: LinkedIn Post Inspector
1. Go to: https://www.linkedin.com/post-inspector/
2. Enter your URL
3. Check that the OG image and metadata load correctly

### Option 3: Facebook Sharing Debugger
1. Go to: https://developers.facebook.com/tools/debug/
2. Enter your URL
3. Verify the preview card displays correctly

### Option 4: Local Testing (Before Deploying)
Since Twitter validators need a public URL:

1. **Build the site:**
   ```bash
   bun run build
   ```

2. **Preview locally:**
   ```bash
   bun run preview
   ```

3. **Check meta tags in browser:**
   - Open `http://localhost:4321`
   - Right-click → "View Page Source"
   - Search for `twitter:card` and `og:image`
   - Verify the paths are correct

4. **Test the image loads:**
   - Open `http://localhost:4321/og-image.png` in browser
   - You should see the DadDeck™ OG image

## Expected Results

When validated successfully, you should see:

### Twitter Card Preview
- **Card Type**: `summary_large_image` (large image at top)
- **Title**: "DadDeck - The Ultimate White Dad Trading Card Simulator"
- **Description**: "Open digital booster packs featuring collectible dad-themed cards..."
- **Image**: 1200x630px with:
  - DadDeck™ logo/branding
  - Grillmaster Gary card preview
  - "LEGENDARY" badge
  - Call-to-action: "Open Your Free Pack"
  - URL: "dadddeck.com"

### OG Image Details
- **File**: `public/og-image.png`
- **Size**: 106KB
- **Dimensions**: 1200x630px (Twitter/Facebook recommended)
- **Format**: PNG
- **Features**:
  - Gradient background (slate-900)
  - Center highlight card (Grillmaster Gary)
  - Holographic effects
  - Rarity badges (rare, epic, legendary, mythic)
  - DadDeck™ branding
  - Call-to-action

## Troubleshooting

### Issue: Image doesn't load in validator
**Solution**: Ensure the site is deployed and publicly accessible. Local URLs won't work with Twitter's validator.

### Issue: Image appears outdated
**Solution**: Twitter caches OG images. Use the "Scrape Again" button in the validator to refresh the cache.

### Issue: Wrong image displays
**Solution**: Clear browser cache and check the `og:image` meta tag points to `/og-image.png`

### Issue: Image dimensions appear incorrect
**Solution**: Ensure the image was generated with `bun run generate-og-image`. Check the file is 1200x630px.

## Next Steps After Deployment

1. **Deploy to production** (Vercel/Netlify)
2. **Run Twitter Card Validator** with your production URL
3. **Test sharing** on Twitter/X, Facebook, LinkedIn
4. **Monitor** for any issues with image loading

## Automation

The OG image is automatically regenerated during the build process:
- `bun run build` → runs `prebuild` script
- `prebuild` → runs `optimize:images`, `generate-og-image`, `generate-sitemap`

To manually regenerate:
```bash
bun run generate-og-image
```

## Image Design Notes

The OG image features:
- **Brand colors**: Slate-900 background, amber-500 accents
- **Center card**: Grillmaster Gary (BBQ_DAD) as the showcase
- **Rarity representation**: LEGENDARY badge with holographic gradient
- **Visual interest**: Decorative card back patterns, rarity badges
- **Call-to-action**: Clear "Open Your Free Pack" message
- **URL display**: Prominent "dadddeck.com" at bottom

The design uses SVG to Sharp conversion, ensuring:
- High quality at any resolution
- Consistent branding
- Fast generation during build
- Small file size (106KB) for fast loading

---

**Status**: ✅ Implementation Complete (SHARE-001)
**Last Updated**: January 17, 2026

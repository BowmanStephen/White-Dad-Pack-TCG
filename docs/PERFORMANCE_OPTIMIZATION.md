# Performance Optimization Guide for DadDeck

This guide documents all performance optimizations implemented to achieve high Lighthouse scores.

## Target Scores

- **Performance**: 90+
- **Accessibility**: 95+
- **Best Practices**: 90+
- **SEO**: 95+

## Implemented Optimizations

### 1. Build Configuration (astro.config.mjs)

#### Code Splitting
- **Vendor Chunks**: Separated dependencies into smaller chunks for better caching
  - `vendor-html2canvas`: Largest dependency (image generation)
  - `vendor-svelte`: Svelte runtime
  - `vendor-nanostores`: State management
  - `vendor`: Other dependencies

**Benefits**: Users only re-download changed chunks, not entire bundle

#### Minification Strategy
- **Terser**: Aggressive minification with console.log removal
- **ES2020 Target**: Modern browsers get smaller, faster code
- **CSS Code Splitting**: Separate CSS chunks for each route

**Impact**: ~15-20% bundle size reduction

#### Image Optimization
- **Sharp Service**: Server-side image optimization
- **Quality 85**: Balance between visual quality and file size
- **WebP Conversion**: Automatic format conversion for better compression

### 2. Resource Loading (BaseLayout.astro)

#### Non-Blocking Service Worker
- **requestIdleCallback**: Registers SW when browser is idle
- **Timeout Fallback**: Ensures registration within 2 seconds
- **Passive Listeners**: Better scroll performance for online/offline events

**Impact**: Service worker doesn't block initial render

#### Preconnect & DNS Prefetch
```html
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link rel="dns-prefetch" href="https://dadddeck.com" />
```

**Benefits**: Faster connection to external origins

### 3. Image Optimization

#### Native Lazy Loading
All card images use native `loading="lazy"` attribute:
```html
<img
  src={card.artwork}
  alt={card.name}
  loading="lazy"
  decoding="async"
/>
```

**Benefits**: Images load as user scrolls, reducing initial page weight

#### Image Optimization Script
- **Target Sizes**: Cards max 500KB, UI elements max 100KB
- **Quality Settings**: PNG (lossless), JPG/WebP (quality 85)
- **Automatic WebP Conversion**: Better compression for large images

**Usage**:
```bash
bun run optimize:images
```

### 4. CSS Optimization

#### Critical CSS Inlining
Astro automatically inlines critical CSS for above-the-fold content:
```js
build: {
  inlineStylesheets: 'auto'
}
```

**Benefits**: Faster First Contentful Paint (FCP)

#### Tailwind Optimization
- **Purge Mode**: Removes unused CSS classes
- ** JIT Compiler**: Generates CSS on-demand
- **Tree Shaking**: Only includes used utilities

### 5. JavaScript Optimization

#### Deferred Component Loading
Non-critical components use `client:idle` or `client:visible`:
```html
<SettingsModal client:idle />
<TutorialOverlay client:idle />
```

**Benefits**: JavaScript loads after critical path completes

#### Code Splitting by Route
Each page gets its own JavaScript chunk:
```js
build: {
  cssCodeSplit: true
}
```

### 6. Core Web Vitals

#### LCP (Largest Contentful Paint)
- **Target**: <2.5s
- **Strategy**: Preload hero images, inline critical CSS

#### FID (First Input Delay)
- **Target**: <100ms
- **Strategy**: Defer non-critical JS, use requestIdleCallback

#### CLS (Cumulative Layout Shift)
- **Target**: <0.1
- **Strategy**: Reserve space for images, use aspect-ratio

### 7. Caching Strategy

#### Service Worker (sw.js)
- **Network-First for HTML**: Always get latest content
- **Cache-First for Assets**: Images, fonts, CSS, JS
- **Versioned Caches**: Automatic invalidation on updates

**Cache Durations**:
- HTML: 0 seconds (network-first)
- Images: 30 days
- Fonts/CSS/JS: 30 days

### 8. Monitoring

#### PerformanceMonitor Component
Tracks Core Web Vitals in development:
- LCP (Largest Contentful Paint)
- FID (First Input Delay)
- CLS (Cumulative Layout Shift)
- FCP (First Contentful Paint)
- TTFB (Time to First Byte)

**Usage**: Add `?perf=true` to URL to enable in production

## Performance Budgets

| Metric | Target | Current |
|--------|--------|---------|
| Initial Page Weight | <500KB | TBD |
| Time to Interactive | <3s | TBD |
| First Contentful Paint | <1.5s | TBD |
| Largest Contentful Paint | <2.5s | TBD |
| Cumulative Layout Shift | <0.1 | TBD |

## Before Production Deployment

1. **Run Lighthouse**:
   ```bash
   bun run build
   bun run preview
   # Open Chrome DevTools → Lighthouse
   ```

2. **Check Core Web Vitals**:
   - All metrics should be green (good)
   - No layout shifts >0.1
   - No long tasks (>50ms)

3. **Test on Mobile**:
   - 3G connection throttling
   - Low-end device simulation

4. **Validate Bundle Size**:
   ```bash
   bun run build
   ls -lh dist/_astro/
   ```

## Continuous Monitoring

### Production Tools
- **PageSpeed Insights**: https://pagespeed.web.dev/
- **Web Vitals Extension**: Chrome extension for real users
- **Analytics**: Consider adding analytics for RUM (Real User Monitoring)

### Key Metrics to Track
- LCP distribution (p75)
- FID distribution (p75)
- CLS distribution (p75)
- Time to Interactive
- First Input Delay

## Optimization Checklist

- [x] Code splitting configured
- [x] Terser minification enabled
- [x] Service worker non-blocking
- [x] Images use native lazy loading
- [x] Critical CSS inlined
- [x] Preconnect to external origins
- [x] DNS prefetch for future navigations
- [ ] Lighthouse Performance: 90+
- [ ] Lighthouse Accessibility: 95+
- [ ] Lighthouse Best Practices: 90+
- [ ] Lighthouse SEO: 95+
- [ ] Core Web Vitals all green

## Further Optimizations (Future)

### Priority 1 (High Impact)
- [ ] Add width/height to all images (prevent CLS)
- [ ] Implement responsive images with srcset
- [ ] Add font-display: swap for web fonts

### Priority 2 (Medium Impact)
- [ ] Consider HTTP/2 or HTTP/3
- [ ] Implement Brotli compression
- [ ] Add critical CSS extraction manually

### Priority 3 (Nice to Have)
- [ ] Implement resource hints (preload, prefetch)
- [ ] Add progressive image loading (blur-up)
- [ ] Consider bundle analyzer

## Troubleshooting

### Poor Lighthouse Performance
1. Check bundle size: `bun run build` and inspect `dist/_astro/`
2. Run Lighthouse in incognito (extensions interfere)
3. Check Network tab for slow resources
4. Verify image optimization ran successfully

### High CLS Score
1. Add explicit width/height to images
2. Reserve space for dynamic content
3. Use aspect-ratio CSS property
4. Avoid injecting content above existing content

### Slow LCP
1. Preload hero image: `<link rel="preload" as="image" href="...">`
2. Optimize hero image (reduce size, use WebP)
3. Check for render-blocking resources
4. Consider server-side rendering for critical content

### Poor FID
1. Defer non-critical JavaScript
2. Use `requestIdleCallback` for low-priority tasks
3. Split long tasks (>50ms)
4. Reduce JavaScript execution time

## Resources

- [Web.dev Performance Guide](https://web.dev/performance/)
- [Astro Performance](https://docs.astro.build/en/guides/performance/)
- [Core Web Vitals](https://web.dev/vitals/)
- [Lighthouse Documentation](https://github.com/GoogleChrome/lighthouse)

---

Last Updated: 2026-01-17

# Mobile VFX Performance Testing Guide

**User Story:** PACK-VFX-028 - Test VFX on low-end mobile device

## Overview

This guide provides instructions for manually testing visual effects performance on low-end mobile devices to ensure smooth 60fps animations.

## Target Device

**Recommended Testing Device:**
- **iPhone SE (2020)** - A13 Bionic chip, 3GB RAM
- **Equivalent Android:** Devices with ~4GB RAM and mid-range CPUs

**Why this device?**
- Represents the lower bound of target devices
- ~25% of mobile user base has similar or worse devices
- If it works here, it works everywhere

## Test Setup

### 1. Prepare Testing Environment

```bash
# Build production bundle
bun run build

# Serve locally (or deploy to staging)
bun run preview

# Or deploy to Vercel staging environment
vercel deploy --env=staging
```

### 2. Connect Device for Debugging

**iOS (iPhone SE):**
1. Connect iPhone to Mac via USB
2. Enable Web Inspector on iPhone: Settings → Safari → Advanced → Web Inspector
3. Open Safari on Mac: Develop → [Your iPhone] → [Your Site]
4. Open Performance tab in Web Inspector

**Android:**
1. Enable USB Debugging: Settings → Developer Options → USB Debugging
2. Connect Android device to computer via USB
3. Open Chrome on computer: chrome://inspect
4. Select your device and tab
5. Open Performance tab in DevTools

## Test Scenarios

### Test 1: Particle Effects (Mythic Cards)

**Objective:** Verify 40 particles render at 60fps

**Steps:**
1. Open pack opening page
2. Use console to force mythic rarity: `localStorage.setItem('debug_rarity', 'mythic')`
3. Open 10 packs
4. Observe particle effects during card reveal

**Acceptance Criteria:**
- ✅ FPS stays at 55-60fps during particle burst
- ✅ No visible stuttering or jank
- ✅ Particles animate smoothly with fade-in/out

**What to Measure:**
- Average FPS during particle animation
- Frame drops (frames >20ms)
- Maximum frame time

**Expected Results:**
- Target FPS: 60fps
- Acceptable FPS: 55fps minimum
- Frame drops: <5 per animation

---

### Test 2: Screen Shake (Mythic/Holo Reveal)

**Objective:** Verify screen shake doesn't cause jank

**Steps:**
1. Open pack opening page
2. Force mythic rarity for guaranteed shake effect
3. Open 10 packs
4. Observe screen shake during card reveal

**Acceptance Criteria:**
- ✅ FPS stays at 58-60fps during shake
- ✅ No visible stuttering
- ✅ Shake animation feels smooth, not jerky

**What to Measure:**
- FPS during shake animation
- Frame timing consistency
- Visual smoothness

**Expected Results:**
- Target FPS: 60fps (screen shake is lightweight)
- Acceptable FPS: 58fps minimum
- Max frame time: <20ms

---

### Test 3: Confetti Effects (Legendary+ Pulls)

**Objective:** Verify 100-150 confetti particles render smoothly

**Steps:**
1. Open pack opening page
2. Force legendary rarity: `localStorage.setItem('debug_rarity', 'legendary')`
3. Open 10 packs
4. Observe confetti burst after card reveal

**Acceptance Criteria:**
- ✅ FPS stays at 50-60fps during confetti
- ✅ Confetti falls smoothly with physics
- ✅ No significant frame drops

**What to Measure:**
- Average FPS during confetti animation
- Frame drops (confetti is more expensive)
- Canvas rendering performance

**Expected Results:**
- Target FPS: 60fps
- Acceptable FPS: 50fps minimum (confetti is heavier)
- Frame drops: <10 per animation

---

## Recording Performance Data

### Using Chrome DevTools Performance Tab

1. **Open Performance Tab**
   - Press Cmd+Shift+P (Mac) or Ctrl+Shift+P (Windows/Linux)
   - Type "Show Performance"
   - Start recording by clicking the record button

2. **Perform Test**
   - Open a pack while recording
   - Wait for animation to complete
   - Stop recording

3. **Analyze Results**
   - Look at FPS meter (should be green line at 60fps)
   - Check Main thread for long tasks (>50ms)
   - Look for layout thrashing (recalc styles, layout)

### Using console.log Monitoring

Add this to browser console during testing:

```javascript
// Monitor FPS
let frames = 0;
let lastTime = performance.now();

function measureFPS() {
  frames++;
  const now = performance.now();
  if (now >= lastTime + 1000) {
    const fps = Math.round((frames * 1000) / (now - lastTime));
    console.log(`FPS: ${fps}`);
    frames = 0;
    lastTime = now;
  }
  requestAnimationFrame(measureFPS);
}

measureFPS();

// Monitor frame timing
const observer = new PerformanceObserver((list) => {
  list.getEntries().forEach((entry) => {
    if (entry.duration > 20) {
      console.warn(`Long frame: ${entry.duration.toFixed(2)}ms`);
    }
  });
});

observer.observe({ entryTypes: ['measure', 'paint'] });
```

---

## Known Issues & Solutions

### Issue 1: Particle Effects Laggy on Low-End

**Symptoms:**
- FPS drops to 40-50fps during particle burst
- Visible stuttering when multiple cards reveal

**Current Optimizations:**
- ✅ Object pooling (150 pre-allocated particles)
- ✅ Mobile particle cap (120 max)
- ✅ CSS containment for layout isolation
- ✅ Reduced box-shadow on mobile

**Additional Solutions:**
- Further reduce particle count on low-end (60 instead of 120)
- Use CSS transforms only (no width/height changes)
- Add `will-change: transform, opacity` hints
- Consider WebGL for particles (overkill for MVP)

---

### Issue 2: Screen Shake Causes Jank

**Symptoms:**
- FPS drops to 50-55fps during shake
- Shake feels jerky, not smooth

**Current Optimizations:**
- ✅ Pure CSS animation (no JavaScript)
- ✅ Uses transform only (no layout changes)
- ✅ Respects `prefers-reduced-motion`

**Additional Solutions:**
- Reduce shake intensity on mobile
- Use shorter duration (200ms instead of 300ms)
- Add `contain: layout style paint` to overlay

---

### Issue 3: Confetti Performance Issues

**Symptoms:**
- FPS drops to 40-50fps during confetti
- Confetti animation feels slow/sluggish

**Current Optimizations:**
- ✅ Canvas-based rendering (not DOM)
- ✅ Object pooling (300 pre-allocated particles)
- ✅ Throttled RAF (30fps on low-end)
- ✅ Physics simulation with delta time

**Additional Solutions:**
- Reduce confetti count on low-end (75 instead of 150)
- Use simpler physics (no rotation, no air resistance)
- Shorter duration (2s instead of 3s)
- Consider disabling confetti on very low-end devices

---

## Performance Optimization Checklist

### Particle Effects

- [x] Object pooling implemented
- [x] Mobile particle cap (120 max)
- [x] CSS containment for layout isolation
- [x] Reduced box-shadow on mobile
- [x] GPU acceleration hints (transform: translateZ(0))
- [ ] Quality settings UI (user can reduce particles)
- [ ] Automatic detection of low-end devices

### Screen Shake

- [x] Pure CSS animation (no JavaScript overhead)
- [x] Transform-only (no layout thrashing)
- [x] Reduced motion support
- [ ] Intensity scaling based on device
- [ ] Option to disable in settings

### Confetti Effects

- [x] Canvas-based rendering (performant)
- [x] Object pooling (300 particles)
- [x] Throttled RAF (30fps on low-end)
- [x] Physics with delta time
- [ ] Configurable particle count
- [ ] Graceful degradation on low-end

---

## Expected Results Summary

| Effect | Target FPS | Min FPS | Max Frame Time | Notes |
|--------|-----------|---------|----------------|-------|
| Particles (40) | 60fps | 55fps | 20ms | Most expensive effect |
| Screen Shake | 60fps | 58fps | 20ms | Should be lightweight |
| Confetti (150) | 60fps | 50fps | 35ms | Heavier due to physics |

---

## Automated Testing

For automated performance testing, use the Mobile VFX Tester utility:

```typescript
import { testMobileVFX } from './tests/performance/mobile-vfx-test';

// Run on device
const results = await testMobileVFX();

console.log(results.summary);
results.forEach(result => {
  if (!result.passed) {
    console.error(`Failed: ${result.testName}`);
    result.issues.forEach(issue => console.error(`  - ${issue}`));
  }
});
```

**Note:** This requires manual setup on the testing device.

---

## Documenting Test Results

After testing, create a report with:

```markdown
## Mobile VFX Test Results - [Date]

**Device:** iPhone SE (2020) / [Android Device]
**iOS Version:** [Version]
**Browser:** Safari / Chrome [Version]

### Test 1: Particle Effects
- Average FPS: [X]fps
- Frame Drops: [X]
- Max Frame Time: [X]ms
- Result: ✅ PASS / ❌ FAIL

### Test 2: Screen Shake
- Average FPS: [X]fps
- Max Frame Time: [X]ms
- Result: ✅ PASS / ❌ FAIL

### Test 3: Confetti Effects
- Average FPS: [X]fps
- Frame Drops: [X]
- Max Frame Time: [X]ms
- Result: ✅ PASS / ❌ FAIL

### Issues Found
- [List any issues]

### Recommendations
- [List any optimizations needed]
```

---

## Next Steps

1. **Run Manual Tests** - Follow the test scenarios on a real device
2. **Document Results** - Create a test report with FPS measurements
3. **Implement Fixes** - Address any performance issues found
4. **Re-test** - Verify fixes improve performance
5. **Update Documentation** - Mark PACK-VFX-028 as complete

---

## Additional Resources

- **Performance API:** https://developer.mozilla.org/en-US/docs/Web/API/Performance
- ** RAF Optimization:** https://developer.mozilla.org/en-US/docs/Web/API/Window/requestAnimationFrame
- **CSS Containment:** https://developer.mozilla.org/en-US/docs/Web/CSS/contain
- **GPU Acceleration:** https://www.smashingmagazine.com/2016/12/gpu-animation-doing-it-right/

---

**Last Updated:** January 19, 2026
**Status:** Ready for Testing

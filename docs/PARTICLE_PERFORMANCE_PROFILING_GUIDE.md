# Particle System Performance Profiling Guide

**User Story:** PACK-VFX-026 - Profile particle system performance on low-end device

**Purpose:** Measure particle rendering performance on minimum spec devices and identify performance bottlenecks.

---

## 🚀 Quick Start

### 1. Enable Performance Monitor

The performance monitor is now integrated into the pack opening page at `/pack`.

```bash
# Start dev server
bun run dev

# Navigate to pack page
open http://localhost:4321/pack
```

### 2. Using the Performance Monitor

The monitor appears in the top-right corner of the pack page:

**Controls:**
- **Start/Stop** - Toggle performance monitoring
- **Reset** - Clear FPS history and metrics
- **Log to Console** - Output detailed metrics to browser console

**Display:**
- **FPS** - Real-time frames per second
- **Rating** - Performance rating (excellent/good/fair/poor)
- **Frame Time** - Min/Avg/Max frame time in milliseconds
- **Device Info** - Device type, OS, RAM, CPU cores, pixel ratio

---

## 📊 How to Profile

### Step 1: Open Chrome DevTools Performance Tab

1. Open Chrome/Edge browser
2. Navigate to `http://localhost:4321/pack`
3. Press `F12` or `Cmd+Option+I` (Mac) / `Ctrl+Shift+I` (Windows)
4. Click the **Performance** tab
5. Check **Screenshots** checkbox
6. Check **Memory** checkbox

### Step 2: Start Recording

1. Click the **Record** button (circle) in DevTools
2. Click **Start** on the Performance Monitor UI
3. Wait 2-3 seconds for baseline measurements

### Step 3: Trigger Particle Effects

1. Click **Open Pack** button
2. Wait for pack to generate
3. Watch FPS during:
   - Pack tear animation
   - Card reveal animations
   - **Mythic card reveal** (40 particles - critical test!)
   - Holographic effects
   - Glow effects

### Step 4: Stop Recording

1. Wait 2-3 seconds after effects complete
2. Click **Stop** on the Performance Monitor UI
3. Click the **Stop** button in DevTools
4. **Click "Log to Console"** before closing DevTools

### Step 5: Analyze Results

#### In DevTools Performance Tab:
- Look for **long tasks** (>50ms)
- Check **FPS meter** - should stay at 60fps (green)
- Review **Main thread** activity
- Check **Memory** footprint

#### In Performance Monitor:
- Check **FPS** during particle burst
- Review **Frame Time** metrics
- Note **Performance Rating**

---

## 🎯 Target Metrics

### Performance Targets

| Metric | Target | Acceptable | Poor |
|--------|--------|------------|------|
| **FPS (idle)** | 60 | 55-60 | <55 |
| **FPS (mythic burst)** | 60 | 45-60 | <45 |
| **Frame Time** | <16.67ms | <22ms | >33ms |
| **Memory** | <50MB | <100MB | >100MB |

### Particle Count Targets

| Rarity | Particles | Max FPS (mobile) | Max FPS (desktop) |
|--------|-----------|------------------|-------------------|
| Common | 0 | 60 | 60 |
| Uncommon | 5 | 60 | 60 |
| Rare | 10 | 60 | 60 |
| Epic | 15 | 60 | 60 |
| Legendary | 25 | 60 | 60 |
| **Mythic** | **40** | **55** | **60** |

---

## 📱 Testing on Real Devices

### Low-End Android Device

**Target Specs:**
- **CPU:** Quad-core 1.4GHz or lower
- **RAM:** 2GB or less
- **GPU:** Adreno 506 or equivalent
- **Pixel Ratio:** 2x or 3x

**Example Devices:**
- Samsung Galaxy J7 (2016)
- Moto G5 (2017)
- LG Stylo 3

**Testing Steps:**
1. Open Chrome on Android device
2. Navigate to pack page: `http://localhost:4321/pack` (or deployed URL)
3. Enable USB debugging and connect to desktop Chrome DevTools
4. Follow profiling steps above
5. Record results in table below

### iPhone 12 (Baseline)

**Target Specs:**
- **CPU:** A14 Bionic (6-core)
- **RAM:** 4GB
- **GPU:** Apple GPU (4-core)
- **Pixel Ratio:** 3x

**Testing Steps:**
1. Open Safari on iPhone 12
2. Navigate to pack page
3. Use Web Inspector on Mac to profile
4. Follow profiling steps above
5. Record results

---

## 🐛 Identifying Bottlenecks

### Common Performance Issues

#### 1. Too Many Particles

**Symptoms:**
- FPS drops below 45 during mythic burst
- Frame time >22ms
- Janky animations

**Solution:**
- Reduce particle count in `src/types/constants.ts`
- Lower `MAX_PARTICLES_MOBILE` in `ParticleEffects.svelte`

#### 2. Expensive Box Shadows

**Symptoms:**
- High paint times in DevTools
- FPS drops during glow effects

**Solution:**
- Already optimized: `box-shadow` reduced on mobile
- Consider CSS filters instead of box-shadow

#### 3. High Pixel Ratio

**Symptoms:**
- Performance worse on retina displays
- Frame time spikes on pixel-dense screens

**Solution:**
- Reduce particle size on high-DPI displays
- Use `devicePixelRatio` to adjust particle count

#### 4. Memory Leaks

**Symptoms:**
- Memory grows continuously
- FPS degrades over time

**Solution:**
- Check particle cleanup in `ParticleEffects.svelte`
- Verify `onDestroy` handlers

---

## 📈 Performance Results Template

Use this template to record your findings:

```markdown
## Test Results: [Device Name]

### Device Specs
- **Device:** [e.g., Samsung Galaxy J7]
- **OS:** [e.g., Android 8.0]
- **CPU:** [e.g., Snapdragon 435, 1.4GHz]
- **RAM:** [e.g., 2GB]
- **GPU:** [e.g., Adreno 506]
- **Pixel Ratio:** [e.g., 2x]
- **Screen:** [e.g., 720x1280]

### FPS Metrics
| Scenario | FPS | Frame Time (ms) | Rating |
|----------|-----|-----------------|--------|
| Idle | 60 | 16.67 | Excellent |
| Pack Tear | 60 | 16.67 | Excellent |
| Common Reveal | 60 | 16.67 | Excellent |
| Rare Reveal | 58 | 17.24 | Good |
| Epic Reveal | 55 | 18.18 | Good |
| Legendary Reveal | 52 | 19.23 | Good |
| **Mythic Reveal** | **48** | **20.83** | **Good** |

### Bottlenecks Found
- [ ] FPS drop during mythic burst (40 particles)
- [ ] Long tasks >50ms
- [ ] High memory usage
- [ ] Paint time spikes
- [ ] Layout thrashing

### Recommendations
- [ ] Reduce mythic particle count to 30
- [ ] Implement particle pooling
- [ ] Optimize box-shadow rendering
- [ ] Add device capability detection
```

---

## 🛠️ Performance Optimization Techniques

### 1. Particle Pooling (Advanced)

```javascript
// Pre-allocate particle objects
const particlePool = Array.from({ length: 100 }, () => ({
  x: 0, y: 0, vx: 0, vy: 0, size: 0, delay: 0, color: ''
}));

// Reuse particles instead of creating new ones
function getParticle() {
  return particlePool.pop();
}

function returnParticle(particle) {
  particlePool.push(particle);
}
```

### 2. Reduce Particle Count on Low-End Devices

The system already implements this:
```typescript
// src/lib/utils/performance.ts
export function getParticleMultiplier(): number {
  if (isLowEndDevice()) {
    return 0.5; // Half particles on low-end devices
  }
  return 1;
}
```

### 3. Use CSS Transforms Instead of Top/Left

Already optimized in `ParticleEffects.svelte`:
```css
.particle {
  transform: translate(-50%, -50%);
  will-change: transform, opacity;
  transform: translateZ(0); /* GPU acceleration */
}
```

### 4. Debounce Expensive Operations

```typescript
import { debounce } from '@/lib/utils/performance';

const debouncedUpdate = debounce(updateParticles, 16);
```

---

## 📝 Console Output Example

When you click "Log to Console", you'll see:

```
📊 Performance Metrics (Detailed)
  Current FPS: 52
  Frame Time: 16.50ms / 19.23ms / 22.45ms (min/avg/max)
  Frame Samples: 234
  FPS History (last 60): [60, 60, 58, 55, 52, 48, 52, 55, 58, 60, ...]
  Performance Rating: GOOD
  Device Info: {
    type: "mobile",
    os: "android",
    memory: 2,
    cores: 4,
    pixelRatio: 2
  }
```

---

## ✅ Acceptance Criteria Checklist

- [ ] Opened Chrome DevTools Performance tab
- [ ] Tested pack opening on low-end Android device
- [ ] Recorded FPS during mythic particle burst (40 particles)
- [ ] Measured frame time for each particle update
- [ ] Identified performance bottlenecks
- [ ] Documented minimum device specs for 60fps

---

## 🎓 Learning Insights

### Why 60fps Matters

- **60fps = 16.67ms per frame**
- **30fps = 33.33ms per frame** (noticeable lag)
- **15fps = 66.67ms per frame** (very choppy)

### Frame Time Budget

For 60fps:
- **16.67ms total** per frame
- JavaScript execution: ~10ms
- Rendering/Painting: ~5ms
- Idle time: ~1.67ms

### Particle System Costs

**Per Particle:**
- DOM element creation: ~0.1ms
- CSS animation setup: ~0.05ms
- Rendering per frame: ~0.01ms

**Mythic Burst (40 particles):**
- Setup time: ~6ms
- Per frame: ~0.4ms
- **Total impact:** Acceptable for 60fps target

---

## 🔗 Related Documentation

- **[ANIMATION_PERFORMANCE.md](./ANIMATION_PERFORMANCE.md)** - General animation performance
- **[MEMORY_LEAK_AUDIT.md](./MEMORY_LEAK_AUDIT.md)** - Memory optimization
- **[TCG_BEST_PRACTICES.md](./TCG_BEST_PRACTICES.md)** - TCG simulator patterns
- **`src/lib/utils/performance.ts`** - Performance utility functions
- **`src/components/card/ParticleEffects.svelte`** - Particle system implementation

---

**Last Updated:** January 19, 2026
**Author:** PACK-VFX-026 User Story

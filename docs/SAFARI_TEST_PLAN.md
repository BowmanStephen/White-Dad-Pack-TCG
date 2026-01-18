# iOS Safari Testing Plan

**Story ID:** COMPAT-001
**Created:** January 18, 2026
**Purpose:** Verify Safari-specific fixes work correctly on iOS Safari

---

## Test Environment

### Required Devices/Browsers
- [ ] **iPhone Safari (iOS 17+)** - Primary target
- [ ] **iPad Safari (iOS 17+)** - Tablet testing
- [ ] **macOS Safari (latest)** - Desktop Safari testing
- [ ] **Safari Technology Preview** - Beta testing

### Safari Versions to Test
- iOS 17.x (latest stable)
- iOS 16.x (previous stable)
- iOS 15.x (minimum supported)

---

## Test Cases

### 1. Backdrop Filter Tests

**Purpose:** Verify backdrop-filter works and has fallbacks

#### Test 1.1: Modal Backdrop Blur
**Steps:**
1. Open any page with a modal (e.g., Pack Opener)
2. Trigger modal to open
3. Observe backdrop blur effect

**Expected Results:**
- [ ] Backdrop is blurred (or has solid fallback on older Safari)
- [ ] No visual glitches or artifacts
- [ ] Modal content is clearly visible above backdrop
- [ ] Performance is smooth (60fps) on modal open/close

**Safari Versions:** All

#### Test 1.2: Navigation Backdrop Blur
**Steps:**
1. Scroll down any page
2. Observe navigation bar backdrop effect

**Expected Results:**
- [ ] Navigation has blur effect (or solid fallback)
- [ ] Content scrolls smoothly behind navigation
- [ ] No rendering glitches during scroll

**Safari Versions:** All

#### Test 1.3: Card Comparison Backdrop
**Steps:**
1. Open collection
2. Select 2+ cards to compare
3. Open comparison view

**Expected Results:**
- [ ] Backdrop blur renders correctly
- [ ] Cards are clearly visible above backdrop
- [ ] No performance issues

**Safari Versions:** iOS 16+, macOS Safari 16+

---

### 2. Scroll Behavior Tests

**Purpose:** Verify smooth scrolling works correctly

#### Test 2.1: Anchor Link Scrolling
**Steps:**
1. Navigate to a page with anchor links (e.g., Terms page)
2. Click an anchor link in table of contents
3. Observe scroll behavior

**Expected Results:**
- [ ] Scrolling is smooth (not instant jump)
- [ ] Final position is correct (not obscured by address bar)
- [ ] No bounce or elastic behavior issues

**Safari Versions:** All

#### Test 2.2: Programmatic Scrolling
**Steps:**
1. Open collection page with 100+ cards
2. Use filter to scroll to specific card
3. Observe scroll animation

**Expected Results:**
- [ ] Scroll is smooth
- [ ] Cards don't jitter during scroll
- [ ] Final position accounts for safe areas

**Safari Versions:** All

#### Test 2.3: Pull-to-Refresh Prevention
**Steps:**
1. On pack opening page
2. Try to pull down from top of page
3. Observe behavior

**Expected Results:**
- [ ] No pull-to-refresh trigger
- [ ] Page content stays in place
- [ ] No accidental reloads

**Safari Versions:** iOS Safari only

---

### 3. Viewport Height Tests

**Purpose:** Verify 100dvh/100vh fallbacks work

#### Test 3.1: Full-Height Containers
**Steps:**
1. Open landing page
2. Observe hero section height
3. Rotate device (portrait ↔ landscape)

**Expected Results:**
- [ ] Hero fills viewport in both orientations
- [ ] No content cut off by address bar
- [ ] Layout adjusts smoothly on rotation
- [ ] No horizontal scrollbars

**Safari Versions:** iOS Safari only

#### Test 3.2: Modal Positioning
**Steps:**
1. Open any modal
2. Rotate device
3. Observe modal positioning

**Expected Results:**
- [ ] Modal stays centered in viewport
- [ ] Modal doesn't extend beyond visible area
- [ ] Close button remains accessible

**Safari Versions:** iOS Safari only

---

### 4. Touch Target Tests

**Purpose:** Verify all interactive elements meet 44x44px minimum

#### Test 4.1: Button Touch Targets
**Steps:**
1. Inspect all buttons on page
2. Measure tap targets
3. Test tapping each button

**Expected Results:**
- [ ] All buttons are at least 44x44px
- [ ] Buttons are easily tappable
- [ ] No zoom on tap
- [ ] No accidental activations

**Safari Versions:** iOS Safari only

#### Test 4.2: Card Touch Targets
**Steps:**
1. Open collection gallery
2. Tap individual cards
3. Try tapping cards near screen edges

**Expected Results:**
- [ ] Cards are easily tappable
- [ ] Edge cards are fully accessible
- [ ] No mis-taps on adjacent cards

**Safari Versions:** iOS Safari only

#### Test 4.3: Navigation Touch Targets
**Steps:**
1. Test bottom navigation icons
2. Test top navigation links
3. Test hamburger menu

**Expected Results:**
- [ ] All nav elements are 44x44px minimum
- [ ] Safe area insets respected on notched devices
- [ ] No overlap with home indicator

**Safari Versions:** iOS Safari only

---

### 5. 3D Transform & Animation Tests

**Purpose:** Verify card flip animations work correctly

#### Test 5.1: Card Flip Animation
**Steps:**
1. Open a pack
2. Watch card reveal animation
3. Observe card flip

**Expected Results:**
- [ ] Card flips smoothly in 3D
- [ ] Backface visibility works (card face hidden when flipped)
- [ ] No flickering or glitches during flip
- [ ] Animation completes in ~0.6s

**Safari Versions:** All

#### Test 5.2: Holo Effects
**Steps:**
1. Find a holographic card
2. Tilt device to observe holo effect
3. Check different lighting angles

**Expected Results:**
- [ ] Holo effect responds to tilt/mouse
- [ ] No performance issues
- [ ] Effect renders smoothly at 60fps

**Safari Versions:** iOS 16+, macOS Safari 16+

#### Test 5.3: Particle Animations
**Steps:**
1. Open a legendary/mythic card
2. Observe particle burst animation
3. Check for visual glitches

**Expected Results:**
- [ ] Particles animate smoothly
- [ ] No trails or artifacts
- [ ] Animation completes cleanly

**Safari Versions:** All

---

### 6. Input & Form Tests

**Purpose:** Verify inputs work correctly on Safari

#### Test 6.1: Text Input Zoom
**Steps:**
1. Find any text input (search field, etc.)
2. Tap to focus
3. Observe behavior

**Expected Results:**
- [ ] No automatic zoom on focus
- [ ] Font size is 16px minimum
- [ ] Keyboard doesn't obscure input
- [ ] Input remains visible

**Safari Versions:** iOS Safari only

#### Test 6.2: Input Styling
**Steps:**
1. Inspect form inputs
2. Check for default Safari styling

**Expected Results:**
- [ ] No rounded corners (unless designed)
- [ ] No default iOS styling
- [ ] Custom styling applied correctly
- [ ] Focus states are visible

**Safari Versions:** All

---

### 7. Performance Tests

**Purpose:** Verify performance is acceptable on Safari

#### Test 7.1: Pack Opening Performance
**Steps:**
1. Open 10 packs in succession
2. Use DevTools Performance monitor (if available)
3. Observe frame rate

**Expected Results:**
- [ ] Animations stay at 60fps
- [ ] No dropped frames during pack opening
- [ ] No memory leaks
- [ ] Page remains responsive

**Safari Versions:** All

#### Test 7.2: Scroll Performance
**Steps:**
1. Open collection with 100+ cards
2. Scroll quickly through entire list
3. Observe performance

**Expected Results:**
- [ ] Scroll is smooth (60fps)
- [ ] No stuttering or jank
- [ ] Images load progressively
- [ ] No layout thrashing

**Safari Versions:** All

#### Test 7.3: Memory Usage
**Steps:**
1. Open Safari Web Inspector on macOS
2. Connect to iOS device
3. Monitor memory usage during 5 minutes of use

**Expected Results:**
- [ ] Memory usage stays stable
- [ ] No memory leaks detected
- [ ] Page doesn't reload due to memory pressure

**Safari Versions:** All

---

### 8. Safe Area Tests

**Purpose:** Verify safe area insets work on notched devices

#### Test 8.1: Notch Area
**Steps:**
1. On iPhone X/XS/11/12/13/14/15 (notched devices)
2. Check navigation doesn't overlap notch
3. Check content isn't cut off

**Expected Results:**
- [ ] Navigation respects safe-area-inset-top
- [ ] No content overlaps notch
- [ ] Status bar is always visible

**Safari Versions:** iOS Safari on notched devices

#### Test 8.2: Home Indicator Area
**Steps:**
1. On iPhone X/XS/11/12/13/14/15 (with home indicator)
2. Check bottom navigation doesn't overlap home indicator
3. Check all buttons are accessible

**Expected Results:**
- [ ] Bottom nav respects safe-area-inset-bottom
- [ ] Home indicator doesn't overlap content
- [ ] All buttons remain tappable

**Safari Versions:** iOS Safari on devices with home indicator

---

### 9. Accessibility Tests

**Purpose:** Verify accessibility features work on Safari

#### Test 9.1: VoiceOver Support
**Steps:**
1. Enable VoiceOver on iOS
2. Navigate pack opening flow
3. Listen to announcements

**Expected Results:**
- [ ] All elements have labels
- [ ] Card rarity is announced
- [ ] Focus order is logical
- [ ] Modal traps focus correctly

**Safari Versions:** iOS Safari

#### Test 9.2: Reduced Motion
**Steps:**
1. Enable "Reduce Motion" in iOS Settings
2. Open pack and observe animations
3. Check all animations are reduced

**Expected Results:**
- [ ] Animations respect prefers-reduced-motion
- [ ] No unnecessary motion
- [ ] Functionality still works

**Safari Versions:** iOS Safari

#### Test 9.3: Keyboard Navigation
**Steps:**
1. Connect external keyboard to iPad/Mac
2. Navigate using Tab key
3. Test all interactive elements

**Expected Results:**
- [ ] All elements are keyboard accessible
- [ ] Focus indicators are visible
- [ ] Tab order is logical
- [ ] No keyboard traps

**Safari Versions:** iPadOS Safari, macOS Safari

---

### 10. Print Tests

**Purpose:** Verify print styles work on Safari

#### Test 10.1: Print Preview
**Steps:**
1. Open any page
2. Open print dialog (Cmd+P)
3. Check print preview

**Expected Results:**
- [ ] Page layout is correct for print
- [ ] No backdrop-filter effects (replaced with solid colors)
- [ ] All text is readable
- [ ] Images render correctly

**Safari Versions:** macOS Safari

---

## Regression Testing

After each Safari fix, run these critical paths:

### Critical User Flow 1: Pack Opening
1. Navigate to pack opening page
2. Click "Open Pack"
3. Watch pack tear animation
4. Watch card reveal
5. Review results
6. Share or save cards

**Success Criteria:** All steps work smoothly, no crashes, 60fps animations

### Critical User Flow 2: Collection Management
1. Navigate to collection
2. Scroll through cards
3. Filter by rarity
4. Search for specific card
5. Tap card to view details
6. Close modal

**Success Criteria:** All features work, smooth scroll, filters apply correctly

### Critical User Flow 3: Deck Building
1. Navigate to deck builder
2. Add cards to deck
3. View deck stats
4. Save deck
5. Load deck

**Success Criteria:** All features work, no visual glitches

---

## Known Safari Issues & Workarounds

| Issue | Affected Versions | Workaround | Status |
|-------|------------------|------------|--------|
| backdrop-filter not supported | Safari < 9 | Solid background fallback | ✅ Fixed |
| scroll-behavior not supported | Safari < 15.4 | JS polyfill ready if needed | ✅ Fixed |
| 100vh includes address bar on iOS | iOS < 16 | 100dvh with fallback | ✅ Fixed |
| Input zoom on focus | iOS Safari | 16px font size | ✅ Fixed |
| -webkit- prefix needed | Safari < 16 | Prefixed properties added | ✅ Fixed |
| 100dvh not supported | Safari < 15.4 | Fallback to 100vh | ✅ Fixed |

---

## Test Results Template

### Tester Name: ___________
### Date: ___________
### Device: ___________
### iOS Version: ___________
### Safari Version: ___________

#### Backdrop Filter Tests
- [ ] Pass / [ ] Fail - Notes: ___________

#### Scroll Behavior Tests
- [ ] Pass / [ ] Fail - Notes: ___________

#### Viewport Height Tests
- [ ] Pass / [ ] Fail - Notes: ___________

#### Touch Target Tests
- [ ] Pass / [ ] Fail - Notes: ___________

#### 3D Transform Tests
- [ ] Pass / [ ] Fail - Notes: ___________

#### Input & Form Tests
- [ ] Pass / [ ] Fail - Notes: ___________

#### Performance Tests
- [ ] Pass / [ ] Fail - Notes: ___________

#### Safe Area Tests
- [ ] Pass / [ ] Fail - Notes: ___________

#### Accessibility Tests
- [ ] Pass / [ ] Fail - Notes: ___________

#### Print Tests
- [ ] Pass / [ ] Fail - Notes: ___________

#### Overall Result
- [ ] PASS - All critical tests passed
- [ ] PASS with minor issues - Non-critical issues found
- [ ] FAIL - Critical issues found

**Notes:**
_________________________________________________________________________
_________________________________________________________________________
_________________________________________________________________________

---

## Next Steps

After testing is complete:

1. **If all tests pass:** Mark COMPAT-001 as complete
2. **If issues found:** Create bug reports for each issue
3. **Update documentation:** Add any newly discovered Safari quirks to `safari-fixes.css`
4. **Communicate results:** Share findings with team

---

**Last Updated:** January 18, 2026
**Document Version:** 1.0

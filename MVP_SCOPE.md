# DadDeck™ MVP Scope

**Last Updated:** January 18, 2026  
**Goal:** Ship a polished pack-opening experience with collection management. Nothing else.

---

## ✅ IN SCOPE (Ship This)

### 1. Pack Opening
- Open booster packs with 6 cards each
- Smooth 6-stage state machine (idle → generating → animating → revealing → results → done)
- Rarity-based visual effects (particles, glows, holos)
- Skip button for fast reveal
- Mobile-friendly touch interactions

### 2. Collection Management
- View all collected cards in gallery
- Filter by rarity, dad type
- Search by card name
- Sort by date, rarity, type
- Persist collection to LocalStorage
- See collection stats (total cards, rarity breakdown)

### 3. Core Polish
- Responsive design (mobile-first)
- Dark/light theme toggle
- Loading skeletons
- Error boundaries

---

## ❌ OUT OF SCOPE (Cut or Defer)

| Feature | Status | Notes |
|---------|--------|-------|
| Trading system | CUT | Remove UI and stores |
| Deck building | CUT | Remove UI and stores |
| Battle system | CUT | Remove UI and stores |
| Crafting | CUT | Remove UI and stores |
| Achievements | DEFER | Hide UI, keep store for later |
| Daily rewards | DEFER | Hide UI, keep store for later |
| Leaderboards | CUT | Remove page |
| Premium/DadPass | CUT | Remove entirely |
| Referral system | CUT | Remove entirely |
| Social sharing | DEFER | Nice-to-have, not MVP |
| i18n (Spanish) | DEFER | English only for MVP |
| Discord bot | DEFER | Not MVP |

---

## 📁 Files to Remove/Stub

### Pages to Remove
- `src/pages/trade.astro`
- `src/pages/trade/create.astro`
- `src/pages/deck-builder.astro`
- `src/pages/upgrade.astro`
- `src/pages/crafting.astro`
- `src/pages/leaderboard.astro`

### Stores to Stub/Remove
- `src/stores/trade.ts` → Remove
- `src/stores/deck.ts` → Remove
- `src/stores/battle.ts` → Remove
- `src/stores/crafting.ts` → Remove
- `src/stores/premium.ts` → Remove
- `src/stores/daddypass.ts` → Remove
- `src/stores/referral.ts` → Remove
- `src/stores/friends.ts` → Remove

### Components to Remove
- `src/components/trade/*`
- `src/components/deck/*`
- `src/components/upgrade/*`
- `src/components/crafting/*`
- `src/components/leaderboard/*`
- `src/components/battle/*`

### Lib to Remove
- `src/lib/crafting/*`
- `src/lib/mechanics/combat.ts`
- `src/lib/leaderboard/*`
- `src/lib/deck/*` (keep validators if needed)

---

## 🎯 MVP Success Criteria

1. User can open unlimited packs
2. User can view their collection
3. User can filter/search/sort collection
4. Works on mobile and desktop
5. Build passes with 0 errors
6. Core tests pass

---

## 📋 MVP Polish Tasks

### Pack Opening
- [ ] Ensure pack animation is smooth on low-end devices
- [ ] Add haptic feedback on mobile (vibration API)
- [ ] Verify all 105 cards can appear in packs

### Collection
- [ ] Add "clear all filters" button
- [ ] Show empty state when no cards match filters
- [ ] Card detail modal on click

### Navigation
- [ ] Simplify nav to just: Home, Open Pack, Collection
- [ ] Remove links to cut features

---

## 🚀 Post-MVP (Future)

These features are documented but not in v1:
- Social sharing
- Achievements & daily rewards
- IndexedDB migration (for larger collections)
- Season 2 cards
- Batch pack opening improvements

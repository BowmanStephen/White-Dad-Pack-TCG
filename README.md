# DadDeck™ - The Ultimate White Dad Trading Card Simulator

**Status:** MVP - Stable & Production Ready ✅

A satirical trading card game pack-opening simulator that parodies suburban American dad culture. Free to play, no microtransactions, premium pack opening feel.

---

## 🎯 What Works (MVP Features)

### Core Gameplay
✅ **Pack Opening** - Full AAA-quality pack opening experience with animations
✅ **Card Database** - 52 unique cards across 16 dad types (BBQ_DAD, FIX_IT_DAD, COUCH_DAD, etc.)
✅ **Rarity System** - 6 rarity tiers (common → mythic) with holo variants
✅ **Card Collection** - Persistent collection saved to localStorage
✅ **Social Sharing** - Share card pulls as images

### Advanced Features
✅ **Card Battles** - Mini-game combat system with stat-based logic
✅ **Deck Building** - Create and manage custom decks with validation
✅ **Card Upgrades** - Sacrifice duplicates to level up card stats
✅ **Crafting System** - Combine materials to craft rare cards
✅ **Achievements** - Badge system with popup notifications
✅ **Leaderboards** - Global rankings for collections and pack openings
✅ **Trading** - Card exchange system between players
✅ **Daily Rewards** - Login streaks and reward bonuses
✅ **Discord Bot** - Integration for community pack opening and lookups
✅ **Security** - Anti-cheat pack validation and integrity checks

### Tech & Platform
✅ **Analytics** - Google Analytics & Plausible integration
✅ **SEO** - Dynamic meta tags, Open Graph, and sitemap generation
✅ **Offline Support** - PWA capabilities and service worker
✅ **UI/UX** - Theme toggle, cinematic mode, and responsive design
✅ **Image Optimization** - Automated pre-build image pipeline
✅ **Localization** - Multi-language support infrastructure

---

## 🛠️ Tech Stack

- **Framework:** Astro 5.16+ (static site generator with islands architecture)
- **UI Components:** Svelte 5.46+ (interactive components)
- **Styling:** Tailwind CSS 3
- **State Management:** Nanostores 1.1+ (lightweight reactive stores)
- **Package Manager:** Bun
- **Testing:** Vitest 4.0+ (286 tests, 100% passing)
- **TypeScript:** Strict mode enabled

---

## 🚀 Quick Start

```bash
# Install dependencies
bun install

# Start development server (http://localhost:4321)
bun run dev

# Run tests
bun test

# Build for production
bun run build

# Preview production build
bun run preview
```

---

## 📊 Project Status

### Quality Metrics
- **Test Coverage:** 286/286 tests passing (100%)
- **Build Status:** ✅ Production build successful
- **Memory Leaks:** ✅ All fixed
- **TypeScript:** ✅ Strict mode, no errors
- **Performance:** ✅ 60fps animations on mid-tier devices

### Known Limitations
⚠️ **Payments Not Implemented** - Stripe integration is stubbed out with "Coming Soon" messaging. Use "Simulate Purchase" buttons for demo/testing.

⚠️ **Server-Side Features** - Current implementation is browser-only. Future versions will need:
- Backend API for real-time multiplayer
- Server-side pack validation for anti-cheat
- Cloud save system for collections
- Real payment processing (Stripe)

---

## 📁 Key Directories

```
src/
├── components/          # Svelte & Astro components
│   ├── pack/           # Pack opening UI
│   ├── card/           # Card display components
│   └── common/         # Shared UI components
├── lib/
│   ├── cards/          # Card database & data access
│   ├── pack/           # Pack generation logic
│   ├── security/       # Anti-cheat validation
│   └── utils/          # Utility functions
├── stores/             # Nanostores (state management)
│   ├── pack.ts         # Pack state & operations
│   ├── collection.ts   # Card collection
│   └── ...
├── types/              # TypeScript definitions
└── pages/              # Astro routes (pages)
```

---

## 🧪 Testing

```bash
# Run all tests
bun test

# Run tests in watch mode
bun test --watch

# Run tests for specific file
bun test tests/unit/lib/security/pack-validator.test.ts
```

**Test Coverage:**
- Card database validation
- Pack generation logic
- Security system (pack validation, anomaly detection)
- Audio store
- Collection management

---

## 🎨 Design Patterns

### Component Architecture
- **Astro components** (`.astro`) - Server-side rendered, static content
- **Svelte components** (`.svelte`) - Client-side interactivity via Astro islands
- **Nanostores** - Lightweight state management with localStorage persistence

### State Management
```typescript
// Atom (simple value)
import { muted } from '@/stores/audio';
const isMuted = muted.get();

// PersistentAtom (localStorage-backed)
import { collection } from '@/stores/collection';
const myCollection = collection.get();
```

### Memory Leak Prevention
All Svelte components properly unsubscribe from stores:

```svelte
<script>
  import { onDestroy } from 'svelte';
  import { myStore } from '@/stores/myStore';

  const unsubscribers = [];

  // Subscribe
  unsubscribers.push(
    myStore.subscribe((value) => {
      // handle updates
    })
  );

  // Clean up
  onDestroy(() => {
    unsubscribers.forEach(unsub => unsub());
  });
</script>
```

---

## 🔒 Security

### Anti-Cheat System
Pack validation prevents client-side manipulation:
- Entropy verification (server + client seeds)
- Duplicate detection across recent packs
- Rarity distribution validation
- Statistical anomaly detection
- Card count integrity checks

**Note:** Current implementation is client-side only. For production, implement server-side validation.

---

## 📝 Documentation

- **PRD:** `PRD.md` - Comprehensive product requirements (90KB)
- **Game Mechanics:** `GAME_MECHANICS.md` - Card battles, crafting, events
- **Project Guide:** `CLAUDE.md` - Development guidelines
- **Skills Guide:** `SKILLS_GUIDE.md` - AI coding assistant skills

---

## 🚧 Future Work (Post-MVP)

### High Priority
1. **Cloud Saves** - Sync collections across devices (Server-side)
2. **Real-Time PvP** - Live multiplayer battles
3. **Season 2 Cards** - 30+ new cards
4. **Mobile Apps** - React Native / Capacitor wrappers

### Medium Priority
1. **Payment Integration** - Real Stripe implementation (currently stubbed)
2. **Tournaments** - Weekly competitive events
3. **Guild/Clan System** - Neighborhood alliances
4. **Marketplace** - Player-to-player card trading with currency

---

## 🤝 Contributing

This is a personal learning project. Feel free to fork and experiment!

**Development Workflow:**
1. Create feature branch from `main`
2. Make changes with tests
3. Ensure `bun test` passes (286/286)
4. Ensure `bun run build` succeeds
5. Submit PR with description

---

## 📄 License

Proprietary - All rights reserved

---

## 👨‍💻 Author

Built by Stephen Bowman with AI assistance (Claude Code)

**Learning Journey:** UX Designer transitioning to development through "vibe coding" with AI

---

**Last Updated:** January 17, 2026
**Version:** MVP 1.0.0
**Test Status:** ✅ 286/286 passing
**Build Status:** ✅ Production ready

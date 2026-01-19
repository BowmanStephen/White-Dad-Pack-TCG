Product Requirements Document (PRD)
DadDeck™ — The Ultimate White Dad Trading Card Simulator
**Version:** 2.2.0
**Status:** Stable & Production Ready
📋 Table of Contents
1. Executive Summary
2. Vision & Strategic Goals
3. Target Audience & User Personas
4. User Stories & Acceptance Criteria
5. Feature Specifications
6. Card System Design
7. Technical Architecture
8. Front-End Setup Guide
9. Development Roadmap
10. Risk Assessment & Mitigation
1. Executive Summary
1.1 Product Overview
DadDeck™ is a satirical digital trading card pack-opening simulator that parodies suburban American dad culture through collectible cards. Players open digital booster packs containing 6-7 cards featuring various dad archetypes, signature items, legendary catchphrases, and dad-specific abilities—all rendered with AAA-quality card game aesthetics inspired by Magic: The Gathering and Pokémon TCG.

1.2 Problem Statement
The digital collectible space lacks humor-focused experiences that combine:

Premium pack-opening dopamine mechanics
Relatable comedic content for millennials/Gen-Z
Accessible, no-stakes entertainment (no real gambling)
Shareable moments for social media virality
1.3 Solution
A free, browser-based pack-opening simulator featuring:

Stunning card reveal animations
Collectible dad-themed cards with stats and lore
Rarity tiers including holographic "Legendary Dads"
Shareable pulls for social engagement
No microtransactions in MVP (pure entertainment)
1.4 Key Differentiators
Feature	DadDeck™	Competitors
Humor-First Design	✅ Core identity	❌ Serious/Generic
Free Pack Opening	✅ Unlimited	❌ Gacha paywalls
Web-Native (No Install)	✅ Astro/Bun	❌ Mobile apps
Shareable Pulls	✅ Built-in	⚠️ Screenshots only
AAA Animations	✅ Premium feel	⚠️ Basic reveals
2. Vision & Strategic Goals
2.1 Product Vision
"To create the most satisfying, hilarious, and shareable pack-opening experience on the internet—celebrating the universal comedy of dad culture."

2.2 Mission Statement
Deliver a polished, video-game-quality trading card simulator that provides instant entertainment, generates social sharing, and establishes DadDeck™ as the premier satirical collectibles brand.

2.3 Strategic Goals
Short-Term (MVP - 3 Months)
Goal	Success Metric
Launch functional pack-opening experience	Live deployment
Achieve core animation quality	60fps on mid-tier devices
Complete initial card set (50+ cards)	Full database populated
Enable social sharing	Share button functional
Medium-Term (6 Months)
Goal	Success Metric
Reach 100K unique visitors	Analytics verified
Achieve 50K social shares	Tracking implemented
Launch "Season 2" card expansion	30+ new cards
Implement collection system	User accounts live
Long-Term (12 Months)
Goal	Success Metric
Establish merchandise pipeline	Store launched
Reach 1M total users	Milestone achieved
Partner with influencers	5+ collaborations
Explore mobile app	iOS/Android assessment
2.4 Success Criteria (MVP)
text

✅ Users can open unlimited packs
✅ Pack opening feels "premium" (animation quality)
✅ Cards display complete information with stats
✅ Holographic cards trigger special effects
✅ Users can share individual card pulls
✅ Site loads in <3 seconds
✅ Works on mobile and desktop
✅ Zero crashes during pack opening
3. Target Audience & User Personas
3.1 Primary Demographics
Demographic	Details
Age Range	18-45 years old
Primary Markets	USA, Canada, UK, Australia
Interests	Gaming, meme culture, nostalgia, TCG
Tech Comfort	Moderate to high
Platforms	Mobile-first (65%), Desktop (35%)
3.2 User Personas
Persona 1: "The Nostalgic Millennial"
text

┌─────────────────────────────────────────────────────┐
│  👤 JAKE, 32                                        │
│  Marketing Manager, Chicago                         │
├─────────────────────────────────────────────────────┤
│  BACKGROUND                                         │
│  • Grew up collecting Pokémon cards                 │
│  • Now a dad himself (2 kids)                       │
│  • Active on Reddit and Twitter                     │
│  • Loves sharing funny content with friends         │
├─────────────────────────────────────────────────────┤
│  MOTIVATIONS                                        │
│  • Relive pack-opening excitement                   │
│  • Find relatable dad humor                         │
│  • Share funny pulls with dad friend group          │
│  • Quick entertainment during breaks                │
├─────────────────────────────────────────────────────┤
│  PAIN POINTS                                        │
│  • Real TCG collecting is expensive                 │
│  • Most mobile games feel like cash grabs           │
│  • Hard to find genuine dad humor content           │
├─────────────────────────────────────────────────────┤
│  GOALS                                              │
│  • 5-minute entertainment sessions                  │
│  • Share-worthy moments                             │
│  • Nostalgic but fresh experience                   │
└─────────────────────────────────────────────────────┘
Persona 2: "The Meme Connoisseur"
text

┌─────────────────────────────────────────────────────┐
│  👤 SARAH, 24                                       │
│  Content Creator, Los Angeles                       │
├─────────────────────────────────────────────────────┤
│  BACKGROUND                                         │
│  • Active TikTok/Instagram presence                 │
│  • Loves niche humor and satire                     │
│  • Grew up watching dad fail compilations           │
│  • Always looking for fresh content                 │
├─────────────────────────────────────────────────────┤
│  MOTIVATIONS                                        │
│  • Find unique content for social media             │
│  • Experience satisfying animations                 │
│  • Discover shareable moments                       │
│  • Engage with ironic/satirical humor               │
├─────────────────────────────────────────────────────┤
│  PAIN POINTS                                        │
│  • Content fatigue from same formats                │
│  • Games require too much time investment           │
│  • Hard to find genuinely funny apps                │
├─────────────────────────────────────────────────────┤
│  GOALS                                              │
│  • Create reaction content                          │
│  • Share rare pulls with followers                  │
│  • Quick dopamine hits between tasks                │
└─────────────────────────────────────────────────────┘
Persona 3: "The Casual Gamer"
text

┌─────────────────────────────────────────────────────┐
│  👤 MARCUS, 28                                      │
│  Software Developer, Austin                         │
├─────────────────────────────────────────────────────┤
│  BACKGROUND                                         │
│  • Plays TCG games casually (MTG Arena)             │
│  • Appreciates good UI/UX design                    │
│  • Sent link by friend                              │
│  • Appreciates polished experiences                 │
├─────────────────────────────────────────────────────┤
│  MOTIVATIONS                                        │
│  • Experience pack-opening without spending         │
│  • Appreciate animation and design quality          │
│  • Collect and track cards                          │
│  • Low-commitment entertainment                     │
├─────────────────────────────────────────────────────┤
│  PAIN POINTS                                        │
│  • TCG games require money or grinding              │
│  • Burnout from competitive gaming                  │
│  • Wants quality without commitment                 │
├─────────────────────────────────────────────────────┤
│  GOALS                                              │
│  • Satisfying pack-opening experience               │
│  • Appreciate craft and attention to detail         │
│  • Casual collection building                       │
└─────────────────────────────────────────────────────┘
3.3 User Journey Map
text

┌──────────────────────────────────────────────────────────────────────┐
│                        USER JOURNEY: FIRST VISIT                      │
├──────────────────────────────────────────────────────────────────────┤
│                                                                       │
│  AWARENESS        CONSIDERATION       ACTIVATION        RETENTION     │
│      │                  │                  │                │         │
│      ▼                  ▼                  ▼                ▼         │
│  ┌───────┐         ┌───────┐         ┌───────┐         ┌───────┐     │
│  │ Sees  │         │ Lands │         │ Opens │         │ Shares│     │
│  │ share │───────▶│  on   │───────▶│ first │───────▶│ card  │     │
│  │ post  │         │ site  │         │ pack  │         │ pull  │     │
│  └───────┘         └───────┘         └───────┘         └───────┘     │
│      │                  │                  │                │         │
│      ▼                  ▼                  ▼                ▼         │
│  "That's            "This looks       "WHOA that         "My dad    │
│   hilarious"         polished"         was SICK!"         IS this!" │
│                                                                       │
│  ───────────────────────────────────────────────────────────────────  │
│  TOUCHPOINTS:                                                         │
│  • Social media     • Landing page    • Pack animation  • Share UI   │
│  • Friend link      • Hero section    • Card reveals    • Results    │
│  • Search           • CTA button      • Rare effects    • Collection │
│                                                                       │
│  EMOTIONS:                                                            │
│  Curiosity ───▶ Interest ───▶ Excitement ───▶ Delight ───▶ Pride    │
│                                                                       │
└──────────────────────────────────────────────────────────────────────┘
4. User Stories & Acceptance Criteria
4.1 Epic Overview
text

┌─────────────────────────────────────────────────────────────────┐
│                          EPIC STRUCTURE                          │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  EPIC 1: Pack Opening Experience                                 │
│  ├── US-1.1: View landing page                                   │
│  ├── US-1.2: Initiate pack opening                               │
│  ├── US-1.3: Experience pack animation                           │
│  ├── US-1.4: Reveal individual cards                             │
│  ├── US-1.5: View complete pack results                          │
│  └── US-1.6: Open another pack                                   │
│                                                                  │
│  EPIC 2: Card Interaction                                        │
│  ├── US-2.1: View card details                                   │
│  ├── US-2.2: Flip card for back content                          │
│  ├── US-2.3: Experience holographic effects                      │
│  ├── US-2.4: Navigate between cards                              │
│  └── US-2.5: Zoom on card artwork                                │
│                                                                  │
│  EPIC 3: Social Sharing                                          │
│  ├── US-3.1: Share individual card                               │
│  ├── US-3.2: Share complete pack                                 │
│  ├── US-3.3: Generate shareable image                            │
│  └── US-3.4: Copy share link                                     │
│                                                                  │
│  EPIC 4: Collection & Meta-Progression                          │
│  ├── US-4.1: View collection                                     │
│  ├── US-4.2: Track duplicate cards                               │
│  ├── US-4.3: View collection stats                               │
│  ├── US-4.4: Filter/sort collection                              │
│  ├── US-4.5: Deck building & management                          │
│  ├── US-4.6: Card upgrade system                                 │
│  └── US-4.7: Crafting & material gathering                       │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
4.2 Detailed User Stories
EPIC 1: Pack Opening Experience
US-1.1: View Landing Page
User Story

text

AS A first-time visitor
I WANT TO see an engaging landing page
SO THAT I understand what the app does and feel compelled to try it
Acceptance Criteria

gherkin

Feature: Landing Page Display

  Scenario: User visits the landing page
    Given I am a new visitor
    When I navigate to the homepage
    Then I should see:
      | Element                    | Requirement                        |
      | Hero section               | Above the fold                     |
      | Animated pack visual       | Subtle idle animation              |
      | Clear CTA button           | "Open Your First Pack"             |
      | Value proposition          | Brief, humorous tagline            |
      | Sample card preview        | Showcasing art style               |
    And the page should load within 3 seconds
    And all animations should run at 60fps

  Scenario: User views on mobile device
    Given I am on a mobile device (< 768px width)
    When I view the landing page
    Then all elements should be properly responsive
    And the CTA should be easily tappable (min 44px height)
    And text should be readable without zooming

  Scenario: User with reduced motion preferences
    Given I have "prefers-reduced-motion" enabled
    When I view the landing page
    Then animations should be minimized or static
    And the experience should remain engaging
Technical Notes

Hero section uses Astro's static optimization
Pack animation uses CSS transforms (GPU-accelerated)
Implement intersection observer for below-fold content
Critical CSS inlined for fastest LCP
Priority: P0 (Must Have)
Story Points: 5
Dependencies: Design assets, copy finalized

US-1.2: Initiate Pack Opening
User Story

text

AS A user ready to open a pack
I WANT TO click/tap a clear call-to-action
SO THAT I can begin the pack-opening experience
Acceptance Criteria

gherkin

Feature: Pack Opening Initiation

  Scenario: User clicks the open pack button
    Given I am on the landing page
    When I click the "Open Pack" CTA button
    Then the button should show a pressed state
    And I should see a brief anticipation animation
    And I should transition to the pack-opening sequence
    And the transition should feel smooth (no jarring cuts)

  Scenario: User taps on mobile
    Given I am on a touch device
    When I tap the CTA button
    Then I should receive haptic feedback (if supported)
    And the touch target should be at least 44x44 pixels
    And there should be no double-tap zoom issue

  Scenario: Pack selection (future enhancement)
    Given multiple pack types exist
    When I click open pack
    Then I should open the standard "Starter Pack"
    # Note: Pack selection UI is post-MVP
Technical Notes

Button uses CSS transitions for press state
Implement navigator.vibrate() for haptic feedback
Use React/Svelte for interactive components (islands)
Debounce to prevent double-clicks
Priority: P0 (Must Have)
Story Points: 3
Dependencies: US-1.1 complete

US-1.3: Experience Pack Animation
User Story

text

AS A user who initiated pack opening
I WANT TO see an exciting pack-reveal animation
SO THAT I feel anticipation and excitement before seeing my cards
Acceptance Criteria

gherkin

Feature: Pack Opening Animation

  Scenario: Standard pack animation sequence
    Given I have initiated pack opening
    When the pack animation begins
    Then I should see the following sequence:
      | Phase              | Duration | Description                      |
      | Pack appearance    | 0.5s     | Pack slides/fades into center    |
      | Pack glow          | 1.0s     | Energy builds around pack        |
      | Rarity hint        | 0.3s     | Glow color hints at best rarity  |
      | Pack tear          | 0.8s     | Pack tears open dramatically     |
      | Cards emerge       | 0.5s     | Cards fan out from pack          |
    And total animation is between 2.5-4 seconds
    And animation runs at consistent 60fps

  Scenario: Pack contains legendary card
    Given my pack contains a Legendary rarity card
    When the pack animation plays
    Then the glow should be golden/prismatic
    And additional particle effects should appear
    And a subtle "legendary sound cue" visual should display

  Scenario: User attempts to skip animation
    Given the pack animation is playing
    When I tap/click the screen
    Then the animation should fast-forward to card reveal
    And all cards should be visible immediately
    And this should feel like skipping, not breaking

  Scenario: Animation performance
    Given I am on a low-end device
    When the pack animation plays
    Then the animation should gracefully degrade
    And frame rate should not drop below 30fps
    And no animation should cause layout shift
Technical Notes

JavaScript

// Animation phases configuration
const PACK_ANIMATION_CONFIG = {
  phases: {
    appearance: { duration: 500, easing: 'cubic-bezier(0.34, 1.56, 0.64, 1)' },
    glow: { duration: 1000, easing: 'ease-in-out' },
    rarityHint: { duration: 300, easing: 'ease-out' },
    tear: { duration: 800, easing: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)' },
    emerge: { duration: 500, easing: 'ease-out' }
  },
  skipEnabled: true,
  performanceMode: 'auto' // 'high' | 'low' | 'auto'
};
Priority: P0 (Must Have)
Story Points: 13
Dependencies: Animation assets, sound cue visuals

US-1.4: Reveal Individual Cards
User Story

text

AS A user viewing my opened pack
I WANT TO reveal each card one by one with satisfying effects
SO THAT I experience anticipation for each card's identity and rarity
Acceptance Criteria

gherkin

Feature: Individual Card Reveal

  Scenario: User reveals first card
    Given my pack has been opened
    And cards are displayed face-down
    When I tap/click the first card
    Then the card should flip with 3D animation
    And the card face should be revealed
    And rarity-appropriate effects should play
    And I should see the card's name and stats

  Scenario: Swipe navigation on mobile
    Given I am on a touch device
    And a card has been revealed
    When I swipe left
    Then the current card should animate off-screen
    And the next card should animate into view
    And if face-down, it should auto-reveal

  Scenario: Keyboard navigation on desktop
    Given I am on a desktop device
    When I press the right arrow key
    Then I should navigate to the next card
    When I press the left arrow key  
    Then I should navigate to the previous card
    When I press spacebar on face-down card
    Then the card should flip to reveal

  Scenario: Card reveal effects by rarity
    Given I reveal a card
    Then effects should match the rarity:
      | Rarity    | Effects                                  |
      | Common    | Simple flip, minimal particles           |
      | Uncommon  | Flip with soft glow                      |
      | Rare      | Flip with blue sparkle burst             |
      | Epic      | Flip with purple energy waves            |
      | Legendary | Flip with gold explosion + screen shake  |
      | Mythic    | Legendary + prismatic rainbow cascade    |

  Scenario: Holographic card reveal
    Given I reveal a holographic variant card
    Then the card should display holographic sheen effect
    And the effect should respond to device tilt (mobile)
    And the effect should respond to mouse position (desktop)
Technical Notes

CSS

/* 3D Card flip base styles */
.card-container {
  perspective: 1000px;
}

.card {
  transform-style: preserve-3d;
  transition: transform 0.6s cubic-bezier(0.4, 0, 0.2, 1);
}

.card.flipped {
  transform: rotateY(180deg);
}

.card-face {
  backface-visibility: hidden;
}
Priority: P0 (Must Have)
Story Points: 13
Dependencies: US-1.3, Card assets

US-1.5: View Complete Pack Results
User Story

text

AS A user who has revealed all cards
I WANT TO see a summary of my complete pack
SO THAT I can appreciate my pulls and decide what to do next
Acceptance Criteria

gherkin

Feature: Pack Results Summary

  Scenario: All cards revealed
    Given I have revealed all cards in my pack
    When I navigate past the last card
    Then I should see a pack summary screen
    And the summary should display:
      | Element            | Details                          |
      | All cards grid     | Thumbnail view of all 6-7 cards  |
      | Rarity breakdown   | Count per rarity tier            |
      | "Best pull" badge  | Highlighted on rarest card       |
      | Pack statistics    | "You pulled a [rarity]!"         |
      | Action buttons     | Share, Open Another, View Card   |

  Scenario: User pulls legendary or mythic
    Given my pack contains a Legendary or Mythic card
    When I view the results summary
    Then special celebration effects should play
    And the rare card should be prominently featured
    And a "LEGENDARY PULL!" banner should appear

  Scenario: Access individual cards from summary
    Given I am viewing the pack results
    When I click/tap on any card thumbnail
    Then I should see that card's full-size detail view
    And I should be able to navigate back to summary
Priority: P0 (Must Have)
Story Points: 8
Dependencies: US-1.4

US-1.6: Open Another Pack
User Story

text

AS A user who has finished viewing a pack
I WANT TO easily open another pack
SO THAT I can continue enjoying the experience
Acceptance Criteria

gherkin

Feature: Repeat Pack Opening

  Scenario: Open another pack from results
    Given I am viewing pack results
    When I click "Open Another Pack"
    Then I should see a smooth transition
    And a new pack animation should begin
    And the new pack should contain different random cards

  Scenario: Rapid pack opening
    Given I have opened 10 packs in quick succession
    When I open another pack
    Then the experience should remain smooth
    And no memory leaks should occur
    And animations should not degrade

  Scenario: Return to landing page
    Given I am viewing pack results
    When I click the home/logo button
    Then I should return to the landing page
    And my session should remain active
Priority: P0 (Must Have)
Story Points: 3
Dependencies: US-1.5

EPIC 2: Card Interaction
US-2.1: View Card Details
User Story

text

AS A user viewing a revealed card
I WANT TO see all card information clearly
SO THAT I understand the card's stats, abilities, and lore
Acceptance Criteria

gherkin

Feature: Card Detail Display

  Scenario: View complete card information
    Given I am viewing a revealed card
    Then I should see all card elements:
      | Element         | Location              | Example                      |
      | Card name       | Top banner            | "Grill Master Gary"          |
      | Subtitle/Title  | Below name            | "Keeper of the Flame"        |
      | Artwork         | Center (60% of card)  | Full illustration            |
      | Dad Type        | Top corner badge      | "BBQ Dad"                    |
      | Rarity indicator| Bottom or border glow | Star icons / foil pattern    |
      | Stats           | Bottom section        | DAD JOKE: 85, GRILL: 99      |
      | Flavor text     | Bottom quote box      | "Medium-rare? That's how..." |
      | Card number     | Fine print            | "025/150 • Series 1"         |

  Scenario: Stat interpretation
    Given I am viewing card stats
    Then each stat should have:
      | Component      | Details                              |
      | Stat name      | Short, clear label                   |
      | Stat value     | 0-100 scale                          |
      | Visual bar     | Filled proportionally                |
      | Icon           | Representing stat type               |
Priority: P0 (Must Have)
Story Points: 5
Dependencies: Card design finalized

US-2.2: Experience Holographic Effects
User Story

text

AS A user who pulled a holographic card
I WANT TO see realistic holographic visual effects
SO THAT the card feels premium and special
Acceptance Criteria

gherkin

Feature: Holographic Card Effects

  Scenario: Holographic effect on desktop
    Given I am viewing a holographic card on desktop
    When I move my mouse across the card
    Then the holographic sheen should follow the cursor
    And light refraction patterns should shift realistically
    And the effect should be smooth (no stuttering)

  Scenario: Holographic effect on mobile
    Given I am viewing a holographic card on mobile
    When I tilt my device
    Then the holographic effect should respond to gyroscope
    And the shift should feel natural and responsive
    And fallback to touch-drag if gyroscope unavailable

  Scenario: Different holographic patterns
    Given different holographic variants exist
    Then effects should vary by type:
      | Variant          | Effect Description                    |
      | Standard Holo    | Rainbow sheen across surface          |
      | Reverse Holo     | Holographic background, matte art     |
      | Full Art Holo    | Extended art with full holographic    |
      | Prismatic        | Intense rainbow with sparkle overlay  |
Technical Notes

JavaScript

// Holographic effect using CSS custom properties
const updateHoloEffect = (event, cardElement) => {
  const rect = cardElement.getBoundingClientRect();
  const x = (event.clientX - rect.left) / rect.width;
  const y = (event.clientY - rect.top) / rect.height;
  
  cardElement.style.setProperty('--mouse-x', x);
  cardElement.style.setProperty('--mouse-y', y);
  cardElement.style.setProperty('--rotation-x', (y - 0.5) * 20);
  cardElement.style.setProperty('--rotation-y', (x - 0.5) * 20);
};
CSS

.card-holographic {
  --mouse-x: 0.5;
  --mouse-y: 0.5;
  
  background: 
    linear-gradient(
      calc(var(--mouse-x) * 360deg),
      hsl(0, 100%, 70%),
      hsl(60, 100%, 70%),
      hsl(120, 100%, 70%),
      hsl(180, 100%, 70%),
      hsl(240, 100%, 70%),
      hsl(300, 100%, 70%),
      hsl(360, 100%, 70%)
    );
  background-blend-mode: overlay;
  
  transform: 
    perspective(1000px)
    rotateX(calc(var(--rotation-x) * 1deg))
    rotateY(calc(var(--rotation-y) * 1deg));
}
Priority: P1 (Should Have)
Story Points: 8
Dependencies: US-2.1

US-2.3: Navigate Between Cards
User Story

text

AS A user viewing cards in my pack
I WANT TO navigate between cards using intuitive gestures
SO THAT I can browse my entire pack smoothly
Acceptance Criteria

gherkin

Feature: Card Navigation

  Scenario: Swipe navigation
    Given I am viewing a card (not first or last)
    When I swipe left
    Then I should see the next card
    When I swipe right
    Then I should see the previous card
    And transitions should animate smoothly

  Scenario: Button navigation
    Given I am viewing a card
    Then I should see navigation arrows
    When I click the right arrow
    Then I should see the next card
    And there should be visual feedback on click

  Scenario: Progress indication
    Given I am viewing any card in the pack
    Then I should see a progress indicator (e.g., "3/7")
    And/or dot indicators showing current position

  Scenario: Edge behavior
    Given I am viewing the first card
    When I try to navigate to previous
    Then I should see a subtle "end reached" feedback
    And I should not navigate away
    Given I am viewing the last card
    When I try to navigate to next
    Then I should proceed to pack results (US-1.5)
Priority: P0 (Must Have)
Story Points: 5
Dependencies: US-1.4

EPIC 3: Social Sharing
US-3.1: Share Individual Card
User Story

text

AS A user who pulled an exciting card
I WANT TO share that card on social media
SO THAT I can show off my pull to friends
Acceptance Criteria

gherkin

Feature: Single Card Sharing

  Scenario: Share card to social platforms
    Given I am viewing a revealed card
    When I tap the share button
    Then I should see sharing options:
      | Platform    | Action                              |
      | Twitter/X   | Opens tweet composer with image     |
      | Copy Link   | Copies shareable URL to clipboard   |
      | Download    | Saves card image to device          |
      | Native      | Uses device share sheet if available|

  Scenario: Generated share image
    Given I share a card
    Then the generated image should include:
      | Element              | Requirement                      |
      | Full card artwork    | High resolution                  |
      | DadDeck™ branding    | Subtle watermark/logo            |
      | Rarity indication    | Visual rarity effects            |
      | URL/QR code          | Link back to app                 |

  Scenario: Share link functionality
    Given someone clicks my shared link
    Then they should land on a page showing:
      | Element              | Details                          |
      | The shared card      | Full display                     |
      | CTA to open packs    | "Get your own cards!"            |
Priority: P1 (Should Have)
Story Points: 8
Dependencies: US-2.1, Image generation service

US-3.2: Share Complete Pack
User Story

text

AS A user who opened an exciting pack
I WANT TO share my entire pack opening results
SO THAT I can show off a legendary pull in context
Acceptance Criteria

gherkin

Feature: Pack Results Sharing

  Scenario: Share pack from results screen
    Given I am viewing pack results
    When I tap the share button
    Then I should generate an image showing:
      | Element                | Details                        |
      | All cards in grid      | Visible thumbnails             |
      | Highlight on rare      | Best pull emphasized           |
      | Pack statistics        | "Pulled 1 Legendary!"          |
      | Branding               | DadDeck™ logo                  |

  Scenario: Video clip generation (future)
    Given video sharing is enabled
    When I complete pack opening
    Then I should have option to share video clip
    And clip should capture reveal animations
    # Note: Video generation is post-MVP
Priority: P2 (Nice to Have for MVP)
Story Points: 5
Dependencies: US-3.1

4.3 User Story Summary Table
ID	User Story	Priority	Points	Sprint
US-1.1	View landing page	P0	5	1
US-1.2	Initiate pack opening	P0	3	1
US-1.3	Experience pack animation	P0	13	2
US-1.4	Reveal individual cards	P0	13	2-3
US-1.5	View pack results	P0	8	3
US-1.6	Open another pack	P0	3	3
US-2.1	View card details	P0	5	2
US-2.2	Holographic effects	P1	8	4
US-2.3	Card navigation	P0	5	2
US-3.1	Share individual card	P1	8	4
US-3.2	Share complete pack	P2	5	5
Total MVP Story Points: ~76

5. Feature Specifications
5.1 Feature Priority Matrix
text

┌─────────────────────────────────────────────────────────────────────┐
│                     FEATURE PRIORITY MATRIX                          │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  IMPACT   │                                                          │
│    ▲      │                                                          │
│    │      │                    ★ Pack Opening                        │
│  HIGH     │  ★ Card Reveal      ★ Pack Opening                         │
│    │      │    Animation         Animation                            │
│    │      │                                                          │
│    │      │       ★ Holographic    ★ Social                            │
│    │      │         Effects         Sharing                            │
│    │      │                                                          │
│    │      │           ★ Card          ★ Collection                     │
│    │      │            Battles         System                          │
│    │      │                              ★ Deck                        │
│    │      │                                Building                    │
│    └──────┼─────────────────────────────────────────────────▶        │
│           │   LOW        MEDIUM        HIGH                          │
│           │                                                          │
│           │                 EFFORT ──▶                               │
│                                                                      │
│  ★ Completed Features (Version 2.0.0)                                │
│  ★ Future Roadmap (Post-v2.0.0)                                      │

│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
5.2 Feature Specifications
F-001: Landing Page
Attribute	Specification
ID	F-001
Name	Landing Page
Priority	P0 - Critical
Description	Entry point showcasing the product with clear CTA
Components:

text

┌─────────────────────────────────────────────────────────────────┐
│                        LANDING PAGE LAYOUT                       │
├─────────────────────────────────────────────────────────────────┤
│  ┌───────────────────────────────────────────────────────────┐  │
│  │  HEADER                                                    │  │
│  │  [Logo] DadDeck™                            [About] [FAQ]  │  │
│  └───────────────────────────────────────────────────────────┘  │
│                                                                  │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │  HERO SECTION                                              │  │
│  │                                                            │  │
│  │        ┌─────────────┐                                     │  │
│  │        │             │    "Collect Every Dad              │  │
│  │        │  ANIMATED   │     in the Cul-de-sac"             │  │
│  │        │   PACK      │                                     │  │
│  │        │  PREVIEW    │    The satirical trading card      │  │
│  │        │             │    game your father would          │  │
│  │        └─────────────┘    definitely not understand.      │  │
│  │                                                            │  │
│  │              [ 🎴 OPEN YOUR FIRST PACK ]                   │  │
│  │                                                            │  │
│  └───────────────────────────────────────────────────────────┘  │
│                                                                  │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │  FEATURED CARDS CAROUSEL                                   │  │
│  │                                                            │  │
│  │    ┌───┐   ┌───┐   ┌───┐   ┌───┐   ┌───┐                  │  │
│  │    │   │   │   │   │   │   │   │   │   │                  │  │
│  │    └───┘   └───┘   └───┘   └───┘   └───┘                  │  │
│  │                                                            │  │
│  │  "Meet the Dads"                                           │  │
│  └───────────────────────────────────────────────────────────┘  │
│                                                                  │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │  FEATURES SECTION                                          │  │
│  │                                                            │  │
│  │  [🎁 No cost, ever]  [✨ Premium animations]  [📤 Share]  │  │
│  │                                                            │  │
│  └───────────────────────────────────────────────────────────┘  │
│                                                                  │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │  FOOTER                                                    │  │
│  │  © 2024 DadDeck™ | Privacy | Terms | Twitter | Discord    │  │
│  └───────────────────────────────────────────────────────────┘  │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
Requirements:

 Responsive design (mobile-first)
 Page load < 3 seconds
 CTA visible without scrolling
 Animated pack preview loops indefinitely
 SEO meta tags implemented
 Open Graph tags for social previews
F-002: Pack Opening System
Attribute	Specification
ID	F-002
Name	Pack Opening System
Priority	P0 - Critical
Description	Core mechanic for opening digital booster packs
Pack Configuration:

JavaScript

const PACK_CONFIG = {
  cardsPerPack: 7,
  raritySlots: [
    { slot: 1, guaranteedRarity: 'common', probability: null },
    { slot: 2, guaranteedRarity: 'common', probability: null },
    { slot: 3, guaranteedRarity: 'common', probability: null },
    { slot: 4, guaranteedRarity: 'uncommon', probability: null },
    { slot: 5, guaranteedRarity: 'uncommon', probability: null },
    { slot: 6, rarityPool: true, probability: { rare: 0.6, epic: 0.3, legendary: 0.1 }},
    { slot: 7, rarityPool: true, probability: { 
      common: 0.35, 
      uncommon: 0.30, 
      rare: 0.20, 
      epic: 0.10, 
      legendary: 0.04,
      mythic: 0.01 
    }},
  ],
  holoChance: 0.10, // 10% of any card can be holographic variant
};
State Machine:

text

┌─────────────────────────────────────────────────────────────────┐
│                    PACK OPENING STATE MACHINE                    │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│                         ┌─────────┐                              │
│                         │  IDLE   │                              │
│                         └────┬────┘                              │
│                              │                                   │
│                         [click CTA]                              │
│                              │                                   │
│                              ▼                                   │
│                     ┌───────────────┐                            │
│                     │  GENERATING   │──── Generate 7 cards       │
│                     └───────┬───────┘                            │
│                             │                                    │
│                        [cards ready]                             │
│                             │                                    │
│                             ▼                                    │
│                    ┌────────────────┐                            │
│                    │  PACK_ANIMATE  │──── Play pack animation    │
│                    └───────┬────────┘                            │
│                            │                                     │
│                    [animation complete / skip]                   │
│                            │                                     │
│                            ▼                                     │
│                    ┌───────────────┐                             │
│                    │  CARDS_READY  │──── Cards face-down         │
│                    └───────┬───────┘                             │
│                            │                                     │
│                    [user interaction]                            │
│                            │                                     │
│                            ▼                                     │
│                   ┌────────────────┐                             │
│                   │   REVEALING    │◄─── Loop for each card     │
│                   └───────┬────────┘                             │
│                           │                                      │
│                   [all cards revealed]                           │
│                           │                                      │
│                           ▼                                      │
│                    ┌─────────────┐                               │
│                    │   RESULTS   │──── Show summary              │
│                    └──────┬──────┘                               │
│                           │                                      │
│                   [open another]  [exit]                         │
│                           │          │                           │
│                           ▼          ▼                           │
│                      ┌─────────┐  ┌──────┐                       │
│                      │GENERATING│  │ IDLE │                      │
│                      └─────────┘  └──────┘                       │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
F-003: Card Display System
Attribute	Specification
ID	F-003
Name	Card Display System
Priority	P0 - Critical
Description	Renders cards with all visual elements and interactivity
Card Anatomy:

text

┌─────────────────────────────────────────────────────────────────┐
│                        CARD ANATOMY                              │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│    ┌─────────────────────────────────────────────────┐          │
│    │ ┌─────┐                              ┌────────┐ │          │
│    │ │TYPE │  CARD NAME                   │ RARITY │ │ ◄─ TOP  │
│    │ │BADGE│  "Grill Master Gary"         │ ★★★☆☆ │ │   BAR   │
│    │ └─────┘                              └────────┘ │          │
│    ├─────────────────────────────────────────────────┤          │
│    │                                                 │          │
│    │                                                 │          │
│    │                                                 │          │
│    │                                                 │          │
│    │            A  R  T  W  O  R  K                 │ ◄─ 65%   │
│    │                                                 │   HEIGHT │
│    │                  (512x512)                      │          │
│    │                                                 │          │
│    │                                                 │          │
│    │                                                 │          │
│    ├─────────────────────────────────────────────────┤          │
│    │  SUBTITLE: "Keeper of the Sacred Flame"        │ ◄─ MID   │
│    ├─────────────────────────────────────────────────┤          │
│    │                                                 │          │
│    │  📊 STATS                                       │          │
│    │  ┌────────────────────────────────────────┐    │          │
│    │  │ 👔 Dad Joke    ████████████░░░░  85    │    │          │
│    │  │ 🔥 Grill Skill ██████████████████ 99    │    │          │
│    │  │ 🛠️ Fix-It      ██████████░░░░░░░  62    │    │ ◄─ STATS │
│    │  │ 😴 Nap Power   ████████████████░  92    │    │   BLOCK  │
│    │  └────────────────────────────────────────┘    │          │
│    │                                                 │          │
│    ├─────────────────────────────────────────────────┤          │
│    │  💬 "Medium rare? That's what I'd call        │          │
│    │      your mother's driving skills."            │ ◄─ FLAVOR│
│    │                                      - Gary    │   TEXT   │
│    ├─────────────────────────────────────────────────┤          │
│    │  #025 | Series 1 | Illustrated by DadArt      │ ◄─ FOOTER │
│    └─────────────────────────────────────────────────┘          │
│                                                                  │
│    CARD DIMENSIONS:                                              │
│    • Standard: 320w x 448h (2.5:3.5 ratio, like real TCG)       │
│    • Mobile:   280w x 392h                                       │
│    • Zoomed:   400w x 560h                                       │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
F-004: Animation System
Attribute	Specification
ID	F-004
Name	Animation System
Priority	P0 - Critical
Description	Handles all motion and visual effects
Animation Library (CSS + JS Hybrid):

CSS

/* Core Animation Keyframes */

/* Pack Glow Animation */
@keyframes packGlow {
  0%, 100% {
    box-shadow: 
      0 0 20px rgba(255, 215, 0, 0.3),
      0 0 40px rgba(255, 215, 0, 0.2);
  }
  50% {
    box-shadow: 
      0 0 40px rgba(255, 215, 0, 0.5),
      0 0 80px rgba(255, 215, 0, 0.3),
      0 0 120px rgba(255, 215, 0, 0.1);
  }
}

/* Card Flip */
@keyframes cardFlip {
  0% { transform: rotateY(0deg) scale(1); }
  50% { transform: rotateY(90deg) scale(1.1); }
  100% { transform: rotateY(180deg) scale(1); }
}

/* Rarity Burst - Legendary */
@keyframes legendaryBurst {
  0% { 
    transform: scale(0); 
    opacity: 1; 
  }
  50% { 
    transform: scale(1.5); 
    opacity: 0.8; 
  }
  100% { 
    transform: scale(2); 
    opacity: 0; 
  }
}

/* Card Reveal Slide */
@keyframes slideInFromRight {
  from {
    transform: translateX(100%) rotate(5deg);
    opacity: 0;
  }
  to {
    transform: translateX(0) rotate(0);
    opacity: 1;
  }
}

/* Particle Float */
@keyframes particleFloat {
  0% {
    transform: translateY(0) rotate(0deg);
    opacity: 1;
  }
  100% {
    transform: translateY(-100px) rotate(720deg);
    opacity: 0;
  }
}
JavaScript Animation Controller:

JavaScript

// animation-controller.js
class AnimationController {
  constructor() {
    this.animationQueue = [];
    this.isPlaying = false;
    this.subscribers = new Set();
  }

  async playSequence(sequence) {
    this.isPlaying = true;
    
    for (const animation of sequence) {
      if (this.skipRequested) {
        this.skipToEnd(sequence);
        break;
      }
      
      await this.playAnimation(animation);
    }
    
    this.isPlaying = false;
    this.notify('sequenceComplete');
  }

  async playAnimation({ element, keyframes, options }) {
    return new Promise((resolve) => {
      const animation = element.animate(keyframes, {
        duration: options.duration || 500,
        easing: options.easing || 'ease-out',
        fill: 'forwards',
        ...options
      });
      
      animation.onfinish = resolve;
    });
  }

  skip() {
    this.skipRequested = true;
  }

  // Performance monitoring
  measureFPS(callback) {
    let frameCount = 0;
    let lastTime = performance.now();
    
    const measure = () => {
      frameCount++;
      const currentTime = performance.now();
      
      if (currentTime - lastTime >= 1000) {
        callback(frameCount);
        frameCount = 0;
        lastTime = currentTime;
      }
      
      if (this.isPlaying) {
        requestAnimationFrame(measure);
      }
    };
    
    requestAnimationFrame(measure);
  }
}
F-005: Sharing System
Attribute	Specification
ID	F-005
Name	Social Sharing System
Priority	P1 - High
Description	Enables users to share cards and pack results
Share Image Generation:

JavaScript

// share-generator.js
async function generateShareImage(card, options = {}) {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  
  // Set dimensions for optimal social sharing
  const config = {
    twitter: { width: 1200, height: 675 },  // 16:9
    instagram: { width: 1080, height: 1080 }, // 1:1
    default: { width: 1200, height: 675 }
  };
  
  const { width, height } = config[options.platform] || config.default;
  canvas.width = width;
  canvas.height = height;
  
  // Draw background
  ctx.fillStyle = '#1a1a2e';
  ctx.fillRect(0, 0, width, height);
  
  // Draw card
  const cardImage = await loadImage(card.imageUrl);
  const cardWidth = 400;
  const cardHeight = 560;
  const cardX = (width - cardWidth) / 2;
  const cardY = (height - cardHeight) / 2 - 30;
  
  ctx.drawImage(cardImage, cardX, cardY, cardWidth, cardHeight);
  
  // Draw branding
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 24px system-ui';
  ctx.textAlign = 'center';
  ctx.fillText('DadDeck™', width / 2, height - 40);
  ctx.font = '16px system-ui';
  ctx.fillText('daddeck.app', width / 2, height - 15);
  
  // Add rarity flair for legendary+
  if (['legendary', 'mythic'].includes(card.rarity)) {
    addGlowEffect(ctx, cardX, cardY, cardWidth, cardHeight, card.rarity);
  }
  
  return canvas.toDataURL('image/png');
}
6. Card System Design
6.1 Card Rarity Tiers
text

┌─────────────────────────────────────────────────────────────────┐
│                      RARITY TIER SYSTEM                          │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  TIER        │ PROBABILITY │ VISUAL STYLE          │ EFFECTS    │
│  ───────────────────────────────────────────────────────────────│
│                                                                  │
│  COMMON      │   50%       │ White border          │ Basic flip │
│  ⚪           │             │ No special effects    │            │
│                                                                  │
│  UNCOMMON    │   28%       │ Silver border         │ Soft glow  │
│  🔵           │             │ Subtle shimmer        │            │
│                                                                  │
│  RARE        │   15%       │ Gold border           │ Sparkles   │
│  🟡           │             │ Metallic sheen        │ + Sound cue│
│                                                                  │
│  EPIC        │    5%       │ Purple border         │ Energy     │
│  🟣           │             │ Animated aura         │ waves      │
│                                                                  │
│  LEGENDARY   │   1.8%      │ Holographic border    │ Explosion  │
│  🟠           │             │ Prismatic surface     │ + Shake    │
│                                                                  │
│  MYTHIC      │   0.2%      │ Animated border       │ Full       │
│  ⭐           │             │ Reality-bending FX    │ spectacle  │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
6.2 Card Categories (Dad Types)
text

┌─────────────────────────────────────────────────────────────────┐
│                        DAD TYPE CATEGORIES                       │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  🔥 BBQ DAD                   │  🛠️ FIX-IT DAD                   │
│  Masters of the grill         │  Duct tape solutions              │
│  • Grill Master Gary          │  • Handyman Hank                  │
│  • Smoker Steve               │  • YouTube Tutorial Tom           │
│  • Propane Paul               │  • "I Can Do It Cheaper" Carl     │
│                                                                  │
│  🏌️ GOLF DAD                  │  📺 COUCH DAD                     │
│  Weekend warriors             │  Remote control royalty           │
│  • Bogey Bob                  │  • Recliner Randy                 │
│  • Tiger Woods Wannabe        │  • Sports Center Sam              │
│  • Country Club Chad          │  • Sunday Nap Master              │
│                                                                  │
│  🌱 LAWN DAD                  │  🚗 CAR DAD                       │
│  Grass guardians              │  Automotive enthusiasts           │
│  • Mower Mike                 │  • Oil Change Oscar               │
│  • Fertilizer Fred            │  • Classic Car Craig              │
│  • "Get Off My Lawn" Larry    │  • Minivan Master                 │
│                                                                  │
│  👔 OFFICE DAD                │  🎸 COOL DAD                      │
│  Corporate warriors           │  Still got it (maybe)             │
│  • TPS Report Terry           │  • "I Was In A Band" Brad         │
│  • Conference Call Carl       │  • Skateboard Scott               │
│  • LinkedIn Larry             │  • Fellow Kids Frank              │
│                                                                  │
│  🎒 COACH DAD                 │  👨‍🍳 CHEF DAD                     │
│  Sideline legends             │  Kitchen commanders               │
│  • Soccer Stan                │  • Secret Recipe Rick             │
│  • Little League Lou          │  • Breakfast King Keith           │
│  • "Hustle!" Harry            │  • Grill Master (cooking)         │
│                                                                  │
│                                                                  │
│  SPECIAL TYPES:                                                  │
│  ─────────────────────────────────────────────────────────────  │
│  🎄 HOLIDAY DAD - Seasonal exclusive cards                       │
│  📦 WAREHOUSE DAD - Costco/Home Depot enthusiasts                │
│  🔧 VINTAGE DAD - Classic dad stereotypes from past decades      │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
6.3 Card Stats System
text

┌─────────────────────────────────────────────────────────────────┐
│                         STAT SYSTEM                              │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  STAT NAME        │ DESCRIPTION                    │ RANGE      │
│  ───────────────────────────────────────────────────────────────│
│                                                                  │
│  👔 DAD JOKE      │ Quality of terrible puns       │ 0-100      │
│  🔥 GRILL SKILL   │ BBQ mastery level              │ 0-100      │
│  🛠️ FIX-IT        │ Repair capabilities            │ 0-100      │
│  😴 NAP POWER     │ Ability to fall asleep anywhere│ 0-100      │
│  📺 REMOTE CONTROL│ Channel surfing expertise      │ 0-100      │
│  🎯 THERMOSTAT    │ Temperature control obsession  │ 0-100      │
│  🧦 SOCK+SANDAL   │ Fashion confidence             │ 0-100      │
│  🍺 BEER SNOB     │ Craft beer knowledge           │ 0-100      │
│                                                                  │
│                                                                  │
│  STAT DISTRIBUTION BY RARITY:                                    │
│  ─────────────────────────────────────────────────────────────  │
│  • Common:    Total stats 150-250                                │
│  • Uncommon:  Total stats 250-350                                │
│  • Rare:      Total stats 350-450                                │
│  • Epic:      Total stats 450-550                                │
│  • Legendary: Total stats 550-650                                │
│  • Mythic:    Total stats 650-800 (can exceed 100 in one stat)  │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
6.4 Sample Card Database Entries
JavaScript

const SAMPLE_CARDS = [
  {
    id: "001",
    name: "Grill Master Gary",
    subtitle: "Keeper of the Sacred Flame",
    type: "BBQ_DAD",
    rarity: "rare",
    artwork: "/cards/grill-master-gary.png",
    stats: {
      dadJoke: 75,
      grillSkill: 99,
      fixIt: 45,
      napPower: 60,
      remoteControl: 55,
      thermostat: 70,
      sockSandal: 80,
      beerSnob: 85
    },
    flavorText: "Medium rare? That's what I'd call your mother's driving skills.",
    abilities: [
      {
        name: "Propane Prophecy",
        description: "Knows exactly when the tank is running low"
      }
    ],
    series: 1,
    cardNumber: 25,
    totalInSeries: 150,
    artist: "DadArt Studios"
  },
  {
    id: "002",
    name: "Thermostat Tyrant",
    subtitle: "Guardian of the 68°",
    type: "HOME_DAD",
    rarity: "legendary",
    artwork: "/cards/thermostat-tyrant.png",
    stats: {
      dadJoke: 82,
      grillSkill: 40,
      fixIt: 55,
      napPower: 70,
      remoteControl: 75,
      thermostat: 100,
      sockSandal: 65,
      beerSnob: 60
    },
    flavorText: "Touch that dial and you're paying the electric bill.",
    abilities: [
      {
        name: "Thermal Awareness",
        description: "Can detect a 1° change from any room"
      },
      {
        name: "Bill Rage",
        description: "Gains power when electricity bill arrives"
      }
    ],
    series: 1,
    cardNumber: 1,
    totalInSeries: 150,
    artist: "DadArt Studios",
    holoVariant: true
  },
  {
    id: "003",
    name: "New Balance Nathan",
    subtitle: "The Sole Survivor",
    type: "FASHION_DAD",
    rarity: "common",
    artwork: "/cards/new-balance-nathan.png",
    stats: {
      dadJoke: 60,
      grillSkill: 50,
      fixIt: 40,
      napPower: 55,
      remoteControl: 65,
      thermostat: 45,
      sockSandal: 95,
      beerSnob: 35
    },
    flavorText: "These babies have great arch support.",
    abilities: [
      {
        name: "Comfort Zone",
        description: "Never sacrifices comfort for style"
      }
    ],
    series: 1,
    cardNumber: 89,
    totalInSeries: 150,
    artist: "DadArt Studios"
  }
];
6.5 Item & Accessory Cards
text

┌─────────────────────────────────────────────────────────────────┐
│                      ITEM CARDS                                  │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  TOOLS & EQUIPMENT                                               │
│  ───────────────────────────────────────────────────────────────│
│  • Weber Genesis Grill (Legendary)                               │
│  • Craftsman Toolbox (Epic)                                      │
│  • "World's Best Dad" Mug (Common)                               │
│  • Riding Lawn Mower (Rare)                                      │
│  • La-Z-Boy Recliner (Epic)                                      │
│  • New Balance 608s (Uncommon)                                   │
│  • Cargo Shorts of Holding (Rare)                                │
│  • The Thermostat (Mythic)                                       │
│                                                                  │
│  CLOTHING & ACCESSORIES                                          │
│  ───────────────────────────────────────────────────────────────│
│  • White Crew Socks (Common)                                     │
│  • Cell Phone Belt Holster (Uncommon)                            │
│  • Oakley Wraparounds (Rare)                                     │
│  • "Kiss the Cook" Apron (Common)                                │
│  • Hawaiian Shirt (Uncommon)                                     │
│                                                                  │
│  CONSUMABLES                                                     │
│  ───────────────────────────────────────────────────────────────│
│  • IPA 6-Pack (Uncommon)                                         │
│  • Costco Hot Dog (Common - Iconic)                              │
│  • The Perfect Steak (Rare)                                      │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
7. Technical Architecture
7.1 System Overview
text

┌─────────────────────────────────────────────────────────────────┐
│                    SYSTEM ARCHITECTURE                           │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │                      CLIENT LAYER                        │    │
│  │  ┌───────────────────────────────────────────────────┐  │    │
│  │  │                   ASTRO (SSG/SSR)                  │  │    │
│  │  │  ┌─────────────┐  ┌─────────────┐  ┌───────────┐  │  │    │
│  │  │  │   Static    │  │   Island    │  │   Island  │  │  │    │
│  │  │  │   Pages     │  │   React/    │  │   Svelte  │  │  │    │
│  │  │  │   (HTML)    │  │   Preact    │  │   (Cards) │  │  │    │
│  │  │  └─────────────┘  └─────────────┘  └───────────┘  │  │    │
│  │  └───────────────────────────────────────────────────┘  │    │
│  │                            │                             │    │
│  │  ┌───────────────────────────────────────────────────┐  │    │
│  │  │               STATE MANAGEMENT                     │  │    │
│  │  │          (Nano Stores / Zustand)                   │  │    │
│  │  └───────────────────────────────────────────────────┘  │    │
│  │                            │                             │    │
│  │  ┌───────────────────────────────────────────────────┐  │    │
│  │  │              ANIMATION ENGINE                      │  │    │
│  │  │         (CSS + Web Animations API)                 │  │    │
│  │  └───────────────────────────────────────────────────┘  │    │
│  └─────────────────────────────────────────────────────────┘    │
│                              │                                   │
│                              │ HTTP/REST                         │
│                              ▼                                   │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │                      SERVER LAYER                        │    │
│  │  ┌───────────────────────────────────────────────────┐  │    │
│  │  │                  BUN RUNTIME                       │  │    │
│  │  │  ┌─────────────┐  ┌─────────────┐  ┌───────────┐  │  │    │
│  │  │  │   API       │  │   Pack      │  │   Image   │  │  │    │
│  │  │  │   Routes    │  │   Generator │  │   Service │  │  │    │
│  │  │  └─────────────┘  └─────────────┘  └───────────┘  │  │    │
│  │  └───────────────────────────────────────────────────┘  │    │
│  └─────────────────────────────────────────────────────────┘    │
│                              │                                   │
│                              ▼                                   │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │                      DATA LAYER                          │    │
│  │  ┌───────────────┐  ┌───────────────┐  ┌─────────────┐  │    │
│  │  │   Static      │  │   SQLite/     │  │   CDN       │  │    │
│  │  │   JSON        │  │   Turso       │  │   (Images)  │  │    │
│  │  │   (Cards DB)  │  │   (Users*)    │  │             │  │    │
│  │  └───────────────┘  └───────────────┘  └─────────────┘  │    │
│  └─────────────────────────────────────────────────────────┘    │
│                                                                  │
│  * User database & Cloud saves are post-v2.0.0
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
7.2 Technology Stack
Core Technologies
Layer	Technology	Version	Justification
Runtime	Bun	1.0+	Fast JS runtime, native TypeScript, great DX
Framework	Astro	4.0+	Partial hydration, excellent performance
UI Islands	Svelte	5.0+	Small bundle, reactive, great for animations
Styling	Tailwind CSS	3.4+	Utility-first, rapid development
Animation	Motion One	10.x	Small, performant, declarative
State	Nano Stores	0.9+	Framework-agnostic, tiny footprint
Icons	Lucide	Latest	Consistent, tree-shakeable
Development Tools
Purpose	Tool	Notes
Package Manager	Bun	Built-in, fast
Linting	ESLint + Prettier	Standard config
Testing	Vitest	Bun-compatible
E2E Testing	Playwright	Cross-browser
CI/CD	GitHub Actions	Automated deploys
Hosting	Vercel / Cloudflare	Edge deployment
7.3 Project Structure
text

daddeck/
├── README.md
├── package.json
├── bun.lockb
├── astro.config.mjs
├── tailwind.config.mjs
├── tsconfig.json
├── .env.example
├── .gitignore
│
├── public/
│   ├── favicon.svg
│   ├── og-image.png
│   ├── fonts/
│   │   └── custom-font.woff2
│   └── cards/
│       ├── card-back.png
│       └── [card-images...]
│
├── src/
│   ├── layouts/
│   │   ├── BaseLayout.astro       # HTML shell, meta tags
│   │   └── PackLayout.astro       # Pack opening layout
│   │
│   ├── pages/
│   │   ├── index.astro            # Landing page
│   │   ├── pack.astro             # Pack opening experience
│   │   ├── card/
│   │   │   └── [id].astro         # Individual card view (share link)
│   │   └── api/
│   │       ├── pack.ts            # Generate pack endpoint
│   │       └── share.ts           # Share image generation
│   │
│   ├── components/
│   │   ├── common/
│   │   │   ├── Button.astro
│   │   │   ├── Logo.astro
│   │   │   └── Icon.astro
│   │   │
│   │   ├── landing/
│   │   │   ├── Hero.astro
│   │   │   ├── FeaturedCards.astro
│   │   │   └── Features.astro
│   │   │
│   │   ├── pack/
│   │   │   ├── PackOpener.svelte    # Main interactive island
│   │   │   ├── PackAnimation.svelte
│   │   │   ├── CardRevealer.svelte
│   │   │   └── PackResults.svelte
│   │   │
│   │   └── card/
│   │       ├── Card.svelte          # Full card component
│   │       ├── CardFront.svelte
│   │       ├── CardBack.svelte
│   │       ├── CardStats.svelte
│   │       ├── HolographicOverlay.svelte
│   │       └── RarityEffects.svelte
│   │
│   ├── lib/
│   │   ├── cards/
│   │   │   ├── database.ts          # Card database operations
│   │   │   ├── types.ts             # TypeScript interfaces
│   │   │   └── rarity.ts            # Rarity calculations
│   │   │
│   │   ├── pack/
│   │   │   ├── generator.ts         # Pack generation logic
│   │   │   └── probability.ts       # Weighted random selection
│   │   │
│   │   ├── animation/
│   │   │   ├── controller.ts        # Animation orchestration
│   │   │   ├── sequences.ts         # Predefined sequences
│   │   │   └── particles.ts         # Particle system
│   │   │
│   │   ├── share/
│   │   │   ├── generator.ts         # Image generation
│   │   │   └── platforms.ts         # Platform configs
│   │   │
│   │   └── utils/
│   │       ├── random.ts            # Seeded random utilities
│   │       └── performance.ts       # Performance helpers
│   │
│   ├── stores/
│   │   ├── pack.ts                  # Pack state
│   │   ├── cards.ts                 # Revealed cards
│   │   └── ui.ts                    # UI state
│   │
│   ├── styles/
│   │   ├── global.css               # Global styles
│   │   ├── animations.css           # Keyframe animations
│   │   ├── card.css                 # Card-specific styles
│   │   └── holographic.css          # Holo effects
│   │
│   ├── data/
│   │   ├── cards.json               # Full card database
│   │   └── packs.json               # Pack configurations
│   │
│   └── types/
│       └── index.ts                 # Global type definitions
│
├── tests/
│   ├── unit/
│   │   ├── pack-generator.test.ts
│   │   └── rarity.test.ts
│   └── e2e/
│       └── pack-opening.test.ts
│
└── scripts/
    ├── generate-cards.ts            # Card generation helpers
    └── optimize-images.ts           # Image optimization
7.4 Data Flow
text

┌─────────────────────────────────────────────────────────────────┐
│                        DATA FLOW DIAGRAM                         │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  USER ACTION                                                     │
│       │                                                          │
│       ▼                                                          │
│  ┌─────────┐     ┌──────────────┐     ┌──────────────┐          │
│  │ Click   │────▶│   Svelte     │────▶│   API Call   │          │
│  │ "Open"  │     │   Component  │     │   /api/pack  │          │
│  └─────────┘     └──────────────┘     └──────┬───────┘          │
│                                              │                   │
│                                              ▼                   │
│                                   ┌──────────────────┐          │
│                                   │  Pack Generator  │          │
│                                   │  (Server-Side)   │          │
│                                   └────────┬─────────┘          │
│                                            │                     │
│         ┌──────────────────────────────────┼───────────────────┐│
│         │                                  ▼                    ││
│         │  ┌──────────┐    ┌───────────────────────────┐       ││
│         │  │  Cards   │───▶│   Weighted Random Select  │       ││
│         │  │  JSON DB │    │   + Rarity Assignment     │       ││
│         │  └──────────┘    └────────────┬──────────────┘       ││
│         │                               │                       ││
│         │                               ▼                       ││
│         │                    ┌────────────────────┐             ││
│         │                    │  Pack Object       │             ││
│         │                    │  { cards: [...] }  │             ││
│         │                    └─────────┬──────────┘             ││
│         │    SERVER                    │                        ││
│         └──────────────────────────────┼────────────────────────┘│
│                                        │                         │
│                                        ▼                         │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │                         CLIENT                               ││
│  │                                                              ││
│  │    ┌─────────────┐     ┌─────────────┐     ┌─────────────┐ ││
│  │    │   Nano      │────▶│  Animation  │────▶│   UI        │ ││
│  │    │   Store     │     │  Controller │     │   Update    │ ││
│  │    │   (State)   │     │             │     │             │ ││
│  │    └─────────────┘     └─────────────┘     └─────────────┘ ││
│  │                                                              ││
│  └─────────────────────────────────────────────────────────────┘│
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
8. Front-End Setup Guide
8.1 Prerequisites
Bash

# Required Software
- Bun v1.0 or higher (https://bun.sh)
- Node.js 18+ (fallback compatibility)
- Git
- VS Code (recommended)

# Recommended VS Code Extensions
- Astro (astro-build.astro-vscode)
- Svelte for VS Code (svelte.svelte-vscode)  
- Tailwind CSS IntelliSense
- Prettier - Code formatter
8.2 Installation Steps
Bash

# 1. Create new project
bun create astro@latest daddeck
# Choose: Empty project, Yes to TypeScript (Strict), Yes to install dependencies

# 2. Navigate to project
cd daddeck

# 3. Install additional dependencies
bun add @astrojs/svelte svelte
bun add @astrojs/tailwind tailwindcss
bun add nanostores @nanostores/persistent
bun add motion
bun add canvas  # For share image generation

# 4. Install dev dependencies
bun add -d @types/node vitest playwright

# 5. Configure Astro (astro.config.mjs)
8.3 Configuration Files
astro.config.mjs
JavaScript

import { defineConfig } from 'astro/config';
import svelte from '@astrojs/svelte';
import tailwind from '@astrojs/tailwind';

export default defineConfig({
  integrations: [
    svelte(),
    tailwind()
  ],
  output: 'hybrid', // Allows SSR for API routes
  adapter: /* your deployment adapter */,
  vite: {
    ssr: {
      noExternal: ['motion']
    }
  }
});
tailwind.config.mjs
JavaScript

/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
  theme: {
    extend: {
      colors: {
        // Brand colors
        'dad-blue': '#1a365d',
        'dad-gold': '#d69e2e',
        'dad-green': '#276749',
9. Development Roadmap

9.1 Phase 1: Foundation (Completed ✅)
- Core pack opening mechanics
- Initial card set (105+ cards)
- Rarity and holo systems
- Basic collection management

9.2 Phase 2: Meta-Progression (Completed ✅)
- Deck building and validation
- Card upgrade and crafting systems
- Achievements and daily rewards
- Global leaderboards and trading

9.3 Phase 3: Migration 3 (Completed ✅ - Jan 18, 2026)
- 37 DICKTATOR DAD types
- 6 Special card types (EVENT, TERRAIN, EVOLUTION, etc.)
- 105 total cards in database
- Type-safe card system & automatic migrations
- Error Logging System (PACK-103)

9.4 Phase 4: Social & Competitive (Active 🚧)
- Real-time PvP battles (US090)
- Season 2 expansion (reach 150 cards)
- Tournament mode
- Guild/Clan system (Neighborhood Alliances)

9.5 Phase 5: Platform Expansion (Planned 📅)
- Server-side cloud saves
- Real payment integration (Stripe)
- Mobile applications (iOS/Android)
- Marketplace for player trading

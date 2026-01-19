# Season 2: Summer BBQ Dads Content Expansion PRD

## Overview
This expansion adds 30 new cards to DadDeck™ under the "Season 2" banner. The theme is focused on suburban summer culture, centered around grilling, yard games, and heat-induced dad behaviors.

## Problem Statement
Season 1 has been stable, but players need fresh content to keep the pack-opening loop engaging. We need to utilize the Season system built into the architecture.

## Goals
- Add 30 unique cards with a cohesive "Summer BBQ" theme.
- Activate the Season 2 configuration in the codebase.
- Implement specialized stats and abilities for the new set.

## User Stories

### As a player
### I want to open packs that contain new Season 2 cards
### So that I can expand my collection with summer-themed dads and items

**Acceptance Criteria:**
- Given Season 2 is active
- When I open a pack
- Then I have a chance to pull cards with the Season 2 badge
- And the pack visual style matches the Summer BBQ theme

### As a completionist
### I want to see Season 2 cards separately in my gallery
### So that I can track my progress for the new set

**Acceptance Criteria:**
- Given I am in the collection gallery
- When I filter by Season 2
- Then I see only the new 30 cards

## Feature Specifications

### Card List (30 Cards)
1.  **Smoke Master Sam** (Legendary, BBQ_DAD) - *The low and slow prophet.*
2.  **Pool Side Paul** (Rare, COOL_DAD) - *Guardian of the deep end.*
3.  **Mosquito Magnet Mike** (Common, LAWN_DAD) - *Sacrificing blood for the yard.*
4.  **Sunburn Stan** (Uncommon, COOL_DAD) - *Lobster-tinted leisure.*
5.  **Flip Flop Floyd** (Common, FASHION_DAD) - *The rhythmic slapping of summer.*
6.  **Cooler King Kevin** (Rare, ITEM) - *The ice must flow.*
7.  **Back Deck Barry** (Uncommon, COUCH_DAD) - *Outdoor napping specialist.*
8.  **Tongs-Clicking Tim** (Common, BBQ_DAD) - *Checking the calibration.*
9.  **Marinade Mark** (Rare, CHEF_DAD) - *24 hours of flavor prep.*
10. **Charcoal Charlie** (Uncommon, BBQ_DAD) - *Analog heat enthusiast.*
11. **Cornhole Chris** (Rare, COOL_DAD) - *The beanbag sniper.*
12. **Ladder Ball Larry** (Uncommon, COOL_DAD) - *Tangled in plastic.*
13. **Badminton Brad** (Common, COACH_DAD) - *Intense backyard athletics.*
14. **Water Balloon Walter** (Common, COACH_DAD) - *Tactical hydration deployment.*
15. **Slip n Slide Sid** (Epic, COOL_DAD) - *Defying friction (and back health).*
16. **Citronella Cy** (Common, ITEM) - *The waxy shield.*
17. **Tiki Torch Tom** (Uncommon, LAWN_DAD) - *Backyard illumination expert.*
18. **Light Beer Bill** (Common, BBQ_DAD) - *Hydration is mostly water.*
19. **Zucchini Zeus** (Rare, LAWN_DAD) - *The garden over-producer.*
20. **Burger Builder Bob** (Uncommon, CHEF_DAD) - *Architect of the bun.*
21. **Hot Dog Harry** (Common, CHEF_DAD) - *Tube meat traditionalist.*
22. **Condiment Craig** (Common, ITEM) - *The mustard militia.*
23. **Ice Run Ian** (Common, CAR_DAD) - *The essential supply driver.*
24. **Shade Seeker Steve** (Uncommon, COUCH_DAD) - *Chasing the shadow.*
25. **Sprinkler Spencer** (Common, LAWN_DAD) - *Yard irrigation veteran.*
26. **Lawn Chair Leon** (Rare, ITEM) - *Webbed throne holder.*
27. **Patriotic Pete** (Rare, HOLIDAY_DAD) - *The flag-waver.*
28. **Bug Zapper Ben** (Uncommon, TECH_DAD) - *The electric blue judge.*
29. **Fire Pit Fred** (Rare, VINTAGE_DAD) - *Storytelling in the smoke.*
30. **Inflatable Island Ivan** (Epic, ITEM) - *Captain of the vinyl raft.*

## Technical Requirements
1. Update `src/data/cards.json` with the new array of objects.
2. Update `src/data/seasons.ts` to set Season 2 to `active`.
3. Ensure `seasonId: 2` is applied to all new cards.
4. Update `totalCards` and `cardIds` in `SEASON_2` config.

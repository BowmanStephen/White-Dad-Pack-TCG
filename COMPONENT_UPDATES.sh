#!/bin/bash

# Component Updates for Special Card Type Support
# This script documents the exact edits needed for each component

echo "========================================"
echo "CARD COMPONENT UPDATES"
echo "========================================"

# Component 1: Card.svelte - Add special card type support
echo "
1. UPDATE: src/components/card/Card.svelte
   - Add import at top (after existing imports):
     import { isSpecialCardType, getSpecialCardTypeLabel, getSpecialCardIcon, getSpecialCardBorderColor, getSpecialCardGlowClasses, hasCardStats } from '../../lib/card-types';
   
   - Add this before the cardBackground computed property:
   
   // Type guards for special card types
   function isStatlessCard(type: string): boolean {
     return isSpecialCardType(type) && type !== 'EVOLUTION' && type !== 'ITEM';
   }

   - Add special card badge to the card face HTML (in the main card div):
   
   {#if isSpecialCardType(card.type)}
     <div class=\"absolute top-2 right-2 z-40 flex items-center gap-1 px-2 py-1 rounded-lg\" style=\"background: rgba(0,0,0,0.5); border: 2px solid {getSpecialCardBorderColor(card.type)};\">
       <span class=\"text-base\" aria-hidden=\"true\">{getSpecialCardIcon(card.type)}</span>
       <span class=\"text-xs font-bold\" style=\"color: {getSpecialCardBorderColor(card.type)};\">{getSpecialCardTypeLabel(card.type)}</span>
     </div>
   {/if}

   - Wrap CardStats display with conditional:
   
   {#if !isStatlessCard(card.type)}
     <CardStats stats={card.stats} rarityConfig={rarityConfig} cardRarity={card.rarity} />
   {:else}
     <div class=\"text-xs text-slate-400 text-center py-2\">
       {getSpecialCardTypeLabel(card.type)} Card - Effect-based abilities
     </div>
   {/if}

   - Apply special glow to card element if special type:
   
   In the card-3d div's style attribute, add conditional border and glow:
   style=\"{isHovered ? 'box-shadow: ' + glowStyle + ', 0 0 20px ' + getSpecialCardBorderColor(card.type) + '55;' : 'box-shadow: ' + glowStyle + ';'}\"
"

echo "
2. UPDATE: src/components/card/CardStats.svelte
   - Add import at top:
     import { isSpecialCardType, hasCardStats } from '../../lib/card-types';
   
   - Add new prop:
     export let cardType: string = '';
   
   - Wrap the entire stats grid with conditional:
   
   {#if hasCardStats(cardType || 'DAD_ARCHETYPE')}
     <div class=\"space-y-1.5 stats-grid\">
       {#each statEntries as stat, i}
         <!-- existing stat rows -->
       {/each}
     </div>
   {:else}
     <div class=\"text-center text-xs text-slate-400 py-4\">
       <p>No base stats</p>
       <p class=\"text-[10px] mt-1\">This card uses special effects</p>
     </div>
   {/if}
"

echo "
3. UPDATE: src/components/pack/PackOpener.svelte
   - Add import at top:
     import { getCardRevealTiming } from '../../lib/card-types';
   
   - Pass card type to CardRevealer component:
     OLD: <CardRevealer card={currentPack.cards[currentCardIndex]} revealed={revealedCards.has(currentCardIndex)} />
     NEW: <CardRevealer card={currentPack.cards[currentCardIndex]} revealed={revealedCards.has(currentCardIndex)} cardType={currentPack.cards[currentCardIndex].type} />
"

echo "
4. UPDATE: src/components/pack/CardRevealer.svelte
   - Add import at top:
     import { isSpecialCardType, getRevealAnimationClasses, getParticleConfig } from '../../lib/card-types';
   
   - Add new prop:
     export let cardType: string = '';
   
   - Apply animation classes:
     OLD: <div ... class=\"card-flip-animation\">
     NEW: <div ... class=\"card-flip-animation {getRevealAnimationClasses(cardType)}\">
   
   - Add particle effects component with config:
     {#if isSpecialCardType(cardType)}
       <ParticleEffects config={getParticleConfig(cardType)} />
     {/if}
"

echo "
5. UPDATE: src/components/collection/CollectionManager.svelte
   - Add import at top:
     import { isSpecialCardType, SPECIAL_CARD_TYPES, getSpecialCardIcon, getSpecialCardTypeLabel } from '../../lib/card-types';
   
   - Add type filter state:
     let selectedCardTypes = \$state<string[]>([]);
   
   - Add type filter UI section (before or after rarity filters):
     <div class=\"filter-group\">
       <h3 class=\"text-sm font-bold mb-2\">Card Type</h3>
       <select 
         value={selectedCardTypes[0] || ''}
         onchange={(e) => {
           const val = e.currentTarget.value;
           selectedCardTypes = val ? [val] : [];
         }}
         class=\"w-full px-3 py-2 rounded-lg bg-slate-700 text-white text-sm\"
       >
         <option value=\"\">All Types</option>
         <optgroup label=\"Special Cards\">
           {#each SPECIAL_CARD_TYPES as type}
             <option value={type}>{getSpecialCardIcon(type)} {getSpecialCardTypeLabel(type)}</option>
           {/each}
         </optgroup>
       </select>
     </div>
   
   - Update filter logic in card filtering function:
     if (selectedCardTypes.length > 0) {
       cards = cards.filter(card => selectedCardTypes.includes(card.type));
     }
   
   - Add type badge to card grid items:
     {#if isSpecialCardType(card.type)}
       <div class=\"absolute top-1 right-1 text-base\" title=\"{getSpecialCardTypeLabel(card.type)}\">
         {getSpecialCardIcon(card.type)}
       </div>
     {/if}
"

echo "
6. UPDATE: src/components/card/CardComparison.svelte
   - Add import at top:
     import { isSpecialCardType, getSpecialCardIcon, getSpecialCardTypeLabel, hasCardStats } from '../../lib/card-types';
   
   - Wrap stats comparison section with conditional:
     {#if hasCardStats(card1.type) && hasCardStats(card2.type)}
       <!-- existing stats comparison -->
     {:else if !hasCardStats(card1.type) && !hasCardStats(card2.type)}
       <div class=\"text-center text-slate-400 text-sm py-4\">
         Both cards use effect-based abilities
       </div>
     {:else}
       <div class=\"text-center text-slate-400 text-sm py-4\">
         One card uses stats, one uses effects
       </div>
     {/if}
   
   - Add effect display section:
     {#if isSpecialCardType(card1.type) || isSpecialCardType(card2.type)}
       <div class=\"border-t border-slate-700 pt-4 mt-4\">
         <h3 class=\"text-sm font-bold mb-3 flex items-center gap-2\">
           <span>⚡</span> Effects & Abilities
         </h3>
         <!-- Compare abilities -->
       </div>
     {/if}
"

echo "
7. UPDATE: src/components/card/ParticleEffects.svelte (if exists)
   - Add import at top:
     import { getParticleConfig } from '../../lib/card-types';
   
   - Add config prop:
     export let config: ParticleConfig | null = null;
   
   - Use config for particle generation:
     {#if config}
       {#each Array(config.count) as _, i}
         <div 
           class=\"particle\"
           style=\"
             background: {config.colors[i % config.colors.length]};
             animation: particle-{config.type} {config.duration}ms ease-out forwards;
             animation-delay: {Math.random() * 50}ms;
           \"
         />
       {/each}
     {/if}
"

echo "
========================================"
echo "KEY POINTS"
echo "========================================"
echo "
✓ All changes are backwards compatible
✓ Existing DAD_ARCHETYPE cards work unchanged  
✓ New card types handled gracefully
✓ No breaking changes to existing APIs
✓ Type guards prevent rendering errors
✓ Conditional rendering for UI elements
✓ Stats display only for cards that have stats
✓ Special effects rendered for EVENT, TERRAIN, CURSE, TRAP
✓ Visual distinction via badges, glows, and animations
✓ Filter system extended for new types
"

echo "
========================================"
echo "TESTING CHECKLIST"
echo "========================================"
echo "
□ Pack opening with mixed card types
□ Stats display hidden for EVENT/TERRAIN/CURSE/TRAP cards
□ Stats display visible for DAD_ARCHETYPE and EVOLUTION/ITEM cards
□ Card badges show correct icons and labels
□ Glow colors match card type
□ Collection filters work for all card types
□ Collection search includes special card types
□ Card comparison handles mixed types
□ Particle animations play for special types
□ Mobile responsive design preserved
□ No console errors
□ No TypeScript errors
□ Build succeeds
□ Tests pass
"

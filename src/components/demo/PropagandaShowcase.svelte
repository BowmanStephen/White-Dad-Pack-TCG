<script lang="ts">
/**
 * PROPAGANDA SHOWCASE
 *
 * Interactive display of the Suburban Propaganda card design
 * showing all rarity tiers and different dad types.
 */
import type { PackCard, Rarity, DadType } from '@/types';
import PropagandaCard from '../card/PropagandaCard.svelte';

// Demo cards showcasing different rarities and types
const demoCards: PackCard[] = [
  {
    id: 'demo-common-1',
    name: 'Grill Recruit Gary',
    subtitle: 'First Year Apprentice',
    type: 'BBQ_DICKTATOR' as DadType,
    rarity: 'common' as Rarity,
    artwork: '',
    stats: {
      dadJoke: 45,
      grillSkill: 52,
      fixIt: 38,
      napPower: 60,
      remoteControl: 55,
      thermostat: 42,
      sockSandal: 30,
      beerSnob: 48,
    },
    flavorText: 'Every revolutionary movement begins with a single flip of the spatula.',
    abilities: [{ name: 'Char Mark', description: 'Leave your mark on history' }],
    series: 1,
    cardNumber: 1,
    totalInSeries: 150,
    artist: 'Comrade Design Bureau',
    isRevealed: true,
    isHolo: false,
    holoType: 'none',
  },
  {
    id: 'demo-uncommon-1',
    name: 'Couch Captain Carl',
    subtitle: 'Channel Commander',
    type: 'COUCH_CUMMANDER' as DadType,
    rarity: 'uncommon' as Rarity,
    artwork: '',
    stats: {
      dadJoke: 58,
      grillSkill: 35,
      fixIt: 42,
      napPower: 85,
      remoteControl: 92,
      thermostat: 78,
      sockSandal: 45,
      beerSnob: 55,
    },
    flavorText: 'From this throne, all channels bow to his command.',
    abilities: [{ name: 'Channel Lock', description: 'No one changes the channel' }],
    series: 1,
    cardNumber: 23,
    totalInSeries: 150,
    artist: 'Ministry of Leisure',
    isRevealed: true,
    isHolo: false,
    holoType: 'none',
  },
  {
    id: 'demo-rare-1',
    name: 'Lawn Marshal Larry',
    subtitle: 'Grass Guardian Elite',
    type: 'LAWN_LUNATIC' as DadType,
    rarity: 'rare' as Rarity,
    artwork: '',
    stats: {
      dadJoke: 62,
      grillSkill: 55,
      fixIt: 70,
      napPower: 45,
      remoteControl: 50,
      thermostat: 65,
      sockSandal: 72,
      beerSnob: 58,
    },
    flavorText: 'The lawn does not mow itself. It yields to the worthy.',
    abilities: [
      { name: 'Perfect Edge', description: 'Precision that inspires fear' },
      { name: 'Fertilize', description: 'Growth through discipline' },
    ],
    series: 1,
    cardNumber: 47,
    totalInSeries: 150,
    artist: "People's Lawn Bureau",
    isRevealed: true,
    isHolo: false,
    holoType: 'none',
  },
  {
    id: 'demo-epic-1',
    name: 'Tool Commissar Hank',
    subtitle: 'Master of All Repairs',
    type: 'FIX_IT_FUCKBOY' as DadType,
    rarity: 'epic' as Rarity,
    artwork: '',
    stats: {
      dadJoke: 72,
      grillSkill: 68,
      fixIt: 95,
      napPower: 40,
      remoteControl: 55,
      thermostat: 88,
      sockSandal: 60,
      beerSnob: 65,
    },
    flavorText: 'If it is broken, it shall be fixed. If it cannot be fixed, duct tape.',
    abilities: [
      { name: 'Emergency Repair', description: 'Nothing stays broken' },
      { name: 'Tool Mastery', description: 'Every tool bends to his will' },
    ],
    series: 1,
    cardNumber: 89,
    totalInSeries: 150,
    artist: 'Industrial Design Collective',
    isRevealed: true,
    isHolo: true,
    holoType: 'standard',
  },
  {
    id: 'demo-legendary-1',
    name: 'Supreme Grill Marshal',
    subtitle: 'Fire and Meat Made Flesh',
    type: 'BBQ_DICKTATOR' as DadType,
    rarity: 'legendary' as Rarity,
    artwork: '',
    stats: {
      dadJoke: 88,
      grillSkill: 99,
      fixIt: 82,
      napPower: 70,
      remoteControl: 75,
      thermostat: 90,
      sockSandal: 85,
      beerSnob: 92,
    },
    flavorText: 'When the smoke rises, all neighbors shall know: perfection has arrived.',
    abilities: [
      { name: 'Inferno Command', description: 'Control the flames absolutely' },
      { name: 'Smoke Signal', description: 'Summon the hungry masses' },
      { name: 'Perfect Sear', description: 'Legendary crust on every cut' },
    ],
    series: 1,
    cardNumber: 142,
    totalInSeries: 150,
    artist: 'Grand Design Soviet',
    isRevealed: true,
    isHolo: true,
    holoType: 'prismatic',
  },
  {
    id: 'demo-mythic-1',
    name: 'THE ULTIMATE DAD',
    subtitle: 'Apotheosis of Suburban Excellence',
    type: 'BBQ_DICKTATOR' as DadType,
    rarity: 'mythic' as Rarity,
    artwork: '',
    stats: {
      dadJoke: 99,
      grillSkill: 99,
      fixIt: 99,
      napPower: 99,
      remoteControl: 99,
      thermostat: 99,
      sockSandal: 99,
      beerSnob: 99,
    },
    flavorText: 'He who masters the grill, masters the universe.',
    abilities: [
      { name: 'Dad Apotheosis', description: 'Transcend mortal limitations' },
      { name: 'Eternal BBQ', description: 'The grill burns forever' },
      { name: 'Suburban Dominion', description: 'All backyards are his domain' },
      { name: 'Thermostat Ascension', description: 'Temperature bends to his will' },
    ],
    series: 1,
    cardNumber: 150,
    totalInSeries: 150,
    artist: 'The Central Committee',
    isRevealed: true,
    isHolo: true,
    holoType: 'prismatic',
  },
];

// State
let selectedRarity = $state<Rarity | 'all'>('all');
let showHoloOnly = $state(false);
const holoOnlyId = `holo-only-${Math.random().toString(36).slice(2)}`;

// Filtered cards
let filteredCards = $derived(
  demoCards.filter(card => {
    if (selectedRarity !== 'all' && card.rarity !== selectedRarity) return false;
    if (showHoloOnly && !card.isHolo) return false;
    return true;
  })
);

const rarityOptions: (Rarity | 'all')[] = [
  'all',
  'common',
  'uncommon',
  'rare',
  'epic',
  'legendary',
  'mythic',
];

function getRarityLabel(rarity: Rarity | 'all'): string {
  if (rarity === 'all') return 'ALL RANKS';
  return rarity.toUpperCase();
}
</script>

<div class="propaganda-showcase">
  <!-- Controls -->
  <div class="controls">
    <div class="control-group">
      <span class="control-label">FILTER BY RANK</span>
      <div class="rarity-buttons">
        {#each rarityOptions as rarity}
          <button
            class="rarity-btn"
            class:active={selectedRarity === rarity}
            class:rarity-common={rarity === 'common'}
            class:rarity-uncommon={rarity === 'uncommon'}
            class:rarity-rare={rarity === 'rare'}
            class:rarity-epic={rarity === 'epic'}
            class:rarity-legendary={rarity === 'legendary'}
            class:rarity-mythic={rarity === 'mythic'}
            onclick={() => (selectedRarity = rarity)}
          >
            {getRarityLabel(rarity)}
          </button>
        {/each}
      </div>
    </div>

    <div class="control-group">
      <label class="toggle-control" for={holoOnlyId}>
        <input id={holoOnlyId} type="checkbox" bind:checked={showHoloOnly} />
        <span class="toggle-label">HOLO ONLY</span>
        <span class="toggle-indicator"></span>
      </label>
    </div>
  </div>

  <!-- Card Grid -->
  <div class="card-grid">
    {#each filteredCards as card (card.id)}
      <div class="card-wrapper" data-rarity={card.rarity}>
        <PropagandaCard {card} size="md" interactive={true} enableLightbox={false} />
        <div class="card-label">
          <span class="card-rarity">{card.rarity.toUpperCase()}</span>
          {#if card.isHolo}
            <span class="card-holo">HOLO</span>
          {/if}
        </div>
      </div>
    {/each}
  </div>

  {#if filteredCards.length === 0}
    <div class="empty-state">
      <div class="empty-icon">
        <svg viewBox="0 0 24 24" fill="currentColor">
          <path
            d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"
          />
        </svg>
      </div>
      <p>NO CARDS MATCH YOUR CRITERIA, COMRADE</p>
      <button
        class="reset-btn"
        onclick={() => {
          selectedRarity = 'all';
          showHoloOnly = false;
        }}
      >
        RESET FILTERS
      </button>
    </div>
  {/if}
</div>

<style>
/* ===== FONTS ===== */
@import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Oswald:wght@400;500;600;700&display=swap');

/* ===== CONTAINER ===== */
.propaganda-showcase {
  max-width: 1400px;
  margin: 0 auto;
  padding: 2rem;
}

/* ===== CONTROLS ===== */
.controls {
  display: flex;
  flex-wrap: wrap;
  gap: 2rem;
  margin-bottom: 3rem;
  padding: 1.5rem;
  background: linear-gradient(145deg, #1a1a2e 0%, #0f0f18 100%);
  border: 2px solid #bf060344;
  clip-path: polygon(0 0, 100% 0, 100% calc(100% - 8px), calc(100% - 8px) 100%, 0 100%);
}

.control-group {
  flex: 1;
  min-width: 280px;
}

.control-label {
  display: block;
  font-family: 'Bebas Neue', sans-serif;
  font-size: 0.875rem;
  letter-spacing: 2px;
  color: #f4d58d;
  margin-bottom: 0.75rem;
}

.rarity-buttons {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.rarity-btn {
  padding: 0.5rem 1rem;
  background: #0a0a0f;
  border: 2px solid #3a3a4a;
  color: #c9b896;
  font-family: 'Oswald', sans-serif;
  font-size: 0.75rem;
  font-weight: 500;
  letter-spacing: 1px;
  cursor: pointer;
  transition: all 0.2s ease;
  clip-path: polygon(4px 0, 100% 0, calc(100% - 4px) 100%, 0 100%);
}

.rarity-btn:hover {
  background: #1a1a2e;
  border-color: #5a5a6a;
}

.rarity-btn.active {
  background: #bf0603;
  border-color: #bf0603;
  color: #faf0ca;
}

.rarity-btn.rarity-common.active {
  background: #6b7280;
  border-color: #6b7280;
}
.rarity-btn.rarity-uncommon.active {
  background: #3d5a80;
  border-color: #3d5a80;
}
.rarity-btn.rarity-rare.active {
  background: #bf0603;
  border-color: #bf0603;
}
.rarity-btn.rarity-epic.active {
  background: #541388;
  border-color: #541388;
}
.rarity-btn.rarity-legendary.active {
  background: #ff6b35;
  border-color: #ff6b35;
}
.rarity-btn.rarity-mythic.active {
  background: #dc143c;
  border-color: #dc143c;
}

/* Toggle */
.toggle-control {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  cursor: pointer;
  padding: 0.5rem;
}

.toggle-control input {
  position: absolute;
  opacity: 0;
  pointer-events: none;
}

.toggle-label {
  font-family: 'Oswald', sans-serif;
  font-size: 0.875rem;
  font-weight: 500;
  letter-spacing: 1px;
  color: #c9b896;
}

.toggle-indicator {
  width: 48px;
  height: 24px;
  background: #0a0a0f;
  border: 2px solid #3a3a4a;
  border-radius: 12px;
  position: relative;
  transition: all 0.2s ease;
}

.toggle-indicator::after {
  content: '';
  position: absolute;
  top: 2px;
  left: 2px;
  width: 16px;
  height: 16px;
  background: #5a5a6a;
  border-radius: 50%;
  transition: all 0.2s ease;
}

.toggle-control input:checked + .toggle-label + .toggle-indicator {
  background: #bf0603;
  border-color: #bf0603;
}

.toggle-control input:checked + .toggle-label + .toggle-indicator::after {
  left: 26px;
  background: #f4d58d;
}

/* ===== CARD GRID ===== */
.card-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 2rem;
  justify-items: center;
}

.card-wrapper {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  animation: fadeInCard 0.4s ease-out forwards;
  opacity: 0;
}

@keyframes fadeInCard {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.card-wrapper:nth-child(1) {
  animation-delay: 0.05s;
}
.card-wrapper:nth-child(2) {
  animation-delay: 0.1s;
}
.card-wrapper:nth-child(3) {
  animation-delay: 0.15s;
}
.card-wrapper:nth-child(4) {
  animation-delay: 0.2s;
}
.card-wrapper:nth-child(5) {
  animation-delay: 0.25s;
}
.card-wrapper:nth-child(6) {
  animation-delay: 0.3s;
}

.card-label {
  display: flex;
  gap: 0.5rem;
  font-family: 'Oswald', sans-serif;
  font-size: 0.75rem;
  letter-spacing: 1px;
}

.card-rarity {
  padding: 0.25rem 0.75rem;
  background: #1a1a2e;
  border: 1px solid #3a3a4a;
  color: #c9b896;
}

.card-wrapper[data-rarity='common'] .card-rarity {
  border-color: #6b7280;
  color: #9ca3af;
}
.card-wrapper[data-rarity='uncommon'] .card-rarity {
  border-color: #3d5a80;
  color: #98c1d9;
}
.card-wrapper[data-rarity='rare'] .card-rarity {
  border-color: #bf0603;
  color: #f4d58d;
}
.card-wrapper[data-rarity='epic'] .card-rarity {
  border-color: #541388;
  color: #a855f7;
}
.card-wrapper[data-rarity='legendary'] .card-rarity {
  border-color: #ff6b35;
  color: #ffd700;
}
.card-wrapper[data-rarity='mythic'] .card-rarity {
  border-color: #dc143c;
  color: #ffffff;
}

.card-holo {
  padding: 0.25rem 0.75rem;
  background: linear-gradient(135deg, #f4d58d, #bf0603);
  color: #0a0a0f;
  font-weight: 600;
}

/* ===== EMPTY STATE ===== */
.empty-state {
  text-align: center;
  padding: 4rem 2rem;
  color: #c9b896;
}

.empty-icon {
  width: 64px;
  height: 64px;
  margin: 0 auto 1.5rem;
  color: #bf0603;
}

.empty-icon svg {
  width: 100%;
  height: 100%;
}

.empty-state p {
  font-family: 'Oswald', sans-serif;
  font-size: 1.25rem;
  letter-spacing: 2px;
  margin-bottom: 1.5rem;
}

.reset-btn {
  padding: 0.75rem 2rem;
  background: #bf0603;
  border: none;
  color: #faf0ca;
  font-family: 'Bebas Neue', sans-serif;
  font-size: 1rem;
  letter-spacing: 2px;
  cursor: pointer;
  transition: all 0.2s ease;
  clip-path: polygon(8px 0, 100% 0, calc(100% - 8px) 100%, 0 100%);
}

.reset-btn:hover {
  background: #e00704;
  transform: translateY(-2px);
}

/* ===== RESPONSIVE ===== */
@media (max-width: 768px) {
  .propaganda-showcase {
    padding: 1rem;
  }

  .controls {
    flex-direction: column;
    gap: 1.5rem;
  }

  .card-grid {
    grid-template-columns: 1fr;
    gap: 1.5rem;
  }
}

/* ===== REDUCED MOTION ===== */
@media (prefers-reduced-motion: reduce) {
  .card-wrapper {
    animation: none;
    opacity: 1;
  }

  .rarity-btn,
  .toggle-indicator,
  .toggle-indicator::after,
  .reset-btn {
    transition: none;
  }
}
</style>

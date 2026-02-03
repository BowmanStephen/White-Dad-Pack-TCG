<script lang="ts">
/**
 * SUBURBAN PROPAGANDA Card Design v3
 *
 * Refined layout, better proportions, enhanced rarity distinction
 */
import type { PackCard } from '@/types';
import { RARITY_CONFIG, DAD_TYPE_ICONS, DAD_TYPE_NAMES } from '@/types';
import { isSpecialCardType, getSpecialCardTypeLabel, getSpecialCardIcon } from '@lib/card-types';
import PropagandaArt from '../art/PropagandaArt.svelte';
import { openLightbox } from '@/stores/lightbox';

interface Props {
  card: PackCard;
  isFlipped?: boolean;
  showBack?: boolean;
  size?: 'sm' | 'md' | 'lg';
  interactive?: boolean;
  enableLightbox?: boolean;
  cardList?: PackCard[];
  cardIndex?: number;
}

let {
  card,
  isFlipped = false,
  showBack = true,
  size = 'md',
  interactive = true,
  enableLightbox = true,
  cardList = [],
  cardIndex = 0,
}: Props = $props();

let rarityConfig = $derived(RARITY_CONFIG[card.rarity]);
let typeIcon = $derived(DAD_TYPE_ICONS[card.type]);
let typeName = $derived(DAD_TYPE_NAMES[card.type]);

// Enhanced propaganda palette with more distinction between rarities
const propagandaPalette = {
  common: {
    bg: '#1e1e24',
    primary: '#2a2a32',
    secondary: '#6b6b73',
    accent: '#9e9e9e',
    highlight: '#c8c8c8',
    border: '#4a4a52',
    glow: 'transparent',
  },
  uncommon: {
    bg: '#0f1a2a',
    primary: '#152238',
    secondary: '#2563eb',
    accent: '#60a5fa',
    highlight: '#dbeafe',
    border: '#1e40af',
    glow: 'rgba(37, 99, 235, 0.25)',
  },
  rare: {
    bg: '#1f0a0a',
    primary: '#2d0f0f',
    secondary: '#dc2626',
    accent: '#fbbf24',
    highlight: '#fef3c7',
    border: '#991b1b',
    glow: 'rgba(220, 38, 38, 0.35)',
  },
  epic: {
    bg: '#1a0a2e',
    primary: '#240f3d',
    secondary: '#9333ea',
    accent: '#fbbf24',
    highlight: '#fef3c7',
    border: '#6b21a8',
    glow: 'rgba(147, 51, 234, 0.4)',
  },
  legendary: {
    bg: '#1f1005',
    primary: '#2d1a0a',
    secondary: '#ea580c',
    accent: '#fcd34d',
    highlight: '#fffbeb',
    border: '#c2410c',
    glow: 'rgba(234, 88, 12, 0.5)',
  },
  mythic: {
    bg: '#1a0510',
    primary: '#2d0a1a',
    secondary: '#e11d48',
    accent: '#fcd34d',
    highlight: '#ffffff',
    border: '#be123c',
    glow: 'rgba(225, 29, 72, 0.6)',
  },
};

let palette = $derived(propagandaPalette[card.rarity] || propagandaPalette.common);

const sizeClasses = {
  sm: 'w-52',
  md: 'w-72',
  lg: 'w-96',
};

const artDimensions = {
  sm: { w: 180, h: 120 },
  md: { w: 250, h: 165 },
  lg: { w: 340, h: 225 },
};

let isHovered = $state(false);

let rarityStars = $derived(
  { common: 1, uncommon: 2, rare: 3, epic: 4, legendary: 5, mythic: 6 }[card.rarity] || 1
);

const slogans: Record<string, string> = {
  BBQ_DICKTATOR: 'MEAT IS VICTORY',
  COUCH_CUMMANDER: 'REST IS REVOLUTION',
  LAWN_LUNATIC: 'GREEN IS GLORY',
  FIX_IT_FUCKBOY: 'BUILD THE FUTURE',
  FASHION_FUCK: 'STYLE IS STRENGTH',
  CAR_COCK: 'DRIVE THE DREAM',
  GOLF_GONAD: 'SWING FOR FREEDOM',
  OFFICE_ORGASMS: 'WORK IS WORSHIP',
  COOL_CUCKS: 'COOL IS CONTROL',
  COACH_CUMSTERS: 'TRAIN FOR TRIUMPH',
  CHEF_CUMSTERS: 'COOK FOR COUNTRY',
  WAREHOUSE_WANKERS: 'BULK IS POWER',
  HOLIDAY_HORNDOGS: 'CELEBRATE ALWAYS',
  VINTAGE_VAGABONDS: 'PAST IS PROLOGUE',
  TECH_TWATS: 'CODE IS LAW',
  GAMER_GIZZARDS: 'PLAY TO WIN',
  PREPPER_PENIS: 'PREPARE OR PERISH',
  ITEM: 'TOOLS OF TRIUMPH',
  EVENT: 'MOMENT OF GLORY',
  TERRAIN: 'SACRED GROUND',
  EVOLUTION: 'TRANSFORM NOW',
  CURSE: 'BURDEN OF DUTY',
  TRAP: 'VIGILANCE VICTORY',
};

let slogan = $derived(slogans[card.type] || 'RISE COMRADE');

function handleClick() {
  if (!enableLightbox || !interactive) return;
  openLightbox(card, cardList.length > 0 ? cardList : [card], cardList.length > 0 ? cardIndex : 0);
}

let showFlash = $state(false);
let wasFlipped = $state(false);
const isClickable = $derived(enableLightbox && interactive);

$effect(() => {
  if (isFlipped && !wasFlipped && card.isHolo) {
    showFlash = true;
    setTimeout(() => (showFlash = false), 350);
    wasFlipped = true;
  } else if (!isFlipped) {
    wasFlipped = false;
    showFlash = false;
  }
});

function handleKeydown(event: KeyboardEvent) {
  if (!isClickable) return;
  if (event.key === 'Enter' || event.key === ' ') {
    event.preventDefault();
    handleClick();
  }
}
</script>

<div
  class="card-wrap {sizeClasses[size]}"
  class:cursor-pointer={isClickable}
  onmouseenter={() => interactive && (isHovered = true)}
  onmouseleave={() => (isHovered = false)}
  onclick={isClickable ? handleClick : undefined}
  onkeydown={handleKeydown}
  role="button"
  aria-label="{card.name} - {rarityConfig.name}"
  aria-disabled={!isClickable}
  tabindex={isClickable ? 0 : -1}
>
  <div
    class="card-3d"
    class:flipped={isFlipped && showBack}
    class:hovered={isHovered}
    style="--glow: {palette.glow};"
  >
    <!-- ========== FRONT ========== -->
    <article
      class="face front"
      style="
        --bg: {palette.bg};
        --primary: {palette.primary};
        --secondary: {palette.secondary};
        --accent: {palette.accent};
        --highlight: {palette.highlight};
        --border: {palette.border};
      "
    >
      {#if showFlash}<div class="flash"></div>{/if}

      <!-- Main frame -->
      <div class="frame">
        <div class="frame-inner"></div>
        <div class="frame-accent tl"></div>
        <div class="frame-accent tr"></div>
        <div class="frame-accent bl"></div>
        <div class="frame-accent br"></div>
      </div>

      <!-- Header -->
      <header class="header">
        <div class="type-pill">
          <span class="type-icon">{typeIcon}</span>
          <span class="type-name">{typeName}</span>
        </div>
        <div class="stars">
          {#each Array(rarityStars) as _}
            <span class="star">★</span>
          {/each}
        </div>
      </header>

      <!-- Artwork -->
      <section class="art-section">
        <div class="art-frame">
          <div class="art-inner">
            <PropagandaArt
              {card}
              width={artDimensions[size].w}
              height={artDimensions[size].h}
              {palette}
            />
          </div>
          {#if card.isHolo}
            <div class="holo-shine"></div>
            <span class="holo-tag">HOLO</span>
          {/if}
        </div>
      </section>

      <!-- Slogan -->
      <div class="slogan-bar">
        <span class="slogan-deco">★</span>
        <span class="slogan-text">{slogan}</span>
        <span class="slogan-deco">★</span>
      </div>

      <!-- Identity -->
      <section class="identity">
        <h1 class="name">{card.name}</h1>
        <p class="subtitle">{card.subtitle}</p>
      </section>

      <!-- Flavor -->
      <section class="flavor">
        <blockquote class="flavor-quote">
          "{card.flavorText}"
        </blockquote>
      </section>

      <!-- Stats -->
      {#if !isSpecialCardType(card.type) || card.type === 'EVOLUTION' || card.type === 'ITEM'}
        <section class="stats">
          <div class="stat">
            <span class="stat-name">ATK</span>
            <div class="stat-bar">
              <div class="stat-fill" style="width:{card.stats.dadJoke}%"></div>
            </div>
            <span class="stat-val">{card.stats.dadJoke}</span>
          </div>
          <div class="stat">
            <span class="stat-name">DEF</span>
            <div class="stat-bar">
              <div class="stat-fill alt" style="width:{card.stats.fixIt}%"></div>
            </div>
            <span class="stat-val">{card.stats.fixIt}</span>
          </div>
          <div class="stat">
            <span class="stat-name">GRL</span>
            <div class="stat-bar">
              <div class="stat-fill acc" style="width:{card.stats.grillSkill}%"></div>
            </div>
            <span class="stat-val">{card.stats.grillSkill}</span>
          </div>
        </section>
      {:else}
        <section class="special">
          <div class="special-badge">
            <span>{getSpecialCardIcon(card.type)}</span>
            <span>{getSpecialCardTypeLabel(card.type)}</span>
          </div>
        </section>
      {/if}

      <!-- Footer -->
      <footer class="footer">
        <span class="f-num">#{card.cardNumber.toString().padStart(3, '0')}</span>
        <span class="f-series">S{card.series}</span>
        <span class="f-artist">{card.artist}</span>
      </footer>

      <!-- Effects -->
      <div class="grain"></div>
      {#if card.rarity === 'legendary' || card.rarity === 'mythic' || card.rarity === 'epic'}
        <div class="rarity-glow"></div>
      {/if}
    </article>

    <!-- ========== BACK ========== -->
    {#if showBack}
      <article
        class="face back"
        style="--bg:{palette.bg};--secondary:{palette.secondary};--accent:{palette.accent};"
      >
        <div class="back-inner">
          <svg class="back-rays" viewBox="0 0 100 140">
            {#each Array(20) as _, i}
              <line
                x1="50"
                y1="70"
                x2={50 + Math.cos((i * Math.PI) / 10) * 80}
                y2={70 + Math.sin((i * Math.PI) / 10) * 100}
                stroke="var(--secondary)"
                stroke-width="0.4"
                opacity="0.25"
              />
            {/each}
            <circle cx="50" cy="70" r="20" fill="var(--secondary)" opacity="0.8" />
            <circle cx="50" cy="70" r="14" fill="var(--bg)" />
          </svg>
          <div class="back-logo">
            <span class="logo-d">D</span>
            <span class="logo-sub">DECK</span>
          </div>
          <div class="back-banner top">DAD DECK</div>
          <div class="back-banner bot">EST. 2024</div>
          <div class="grain"></div>
        </div>
      </article>
    {/if}
  </div>
</div>

<style>
@import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Oswald:wght@400;500;600;700&family=Teko:wght@500;600;700&family=Crimson+Pro:ital@1&display=swap');

/* ===== WRAPPER ===== */
.card-wrap {
  aspect-ratio: 5/7;
  perspective: 1200px;
}

.card-3d {
  width: 100%;
  height: 100%;
  position: relative;
  transform-style: preserve-3d;
  transition: transform 0.4s ease;
}

.card-3d.hovered {
  transform: translateY(-8px) scale(1.02);
  filter: drop-shadow(0 20px 30px rgba(0, 0, 0, 0.4));
}

.card-3d.flipped {
  transform: rotateY(180deg);
}

/* ===== FACES ===== */
.face {
  position: absolute;
  inset: 0;
  backface-visibility: hidden;
  border-radius: 10px;
  overflow: hidden;
  background: var(--bg);
}

.face.back {
  transform: rotateY(180deg);
}

/* ===== FRAME ===== */
.frame {
  position: absolute;
  inset: 0;
  border: 3px solid var(--border);
  border-radius: 10px;
  pointer-events: none;
}

.frame-inner {
  position: absolute;
  inset: 6px;
  border: 1px solid var(--secondary);
  border-radius: 6px;
  opacity: 0.4;
}

.frame-accent {
  position: absolute;
  width: 20px;
  height: 20px;
  border: 2px solid var(--accent);
}

.frame-accent.tl {
  top: 3px;
  left: 3px;
  border-right: none;
  border-bottom: none;
}
.frame-accent.tr {
  top: 3px;
  right: 3px;
  border-left: none;
  border-bottom: none;
}
.frame-accent.bl {
  bottom: 3px;
  left: 3px;
  border-right: none;
  border-top: none;
}
.frame-accent.br {
  bottom: 3px;
  right: 3px;
  border-left: none;
  border-top: none;
}

/* ===== HEADER ===== */
.header {
  position: relative;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 14px 8px;
  z-index: 10;
}

.type-pill {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 4px 12px;
  background: var(--secondary);
  border-radius: 2px;
  clip-path: polygon(0 0, calc(100% - 6px) 0, 100% 50%, calc(100% - 6px) 100%, 0 100%);
}

.type-icon {
  font-size: 13px;
}

.type-name {
  font-family: 'Teko', sans-serif;
  font-size: 13px;
  font-weight: 600;
  letter-spacing: 1px;
  color: var(--highlight);
  text-transform: uppercase;
}

.stars {
  display: flex;
  gap: 2px;
}

.star {
  font-size: 13px;
  color: var(--accent);
  text-shadow: 0 0 6px var(--accent);
}

/* ===== ARTWORK ===== */
.art-section {
  padding: 0 12px;
  margin-bottom: 6px;
}

.art-frame {
  position: relative;
  background: #000;
  border: 2px solid var(--border);
  overflow: hidden;
}

.art-inner {
  display: flex;
  align-items: center;
  justify-content: center;
}

.holo-shine {
  position: absolute;
  inset: 0;
  background: linear-gradient(
    115deg,
    transparent 20%,
    rgba(255, 255, 255, 0.15) 40%,
    rgba(255, 200, 100, 0.1) 50%,
    rgba(255, 255, 255, 0.15) 60%,
    transparent 80%
  );
  background-size: 200% 100%;
  animation: shine 2s ease-in-out infinite;
  pointer-events: none;
}

@keyframes shine {
  0%,
  100% {
    background-position: 200% 0;
  }
  50% {
    background-position: -200% 0;
  }
}

.holo-tag {
  position: absolute;
  top: 4px;
  right: 4px;
  padding: 2px 6px;
  background: linear-gradient(135deg, var(--accent), var(--secondary));
  font-family: 'Teko', sans-serif;
  font-size: 10px;
  font-weight: 600;
  letter-spacing: 1px;
  color: #fff;
}

.flash {
  position: absolute;
  inset: 0;
  background: white;
  z-index: 100;
  animation: flash-out 0.35s ease-out forwards;
}

@keyframes flash-out {
  to {
    opacity: 0;
  }
}

/* ===== SLOGAN ===== */
.slogan-bar {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 4px 0;
  margin: 0 12px 4px;
  background: var(--secondary);
  transform: skewX(-2deg);
}

.slogan-text {
  font-family: 'Bebas Neue', sans-serif;
  font-size: 12px;
  letter-spacing: 3px;
  color: var(--highlight);
  transform: skewX(2deg);
}

.slogan-deco {
  font-size: 8px;
  color: var(--accent);
  transform: skewX(2deg);
}

/* ===== IDENTITY ===== */
.identity {
  text-align: center;
  padding: 0 12px 4px;
}

.name {
  font-family: 'Teko', sans-serif;
  font-size: 26px;
  font-weight: 700;
  line-height: 1;
  letter-spacing: 1px;
  color: var(--highlight);
  text-transform: uppercase;
  text-shadow: 2px 2px 0 var(--secondary);
  margin: 0;
}

.subtitle {
  font-family: 'Oswald', sans-serif;
  font-size: 9px;
  font-weight: 400;
  letter-spacing: 2px;
  color: var(--accent);
  text-transform: uppercase;
  margin: 2px 0 0;
}

/* ===== FLAVOR ===== */
.flavor {
  padding: 0 12px 6px;
}

.flavor-quote {
  margin: 0;
  padding: 6px 10px;
  background: var(--highlight);
  border-left: 3px solid var(--secondary);
  font-family: 'Crimson Pro', Georgia, serif;
  font-size: 10px;
  font-style: italic;
  line-height: 1.4;
  color: var(--bg);
  overflow: hidden;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}

/* ===== STATS ===== */
.stats {
  display: flex;
  flex-direction: column;
  gap: 3px;
  padding: 0 12px 6px;
}

.stat {
  display: grid;
  grid-template-columns: 28px 1fr 28px;
  align-items: center;
  gap: 6px;
}

.stat-name {
  font-family: 'Teko', sans-serif;
  font-size: 12px;
  font-weight: 600;
  color: var(--accent);
}

.stat-bar {
  height: 8px;
  background: rgba(0, 0, 0, 0.5);
  border: 1px solid var(--border);
  overflow: hidden;
}

.stat-fill {
  height: 100%;
  background: linear-gradient(
    90deg,
    var(--secondary) 0%,
    color-mix(in srgb, var(--secondary) 70%, white) 100%
  );
  transition: width 0.5s ease;
}

.stat-fill.alt {
  background: linear-gradient(90deg, var(--border) 0%, var(--secondary) 100%);
}

.stat-fill.acc {
  background: linear-gradient(90deg, #7c5c00 0%, var(--accent) 100%);
}

.stat-val {
  font-family: 'Teko', sans-serif;
  font-size: 14px;
  font-weight: 600;
  color: var(--highlight);
  text-align: right;
}

/* ===== SPECIAL ===== */
.special {
  padding: 6px 12px;
}

.special-badge {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 8px;
  background: var(--secondary);
  font-family: 'Teko', sans-serif;
  font-size: 14px;
  font-weight: 600;
  letter-spacing: 2px;
  color: var(--highlight);
  text-transform: uppercase;
  clip-path: polygon(4% 0, 96% 0, 100% 50%, 96% 100%, 4% 100%, 0 50%);
}

/* ===== FOOTER ===== */
.footer {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  display: flex;
  justify-content: space-between;
  padding: 6px 14px;
  background: var(--primary);
  border-top: 1px solid var(--border);
  font-family: 'Oswald', sans-serif;
  font-size: 8px;
  letter-spacing: 1px;
  text-transform: uppercase;
  z-index: 10;
}

.f-num {
  color: var(--accent);
}
.f-series {
  color: var(--highlight);
  font-weight: 600;
}
.f-artist {
  color: var(--accent);
  opacity: 0.7;
}

/* ===== EFFECTS ===== */
.grain {
  position: absolute;
  inset: 0;
  background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
  opacity: 0.04;
  mix-blend-mode: overlay;
  pointer-events: none;
}

.rarity-glow {
  position: absolute;
  inset: 0;
  box-shadow: inset 0 0 50px var(--glow);
  animation: glow-pulse 2s ease-in-out infinite;
  pointer-events: none;
}

@keyframes glow-pulse {
  0%,
  100% {
    opacity: 0.6;
  }
  50% {
    opacity: 1;
  }
}

/* ===== BACK ===== */
.back-inner {
  width: 100%;
  height: 100%;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
}

.back-rays {
  position: absolute;
  width: 100%;
  height: 100%;
}

.back-logo {
  position: relative;
  z-index: 10;
  text-align: center;
}

.logo-d {
  display: block;
  font-family: 'Teko', sans-serif;
  font-size: 64px;
  font-weight: 700;
  color: var(--accent);
  line-height: 0.8;
  text-shadow: 0 0 20px var(--accent);
}

.logo-sub {
  font-family: 'Teko', sans-serif;
  font-size: 18px;
  font-weight: 500;
  letter-spacing: 8px;
  color: var(--secondary);
}

.back-banner {
  position: absolute;
  left: 0;
  right: 0;
  padding: 6px;
  background: var(--secondary);
  font-family: 'Bebas Neue', sans-serif;
  font-size: 12px;
  letter-spacing: 4px;
  color: var(--highlight);
  text-align: center;
  z-index: 10;
}

.back-banner.top {
  top: 10%;
  transform: skewY(-1deg);
}
.back-banner.bot {
  bottom: 10%;
  transform: skewY(1deg);
}

/* ===== RESPONSIVE ===== */
.card-wrap.w-52 .name {
  font-size: 20px;
}
.card-wrap.w-52 .slogan-text {
  font-size: 10px;
}
.card-wrap.w-52 .flavor-quote {
  font-size: 9px;
}

.card-wrap.w-96 .name {
  font-size: 32px;
}
.card-wrap.w-96 .slogan-text {
  font-size: 14px;
}

/* ===== REDUCED MOTION ===== */
@media (prefers-reduced-motion: reduce) {
  .card-3d,
  .holo-shine,
  .rarity-glow,
  .stat-fill {
    animation: none;
    transition: none;
  }
}
</style>

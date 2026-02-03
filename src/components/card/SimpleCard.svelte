<script lang="ts">
import type { Card, PackCard } from '@/types';

interface Props {
  card: Card | PackCard;
  revealed?: boolean;
  size?: 'sm' | 'md' | 'lg';
  onClick?: () => void;
}

let { card, revealed = true, size = 'md', onClick }: Props = $props();

const isPackCard = (c: Card | PackCard): c is PackCard => 'isHolo' in c;

function handleKeydown(event: KeyboardEvent) {
  if (!onClick) return;
  if (event.key === 'Enter' || event.key === ' ') {
    event.preventDefault();
    onClick();
  }
}

const sizeClasses = {
  sm: 'w-36 h-52',
  md: 'w-56 h-80',
  lg: 'w-72 h-96',
};

// 8-bit color palette
const palette = {
  common: { border: '#9ca3af', bg: '#f3f4f6', dark: '#4b5563' },
  uncommon: { border: '#22c55e', bg: '#dcfce7', dark: '#166534' },
  rare: { border: '#3b82f6', bg: '#dbeafe', dark: '#1e40af' },
  epic: { border: '#a855f7', bg: '#f3e8ff', dark: '#6b21a8' },
  legendary: { border: '#f59e0b', bg: '#fef3c7', dark: '#92400e' },
  mythic: { border: '#ec4899', bg: '#fce7f3', dark: '#9d174d' },
};

// 8-bit type icons
const typePixels: Record<string, string> = {
  BBQ_DICKTATOR: '🍖',
  COUCH_CUMMANDER: '📺',
  LAWN_LUNATIC: '🌱',
  FIX_IT_FUCKBOY: '🔨',
  FASHION_FUCK: '👟',
  CAR_COCK: '🚙',
  GOLF_GONAD: '⛳',
  OFFICE_ORGASMS: '📠',
  COOL_CUCKS: '🕶️',
  COACH_CUMSTERS: '🏆',
  CHEF_CUMSTERS: '🍳',
  ITEM: '📦',
  EVENT: '⚡',
};
</script>

{#if revealed}
  <div
    class="relative {sizeClasses[
      size
    ]} cursor-pointer transform transition-all duration-100 hover:scale-105"
    style="image-rendering: pixelated;"
    onclick={onClick}
    onkeydown={handleKeydown}
    role="button"
    tabindex="0"
  >
    <!-- Main card body -->
    <div
      class="absolute inset-0"
      style="background: {palette[card.rarity].bg}; box-shadow: 
        4px 0 0 {palette[card.rarity].dark},
        0 4px 0 {palette[card.rarity].dark},
        4px 4px 0 {palette[card.rarity].dark},
        -4px 0 0 {palette[card.rarity].border},
        0 -4px 0 {palette[card.rarity].border},
        -4px -4px 0 {palette[card.rarity].border},
        4px -4px 0 {palette[card.rarity].border},
        -4px 4px 0 {palette[card.rarity].border};"
    >
      <!-- Pixel border inner -->
      <div class="absolute inset-2" style="border: 4px solid {palette[card.rarity].border};"></div>

      <!-- Header bar -->
      <div
        class="absolute top-2 left-2 right-2 h-8 flex items-center px-2"
        style="background: {palette[card.rarity].border}; border-bottom: 4px solid {palette[
          card.rarity
        ].dark};"
      >
        <span
          class="text-xs font-bold text-white uppercase truncate flex-1"
          style="font-family: 'Courier New', monospace; letter-spacing: -0.5px;"
        >
          {card.name.length > 18 ? card.name.slice(0, 18) + '..' : card.name}
        </span>
      </div>

      <!-- Type badge - pixel art style -->
      <div
        class="absolute top-3 left-3 w-6 h-6 flex items-center justify-center text-sm z-10"
        style="background: {palette[card.rarity]
          .dark}; border: 2px solid white; box-shadow: 2px 2px 0 rgba(0,0,0,0.3);"
      >
        {typePixels[card.type] || '❓'}
      </div>

      <!-- Pixel art frame for image -->
      <div
        class="absolute top-12 left-3 right-3 bottom-32 bg-white"
        style="border: 4px solid {palette[card.rarity]
          .dark}; box-shadow: inset 4px 4px 0 rgba(0,0,0,0.1);"
      >
        <img
          src={card.artwork}
          alt={card.name}
          class="w-full h-full object-cover"
          loading="lazy"
          style="image-rendering: pixelated; filter: contrast(1.1);"
        />
      </div>

      <!-- Stats box - 8-bit style -->
      <div
        class="absolute bottom-16 left-3 right-3 h-12 flex items-center justify-between px-2"
        style="background: white; border: 3px solid {palette[card.rarity].border};"
      >
        <div class="text-center">
          <div class="text-[10px] uppercase font-bold" style="color: {palette[card.rarity].dark};">
            ATK
          </div>
          <div
            class="text-sm font-black"
            style="color: {palette[card.rarity].dark}; font-family: 'Courier New', monospace;"
          >
            {card.stats.dadJoke.toString().padStart(2, '0')}
          </div>
        </div>
        <div class="w-px h-8 bg-gray-300"></div>
        <div class="text-center">
          <div class="text-[10px] uppercase font-bold" style="color: {palette[card.rarity].dark};">
            DEF
          </div>
          <div
            class="text-sm font-black"
            style="color: {palette[card.rarity].dark}; font-family: 'Courier New', monospace;"
          >
            {card.stats.fixIt.toString().padStart(2, '0')}
          </div>
        </div>
        <div class="w-px h-8 bg-gray-300"></div>
        <div class="text-center">
          <div class="text-[10px] uppercase font-bold" style="color: {palette[card.rarity].dark};">
            HP
          </div>
          <div
            class="text-sm font-black"
            style="color: {palette[card.rarity].dark}; font-family: 'Courier New', monospace;"
          >
            {Object.values(card.stats)
              .reduce((a, b) => a + b, 0)
              .toString()
              .padStart(3, '0')}
          </div>
        </div>
      </div>

      <!-- Flavor text - scrolling marquee style -->
      <div
        class="absolute bottom-4 left-3 right-3 h-12 flex items-center px-3 overflow-hidden"
        style="background: {palette[card.rarity].bg}; border: 2px dashed {palette[card.rarity]
          .border};"
      >
        <p
          class="text-xs text-gray-700 w-full break-words leading-tight"
          style="font-family: 'Courier New', monospace;"
        >
          "{card.flavorText}"
        </p>
      </div>
    </div>

    <!-- Holo indicator - pixel sparkle -->
    {#if isPackCard(card) && card.isHolo}
      <div class="absolute top-10 right-2 animate-pulse">
        <div class="text-xl">✨</div>
      </div>
    {/if}

    <!-- Pixel rarity badge -->
    <div
      class="absolute -top-2 -right-2 px-2 py-1 z-20"
      style="background: {palette[card.rarity].border}; border: 3px solid {palette[card.rarity]
        .dark}; box-shadow: 3px 3px 0 rgba(0,0,0,0.3);"
    >
      <span
        class="text-xs font-black text-white uppercase"
        style="font-family: 'Courier New', monospace;"
      >
        {card.rarity.slice(0, 3)}
      </span>
    </div>

    <!-- Pixel corner accents -->
    <div
      class="absolute bottom-2 left-4 text-[8px] text-gray-500"
      style="font-family: 'Courier New', monospace;"
    >
      LV.{Math.floor(Object.values(card.stats).reduce((a, b) => a + b, 0) / 10)}
    </div>
  </div>
{:else}
  <!-- Card Back - Pixel Mystery Box -->
  <div class="relative {sizeClasses[size]} cursor-pointer">
    <!-- Pixelated mystery box -->
    <div
      class="absolute inset-0"
      style="background: #1e293b; box-shadow: 
        6px 0 0 #0f172a,
        0 6px 0 #0f172a,
        6px 6px 0 #0f172a,
        -6px 0 0 #3b82f6,
        0 -6px 0 #3b82f6,
        -6px -6px 0 #3b82f6,
        6px -6px 0 #3b82f6,
        -6px 6px 0 #3b82f6;"
    >
      <!-- Question mark block -->
      <div class="absolute inset-0 flex items-center justify-center">
        <div class="text-center">
          <div
            class="w-16 h-16 flex items-center justify-center text-3xl font-black text-white mb-2"
            style="background: #fbbf24; border: 4px solid #f59e0b; box-shadow: 4px 4px 0 #92400e;"
          >
            ?
          </div>
          <div
            class="text-xs font-bold text-blue-400 uppercase tracking-widest"
            style="font-family: 'Courier New', monospace;"
          >
            PRESS START
          </div>
        </div>
      </div>

      <!-- Pixel dots decoration -->
      <div class="absolute top-4 left-4 w-2 h-2 bg-blue-400"></div>
      <div class="absolute top-4 right-4 w-2 h-2 bg-blue-400"></div>
      <div class="absolute bottom-4 left-4 w-2 h-2 bg-blue-400"></div>
      <div class="absolute bottom-4 right-4 w-2 h-2 bg-blue-400"></div>
    </div>
  </div>
{/if}

<style>
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

@keyframes pulse {
  0%,
  100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}

.animate-pulse {
  animation: pulse 1s steps(2) infinite;
}
</style>

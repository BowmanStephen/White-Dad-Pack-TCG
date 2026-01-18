import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Read cards data
const cardsPath = path.join(__dirname, '../src/data/cards.json');
const { cards } = JSON.parse(fs.readFileSync(cardsPath, 'utf-8'));

// Color schemes by rarity
const RARITY_COLORS = {
  common: {
    primary: '#64748b',
    secondary: '#475569',
    accent: '#94a3b8',
    gradient: ['#64748b', '#475569', '#334155']
  },
  uncommon: {
    primary: '#22c55e',
    secondary: '#16a34a',
    accent: '#86efac',
    gradient: ['#22c55e', '#16a34a', '#15803d']
  },
  rare: {
    primary: '#3b82f6',
    secondary: '#2563eb',
    accent: '#93c5fd',
    gradient: ['#3b82f6', '#2563eb', '#1d4ed8']
  },
  epic: {
    primary: '#a855f7',
    secondary: '#9333ea',
    accent: '#d8b4fe',
    gradient: ['#a855f7', '#9333ea', '#7e22ce']
  },
  legendary: {
    primary: '#eab308',
    secondary: '#ca8a04',
    accent: '#fde047',
    gradient: ['#eab308', '#ca8a04', '#a16207']
  },
  mythic: {
    primary: '#ec4899',
    secondary: '#db2777',
    accent: '#f9a8d4',
    gradient: ['#ec4899', '#8b5cf6', '#06b6d4']
  }
};

// Dad type icons and colors
const TYPE_CONFIG = {
  BBQ_DAD: { icon: '🍖', color: '#dc2626', symbol: '🔥' },
  COUCH_DAD: { icon: '🛋️', color: '#7c3aed', symbol: '😴' },
  FASHION_DAD: { icon: '👔', color: '#0891b2', symbol: '👕' },
  LAWN_DAD: { icon: '🌱', color: '#16a34a', symbol: '🌿' },
  GOLF_DAD: { icon: '⛳', color: '#15803d', symbol: '🏌️' },
  FIX_IT_DAD: { icon: '🔧', color: '#ea580c', symbol: '🔨' },
  CAR_DAD: { icon: '🚗', color: '#0284c7', symbol: '⚙️' },
  OFFICE_DAD: { icon: '💼', color: '#475569', symbol: '📊' },
  COOL_DAD: { icon: '😎', color: '#0891b2', symbol: '🎸' },
  CHEF_DAD: { icon: '👨‍🍳', color: '#dc2626', symbol: '🍳' },
  COACH_DAD: { icon: '🏀', color: '#ea580c', symbol: '🏆' },
  HOLIDAY_DAD: { icon: '🎄', color: '#0284c7', symbol: '⭐' },
  WAREHOUSE_DAD: { icon: '🏬', color: '#7c3aed', symbol: '📦' },
  TECH_DAD: { icon: '💻', color: '#0284c7', symbol: '🤖' },
  VINTAGE_DAD: { icon: '💿', color: '#78716c', symbol: '📻' },
  ITEM: { icon: '📦', color: '#64748b', symbol: '🎁' }
};

function generateCardSVG(card) {
  const rarity = RARITY_COLORS[card.rarity] || RARITY_COLORS.common;
  const typeConfig = TYPE_CONFIG[card.type] || TYPE_CONFIG.ITEM;
  
  const isMythic = card.rarity === 'mythic';
  const isLegendary = card.rarity === 'legendary' || isMythic;
  const isRareOrBetter = ['rare', 'epic', 'legendary', 'mythic'].includes(card.rarity);
  
  // Build SVG
  const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg width="512" height="512" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <!-- Main background gradient -->
    <linearGradient id="bg-gradient-${card.id}" x1="0%" y1="0%" x2="100%" y2="100%">
      ${rarity.gradient.map((color, i) => `<stop offset="${i * 33}%" stop-color="${color}" />`).join('\n      ')}
    </linearGradient>
    
    <!-- Diagonal overlay gradient -->
    <linearGradient id="diagonal-gradient-${card.id}" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="white" stop-opacity="0.1"/>
      <stop offset="50%" stop-color="white" stop-opacity="0.05"/>
      <stop offset="100%" stop-color="white" stop-opacity="0.1"/>
    </linearGradient>
    
    <!-- Glow gradient for legendary cards -->
    ${isLegendary ? `
    <linearGradient id="glow-gradient-${card.id}" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="${rarity.accent}" stop-opacity="0.8"/>
      <stop offset="50%" stop-color="${rarity.primary}" stop-opacity="0.4"/>
      <stop offset="100%" stop-color="${rarity.secondary}" stop-opacity="0"/>
    </linearGradient>
    
    <radialGradient id="center-glow-${card.id}" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="${rarity.accent}" stop-opacity="0.4"/>
      <stop offset="100%" stop-color="${rarity.primary}" stop-opacity="0"/>
    </radialGradient>` : ''}
    
    <!-- Shadow filters -->
    <filter id="shadow-${card.id}" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="4" stdDeviation="8" flood-color="${rarity.secondary}" flood-opacity="0.4"/>
    </filter>
    
    <filter id="inner-shadow-${card.id}" x="-50%" y="-50%" width="200%" height="200%">
      <feGaussianBlur in="SourceAlpha" stdDeviation="4" result="blur"/>
      <feOffset dx="0" dy="2" result="offsetBlur"/>
      <feComposite in="SourceGraphic" in2="offsetBlur" operator="over"/>
    </filter>
    
    <!-- Glow filter for legendary cards -->
    ${isLegendary ? `
    <filter id="glow-${card.id}" x="-50%" y="-50%" width="200%" height="200%">
      <feGaussianBlur stdDeviation="25" result="coloredBlur"/>
      <feMerge>
        <feMergeNode in="coloredBlur"/>
        <feMergeNode in="SourceGraphic"/>
      </feMerge>
    </filter>
    
    <filter id="intense-glow-${card.id}" x="-50%" y="-50%" width="200%" height="200%">
      <feGaussianBlur stdDeviation="40" result="coloredBlur"/>
      <feMerge>
        <feMergeNode in="coloredBlur"/>
        <feMergeNode in="coloredBlur"/>
        <feMergeNode in="SourceGraphic"/>
      </feMerge>
    </filter>` : ''}
    
    <!-- Clipping path for circular elements -->
    <clipPath id="circle-clip-${card.id}">
      <circle cx="256" cy="256" r="120"/>
    </clipPath>
  </defs>
  
  <!-- Multi-layered background -->
  <rect width="512" height="512" fill="url(#bg-gradient-${card.id})"/>
  
  <!-- Diagonal stripe overlay for texture -->
  <rect width="512" height="512" fill="url(#diagonal-gradient-${card.id})"/>
  
  <!-- Corner radiance effects -->
  <g fill="${rarity.accent}" fill-opacity="0.08">
    <circle cx="0" cy="0" r="150"/>
    <circle cx="512" cy="0" r="150"/>
    <circle cx="0" cy="512" r="150"/>
    <circle cx="512" cy="512" r="150"/>
  </g>
  
  <!-- Subtle concentric circles at center -->
  <g fill="${rarity.accent}" fill-opacity="0.03">
    <circle cx="256" cy="256" r="220"/>
    <circle cx="256" cy="256" r="180"/>
    <circle cx="256" cy="256" r="140"/>
    <circle cx="256" cy="256" r="100"/>
  </g>
  
  <!-- Legendary glow background -->
  ${isLegendary ? `
  <circle cx="256" cy="256" r="200" fill="url(#center-glow-${card.id})">
    <animate attributeName="r" values="180;220;180" dur="4s" repeatCount="indefinite"/>
  </circle>
  
  <circle cx="256" cy="256" r="160" fill="url(#glow-gradient-${card.id})" filter="url(#glow-${card.id})">
    <animate attributeName="opacity" values="0.4;0.7;0.4" dur="3s" repeatCount="indefinite"/>
  </circle>` : ''}
  
  <!-- Geometric decorative pattern -->
  <g fill="${rarity.accent}" fill-opacity="${isRareOrBetter ? 0.18 : 0.12}">
    <!-- Corner circles -->
    <circle cx="64" cy="64" r="24"/>
    <circle cx="448" cy="64" r="20"/>
    <circle cx="64" cy="448" r="20"/>
    <circle cx="448" cy="448" r="24"/>
    
    <!-- Horizontal bars -->
    <rect x="176" y="56" width="160" height="6" rx="3"/>
    <rect x="176" y="450" width="160" height="6" rx="3"/>
    
    <!-- Vertical bars -->
    <rect x="56" y="176" width="6" height="160" rx="3"/>
    <rect x="450" y="176" width="6" height="160" rx="3"/>
  </g>
  
  <!-- Central icon container with enhanced effects -->
  <g transform="translate(256, 256)" filter="url(#shadow-${card.id})">
    <!-- Outer ring with gradient stroke -->
    <circle cx="0" cy="0" r="130" fill="${rarity.secondary}" fill-opacity="0.15" stroke="${rarity.accent}" stroke-width="2" stroke-opacity="0.4"/>
    
    <!-- Inner ring -->
    <circle cx="0" cy="0" r="110" fill="${rarity.primary}" fill-opacity="0.25" stroke="${rarity.accent}" stroke-width="1.5" stroke-opacity="0.3"/>
    
    <!-- Main circle background -->
    <circle cx="0" cy="0" r="95" fill="${rarity.secondary}" fill-opacity="0.4"/>
    
    <!-- Highlight circle -->
    <circle cx="0" cy="0" r="85" fill="${rarity.primary}" fill-opacity="0.6"/>
    
    <!-- Dad type symbol with glow -->
    <g filter="${isRareOrBetter ? 'url(#intense-glow-016)' : 'none'}">
      <text x="0" y="24" text-anchor="middle" font-size="72" font-family="system-ui, sans-serif" filter="url(#shadow-${card.id})">
        ${typeConfig.symbol}
      </text>
    </g>
    
    <!-- Rarity-specific effects -->
    ${isMythic ? `
    <!-- Mythic prismatic effect - multiple colored rings -->
    <g opacity="0.3">
      <circle cx="0" cy="0" r="140" stroke="#ec4899" stroke-width="2" fill="none" stroke-opacity="0.5">
        <animate attributeName="r" values="140;145;140" dur="2s" repeatCount="indefinite"/>
        <animate attributeName="stroke-opacity" values="0.5;0.2;0.5" dur="2s" repeatCount="indefinite"/>
      </circle>
      <circle cx="0" cy="0" r="145" stroke="#8b5cf6" stroke-width="2" fill="none" stroke-opacity="0.4">
        <animate attributeName="r" values="145;150;145" dur="2s" repeatCount="indefinite" begin="0.5s"/>
        <animate attributeName="stroke-opacity" values="0.4;0.1;0.4" dur="2s" repeatCount="indefinite" begin="0.5s"/>
      </circle>
      <circle cx="0" cy="0" r="150" stroke="#06b6d4" stroke-width="2" fill="none" stroke-opacity="0.3">
        <animate attributeName="r" values="150;155;150" dur="2s" repeatCount="indefinite" begin="1s"/>
        <animate attributeName="stroke-opacity" values="0.3;0;0.3" dur="2s" repeatCount="indefinite" begin="1s"/>
      </circle>
    </g>` : ''}
    
    ${card.rarity === 'legendary' ? `
    <!-- Legendary golden sparkles -->
    <g fill="${rarity.accent}">
      ${[0, 0.5, 1, 1.5].map(delay => `
      <circle cx="${Math.cos(delay * Math.PI * 2) * 100}" cy="${Math.sin(delay * Math.PI * 2) * 100}" r="5">
        <animate attributeName="opacity" values="0;1;0" dur="2s" repeatCount="indefinite" begin="${delay}s"/>
      </circle>`).join('')}
    </g>` : ''}
    
    <!-- Rotating outer ring for rare+ -->
    ${isRareOrBetter ? `
    <circle cx="0" cy="0" r="160" stroke="${rarity.accent}" stroke-width="1" fill="none" stroke-opacity="0.2" stroke-dasharray="10 5">
      <animateTransform attributeName="transform" type="rotate" from="0" to="360" dur="20s" repeatCount="indefinite"/>
    </circle>` : ''}
  </g>
  
  <!-- Enhanced card name banner with gradient -->
  <g transform="translate(0, 420)">
    <!-- Banner background with gradient -->
    <rect x="16" y="0" width="480" height="64" rx="10" fill="${rarity.secondary}" fill-opacity="0.85" filter="url(#shadow-${card.id})"/>
    
    <!-- Inner highlight -->
    <rect x="20" y="4" width="472" height="56" rx="8" fill="none" stroke="${rarity.accent}" stroke-width="1.5" stroke-opacity="0.3"/>
    
    <!-- Card name with shadow -->
    <text x="256" y="28" text-anchor="middle" fill="${rarity.accent}" font-family="system-ui, sans-serif" font-weight="bold" font-size="16" letter-spacing="1" opacity="0.6">
      ${card.name.toUpperCase()}
    </text>
    <text x="256" y="42" text-anchor="middle" fill="white" font-family="system-ui, sans-serif" font-weight="bold" font-size="20" letter-spacing="1">
      ${card.name}
    </text>
  </g>
  
  <!-- Enhanced rarity indicator badge -->
  <g transform="translate(456, 60)" filter="url(#shadow-${card.id})">
    <!-- Badge background -->
    <circle cx="0" cy="0" r="44" fill="${rarity.primary}" stroke="${rarity.accent}" stroke-width="3"/>
    
    <!-- Inner ring -->
    <circle cx="0" cy="0" r="36" fill="none" stroke="white" stroke-width="1.5" stroke-opacity="0.3"/>
    
    <!-- Rarity letter -->
    <text x="0" y="8" text-anchor="middle" fill="white" font-family="system-ui, sans-serif" font-weight="bold" font-size="28">
      ${card.rarity.charAt(0).toUpperCase()}
    </text>
    
    <!-- Stars based on rarity -->
    <g transform="translate(-24, 28)" fill="${rarity.accent}" font-size="8">
      ${getRarityStars(card.rarity).map((_, i) => `<text x="${i * 12}" y="0">★</text>`).join('')}
    </g>
  </g>
  
  <!-- Holographic overlays -->
  ${card.isHolo ? `
  <!-- Prismatic holo gradient -->
  <defs>
    <linearGradient id="holo-gradient-${card.id}" x1="0%" y1="0%" x2="100%" y2="100%" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="#ff0000" stop-opacity="0.15"/>
      <stop offset="20%" stop-color="#ff8800" stop-opacity="0.12"/>
      <stop offset="40%" stop-color="#ffff00" stop-opacity="0.15"/>
      <stop offset="60%" stop-color="#00ff00" stop-opacity="0.12"/>
      <stop offset="80%" stop-color="#0088ff" stop-opacity="0.15"/>
      <stop offset="100%" stop-color="#ff00ff" stop-opacity="0.12"/>
    </linearGradient>
    
    ${card.holoType === 'prismatic' ? `
    <radialGradient id="prismatic-spot-${card.id}" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="white" stop-opacity="0.3"/>
      <stop offset="100%" stop-color="transparent" stop-opacity="0"/>
    </radialGradient>` : ''}
  </defs>
  
  <!-- Holo overlay layer -->
  <g style="mix-blend-mode: color-dodge;">
    <rect width="512" height="512" fill="url(#holo-gradient-${card.id})"/>
    
    ${card.holoType === 'prismatic' ? `
    <!-- Prismatic spot effect -->
    <ellipse cx="128" cy="128" rx="80" ry="40" fill="url(#prismatic-spot-${card.id})">
      <animate attributeName="cx" values="128;256;384;128" dur="8s" repeatCount="indefinite"/>
      <animate attributeName="cy" values="128;256;384;128" dur="8s" repeatCount="indefinite" begin="2s"/>
    </ellipse>` : ''}
  </g>
  
  <!-- Holo sparkle lines -->
  <g stroke="white" stroke-width="1.5" stroke-linecap="round" opacity="0.4">
    <line x1="120" y1="140" x2="140" y2="160">
      <animate attributeName="opacity" values="0;1;0" dur="3s" repeatCount="indefinite"/>
    </line>
    <line x1="372" y1="180" x2="392" y2="160">
      <animate attributeName="opacity" values="0;1;0" dur="3s" repeatCount="indefinite" begin="1s"/>
    </line>
    <line x1="150" y1="352" x2="170" y2="372">
      <animate attributeName="opacity" values="0;1;0" dur="3s" repeatCount="indefinite" begin="2s"/>
    </line>
  </g>` : ''}
</svg>`;

  return svg;
}

// Get number of stars based on rarity
function getRarityStars(rarity) {
  const starMap = {
    common: 1,
    uncommon: 2,
    rare: 3,
    epic: 4,
    legendary: 5,
    mythic: 6,
  };
  return Array(starMap[rarity] || 1).fill(0);
}

// Add holographic variants to random cards
function addHoloVariants(cards) {
  const cardsWithHolo = cards.map(card => {
    // 15% chance of being holographic
    const isHolo = Math.random() < 0.15;
    
    // If holo, determine variant type
    let holoType = 'none';
    if (isHolo) {
      // Higher rarities more likely to get better holo variants
      const weightedVariants = {
        common: ['standard', 'standard', 'standard', 'reverse'],
        uncommon: ['standard', 'standard', 'reverse', 'reverse'],
        rare: ['standard', 'reverse', 'reverse', 'full_art'],
        epic: ['reverse', 'reverse', 'full_art', 'full_art'],
        legendary: ['full_art', 'full_art', 'prismatic'],
        mythic: ['prismatic']
      };
      const availableVariants = weightedVariants[card.rarity] || ['standard'];
      holoType = availableVariants[Math.floor(Math.random() * availableVariants.length)];
    }
    
    return {
      ...card,
      isHolo,
      holoType,
      artwork: card.artwork || `/cards/${card.id.toLowerCase().replace(/[^a-z0-9]/g, '-')}.svg`
    };
  });
  
  return cardsWithHolo;
}

// Update cards with holo variants
const cardsWithHolo = addHoloVariants(cards);

// Create public/cards directory
const outputDir = path.join(__dirname, '../public/cards');
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
  console.log(`Created directory: ${outputDir}`);
}

// Generate SVG files
console.log('Generating card artwork with holo variants...');
let generated = 0;
let holoCount = 0;

cardsWithHolo.forEach(card => {
  const filename = path.basename(card.artwork); // Extract filename from path
  const filepath = path.join(outputDir, filename);
  
  const svg = generateCardSVG(card);
  fs.writeFileSync(filepath, svg);
  generated++;
  
  if (card.isHolo) holoCount++;
});

console.log(`✅ Generated ${generated} card SVG files`);
console.log(`   - ${holoCount} holographic variants (${Math.round(holoCount/generated*100)}% of cards)`);
console.log(`   - Output directory: ${outputDir}`);

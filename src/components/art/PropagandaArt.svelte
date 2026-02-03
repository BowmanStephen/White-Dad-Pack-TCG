<script lang="ts">
/**
 * PROPAGANDA ART GENERATOR
 *
 * Creates Soviet constructivist-style artwork for each card.
 * Heroic silhouettes, radiating sunbursts, angular geometric shapes.
 *
 * "THE BACKYARD BELONGS TO THE PEOPLE"
 */
import { onMount } from 'svelte';
import type { Card } from '@/types';
import { createSeededRandom } from '@lib/utils/seeded-random';

interface PropagandaPalette {
  primary: string;
  secondary: string;
  accent: string;
  highlight: string;
}

interface Props {
  card: Card;
  width?: number;
  height?: number;
  palette: PropagandaPalette;
}

let { card, width = 280, height = 180, palette }: Props = $props();

let canvas: HTMLCanvasElement;
let isGenerated = $state(false);

// Dad type to silhouette mapping - heroic poses
const silhouetteConfigs: Record<string, { type: string; props: string[] }> = {
  BBQ_DICKTATOR: { type: 'grill_master', props: ['spatula', 'smoke'] },
  BBQ_BRAWLER: { type: 'grill_master', props: ['tongs', 'flames'] },
  COUCH_CUMMANDER: { type: 'seated_hero', props: ['remote', 'crown'] },
  LAWN_LUNATIC: { type: 'lawn_warrior', props: ['mower', 'grass'] },
  FIX_IT_FUCKBOY: { type: 'tool_bearer', props: ['hammer', 'wrench'] },
  FASHION_FUCK: { type: 'style_icon', props: ['sandal', 'sock'] },
  CAR_COCK: { type: 'driver', props: ['steering', 'keys'] },
  GOLF_GONAD: { type: 'golfer', props: ['club', 'flag'] },
  OFFICE_ORGASMS: { type: 'office_hero', props: ['briefcase', 'tie'] },
  COOL_CUCKS: { type: 'cool_pose', props: ['shades', 'finger_guns'] },
  COACH_CUMSTERS: { type: 'coach', props: ['whistle', 'clipboard'] },
  CHEF_CUMSTERS: { type: 'chef', props: ['hat', 'pan'] },
  WAREHOUSE_WANKERS: { type: 'shopper', props: ['cart', 'card'] },
  HOLIDAY_HORNDOGS: { type: 'festive', props: ['lights', 'star'] },
  VINTAGE_VAGABONDS: { type: 'vintage', props: ['vinyl', 'headphones'] },
  TECH_TWATS: { type: 'tech_hero', props: ['laptop', 'cable'] },
  GAMER_GIZZARDS: { type: 'gamer', props: ['controller', 'headset'] },
  PREPPER_PENIS: { type: 'survivalist', props: ['backpack', 'flashlight'] },
  SUBURBAN_SOCIALITE: { type: 'socialite', props: ['wine', 'phone'] },
  NEIGHBORHOOD_NOSY: { type: 'watcher', props: ['binoculars', 'fence'] },
  SON_SPAWNS: { type: 'youth', props: ['ball', 'cap'] },
  DAUGHTER_DINGBATS: { type: 'youth', props: ['bow', 'star'] },
  UNCLE_UPROARS: { type: 'uncle', props: ['beer', 'cigar'] },
  ITEM: { type: 'item_pedestal', props: ['glow', 'rays'] },
  EVENT: { type: 'explosion', props: ['lightning', 'burst'] },
  TERRAIN: { type: 'landscape', props: ['grass', 'fence'] },
  EVOLUTION: { type: 'transform', props: ['arrow', 'spiral'] },
  CURSE: { type: 'doom', props: ['skull', 'chains'] },
  TRAP: { type: 'trap', props: ['cage', 'spring'] },
};

function generateArt() {
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  const rng = createSeededRandom(card.id);

  // Clear
  ctx.clearRect(0, 0, width, height);

  // Draw layers
  drawBackground(ctx, rng);
  drawSunburst(ctx, rng);
  drawGeometricAccents(ctx, rng);
  drawHeroicSilhouette(ctx, rng);
  drawPropagandaElements(ctx, rng);
  addGrainTexture(ctx);

  isGenerated = true;
}

function drawBackground(ctx: CanvasRenderingContext2D, rng: ReturnType<typeof createSeededRandom>) {
  // Dramatic diagonal gradient
  const gradAngle = rng.next() * 0.3 + 0.1; // Slight variation
  const grad = ctx.createLinearGradient(0, 0, width * gradAngle, height);

  grad.addColorStop(0, palette.primary);
  grad.addColorStop(0.4, adjustColor(palette.primary, 15));
  grad.addColorStop(1, palette.primary);

  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, width, height);

  // Diagonal stripe overlay
  ctx.save();
  ctx.globalAlpha = 0.08;
  const stripeWidth = 20;
  ctx.fillStyle = palette.secondary;

  for (let x = -height; x < width + height; x += stripeWidth * 2) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x + height, height);
    ctx.lineTo(x + height + stripeWidth, height);
    ctx.lineTo(x + stripeWidth, 0);
    ctx.closePath();
    ctx.fill();
  }
  ctx.restore();
}

function drawSunburst(ctx: CanvasRenderingContext2D, rng: ReturnType<typeof createSeededRandom>) {
  const centerX = width * (0.4 + rng.next() * 0.2);
  const centerY = height * (0.3 + rng.next() * 0.2);
  const rayCount = 16 + Math.floor(rng.next() * 8);

  ctx.save();

  // Outer glow
  const glowGrad = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, width * 0.8);
  glowGrad.addColorStop(0, palette.accent + '40');
  glowGrad.addColorStop(0.5, palette.accent + '10');
  glowGrad.addColorStop(1, 'transparent');

  ctx.fillStyle = glowGrad;
  ctx.fillRect(0, 0, width, height);

  // Rays
  ctx.globalAlpha = 0.15;
  for (let i = 0; i < rayCount; i++) {
    const angle = (i / rayCount) * Math.PI * 2;
    const rayLength = width * (0.8 + rng.next() * 0.4);
    const rayWidth = ((Math.PI * 2) / rayCount) * (0.3 + rng.next() * 0.4);

    ctx.fillStyle = i % 2 === 0 ? palette.secondary : palette.accent;
    ctx.beginPath();
    ctx.moveTo(centerX, centerY);
    ctx.arc(centerX, centerY, rayLength, angle - rayWidth / 2, angle + rayWidth / 2);
    ctx.closePath();
    ctx.fill();
  }

  ctx.restore();
}

function drawGeometricAccents(
  ctx: CanvasRenderingContext2D,
  rng: ReturnType<typeof createSeededRandom>
) {
  ctx.save();
  ctx.globalAlpha = 0.2;

  // Angular shapes in corners
  const shapes = 3 + Math.floor(rng.next() * 3);

  for (let i = 0; i < shapes; i++) {
    const corner = Math.floor(rng.next() * 4);
    let x, y;

    switch (corner) {
      case 0:
        x = 0;
        y = 0;
        break;
      case 1:
        x = width;
        y = 0;
        break;
      case 2:
        x = 0;
        y = height;
        break;
      default:
        x = width;
        y = height;
    }

    const size = 30 + rng.next() * 50;

    ctx.fillStyle = rng.next() > 0.5 ? palette.secondary : palette.accent;
    ctx.beginPath();

    // Draw angular shape
    if (rng.next() > 0.5) {
      // Triangle
      ctx.moveTo(x, y);
      ctx.lineTo(x + (corner === 1 || corner === 3 ? -size : size), y);
      ctx.lineTo(x, y + (corner >= 2 ? -size : size));
    } else {
      // Diamond
      const halfSize = size / 2;
      const dirX = corner === 1 || corner === 3 ? -1 : 1;
      const dirY = corner >= 2 ? -1 : 1;
      ctx.moveTo(x + dirX * halfSize, y);
      ctx.lineTo(x + dirX * size, y + dirY * halfSize);
      ctx.lineTo(x + dirX * halfSize, y + dirY * size);
      ctx.lineTo(x, y + dirY * halfSize);
    }

    ctx.closePath();
    ctx.fill();
  }

  // Bold angular lines
  ctx.strokeStyle = palette.accent;
  ctx.lineWidth = 2;
  ctx.globalAlpha = 0.25;

  const lineCount = 2 + Math.floor(rng.next() * 2);
  for (let i = 0; i < lineCount; i++) {
    const startX = rng.next() * width * 0.3;
    const endX = width - rng.next() * width * 0.3;
    const y = height * (0.1 + rng.next() * 0.3);

    ctx.beginPath();
    ctx.moveTo(startX, y + rng.next() * 20);
    ctx.lineTo(endX, y - rng.next() * 20);
    ctx.stroke();
  }

  ctx.restore();
}

function drawHeroicSilhouette(
  ctx: CanvasRenderingContext2D,
  rng: ReturnType<typeof createSeededRandom>
) {
  const config = silhouetteConfigs[card.type] || { type: 'generic', props: ['star'] };

  ctx.save();

  // Position hero
  const heroX = width * 0.5;
  const heroY = height * 0.55;
  const heroScale = height * 0.6;

  ctx.fillStyle = palette.secondary;
  ctx.strokeStyle = palette.accent;
  ctx.lineWidth = 2;

  // Draw based on type
  switch (config.type) {
    case 'grill_master':
      drawGrillMaster(ctx, heroX, heroY, heroScale, rng);
      break;
    case 'seated_hero':
      drawSeatedHero(ctx, heroX, heroY, heroScale, rng);
      break;
    case 'lawn_warrior':
      drawLawnWarrior(ctx, heroX, heroY, heroScale, rng);
      break;
    case 'tool_bearer':
      drawToolBearer(ctx, heroX, heroY, heroScale, rng);
      break;
    case 'style_icon':
      drawStyleIcon(ctx, heroX, heroY, heroScale, rng);
      break;
    case 'driver':
      drawDriver(ctx, heroX, heroY, heroScale, rng);
      break;
    case 'golfer':
      drawGolfer(ctx, heroX, heroY, heroScale, rng);
      break;
    case 'office_hero':
      drawOfficeHero(ctx, heroX, heroY, heroScale, rng);
      break;
    case 'item_pedestal':
      drawItemPedestal(ctx, heroX, heroY, heroScale, rng);
      break;
    case 'explosion':
      drawExplosion(ctx, heroX, heroY, heroScale, rng);
      break;
    default:
      drawGenericHero(ctx, heroX, heroY, heroScale, rng);
  }

  ctx.restore();
}

// Heroic pose drawing functions
function drawGrillMaster(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  scale: number,
  rng: ReturnType<typeof createSeededRandom>
) {
  const s = scale * 0.8;

  // Body - heroic stance
  ctx.beginPath();
  // Torso
  ctx.moveTo(x - s * 0.2, y - s * 0.5);
  ctx.lineTo(x + s * 0.2, y - s * 0.5);
  ctx.lineTo(x + s * 0.25, y + s * 0.1);
  ctx.lineTo(x - s * 0.25, y + s * 0.1);
  ctx.closePath();
  ctx.fill();

  // Head
  ctx.beginPath();
  ctx.arc(x, y - s * 0.65, s * 0.15, 0, Math.PI * 2);
  ctx.fill();

  // Arm raised with spatula
  ctx.beginPath();
  ctx.moveTo(x + s * 0.2, y - s * 0.4);
  ctx.lineTo(x + s * 0.5, y - s * 0.7);
  ctx.lineTo(x + s * 0.55, y - s * 0.65);
  ctx.lineTo(x + s * 0.25, y - s * 0.35);
  ctx.closePath();
  ctx.fill();

  // Spatula
  ctx.fillStyle = palette.accent;
  ctx.beginPath();
  ctx.rect(x + s * 0.45, y - s * 0.9, s * 0.15, s * 0.25);
  ctx.fill();

  // Grill below
  ctx.fillStyle = palette.secondary;
  ctx.beginPath();
  ctx.ellipse(x, y + s * 0.25, s * 0.4, s * 0.1, 0, 0, Math.PI * 2);
  ctx.fill();

  // Smoke/steam lines
  ctx.strokeStyle = palette.highlight;
  ctx.lineWidth = 2;
  ctx.globalAlpha = 0.6;
  for (let i = 0; i < 3; i++) {
    const sx = x - s * 0.2 + i * s * 0.2;
    ctx.beginPath();
    ctx.moveTo(sx, y + s * 0.15);
    ctx.bezierCurveTo(sx - s * 0.1, y - s * 0.1, sx + s * 0.1, y - s * 0.2, sx, y - s * 0.35);
    ctx.stroke();
  }
}

function drawSeatedHero(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  scale: number,
  rng: ReturnType<typeof createSeededRandom>
) {
  const s = scale * 0.9;

  // Throne/chair shape
  ctx.beginPath();
  ctx.moveTo(x - s * 0.4, y - s * 0.3);
  ctx.lineTo(x - s * 0.45, y + s * 0.4);
  ctx.lineTo(x + s * 0.45, y + s * 0.4);
  ctx.lineTo(x + s * 0.4, y - s * 0.3);
  ctx.lineTo(x + s * 0.35, y - s * 0.5);
  ctx.lineTo(x - s * 0.35, y - s * 0.5);
  ctx.closePath();
  ctx.fill();

  // Seated figure
  ctx.fillStyle = palette.accent;
  // Torso
  ctx.beginPath();
  ctx.moveTo(x - s * 0.15, y - s * 0.35);
  ctx.lineTo(x + s * 0.15, y - s * 0.35);
  ctx.lineTo(x + s * 0.2, y + s * 0.1);
  ctx.lineTo(x - s * 0.2, y + s * 0.1);
  ctx.closePath();
  ctx.fill();

  // Head with crown
  ctx.beginPath();
  ctx.arc(x, y - s * 0.5, s * 0.12, 0, Math.PI * 2);
  ctx.fill();

  // Crown
  ctx.fillStyle = palette.highlight;
  ctx.beginPath();
  ctx.moveTo(x - s * 0.1, y - s * 0.6);
  ctx.lineTo(x - s * 0.12, y - s * 0.75);
  ctx.lineTo(x - s * 0.05, y - s * 0.65);
  ctx.lineTo(x, y - s * 0.8);
  ctx.lineTo(x + s * 0.05, y - s * 0.65);
  ctx.lineTo(x + s * 0.12, y - s * 0.75);
  ctx.lineTo(x + s * 0.1, y - s * 0.6);
  ctx.closePath();
  ctx.fill();

  // Remote in hand
  ctx.fillStyle = palette.secondary;
  ctx.fillRect(x + s * 0.15, y - s * 0.15, s * 0.08, s * 0.2);
}

function drawLawnWarrior(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  scale: number,
  rng: ReturnType<typeof createSeededRandom>
) {
  const s = scale * 0.85;

  // Heroic standing figure
  ctx.beginPath();
  // Body
  ctx.moveTo(x - s * 0.15, y - s * 0.4);
  ctx.lineTo(x + s * 0.15, y - s * 0.4);
  ctx.lineTo(x + s * 0.12, y + s * 0.15);
  ctx.lineTo(x - s * 0.12, y + s * 0.15);
  ctx.closePath();
  ctx.fill();

  // Head
  ctx.beginPath();
  ctx.arc(x, y - s * 0.55, s * 0.12, 0, Math.PI * 2);
  ctx.fill();

  // Legs in power stance
  ctx.beginPath();
  ctx.moveTo(x - s * 0.1, y + s * 0.15);
  ctx.lineTo(x - s * 0.2, y + s * 0.45);
  ctx.lineTo(x - s * 0.12, y + s * 0.45);
  ctx.lineTo(x, y + s * 0.2);
  ctx.lineTo(x + s * 0.12, y + s * 0.45);
  ctx.lineTo(x + s * 0.2, y + s * 0.45);
  ctx.lineTo(x + s * 0.1, y + s * 0.15);
  ctx.closePath();
  ctx.fill();

  // Lawnmower
  ctx.fillStyle = palette.accent;
  ctx.beginPath();
  ctx.rect(x - s * 0.5, y + s * 0.3, s * 0.4, s * 0.15);
  ctx.fill();

  // Handle
  ctx.strokeStyle = palette.secondary;
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(x - s * 0.3, y + s * 0.3);
  ctx.lineTo(x - s * 0.1, y - s * 0.1);
  ctx.stroke();

  // Grass pattern
  ctx.strokeStyle = palette.highlight;
  ctx.lineWidth = 1;
  ctx.globalAlpha = 0.5;
  for (let i = 0; i < 8; i++) {
    const gx = x - s * 0.4 + i * s * 0.12;
    ctx.beginPath();
    ctx.moveTo(gx, y + s * 0.45);
    ctx.lineTo(gx + rng.next() * s * 0.05, y + s * 0.35);
    ctx.stroke();
  }
}

function drawToolBearer(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  scale: number,
  rng: ReturnType<typeof createSeededRandom>
) {
  const s = scale * 0.85;

  // Figure holding tools aloft
  ctx.beginPath();
  ctx.moveTo(x - s * 0.2, y - s * 0.35);
  ctx.lineTo(x + s * 0.2, y - s * 0.35);
  ctx.lineTo(x + s * 0.15, y + s * 0.2);
  ctx.lineTo(x - s * 0.15, y + s * 0.2);
  ctx.closePath();
  ctx.fill();

  // Head
  ctx.beginPath();
  ctx.arc(x, y - s * 0.5, s * 0.12, 0, Math.PI * 2);
  ctx.fill();

  // Arms raised
  ctx.beginPath();
  ctx.moveTo(x - s * 0.2, y - s * 0.3);
  ctx.lineTo(x - s * 0.4, y - s * 0.6);
  ctx.lineTo(x - s * 0.35, y - s * 0.65);
  ctx.lineTo(x - s * 0.15, y - s * 0.35);
  ctx.closePath();
  ctx.fill();

  ctx.beginPath();
  ctx.moveTo(x + s * 0.2, y - s * 0.3);
  ctx.lineTo(x + s * 0.4, y - s * 0.6);
  ctx.lineTo(x + s * 0.35, y - s * 0.65);
  ctx.lineTo(x + s * 0.15, y - s * 0.35);
  ctx.closePath();
  ctx.fill();

  // Hammer
  ctx.fillStyle = palette.accent;
  ctx.beginPath();
  ctx.rect(x - s * 0.5, y - s * 0.75, s * 0.2, s * 0.1);
  ctx.fill();
  ctx.fillRect(x - s * 0.42, y - s * 0.65, s * 0.04, s * 0.15);

  // Wrench
  ctx.beginPath();
  ctx.rect(x + s * 0.3, y - s * 0.8, s * 0.15, s * 0.06);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(x + s * 0.45, y - s * 0.77, s * 0.05, 0, Math.PI * 2);
  ctx.fill();
}

function drawStyleIcon(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  scale: number,
  rng: ReturnType<typeof createSeededRandom>
) {
  const s = scale * 0.8;

  // Posed figure
  ctx.beginPath();
  ctx.moveTo(x - s * 0.15, y - s * 0.35);
  ctx.lineTo(x + s * 0.2, y - s * 0.4);
  ctx.lineTo(x + s * 0.15, y + s * 0.1);
  ctx.lineTo(x - s * 0.1, y + s * 0.15);
  ctx.closePath();
  ctx.fill();

  // Head tilted
  ctx.beginPath();
  ctx.arc(x + s * 0.05, y - s * 0.52, s * 0.12, 0, Math.PI * 2);
  ctx.fill();

  // Leg showing sock + sandal
  ctx.beginPath();
  ctx.moveTo(x - s * 0.05, y + s * 0.15);
  ctx.lineTo(x - s * 0.15, y + s * 0.5);
  ctx.lineTo(x, y + s * 0.5);
  ctx.lineTo(x + s * 0.05, y + s * 0.2);
  ctx.closePath();
  ctx.fill();

  // Sock (white)
  ctx.fillStyle = palette.highlight;
  ctx.beginPath();
  ctx.rect(x - s * 0.12, y + s * 0.35, s * 0.14, s * 0.15);
  ctx.fill();

  // Sandal
  ctx.fillStyle = palette.accent;
  ctx.beginPath();
  ctx.ellipse(x - s * 0.05, y + s * 0.52, s * 0.12, s * 0.04, 0, 0, Math.PI * 2);
  ctx.fill();
}

function drawDriver(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  scale: number,
  rng: ReturnType<typeof createSeededRandom>
) {
  const s = scale * 0.85;

  // Car silhouette
  ctx.beginPath();
  ctx.moveTo(x - s * 0.5, y + s * 0.2);
  ctx.lineTo(x - s * 0.4, y);
  ctx.lineTo(x - s * 0.2, y - s * 0.1);
  ctx.lineTo(x + s * 0.1, y - s * 0.1);
  ctx.lineTo(x + s * 0.3, y);
  ctx.lineTo(x + s * 0.5, y + s * 0.2);
  ctx.lineTo(x + s * 0.5, y + s * 0.35);
  ctx.lineTo(x - s * 0.5, y + s * 0.35);
  ctx.closePath();
  ctx.fill();

  // Driver silhouette in window
  ctx.fillStyle = palette.accent;
  ctx.beginPath();
  ctx.arc(x - s * 0.1, y - s * 0.2, s * 0.1, 0, Math.PI * 2);
  ctx.fill();

  // Wheels
  ctx.fillStyle = palette.highlight;
  ctx.beginPath();
  ctx.arc(x - s * 0.3, y + s * 0.35, s * 0.08, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(x + s * 0.3, y + s * 0.35, s * 0.08, 0, Math.PI * 2);
  ctx.fill();

  // Keys dangling
  ctx.strokeStyle = palette.accent;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(x + s * 0.15, y - s * 0.05);
  ctx.lineTo(x + s * 0.25, y + s * 0.1);
  ctx.stroke();
  ctx.fillStyle = palette.accent;
  ctx.beginPath();
  ctx.arc(x + s * 0.25, y + s * 0.12, s * 0.04, 0, Math.PI * 2);
  ctx.fill();
}

function drawGolfer(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  scale: number,
  rng: ReturnType<typeof createSeededRandom>
) {
  const s = scale * 0.85;

  // Follow-through pose
  ctx.beginPath();
  ctx.moveTo(x - s * 0.1, y - s * 0.3);
  ctx.lineTo(x + s * 0.15, y - s * 0.35);
  ctx.lineTo(x + s * 0.2, y + s * 0.15);
  ctx.lineTo(x - s * 0.05, y + s * 0.2);
  ctx.closePath();
  ctx.fill();

  // Head
  ctx.beginPath();
  ctx.arc(x + s * 0.05, y - s * 0.5, s * 0.12, 0, Math.PI * 2);
  ctx.fill();

  // Arms in swing
  ctx.beginPath();
  ctx.moveTo(x + s * 0.15, y - s * 0.3);
  ctx.lineTo(x + s * 0.5, y - s * 0.5);
  ctx.lineTo(x + s * 0.45, y - s * 0.55);
  ctx.lineTo(x + s * 0.1, y - s * 0.35);
  ctx.closePath();
  ctx.fill();

  // Golf club
  ctx.strokeStyle = palette.accent;
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(x + s * 0.5, y - s * 0.5);
  ctx.lineTo(x + s * 0.65, y - s * 0.7);
  ctx.stroke();

  // Club head
  ctx.fillStyle = palette.accent;
  ctx.beginPath();
  ctx.rect(x + s * 0.6, y - s * 0.75, s * 0.12, s * 0.06);
  ctx.fill();

  // Flag in distance
  ctx.strokeStyle = palette.highlight;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(x - s * 0.4, y + s * 0.4);
  ctx.lineTo(x - s * 0.4, y);
  ctx.stroke();
  ctx.fillStyle = palette.highlight;
  ctx.beginPath();
  ctx.moveTo(x - s * 0.4, y);
  ctx.lineTo(x - s * 0.25, y + s * 0.08);
  ctx.lineTo(x - s * 0.4, y + s * 0.15);
  ctx.closePath();
  ctx.fill();
}

function drawOfficeHero(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  scale: number,
  rng: ReturnType<typeof createSeededRandom>
) {
  const s = scale * 0.85;

  // Confident stance
  ctx.beginPath();
  ctx.moveTo(x - s * 0.2, y - s * 0.35);
  ctx.lineTo(x + s * 0.2, y - s * 0.35);
  ctx.lineTo(x + s * 0.18, y + s * 0.15);
  ctx.lineTo(x - s * 0.18, y + s * 0.15);
  ctx.closePath();
  ctx.fill();

  // Head
  ctx.beginPath();
  ctx.arc(x, y - s * 0.5, s * 0.12, 0, Math.PI * 2);
  ctx.fill();

  // Tie
  ctx.fillStyle = palette.accent;
  ctx.beginPath();
  ctx.moveTo(x, y - s * 0.35);
  ctx.lineTo(x + s * 0.05, y - s * 0.1);
  ctx.lineTo(x, y);
  ctx.lineTo(x - s * 0.05, y - s * 0.1);
  ctx.closePath();
  ctx.fill();

  // Briefcase
  ctx.fillStyle = palette.secondary;
  ctx.beginPath();
  ctx.rect(x + s * 0.2, y - s * 0.05, s * 0.25, s * 0.18);
  ctx.fill();
  ctx.strokeStyle = palette.accent;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(x + s * 0.28, y - s * 0.05);
  ctx.lineTo(x + s * 0.28, y - s * 0.1);
  ctx.lineTo(x + s * 0.38, y - s * 0.1);
  ctx.lineTo(x + s * 0.38, y - s * 0.05);
  ctx.stroke();
}

function drawItemPedestal(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  scale: number,
  rng: ReturnType<typeof createSeededRandom>
) {
  const s = scale * 0.8;

  // Pedestal
  ctx.beginPath();
  ctx.moveTo(x - s * 0.3, y + s * 0.4);
  ctx.lineTo(x - s * 0.2, y + s * 0.1);
  ctx.lineTo(x + s * 0.2, y + s * 0.1);
  ctx.lineTo(x + s * 0.3, y + s * 0.4);
  ctx.closePath();
  ctx.fill();

  // Glowing orb (item)
  const orbGrad = ctx.createRadialGradient(x, y - s * 0.15, 0, x, y - s * 0.15, s * 0.25);
  orbGrad.addColorStop(0, palette.highlight);
  orbGrad.addColorStop(0.5, palette.accent);
  orbGrad.addColorStop(1, 'transparent');
  ctx.fillStyle = orbGrad;
  ctx.beginPath();
  ctx.arc(x, y - s * 0.15, s * 0.25, 0, Math.PI * 2);
  ctx.fill();

  // Inner glow
  ctx.fillStyle = palette.highlight;
  ctx.beginPath();
  ctx.arc(x, y - s * 0.15, s * 0.1, 0, Math.PI * 2);
  ctx.fill();

  // Rays
  ctx.strokeStyle = palette.accent;
  ctx.lineWidth = 2;
  ctx.globalAlpha = 0.6;
  for (let i = 0; i < 8; i++) {
    const angle = (i / 8) * Math.PI * 2;
    ctx.beginPath();
    ctx.moveTo(x + Math.cos(angle) * s * 0.15, y - s * 0.15 + Math.sin(angle) * s * 0.15);
    ctx.lineTo(x + Math.cos(angle) * s * 0.35, y - s * 0.15 + Math.sin(angle) * s * 0.35);
    ctx.stroke();
  }
}

function drawExplosion(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  scale: number,
  rng: ReturnType<typeof createSeededRandom>
) {
  const s = scale * 0.9;

  // Central burst
  ctx.fillStyle = palette.accent;
  const points = 12;
  ctx.beginPath();
  for (let i = 0; i < points * 2; i++) {
    const angle = (i / (points * 2)) * Math.PI * 2;
    const radius = i % 2 === 0 ? s * 0.4 : s * 0.2;
    const px = x + Math.cos(angle) * radius;
    const py = y + Math.sin(angle) * radius;
    if (i === 0) ctx.moveTo(px, py);
    else ctx.lineTo(px, py);
  }
  ctx.closePath();
  ctx.fill();

  // Lightning bolts
  ctx.strokeStyle = palette.highlight;
  ctx.lineWidth = 3;
  for (let i = 0; i < 4; i++) {
    const angle = (i / 4) * Math.PI * 2 + Math.PI / 4;
    const startX = x + Math.cos(angle) * s * 0.15;
    const startY = y + Math.sin(angle) * s * 0.15;
    const endX = x + Math.cos(angle) * s * 0.5;
    const endY = y + Math.sin(angle) * s * 0.5;

    ctx.beginPath();
    ctx.moveTo(startX, startY);
    ctx.lineTo(startX + (endX - startX) * 0.4, startY + (endY - startY) * 0.3);
    ctx.lineTo(startX + (endX - startX) * 0.5, startY + (endY - startY) * 0.6);
    ctx.lineTo(endX, endY);
    ctx.stroke();
  }
}

function drawGenericHero(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  scale: number,
  rng: ReturnType<typeof createSeededRandom>
) {
  const s = scale * 0.85;

  // Heroic standing pose
  ctx.beginPath();
  ctx.moveTo(x - s * 0.2, y - s * 0.4);
  ctx.lineTo(x + s * 0.2, y - s * 0.4);
  ctx.lineTo(x + s * 0.25, y + s * 0.15);
  ctx.lineTo(x - s * 0.25, y + s * 0.15);
  ctx.closePath();
  ctx.fill();

  // Head
  ctx.beginPath();
  ctx.arc(x, y - s * 0.55, s * 0.15, 0, Math.PI * 2);
  ctx.fill();

  // Arms akimbo
  ctx.beginPath();
  ctx.moveTo(x - s * 0.2, y - s * 0.3);
  ctx.lineTo(x - s * 0.4, y - s * 0.15);
  ctx.lineTo(x - s * 0.35, y - s * 0.1);
  ctx.lineTo(x - s * 0.15, y - s * 0.25);
  ctx.closePath();
  ctx.fill();

  ctx.beginPath();
  ctx.moveTo(x + s * 0.2, y - s * 0.3);
  ctx.lineTo(x + s * 0.4, y - s * 0.15);
  ctx.lineTo(x + s * 0.35, y - s * 0.1);
  ctx.lineTo(x + s * 0.15, y - s * 0.25);
  ctx.closePath();
  ctx.fill();

  // Star accent
  ctx.fillStyle = palette.accent;
  drawStar(ctx, x, y - s * 0.75, s * 0.1, 5);
}

function drawStar(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  size: number,
  points: number
) {
  ctx.beginPath();
  for (let i = 0; i < points * 2; i++) {
    const angle = (i / (points * 2)) * Math.PI * 2 - Math.PI / 2;
    const radius = i % 2 === 0 ? size : size * 0.4;
    const px = cx + Math.cos(angle) * radius;
    const py = cy + Math.sin(angle) * radius;
    if (i === 0) ctx.moveTo(px, py);
    else ctx.lineTo(px, py);
  }
  ctx.closePath();
  ctx.fill();
}

function drawPropagandaElements(
  ctx: CanvasRenderingContext2D,
  rng: ReturnType<typeof createSeededRandom>
) {
  ctx.save();
  ctx.globalAlpha = 0.15;

  // Banner strips
  ctx.fillStyle = palette.accent;

  if (rng.next() > 0.5) {
    // Top banner strip
    ctx.fillRect(0, height * 0.02, width, height * 0.03);
  }

  if (rng.next() > 0.5) {
    // Bottom banner strip
    ctx.fillRect(0, height * 0.95, width, height * 0.03);
  }

  // Gear/cog accents in corners
  if (rng.next() > 0.6) {
    ctx.strokeStyle = palette.secondary;
    ctx.lineWidth = 1;
    ctx.globalAlpha = 0.1;

    const gearX = rng.next() > 0.5 ? width * 0.1 : width * 0.9;
    const gearY = rng.next() > 0.5 ? height * 0.15 : height * 0.85;
    const gearSize = width * 0.08;

    ctx.beginPath();
    ctx.arc(gearX, gearY, gearSize, 0, Math.PI * 2);
    ctx.stroke();

    // Gear teeth
    for (let i = 0; i < 8; i++) {
      const angle = (i / 8) * Math.PI * 2;
      ctx.beginPath();
      ctx.moveTo(gearX + Math.cos(angle) * gearSize, gearY + Math.sin(angle) * gearSize);
      ctx.lineTo(
        gearX + Math.cos(angle) * (gearSize + 5),
        gearY + Math.sin(angle) * (gearSize + 5)
      );
      ctx.stroke();
    }
  }

  ctx.restore();
}

function addGrainTexture(ctx: CanvasRenderingContext2D) {
  ctx.save();
  ctx.globalAlpha = 0.03;

  const imageData = ctx.getImageData(0, 0, width, height);
  const data = imageData.data;

  for (let i = 0; i < data.length; i += 4) {
    const noise = (Math.random() - 0.5) * 50;
    data[i] += noise;
    data[i + 1] += noise;
    data[i + 2] += noise;
  }

  ctx.putImageData(imageData, 0, 0);
  ctx.restore();
}

function adjustColor(hex: string, amount: number): string {
  const num = parseInt(hex.replace('#', ''), 16);
  const r = Math.min(255, Math.max(0, (num >> 16) + amount));
  const g = Math.min(255, Math.max(0, ((num >> 8) & 0x00ff) + amount));
  const b = Math.min(255, Math.max(0, (num & 0x0000ff) + amount));
  return `#${((1 << 24) | (r << 16) | (g << 8) | b).toString(16).slice(1)}`;
}

onMount(() => {
  generateArt();
});

$effect(() => {
  if (card.id && canvas) {
    generateArt();
  }
});
</script>

<div class="propaganda-art-container" style="width: {width}px; height: {height}px;">
  <canvas
    bind:this={canvas}
    {width}
    {height}
    class="propaganda-canvas"
    class:loaded={isGenerated}
    aria-label="Propaganda style artwork for {card.name}"
  ></canvas>

  {#if !isGenerated}
    <div class="loading-placeholder" style="background: {palette.primary};">
      <div class="loading-spinner"></div>
    </div>
  {/if}
</div>

<style>
.propaganda-art-container {
  position: relative;
  overflow: hidden;
}

.propaganda-canvas {
  display: block;
  width: 100%;
  height: 100%;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.propaganda-canvas.loaded {
  opacity: 1;
}

.loading-placeholder {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
}

.loading-spinner {
  width: 24px;
  height: 24px;
  border: 3px solid rgba(255, 255, 255, 0.2);
  border-top-color: rgba(255, 255, 255, 0.8);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

@media (prefers-reduced-motion: reduce) {
  .propaganda-canvas {
    transition: none;
  }
  .loading-spinner {
    animation: none;
  }
}
</style>

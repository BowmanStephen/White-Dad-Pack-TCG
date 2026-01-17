<script lang="ts">
  import type { Rarity } from '../../types';
  import { RARITY_CONFIG } from '../../types';
  import { getParticleMultiplier } from '../../stores/ui';
  import { onMount, onDestroy } from 'svelte';

  interface Props {
    rarity: Rarity;
    active?: boolean;
  }

  let { rarity, active = false }: Props = $props();

  const config = RARITY_CONFIG[rarity];
  const isLegendaryPlus = rarity === 'legendary' || rarity === 'mythic';

  // Object pool for confetti particles (performance optimization)
  const MAX_POOL_SIZE = 300;
  const pool: ConfettiParticle[] = [];
  const activeParticles: Set<ConfettiParticle> = new Set();

  // Confetti count based on rarity (legendary+ only)
  const baseConfettiCount = isLegendaryPlus ? (rarity === 'mythic' ? 150 : 100) : 0;

  let canvas: HTMLCanvasElement;
  let ctx: CanvasRenderingContext2D;
  let animationId: number | null = null;
  let isRunning = false;
  let autoClearTimer: number | null = null;

  // Particle multiplier for performance scaling
  const particleMultiplier = getParticleMultiplier();
  const adjustedConfettiCount = Math.floor(baseConfettiCount * particleMultiplier);

  /**
   * Confetti particle with physics properties
   */
  class ConfettiParticle {
    id: number;
    x: number;
    y: number;
    vx: number;
    vy: number;
    rotation: number;
    rotationSpeed: number;
    width: number;
    height: number;
    color: string;
    opacity: number;
    active: boolean = false;

    constructor(id: number) {
      this.id = id;
      this.reset();
    }

    reset(canvasWidth: number, canvasHeight: number, colors: string[]): void {
      // Spawn from center with random spread
      this.x = canvasWidth / 2 + (Math.random() - 0.5) * 100;
      this.y = canvasHeight / 2 + (Math.random() - 0.5) * 100;

      // Random velocity in all directions (explosive burst)
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * 15 + 5;
      this.vx = Math.cos(angle) * speed;
      this.vy = Math.sin(angle) * speed - 5; // Initial upward bias

      // Rotation properties
      this.rotation = Math.random() * 360;
      this.rotationSpeed = (Math.random() - 0.5) * 20;

      // Size variation
      this.width = Math.random() * 10 + 6;
      this.height = this.width * (Math.random() * 0.5 + 0.5); // Aspect ratio 1:1 to 1:2

      // Color from rarity theme
      this.color = colors[Math.floor(Math.random() * colors.length)];
      this.opacity = 1;
      this.active = true;
    }

    update(gravity: number, drag: number): void {
      if (!this.active) return;

      // Apply physics
      this.vy += gravity; // Gravity pulls down
      this.vx *= drag; // Air resistance
      this.vy *= drag;

      // Update position
      this.x += this.vx;
      this.y += this.vy;

      // Update rotation
      this.rotation += this.rotationSpeed;

      // Fade out based on lifetime
      this.opacity -= 0.003;

      // Deactivate if faded or out of bounds (with margin)
      if (
        this.opacity <= 0 ||
        this.y > 2000 ||
        this.x < -500 ||
        this.x > 2000
      ) {
        this.active = false;
      }
    }

    draw(ctx: CanvasRenderingContext2D): void {
      if (!this.active || this.opacity <= 0) return;

      ctx.save();
      ctx.translate(this.x, this.y);
      ctx.rotate((this.rotation * Math.PI) / 180);
      ctx.globalAlpha = this.opacity;
      ctx.fillStyle = this.color;

      // Draw confetti as rectangle
      ctx.fillRect(-this.width / 2, -this.height / 2, this.width, this.height);

      ctx.restore();
    }
  }

  // Color palette for confetti (matches rarity theme)
  const confettiColors: Record<Rarity, string[]> = {
    common: ['#9ca3af', '#d1d5db', '#f3f4f6'],
    uncommon: ['#60a5fa', '#93c5fd', '#bfdbfe', '#3b82f6'],
    rare: ['#fbbf24', '#fcd34d', '#fde047', '#eab308', '#f59e0b'],
    epic: ['#a855f7', '#c084fc', '#d8b4fe', '#9333ea', '#a855f7'],
    legendary: ['#f97316', '#fb923c', '#fdba74', '#ea580c', '#f97316', '#fcd34d'],
    mythic: ['#ec4899', '#f472b6', '#f9a8d4', '#db2777', '#ec4899', '#f0abfc', '#fbbf24', '#f97316'],
  };

  /**
   * Initialize object pool on mount
   */
  onMount(() => {
    if (!canvas) return;

    ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return;

    // Set canvas size to match container
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Initialize object pool
    for (let i = 0; i < MAX_POOL_SIZE; i++) {
      pool.push(new ConfettiParticle(i));
    }

    // Start animation when activated
    if (active && adjustedConfettiCount > 0) {
      startConfetti();
    }
  });

  onDestroy(() => {
    stopConfetti();
    window.removeEventListener('resize', resizeCanvas);
  });

  /**
   * Resize canvas to match container
   */
  function resizeCanvas(): void {
    if (!canvas) return;
    const rect = canvas.parentElement?.getBoundingClientRect();
    if (rect) {
      canvas.width = rect.width;
      canvas.height = rect.height;
    }
  }

  /**
   * Start confetti animation
   */
  function startConfetti(): void {
    if (isRunning || adjustedConfettiCount === 0) return;

    isRunning = true;
    activeParticles.clear();

    // Spawn confetti from pool
    const colors = confettiColors[rarity];
    let spawned = 0;

    for (const particle of pool) {
      if (spawned >= adjustedConfettiCount) break;

      if (!particle.active) {
        if (canvas) {
          particle.reset(canvas.width, canvas.height, colors);
        }
        activeParticles.add(particle);
        spawned++;
      }
    }

    // Start animation loop
    animate();

    // Auto-clear after 3 seconds
    if (autoClearTimer) clearTimeout(autoClearTimer);
    autoClearTimer = window.setTimeout(() => {
      stopConfetti();
    }, 3000);
  }

  /**
   * Stop confetti animation
   */
  function stopConfetti(): void {
    isRunning = false;
    if (animationId !== null) {
      cancelAnimationFrame(animationId);
      animationId = null;
    }
    if (autoClearTimer) {
      clearTimeout(autoClearTimer);
      autoClearTimer = null;
    }
    activeParticles.clear();

    // Clear canvas
    if (ctx && canvas) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
  }

  /**
   * Animation loop with physics
   */
  function animate(): void {
    if (!isRunning || !ctx || !canvas) return;

    // Clear canvas with slight trail effect (optional)
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Physics constants
    const gravity = 0.3; // Downward acceleration
    const drag = 0.99; // Air resistance

    // Update and draw all active particles
    for (const particle of activeParticles) {
      if (particle.active) {
        particle.update(gravity, drag);
        particle.draw(ctx);
      } else {
        // Return inactive particles to pool
        activeParticles.delete(particle);
      }
    }

    // Continue animation if particles remain
    if (activeParticles.size > 0) {
      animationId = requestAnimationFrame(animate);
    } else {
      isRunning = false;
    }
  }

  /**
   * React to active prop changes
   */
  $effect(() => {
    if (active && adjustedConfettiCount > 0) {
      startConfetti();
    } else {
      stopConfetti();
    }
  });
</script>

{#if isLegendaryPlus && adjustedConfettiCount > 0}
  <canvas
    bind:this={canvas}
    class="absolute inset-0 pointer-events-none"
    style="z-index: 50;"
  ></canvas>
{/if}

<style>
  canvas {
    width: 100%;
    height: 100%;
    display: block;
  }
</style>

<script lang="ts">
  import type { CardStats, Rarity } from '../../types';
  import { STAT_NAMES, STAT_ICONS } from '../../types';
  import { onMount } from 'svelte';

  export let stats: CardStats;
  export let size: number = 200;
  export let rarity: Rarity = 'rare';

  // Chart configuration
  const center = size / 2;
  const radius = size * 0.35; // Leave room for labels
  const maxStatValue = 100;

  // Stat keys in order for the radar chart
  const statKeys: (keyof CardStats)[] = [
    'dadJoke',
    'grillSkill',
    'fixIt',
    'napPower',
    'remoteControl',
    'thermostat',
    'sockSandal',
    'beerSnob'
  ];

  // Hover state
  let hoveredAxis: number | null = null;

  // Get color based on stat value
  $: getStatColor = (value: number) => {
    if (value >= 80) return '#22c55e'; // Green for high
    if (value >= 60) return '#3b82f6'; // Blue for medium
    if (value >= 40) return '#f59e0b'; // Orange for average
    return '#ef4444'; // Red for low
  };

  // Get rarity color
  $: rarityColor = {
    common: '#9ca3af',
    uncommon: '#3b82f6',
    rare: '#eab308',
    epic: '#a855f7',
    legendary: '#f97316',
    mythic: '#ec4899'
  }[rarity];

  // Calculate point position for radar chart
  function getPoint(index: number, value: number): { x: number; y: number } {
    const angle = (Math.PI * 2 * index) / statKeys.length - Math.PI / 2;
    const distance = (value / maxStatValue) * radius;
    return {
      x: center + distance * Math.cos(angle),
      y: center + distance * Math.sin(angle)
    };
  }

  // Generate polygon points for the data
  $: dataPoints = statKeys
    .map((key, i) => {
      const value = stats[key] || 0;
      const point = getPoint(i, value);
      return `${point.x},${point.y}`;
    })
    .join(' ');

  // Generate background grid (concentric octagons)
  $: gridLevels = [20, 40, 60, 80, 100];

  // Get axis label position
  function getLabelPosition(index: number): { x: number; y: number } {
    const angle = (Math.PI * 2 * index) / statKeys.length - Math.PI / 2;
    const labelRadius = radius * 1.25; // Position labels outside the chart
    return {
      x: center + labelRadius * Math.cos(angle),
      y: center + labelRadius * Math.sin(angle)
    };
  }

  // Format stat name for display
  function formatStatName(key: keyof CardStats): string {
    const names: Record<keyof CardStats, string> = {
      dadJoke: 'Joke',
      grillSkill: 'Grill',
      fixIt: 'Fix-It',
      napPower: 'Nap',
      remoteControl: 'Remote',
      thermostat: 'Thermo',
      sockSandal: 'Sock',
      beerSnob: 'Beer'
    };
    return names[key] || key;
  }

  // Handle axis hover
  function handleAxisHover(index: number) {
    hoveredAxis = index;
  }

  function handleAxisLeave() {
    hoveredAxis = null;
  }

  // Get stat value for display
  $: hoveredStatValue = hoveredAxis !== null ? stats[statKeys[hoveredAxis]] : null;
  $: hoveredStatName = hoveredAxis !== null ? STAT_NAMES[statKeys[hoveredAxis]] : null;
  $: hoveredStatIcon = hoveredAxis !== null ? STAT_ICONS[statKeys[hoveredAxis]] : null;
</script>

<div class="radar-chart-container" style="width: {size}px; height: {size}px;">
  <svg
    width={size}
    height={size}
    viewBox="0 0 {size} {size}"
    class="radar-chart"
    aria-label="Card stats radar chart"
    role="img"
  >
    <!-- Background grid (concentric octagons) -->
    {#each gridLevels as level}
      {@const points = statKeys.map((_, i) => getPoint(i, level)).map(p => `${p.x},${p.y}`).join(' ')}
      <polygon
        points={points}
        fill="none"
        stroke="currentColor"
        stroke-width="0.5"
        class="grid-level opacity-20"
      />
    {/each}

    <!-- Axis lines -->
    {#each statKeys as _, i}
      {@const point = getPoint(i, 100)}
      {@const labelPos = getLabelPosition(i)}
      <line
        x1={center}
        y1={center}
        x2={point.x}
        y2={point.y}
        stroke="currentColor"
        stroke-width="0.5"
        class="axis-line opacity-30 {hoveredAxis === i ? 'opacity-80' : ''}"
        on:mouseenter={() => handleAxisHover(i)}
        on:mouseleave={handleAxisLeave}
      />

      <!-- Axis labels -->
      <text
        x={labelPos.x}
        y={labelPos.y}
        text-anchor="middle"
        dominant-baseline="middle"
        class="axis-label text-[8px] fill-current opacity-70 {hoveredAxis === i ? 'opacity-100 font-bold' : ''}"
        on:mouseenter={() => handleAxisHover(i)}
        on:mouseleave={handleAxisLeave}
      >
        {formatStatName(statKeys[i])}
      </text>
    {/each}

    <!-- Data polygon -->
    <polygon
      points={dataPoints}
      fill="{rarityColor}33"
      stroke={rarityColor}
      stroke-width="2"
      class="data-polygon transition-all duration-300"
    />

    <!-- Data points -->
    {#each statKeys as key, i}
      {@const point = getPoint(i, stats[key] || 0)}
      {@const color = getStatColor(stats[key] || 0)}
      <circle
        cx={point.x}
        cy={point.y}
        r="3"
        fill={color}
        stroke="white"
        stroke-width="1"
        class="data-point transition-all duration-200 {hoveredAxis === i ? 'r-4' : ''}"
        on:mouseenter={() => handleAxisHover(i)}
        on:mouseleave={handleAxisLeave}
      />
    {/each}

    <!-- Center point -->
    <circle
      cx={center}
      cy={center}
      r="2"
      fill="currentColor"
      class="opacity-50"
    />
  </svg>

  <!-- Hover tooltip -->
  {#if hoveredAxis !== null && hoveredStatValue !== null}
    <div class="radar-tooltip">
      <div class="tooltip-header">
        <span class="tooltip-icon">{hoveredStatIcon}</span>
        <span class="tooltip-name">{hoveredStatName}</span>
      </div>
      <div class="tooltip-value" style="color: {getStatColor(hoveredStatValue)}">
        {hoveredStatValue}
      </div>
    </div>
  {/if}
</div>

<style>
  .radar-chart-container {
    position: relative;
    display: inline-block;
  }

  .radar-chart {
    display: block;
    color: currentColor;
  }

  .grid-level {
    transition: all 0.3s ease;
  }

  .axis-line {
    transition: all 0.3s ease;
  }

  .axis-label {
    font-family: system-ui, -apple-system, sans-serif;
    cursor: pointer;
    transition: all 0.2s ease;
    user-select: none;
  }

  .data-polygon {
    filter: drop-shadow(0 0 4px currentColor);
  }

  .data-polygon:hover {
    filter: drop-shadow(0 0 8px currentColor);
  }

  .data-point {
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .data-point:hover {
    r: 5;
    filter: drop-shadow(0 0 4px currentColor);
  }

  .radar-tooltip {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    background: rgba(15, 23, 42, 0.95);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 8px;
    padding: 8px 12px;
    pointer-events: none;
    z-index: 10;
    backdrop-filter: blur(8px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
    animation: tooltip-appear 0.2s ease;
  }

  @keyframes tooltip-appear {
    from {
      opacity: 0;
      transform: translate(-50%, -50%) scale(0.9);
    }
    to {
      opacity: 1;
      transform: translate(-50%, -50%) scale(1);
    }
  }

  .tooltip-header {
    display: flex;
    align-items: center;
    gap: 6px;
    margin-bottom: 4px;
  }

  .tooltip-icon {
    font-size: 12px;
  }

  .tooltip-name {
    font-size: 10px;
    font-weight: 600;
    color: #94a3b8;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }

  .tooltip-value {
    font-size: 18px;
    font-weight: 700;
    text-align: center;
  }

  /* Responsive sizing */
  @media (max-width: 640px) {
    .radar-tooltip {
      padding: 6px 10px;
    }

    .tooltip-icon {
      font-size: 10px;
    }

    .tooltip-name {
      font-size: 9px;
    }

    .tooltip-value {
      font-size: 16px;
    }
  }
</style>

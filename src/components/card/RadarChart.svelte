<script lang="ts">
  import type { CardStats, Rarity } from '@/types';

  interface Props {
    stats: CardStats;
    rarity: Rarity;
    size?: number;
  }

  let {
    stats,
    rarity,
    size = 220,
  }: Props = $props();

  const statKeys: (keyof CardStats)[] = [
    'dadJoke',
    'grillSkill',
    'fixIt',
    'napPower',
    'remoteControl',
    'thermostat',
    'sockSandal',
    'beerSnob',
  ];

  const statNames: Record<keyof CardStats, string> = {
    dadJoke: 'Dad Joke',
    grillSkill: 'Grill Skill',
    fixIt: 'Fix-It',
    napPower: 'Nap Power',
    remoteControl: 'Remote Control',
    thermostat: 'Thermostat',
    sockSandal: 'Sock & Sandal',
    beerSnob: 'Beer Snob',
  };

  const rarityColors: Record<Rarity, string> = {
    common: '#a0aec0',
    uncommon: '#4299e1',
    rare: '#f6e05e',
    epic: '#b794f4',
    legendary: '#f56565',
    mythic: '#ed64a6',
  };

  const angleSlice = $derived((Math.PI * 2) / statKeys.length);
  const radius = $derived(size / 2);
  const center = $derived(size / 2);

  const gridLevels = 5;
  const gridLines = $derived(Array.from({ length: gridLevels }, (_, i) => {
    const r = radius * ((i + 1) / gridLevels);
    return statKeys.map((key, j) => {
      const angle = angleSlice * j - Math.PI / 2;
      const x = center + r * Math.cos(angle);
      const y = center + r * Math.sin(angle);
      return { x, y };
    });
  }));

  const axisLines = $derived(statKeys.map((_, i) => {
    const angle = angleSlice * i - Math.PI / 2;
    const x = center + radius * Math.cos(angle);
    const y = center + radius * Math.sin(angle);
    return { x1: center, y1: center, x2: x, y2: y };
  }));

  const axisLabels = $derived(statKeys.map((key, i) => {
    const angle = angleSlice * i - Math.PI / 2;
    const r = radius * 1.1;
    const x = center + r * Math.cos(angle);
    const y = center + r * Math.sin(angle);
    return { x, y, text: statNames[key], dominantBaseline: y < center ? 'alphabetic' : 'hanging' };
  }));

  const dataPoints = $derived(statKeys.map((key, i) => {
    const value = stats[key] / 100;
    const r = radius * value;
    const angle = angleSlice * i - Math.PI / 2;
    const x = center + r * Math.cos(angle);
    const y = center + r * Math.sin(angle);
    return `${x},${y}`;
  }).join(' '));
</script>

<svg width={size} height={size} viewBox="0 0 {size} {size}" aria-label="Card stats radar chart">
  <g class="grid">
    {#each gridLines as grid, i}
      <polygon
        points={grid.map(p => `${p.x},${p.y}`).join(' ')}
        fill="none"
        stroke="#4a5568"
        stroke-width="0.5"
      />
    {/each}
  </g>

  <g class="axes">
    {#each axisLines as line}
      <line {...line} stroke="#4a5568" stroke-width="0.5" />
    {/each}
  </g>

  <g class="labels">
    {#each axisLabels as label}
      <text
        x={label.x}
        y={label.y}
        fill="#a0aec0"
        font-size="10"
        text-anchor="middle"
        dominant-baseline={label.dominantBaseline}
      >
        {label.text}
      </text>
    {/each}
  </g>

  <g class="data">
    <polygon
      points={dataPoints}
      fill={rarityColors[rarity]}
      fill-opacity="0.4"
      stroke={rarityColors[rarity]}
      stroke-width="1.5"
    />
  </g>
</svg>

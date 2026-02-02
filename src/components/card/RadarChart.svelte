<script lang="ts">
  import type { CardStats, Rarity } from '../../types';

  export let stats: CardStats;
  export let rarity: Rarity;
  export let size: number = 220;

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

  $: angleSlice = (Math.PI * 2) / statKeys.length;
  $: radius = size / 2;
  $: center = size / 2;

  $: gridLevels = 5;
  $: gridLines = Array.from({ length: gridLevels }, (_, i) => {
    const r = radius * ((i + 1) / gridLevels);
    return statKeys.map((key, j) => {
      const angle = angleSlice * j - Math.PI / 2;
      const x = center + r * Math.cos(angle);
      const y = center + r * Math.sin(angle);
      return { x, y };
    });
  });

  $: axisLines = statKeys.map((_, i) => {
    const angle = angleSlice * i - Math.PI / 2;
    const x = center + radius * Math.cos(angle);
    const y = center + radius * Math.sin(angle);
    return { x1: center, y1: center, x2: x, y2: y };
  });

  $: axisLabels = statKeys.map((key, i) => {
    const angle = angleSlice * i - Math.PI / 2;
    const r = radius * 1.1;
    const x = center + r * Math.cos(angle);
    const y = center + r * Math.sin(angle);
    return { x, y, text: statNames[key], dominantBaseline: y < center ? 'alphabetic' : 'hanging' };
  });

  $: dataPoints = statKeys.map((key, i) => {
    const value = stats[key] / 100;
    const r = radius * value;
    const angle = angleSlice * i - Math.PI / 2;
    const x = center + r * Math.cos(angle);
    const y = center + r * Math.sin(angle);
    return `${x},${y}`;
  }).join(' ');
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

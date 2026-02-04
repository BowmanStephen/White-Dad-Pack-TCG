<script lang="ts">
  import AnimatedNumber from '@/components/common/AnimatedNumber.svelte';

  let count = $state(0);
  let balance = $state(100);
  let change = $state(0);
  let noColorCount = $state(0);

  let stats = $state({
    dadJoke: 50,
    grillSkill: 60
  });
</script>

<div class="animated-number-demo">
  <h1 class="text-3xl font-bold mb-8">AnimatedNumber Component Demo</h1>

  <!-- Demo 1: Basic Counter -->
  <section class="mb-8">
    <h2 class="text-xl font-semibold mb-4">Basic Counter</h2>
    <p class="mb-2">
      Current value: <AnimatedNumber {count} />
    </p>
    <div class="flex gap-2">
      <button onclick={() => (count -= 10)} class="btn-primary">-10</button>
      <button onclick={() => (count -= 1)} class="btn-primary">-1</button>
      <button onclick={() => (count += 1)} class="btn-primary">+1</button>
      <button onclick={() => (count += 10)} class="btn-primary">+10</button>
    </div>
  </section>

  <!-- Demo 2: Currency -->
  <section class="mb-8">
    <h2 class="text-xl font-semibold mb-4">Currency (with decimals)</h2>
    <p class="mb-2">
      Balance: $<AnimatedNumber value={balance} decimals={2} />
    </p>
    <div class="flex gap-2">
      <button onclick={() => (balance -= 50)} class="btn-primary">-$50</button>
      <button onclick={() => (balance -= 10)} class="btn-primary">-$10</button>
      <button onclick={() => (balance += 10)} class="btn-primary">+$10</button>
      <button onclick={() => (balance += 50)} class="btn-primary">+$50</button>
    </div>
  </section>

  <!-- Demo 3: With Sign -->
  <section class="mb-8">
    <h2 class="text-xl font-semibold mb-4">With +/- Sign</h2>
    <p class="mb-2">
      Change: <AnimatedNumber value={change} showSign={true} />
    </p>
    <div class="flex gap-2">
      <button onclick={() => (change = -100)} class="btn-primary">-100</button>
      <button onclick={() => (change = 0)} class="btn-primary">0</button>
      <button onclick={() => (change = 100)} class="btn-primary">+100</button>
    </div>
  </section>

  <!-- Demo 4: Stats -->
  <section class="mb-8">
    <h2 class="text-xl font-semibold mb-4">Stats (Long Duration)</h2>
    <p class="mb-2">
      Dad Joke: <AnimatedNumber value={stats.dadJoke} duration={1000} />
    </p>
    <p class="mb-2">
      Grill Skill: <AnimatedNumber value={stats.grillSkill} duration={1000} />
    </p>
    <div class="flex gap-2">
      <button
        onclick={() => (stats = { dadJoke: 50, grillSkill: 60 })}
        class="btn-primary">Low Stats</button
      >
      <button
        onclick={() => (stats = { dadJoke: 75, grillSkill: 85 })}
        class="btn-primary">Med Stats</button
      >
      <button
        onclick={() => (stats = { dadJoke: 95, grillSkill: 99 })}
        class="btn-primary">Max Stats</button
      >
    </div>
  </section>

  <!-- Demo 5: Without Color Change -->
  <section class="mb-8">
    <h2 class="text-xl font-semibold mb-4">Without Color Change</h2>
    <p class="mb-2">
      Count: <AnimatedNumber value={noColorCount} colorChange={false} />
    </p>
    <div class="flex gap-2">
      <button onclick={() => (noColorCount -= 5)} class="btn-primary">-5</button>
      <button onclick={() => (noColorCount += 5)} class="btn-primary">+5</button>
    </div>
  </section>

  <!-- Usage Example -->
  <section class="mb-8 p-4 bg-gray-100 dark:bg-gray-800 rounded">
    <h2 class="text-xl font-semibold mb-4">Usage Example</h2>
    <pre class="text-sm overflow-x-auto"
      ><code>&lt;AnimatedNumber
  value={1234}
  duration={500}
  decimals={2}
  showSign={true}
  colorChange={true}
/&gt;</code
    ></pre>
  </section>
</div>

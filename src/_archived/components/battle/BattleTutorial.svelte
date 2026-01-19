<script lang="ts">
  import type { PackCard } from '../../types';
  import Card from '../card/Card.svelte';

  interface Props {
    isOpen?: boolean;
    onComplete?: () => void;
    onSkip?: () => void;
  }

  let { isOpen = false, onComplete = () => {}, onSkip = () => {} }: Props = $props();

  // Local reactive state for tutorial
  let currentStep = $state(0);
  let practiceCard = $state<PackCard | null>(null);
  let practiceOpponent = $state<PackCard | null>(null);
  let showPractice = $state(false);
  let isTransitioning = $state(false);

  type TutorialStep = {
    id: number;
    title: string;
    content: string;
    position: 'top' | 'bottom' | 'left' | 'right' | 'center';
    target?: string;
    action?: string;
  };

  const steps: TutorialStep[] = [
    {
      id: 1,
      title: 'Welcome to Card Battles! 👊',
      content: 'Battles are turn-based fights where your card\'s stats determine the outcome. Higher stats mean better performance!',
      position: 'center'
    },
    {
      id: 2,
      title: 'Choose Your Fighter 🎯',
      content: 'Click any card from your collection to select it for battle. Each card has unique stats like Grill Skill, Dad Joke, and more.',
      position: 'bottom',
      target: '.card-picker',
      action: 'Select a card from your collection'
    },
    {
      id: 3,
      title: 'Meet Your Opponent 🤖',
      content: 'The game automatically selects a random opponent card for you. You can click "Roll Opponent" to get a different match-up.',
      position: 'bottom',
      target: '.duel-slot:last-child',
      action: 'Opponent is auto-selected'
    },
    {
      id: 4,
      title: 'Type Advantages ⚔️',
      content: 'Certain dad types have advantages over others! For example, BBQ_DAD beats FIX_IT_DAD. Check the battle log for type bonuses.',
      position: 'right',
      target: '.duel-divider'
    },
    {
      id: 5,
      title: 'Start the Battle! ⚡',
      content: 'Click "Start Duel" to begin the battle. Cards will attack each other automatically based on their stats and type advantages.',
      position: 'top',
      target: '.duel-controls',
      action: 'Click "Start Duel"'
    },
    {
      id: 6,
      title: 'Watch the Combat 💥',
      content: 'Damage numbers pop up during battle. Red numbers show damage, and yellow indicates critical hits! The battle log shows all the action.',
      position: 'center',
      action: 'Battle runs automatically'
    },
    {
      id: 7,
      title: 'Victory or Defeat! 🏆',
      content: 'The card with the most HP remaining wins. Try different cards to find the best match-ups! Higher rarity cards usually have better stats.',
      position: 'center'
    }
  ];

  function nextStep() {
    if (currentStep < steps.length - 1) {
      isTransitioning = true;
      setTimeout(() => {
        currentStep++;
        isTransitioning = false;
      }, 300);
    } else {
      completeTutorial();
    }
  }

  function prevStep() {
    if (currentStep > 0) {
      isTransitioning = true;
      setTimeout(() => {
        currentStep--;
        isTransitioning = false;
      }, 300);
    }
  }

  function skipTutorial() {
    if (confirm('Skip the battle tutorial? You can always access it later from the battle page.')) {
      onSkip();
    }
  }

  function completeTutorial() {
    onComplete();
  }

  function startPracticeBattle() {
    showPractice = true;
    // Create practice cards with balanced stats
    practiceCard = {
      id: 'practice-player',
      name: 'Practice Dad',
      subtitle: 'The Tutorial Warrior',
      type: 'BBQ_DAD',
      rarity: 'rare',
      stats: {
        dadJoke: 70,
        grillSkill: 80,
        fixIt: 60,
        napPower: 50,
        remoteControl: 65,
        thermostat: 70,
        sockSandal: 55,
        beerSnob: 75
      },
      abilities: [],
      flavorText: 'Here to help you learn the ropes!',
      isHolo: false,
      holoType: 'none',
      obtainedAt: new Date().toISOString(),
      series: 0,
      cardNumber: 0,
      totalInSeries: 0
    };

    practiceOpponent = {
      id: 'practice-ai',
      name: 'Training Bot',
      subtitle: 'AI Opponent',
      type: 'FIX_IT_DAD', // BBQ_DAD has advantage
      rarity: 'uncommon',
      stats: {
        dadJoke: 50,
        grillSkill: 40,
        fixIt: 85,
        napPower: 45,
        remoteControl: 60,
        thermostat: 50,
        sockSandal: 40,
        beerSnob: 35
      },
      abilities: [],
      flavorText: 'Practice makes perfect!',
      isHolo: false,
      holoType: 'none',
      obtainedAt: new Date().toISOString(),
      series: 0,
      cardNumber: 0,
      totalInSeries: 0
    };
  }
</script>

{#if isOpen}
  <div class="tutorial-overlay">
    {#if !showPractice}
      <div class="tutorial-content" class:transitioning={isTransitioning}>
        <div class="tutorial-header">
          <div class="step-indicator">
            Step {currentStep + 1} of {steps.length}
          </div>
          <button class="skip-btn" on:click={skipTutorial}>Skip Tutorial</button>
        </div>

        <div class="tutorial-body">
          <h2 class="tutorial-title">{steps[currentStep].title}</h2>
          <p class="tutorial-text">{steps[currentStep].content}</p>

          {#if steps[currentStep].action}
            <div class="tutorial-action">
              <span class="action-icon">→</span>
              <span>{steps[currentStep].action}</span>
            </div>
          {/if}
        </div>

        <div class="tutorial-footer">
          <div class="progress-dots">
            {#each steps as step, index}
              <div
                class="dot"
                class:active={index === currentStep}
                class:completed={index < currentStep}
              ></div>
            {/each}
          </div>

          <div class="navigation-buttons">
            {#if currentStep > 0}
              <button class="nav-btn secondary" on:click={prevStep}>← Previous</button>
            {/if}
            <button class="nav-btn primary" on:click={nextStep}>
              {currentStep === steps.length - 1 ? 'Complete' : 'Next →'}
            </button>
          </div>
        </div>
      </div>
    {:else}
      <div class="practice-battle">
        <div class="practice-header">
          <h2>⚔️ Practice Battle</h2>
          <p>Try a battle with balanced practice cards!</p>
          <button class="close-practice" on:click={() => showPractice = false}>← Back to Tutorial</button>
        </div>

        <div class="practice-stage">
          <div class="practice-slot">
            <h3>Your Card</h3>
            {#if practiceCard}
              <Card card={practiceCard} size="sm" interactive={false} showBack={false} />
              <div class="practice-info">
                <span class="type-badge">BBQ_DAD</span>
                <span class="advantage-badge">⚔️ Advantage</span>
              </div>
            {/if}
          </div>

          <div class="practice-vs">
            <span>VS</span>
          </div>

          <div class="practice-slot">
            <h3>AI Opponent</h3>
            {#if practiceOpponent}
              <Card card={practiceOpponent} size="sm" interactive={false} showBack={false} />
              <div class="practice-info">
                <span class="type-badge">FIX_IT_DAD</span>
                <span class="disadvantage-badge">⚠️ Disadvantage</span>
              </div>
            {/if}
          </div>
        </div>

        <div class="practice-tips">
          <h3>Battle Tips 💡</h3>
          <ul>
            <li>BBQ_DAD has advantage over FIX_IT_DAD (+20% damage bonus)</li>
            <li>Higher rarity cards usually have better stats</li>
            <li>Critical hits can turn the tide of battle</li>
            <li>Watch the battle log to understand what's happening</li>
          </ul>
        </div>

        <div class="practice-actions">
          <button class="practice-btn secondary" on:click={() => showPractice = false}>Back to Tutorial</button>
          <button class="practice-btn primary" on:click={completeTutorial}>I'm Ready! 🎯</button>
        </div>
      </div>
    {/if}

    <div class="tutorial-backdrop" on:click={() => showPractice = false}></div>
  </div>
{/if}

<style>
  .tutorial-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    z-index: 2000;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 1rem;
  }

  .tutorial-backdrop {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.85);
    backdrop-filter: blur(4px);
  }

  .tutorial-content {
    position: relative;
    background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%);
    border-radius: 1.25rem;
    padding: 2rem;
    max-width: 500px;
    width: 100%;
    border: 2px solid rgba(251, 191, 36, 0.3);
    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
    animation: slide-up 0.4s ease-out;
  }

  @keyframes slide-up {
    from {
      opacity: 0;
      transform: translateY(30px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  .tutorial-content.transitioning {
    animation: fade-transition 0.3s ease-out;
  }

  @keyframes fade-transition {
    0% {
      opacity: 1;
    }
    50% {
      opacity: 0;
    }
    100% {
      opacity: 1;
    }
  }

  .tutorial-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1.5rem;
  }

  .step-indicator {
    font-size: 0.875rem;
    font-weight: 600;
    color: #94a3b8;
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }

  .skip-btn {
    background: transparent;
    border: none;
    color: #94a3b8;
    font-size: 0.875rem;
    cursor: pointer;
    padding: 0.5rem 1rem;
    border-radius: 0.5rem;
    transition: all 0.2s ease;
  }

  .skip-btn:hover {
    background: rgba(148, 163, 184, 0.1);
    color: #e2e8f0;
  }

  .tutorial-body {
    margin-bottom: 2rem;
  }

  .tutorial-title {
    font-size: 1.75rem;
    font-weight: 800;
    margin-bottom: 1rem;
    background: linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }

  .tutorial-text {
    font-size: 1.05rem;
    line-height: 1.7;
    color: #cbd5e1;
    margin-bottom: 1rem;
  }

  .tutorial-action {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    background: rgba(251, 191, 36, 0.1);
    border: 1px solid rgba(251, 191, 36, 0.3);
    border-radius: 0.75rem;
    padding: 1rem;
    margin-top: 1.5rem;
  }

  .action-icon {
    font-size: 1.5rem;
    color: #fbbf24;
  }

  .tutorial-action span:last-child {
    color: #e2e8f0;
    font-weight: 500;
  }

  .tutorial-footer {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
  }

  .progress-dots {
    display: flex;
    justify-content: center;
    gap: 0.5rem;
  }

  .dot {
    width: 10px;
    height: 10px;
    border-radius: 50%;
    background: rgba(148, 163, 184, 0.3);
    transition: all 0.3s ease;
  }

  .dot.active {
    background: #fbbf24;
    box-shadow: 0 0 10px rgba(251, 191, 36, 0.5);
    transform: scale(1.2);
  }

  .dot.completed {
    background: #22c55e;
  }

  .navigation-buttons {
    display: flex;
    gap: 0.75rem;
    justify-content: flex-end;
  }

  .nav-btn {
    padding: 0.75rem 1.5rem;
    border-radius: 0.75rem;
    font-weight: 600;
    font-size: 0.95rem;
    cursor: pointer;
    transition: all 0.2s ease;
    border: none;
  }

  .nav-btn.primary {
    background: linear-gradient(135deg, #fbbf24, #f59e0b);
    color: #0f172a;
    box-shadow: 0 4px 15px rgba(251, 191, 36, 0.3);
  }

  .nav-btn.primary:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(251, 191, 36, 0.4);
  }

  .nav-btn.secondary {
    background: rgba(30, 41, 59, 0.8);
    color: #e2e8f0;
    border: 1px solid rgba(148, 163, 184, 0.3);
  }

  .nav-btn.secondary:hover {
    background: rgba(30, 41, 59, 1);
    border-color: rgba(148, 163, 184, 0.5);
  }

  /* Practice Battle Styles */
  .practice-battle {
    position: relative;
    background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%);
    border-radius: 1.5rem;
    padding: 2.5rem;
    max-width: 900px;
    width: 100%;
    border: 2px solid rgba(251, 191, 36, 0.3);
    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
    animation: slide-up 0.4s ease-out;
  }

  .practice-header {
    text-align: center;
    margin-bottom: 2rem;
  }

  .practice-header h2 {
    font-size: 2rem;
    font-weight: 800;
    margin-bottom: 0.5rem;
    background: linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }

  .practice-header p {
    color: #94a3b8;
    margin-bottom: 1rem;
  }

  .close-practice {
    background: transparent;
    border: 1px solid rgba(148, 163, 184, 0.4);
    color: #e2e8f0;
    padding: 0.5rem 1rem;
    border-radius: 0.5rem;
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .close-practice:hover {
    background: rgba(148, 163, 184, 0.1);
  }

  .practice-stage {
    display: grid;
    grid-template-columns: 1fr auto 1fr;
    gap: 2rem;
    align-items: center;
    justify-items: center;
    margin-bottom: 2rem;
  }

  .practice-slot {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 1rem;
  }

  .practice-slot h3 {
    font-size: 1.1rem;
    font-weight: 700;
    color: #e2e8f0;
  }

  .practice-vs {
    font-size: 2rem;
    font-weight: 900;
    color: #fbbf24;
    text-shadow: 0 0 20px rgba(251, 191, 36, 0.5);
  }

  .practice-info {
    display: flex;
    gap: 0.5rem;
    flex-wrap: wrap;
    justify-content: center;
  }

  .type-badge {
    background: rgba(59, 130, 246, 0.2);
    border: 1px solid rgba(59, 130, 246, 0.4);
    color: #60a5fa;
    padding: 0.35rem 0.75rem;
    border-radius: 0.5rem;
    font-size: 0.8rem;
    font-weight: 600;
  }

  .advantage-badge {
    background: rgba(34, 197, 94, 0.2);
    border: 1px solid rgba(34, 197, 94, 0.4);
    color: #22c55e;
    padding: 0.35rem 0.75rem;
    border-radius: 0.5rem;
    font-size: 0.8rem;
    font-weight: 600;
  }

  .disadvantage-badge {
    background: rgba(239, 68, 68, 0.2);
    border: 1px solid rgba(239, 68, 68, 0.4);
    color: #f87171;
    padding: 0.35rem 0.75rem;
    border-radius: 0.5rem;
    font-size: 0.8rem;
    font-weight: 600;
  }

  .practice-tips {
    background: rgba(15, 23, 42, 0.6);
    border-radius: 1rem;
    padding: 1.5rem;
    margin-bottom: 2rem;
    border: 1px solid rgba(148, 163, 184, 0.15);
  }

  .practice-tips h3 {
    font-size: 1.25rem;
    font-weight: 700;
    margin-bottom: 1rem;
    color: #e2e8f0;
  }

  .practice-tips ul {
    list-style: none;
    padding: 0;
    margin: 0;
  }

  .practice-tips li {
    padding: 0.75rem 0;
    color: #cbd5e1;
    border-bottom: 1px solid rgba(148, 163, 184, 0.1);
    display: flex;
    align-items: flex-start;
    gap: 0.75rem;
  }

  .practice-tips li:last-child {
    border-bottom: none;
  }

  .practice-tips li::before {
    content: '💡';
    flex-shrink: 0;
  }

  .practice-actions {
    display: flex;
    gap: 1rem;
    justify-content: center;
  }

  .practice-btn {
    padding: 1rem 2rem;
    border-radius: 0.75rem;
    font-weight: 600;
    font-size: 1rem;
    cursor: pointer;
    transition: all 0.2s ease;
    border: none;
  }

  .practice-btn.primary {
    background: linear-gradient(135deg, #fbbf24, #f59e0b);
    color: #0f172a;
    box-shadow: 0 4px 15px rgba(251, 191, 36, 0.3);
  }

  .practice-btn.primary:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(251, 191, 36, 0.4);
  }

  .practice-btn.secondary {
    background: rgba(30, 41, 59, 0.8);
    color: #e2e8f0;
    border: 1px solid rgba(148, 163, 184, 0.3);
  }

  .practice-btn.secondary:hover {
    background: rgba(30, 41, 59, 1);
    border-color: rgba(148, 163, 184, 0.5);
  }

  @media (max-width: 768px) {
    .tutorial-content {
      padding: 1.5rem;
      max-width: 100%;
    }

    .practice-battle {
      padding: 1.5rem;
    }

    .practice-stage {
      grid-template-columns: 1fr;
      gap: 1.5rem;
    }

    .practice-vs {
      transform: rotate(90deg);
    }

    .navigation-buttons {
      flex-direction: column-reverse;
    }

    .nav-btn {
      width: 100%;
    }
  }
</style>

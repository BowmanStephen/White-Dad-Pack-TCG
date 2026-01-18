<script lang="ts">
  import ErrorBoundary from '../common/ErrorBoundary.svelte';
  import Card from './Card.svelte';
  import type { PackCard } from '../../types';

  interface Props {
    card: PackCard;
    isFlipped?: boolean;
    showBack?: boolean;
    size?: 'sm' | 'md' | 'lg';
    interactive?: boolean;
    enableShare?: boolean;
    showUpgradeButton?: boolean;
    onUpgradeClick?: (() => void) | undefined;
  }

  let {
    card,
    isFlipped = false,
    showBack = true,
    size = 'md',
    interactive = true,
    enableShare = false,
    showUpgradeButton = false,
    onUpgradeClick,
  }: Props = $props();
</script>

<ErrorBoundary
  fallbackTitle="Card Display Error"
  fallbackMessage="We couldn't display this card. Please try refreshing the page."
>
  <Card
    {card}
    {isFlipped}
    {showBack}
    {size}
    {interactive}
    {enableShare}
    {showUpgradeButton}
    {onUpgradeClick}
  />
</ErrorBoundary>

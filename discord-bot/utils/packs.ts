/**
 * Pack Generator for Discord Bot
 *
 * Integrates with the existing DadDeck pack generation system
 * to create packs for Discord users.
 */

import type { Card, Pack } from '../../src/types/index.js';
import { generatePack } from '../../src/lib/pack/generator.js';
import type { DiscordCardDisplay, PackOpenData } from '../types/index.js';

/**
 * Convert a PackCard to Discord display format
 */
export function toDiscordCard(card: Card): DiscordCardDisplay {
  return {
    id: card.id,
    name: card.name,
    subtitle: card.subtitle,
    rarity: card.rarity,
    type: card.type,
    isHolo: card.holoVariant !== 'none',
    holoType: card.holoVariant || 'none',
    stats: card.stats,
    flavorText: card.flavorText,
    // TODO: Add image URL when card images are available
    imageUrl: card.artwork,
  };
}

/**
 * Generate a pack and convert to Discord format
 */
export function generateDiscordPack(): PackOpenData {
  const pack = generatePack();

  return {
    packId: pack.id,
    cards: pack.cards.map((card) => toDiscordCard(card)),
    openedAt: pack.openedAt,
    bestRarity: pack.bestRarity,
    holoCount: pack.cards.filter((c) => c.isHolo).length,
  };
}

/**
 * Get rarity emoji for Discord display
 */
export function getRarityEmoji(rarity: string): string {
  const emojis: Record<string, string> = {
    common: '⚪',
    uncommon: '🔵',
    rare: '🟡',
    epic: '🟣',
    legendary: '🟠',
    mythic: '💎',
  };
  return emojis[rarity] || '⚪';
}

/**
 * Get rarity color for Discord embeds
 */
export function getRarityColor(rarity: string): number {
  const colors: Record<string, number> = {
    common: 0x9ca3af, // grey
    uncommon: 0x60a5fa, // blue
    rare: 0xfbbf24, // gold
    epic: 0xa855f7, // purple
    legendary: 0xf97316, // orange
    mythic: 0xec4899, // pink
  };
  return colors[rarity] || 0x9ca3af;
}

/**
 * Format stats for Discord display
 */
export function formatStats(card: DiscordCardDisplay): string {
  const stats = card.stats;
  return (
    `🎭 Dad Joke: ${stats.dadJoke} | 🔥 Grill: ${stats.grillSkill}\n` +
    `🛠️ Fix-It: ${stats.fixIt} | 😴 Nap: ${stats.napPower}\n` +
    `📺 Remote: ${stats.remoteControl} | 🎯 Thermostat: ${stats.thermostat}\n` +
    `🧦 Sock & Sandal: ${stats.sockSandal} | 🍺 Beer: ${stats.beerSnob}`
  );
}

/**
 * Create a card embed for Discord
 */
export function createCardEmbed(card: DiscordCardDisplay, index: number) {
  const rarityEmoji = getRarityEmoji(card.rarity);
  const holoText = card.isHolo ? ` ✨ ${card.holoType.replace('_', ' ')} holo` : '';

  return {
    title: `${rarityEmoji} ${card.name}`,
    description: `*${card.subtitle}*${holoText}\n\n${formatStats(card)}`,
    color: getRarityColor(card.rarity),
    fields: [
      {
        name: 'Type',
        value: card.type,
        inline: true,
      },
      {
        name: 'Rarity',
        value: card.rarity,
        inline: true,
      },
      {
        name: 'Flavor Text',
        value: `"${card.flavorText}"`,
      },
    ],
    footer: {
      text: `Card ${index + 1} • DadDeck™ TCG`,
    },
  };
}

/**
 * Discord Bot Types
 *
 * Types for Discord bot functionality including user accounts,
 * cooldowns, and premium status.
 */

import type { SlashCommandBuilder, ChatInputCommandInteraction } from 'discord.js';

/**
 * Discord command interface
 */
export interface DiscordCommand {
  data: SlashCommandBuilder;
  execute: (interaction: ChatInputCommandInteraction) => Promise<void>;
}

/**
 * Discord user account for tracking collection and cooldowns
 */
export interface DiscordUser {
  discordId: string;        // Discord user ID
  username: string;         // Discord username
  accountId?: string;       // Optional: Bound DadDeck account ID
  isPremium: boolean;       // Premium status (bypasses cooldowns)
  totalPacksOpened: number; // Lifetime pack opens
  lastPackOpenAt?: Date;    // Last pack open timestamp
  cooldownUntil?: Date;     // Cooldown expiration
  createdAt: Date;          // Account creation date
  updatedAt: Date;          // Last update
}

/**
 * User database for Discord bot
 */
export interface UserDatabase {
  users: Record<string, DiscordUser>; // Key: discordId
  lastUpdated: Date;
}

/**
 * Cooldown check result
 */
export interface CooldownResult {
  canOpen: boolean;
  remainingTime?: number; // Milliseconds remaining
  reason?: string;
}

/**
 * Pack open result
 */
export interface PackOpenResult {
  success: boolean;
  pack?: PackOpenData;
  error?: string;
}

/**
 * Pack data for Discord display
 */
export interface PackOpenData {
  packId: string;
  cards: DiscordCardDisplay[];
  openedAt: Date;
  bestRarity: string;
  holoCount: number;
}

/**
 * Card display data for Discord embeds
 */
export interface DiscordCardDisplay {
  id: string;
  name: string;
  subtitle: string;
  rarity: string;
  type: string;
  isHolo: boolean;
  holoType: string;
  stats: {
    dadJoke: number;
    grillSkill: number;
    fixIt: number;
    napPower: number;
    remoteControl: number;
    thermostat: number;
    sockSandal: number;
    beerSnob: number;
  };
  flavorText: string;
  imageUrl?: string;
}

/**
 * DadDeck™ Discord Bot
 *
 * Main bot entry point for the DadDeck™ Trading Card Game Discord bot.
 * Allows users to open packs, view collections, and bind accounts.
 *
 * Features:
 * - /openpack - Open a booster pack (6 cards)
 * - /collection - View your collection statistics
 * - /bindaccount - Link your Discord to your DadDeck account
 * - /premium - Admin command to grant premium status
 *
 * Environment variables required:
 * - DISCORD_TOKEN: Bot token from Discord Developer Portal
 * - DISCORD_CLIENT_ID: Application client ID
 * - DISCORD_GUILD_ID: (Optional) Guild ID for instant command updates in dev
 */

import { Client, GatewayIntentBits, REST, Routes, Collection } from 'discord.js';
import * as dotenv from 'dotenv';
import { commands } from './commands/index.js';
import type { DiscordCommand } from './types/index.js';

// Load environment variables
dotenv.config({ path: './discord-bot/.env' });

const TOKEN = process.env.DISCORD_TOKEN;
const CLIENT_ID = process.env.DISCORD_CLIENT_ID;
const GUILD_ID = process.env.DISCORD_GUILD_ID;

if (!TOKEN) {
  console.error('❌ DISCORD_TOKEN is required in .env file');
  process.exit(1);
}

if (!CLIENT_ID) {
  console.error('❌ DISCORD_CLIENT_ID is required in .env file');
  process.exit(1);
}

// Create Discord client
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
  ],
});

/**
 * Register slash commands with Discord
 */
async function registerCommands() {
  const commandsData = Object.values(commands).map((cmd) => (cmd.data as { toJSON: () => unknown }).toJSON());

  const rest = new REST({ version: '10' }).setToken(TOKEN);

  try {
    console.log(`🔄 Registering ${commandsData.length} slash commands...`);

    if (GUILD_ID) {
      // Register for a specific guild (instant updates, good for dev)
      await rest.put(Routes.applicationGuildCommands(CLIENT_ID, GUILD_ID), {
        body: commandsData,
      });
      console.log(`✅ Commands registered for guild ${GUILD_ID}`);
    } else {
      // Register globally (takes up to 1 hour to propagate)
      await rest.put(Routes.applicationCommands(CLIENT_ID), {
        body: commandsData,
      });
      console.log('✅ Commands registered globally');
    }
  } catch (error) {
    console.error('❌ Error registering commands:', error);
  }
}

/**
 * Handle bot ready event
 */
client.once('ready', async () => {
  console.log(`✅ DadDeck™ Bot logged in as ${client.user?.tag}`);

  // Register commands on startup
  await registerCommands();

  console.log('🎮 Bot is ready!');
});

/**
 * Handle slash command interactions
 */
client.on('interactionCreate', async (interaction) => {
  if (!interaction.isChatInputCommand()) return;

  const { commandName } = interaction;

  // Find and execute the command
  const command = commands[commandName as keyof typeof commands];
  if (!command) {
    console.error(`❌ Unknown command: ${commandName}`);
    return;
  }

  try {
    await command.execute(interaction);
  } catch (error) {
    console.error(`❌ Error executing ${commandName}:`, error);

    const errorMessage = 'There was an error executing this command. Please try again later.';

    // If the interaction was already deferred, edit the reply
    if (interaction.deferred) {
      await interaction.editReply({
        content: errorMessage,
      });
    } else {
      await interaction.reply({
        content: errorMessage,
        ephemeral: true,
      });
    }
  }
});

/**
 * Handle errors
 */
client.on('error', (error) => {
  console.error('❌ Discord client error:', error);
});

// Login to Discord
client.login(TOKEN);

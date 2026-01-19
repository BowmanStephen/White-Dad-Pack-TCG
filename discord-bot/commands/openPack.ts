/**
 * /openpack Command
 *
 * Discord slash command to open a DadDeck™ booster pack.
 * Includes cooldown system and premium user bypass.
 */

import { SlashCommandBuilder, ChatInputCommandInteraction, EmbedBuilder } from 'discord.js';
import { getUser, createUser, saveUser } from '../utils/database.js';
import { checkCooldown, setCooldown, formatCooldown } from '../utils/cooldowns.js';
import { generateDiscordPack, createCardEmbed, getRarityEmoji } from '../utils/packs.js';

export const data = new SlashCommandBuilder()
  .setName('openpack')
  .setDescription('Open a DadDeck™ booster pack and reveal 6 random cards!')
  .addBooleanOption((option) =>
    option
      .setName('reveal')
      .setDescription('Show cards immediately (default: true)')
      .setRequired(false)
  );

/**
 * Execute the /openpack command
 */
export async function execute(interaction: ChatInputCommandInteraction) {
  // Defer reply since pack generation might take a moment
  await interaction.deferReply();

  const userId = interaction.user.id;
  const username = interaction.user.username;

  // Get or create user
  let user = await getUser(userId);
  if (!user) {
    user = createUser(userId, username);
    await saveUser(user);
  }

  // Check cooldown
  const cooldownResult = checkCooldown(user);
  if (!cooldownResult.canOpen) {
    const errorEmbed = new EmbedBuilder()
      .setColor(0xff0000)
      .setTitle('⏳ Pack Opening Cooldown')
      .setDescription(cooldownResult.reason || 'Please wait before opening another pack.')
      .addFields({
        name: 'Cooldown',
        value: formatCooldown(cooldownResult.remainingTime!),
        inline: true,
      });

    await interaction.editReply({ embeds: [errorEmbed] });
    return;
  }

  // Generate pack
  const packData = generateDiscordPack();

  // Update user data
  user.totalPacksOpened++;
  user = setCooldown(user);
  await saveUser(user);

  // Create pack summary embed
  const bestRarityEmoji = getRarityEmoji(packData.bestRarity);
  const summaryEmbed = new EmbedBuilder()
    .setColor(0x1e40af)
    .setTitle(`📦 Pack Opened!`)
    .setDescription(
      `**${username}** opened a pack and got:\n\n` +
      `**Best Pull:** ${bestRarityEmoji} ${packData.bestRarity}\n` +
      `**Holo Cards:** ${packData.holoCount} ✨\n` +
      `**Total Opens:** ${user.totalPacksOpened}`
    )
    .setFooter({ text: `Pack ID: ${packData.packId}` })
    .setTimestamp(packData.openedAt);

  // Create card embeds
  const cardEmbeds = packData.cards.map((card, index) => createCardEmbed(card, index));

  // Send the pack opening result
  await interaction.editReply({
    embeds: [summaryEmbed, ...cardEmbeds],
  });
}

/**
 * /premium Command
 *
 * Admin command to grant/revoke premium status for users.
 * Premium users bypass pack opening cooldowns.
 */

import { SlashCommandBuilder, ChatInputCommandInteraction, EmbedBuilder, PermissionFlagsBits } from 'discord.js';
import { getUser, createUser, setPremiumStatus } from '../utils/database.js';

export const data = new SlashCommandBuilder()
  .setName('premium')
  .setDescription('Admin: Grant or revoke premium status (bypasses cooldowns)')
  .addUserOption((option) =>
    option
      .setName('user')
      .setDescription('The user to modify premium status for')
      .setRequired(true)
  )
  .addBooleanOption((option) =>
    option
      .setName('status')
      .setDescription('Premium status (true = grant, false = revoke)')
      .setRequired(true)
  )
  .setDefaultMemberPermissions(PermissionFlagsBits.Administrator);

/**
 * Execute the /premium command
 */
export async function execute(interaction: ChatInputCommandInteraction) {
  const targetUser = interaction.options.getUser('user', true);
  const premiumStatus = interaction.options.getBoolean('status', true);

  if (!targetUser) {
    await interaction.reply({ content: 'User not found.', ephemeral: true });
    return;
  }

  // Get or create target user
  let user = await getUser(targetUser.id);
  if (!user) {
    user = createUser(targetUser.id, targetUser.username);
  }

  // Update premium status
  await setPremiumStatus(targetUser.id, premiumStatus);

  const statusText = premiumStatus ? 'granted ✨' : 'revoked';
  const statusColor = premiumStatus ? 0xfbbf24 : 0x9ca3af;
  const statusEmoji = premiumStatus ? '✨' : '❌';

  const resultEmbed = new EmbedBuilder()
    .setColor(statusColor)
    .setTitle(`${statusEmoji} Premium Status ${statusText}`)
    .setDescription(`Premium status has been ${statusText} for **${targetUser.username}**.`)
    .addFields(
      { name: 'User', value: targetUser.username, inline: true },
      { name: 'New Status', value: premiumStatus ? '✨ Premium' : 'Free', inline: true },
      { name: 'Benefits', value: premiumStatus ? 'No pack opening cooldowns!' : '1 hour cooldown applies', inline: false }
    )
    .setFooter({ text: 'Admin Action • DadDeck™ TCG' })
    .setTimestamp();

  await interaction.reply({ embeds: [resultEmbed] });
}

/**
 * /bindaccount Command
 *
 * Allows users to bind their Discord account to their DadDeck™ account
 * for cross-platform collection tracking.
 */

import { SlashCommandBuilder, ChatInputCommandInteraction, EmbedBuilder } from 'discord.js';
import { getUser, createUser, saveUser } from '../utils/database.js';

export const data = new SlashCommandBuilder()
  .setName('bindaccount')
  .setDescription('Bind your Discord account to your DadDeck™ collection')
  .addStringOption((option) =>
    option
      .setName('account_id')
      .setDescription('Your DadDeck™ account ID (optional - generates one if not provided)')
      .setRequired(false)
  );

/**
 * Execute the /bindaccount command
 */
export async function execute(interaction: ChatInputCommandInteraction) {
  const userId = interaction.user.id;
  const username = interaction.user.username;
  const accountId = interaction.options.getString('account_id');

  // Get or create user
  let user = await getUser(userId);
  if (!user) {
    user = createUser(userId, username);
  }

  // If account ID provided, bind it
  if (accountId) {
    user.accountId = accountId;
    user.updatedAt = new Date();
    await saveUser(user);

    const successEmbed = new EmbedBuilder()
      .setColor(0x22c55e)
      .setTitle('✅ Account Bound Successfully')
      .setDescription(`Your Discord account is now linked to DadDeck™ account \`${accountId}\``)
      .addFields(
        { name: 'Discord User', value: username, inline: true },
        { name: 'Account ID', value: `\`${accountId}\``, inline: true },
        { name: 'Premium', value: user.isPremium ? '✨ Yes' : 'No', inline: true }
      )
      .setFooter({ text: 'Your collection syncs across platforms!' })
      .setTimestamp();

    await interaction.reply({ embeds: [successEmbed], ephemeral: true });
    return;
  }

  // Show current account status or help
  const statusEmbed = new EmbedBuilder()
    .setColor(0x1e40af)
    .setTitle('🔗 Account Binding')
    .setDescription(
      user.accountId
        ? `Your Discord account is already linked to DadDeck™ account \`${user.accountId}\``
        : 'Bind your Discord account to sync your collection across platforms.'
    )
    .addFields(
      { name: 'Discord User', value: username, inline: true },
      { name: 'Account ID', value: user.accountId || '*Not bound*', inline: true },
      { name: 'Premium', value: user.isPremium ? '✨ Yes' : 'No', inline: true },
      { name: 'Total Pack Opens', value: `${user.totalPacksOpened}`, inline: true }
    )
    .addFields({
      name: 'How to Bind',
      value: 'Use `/bindaccount account_id:YOUR_ACCOUNT_ID` to link your account.',
    })
    .setFooter({ text: 'DadDeck™ TCG • Account Management' })
    .setTimestamp();

  await interaction.reply({ embeds: [statusEmbed], ephemeral: true });
}

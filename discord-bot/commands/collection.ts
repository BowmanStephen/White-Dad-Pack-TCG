/**
 * /collection Command
 *
 * View your DadDeck™ collection statistics from Discord.
 */

import { SlashCommandBuilder, ChatInputCommandInteraction, EmbedBuilder } from 'discord.js';
import { getUser } from '../utils/database.js';

export const data = new SlashCommandBuilder()
  .setName('collection')
  .setDescription('View your DadDeck™ collection statistics');

/**
 * Execute the /collection command
 */
export async function execute(interaction: ChatInputCommandInteraction) {
  const userId = interaction.user.id;

  // Get user
  const user = await getUser(userId);

  if (!user) {
    const noDataEmbed = new EmbedBuilder()
      .setColor(0xff9900)
      .setTitle('📦 No Collection Found')
      .setDescription('You haven\'t opened any packs yet! Use `/openpack` to get started.')
      .addFields({
        name: 'Get Started',
        value: 'Use `/openpack` to open your first DadDeck™ booster pack!',
      });

    await interaction.reply({ embeds: [noDataEmbed], ephemeral: true });
    return;
  }

  const isPremium = user.isPremium;
  const premiumStatus = isPremium ? '✨ **Premium**' : 'Free';
  const cooldownStatus = user.cooldownUntil && user.cooldownUntil > new Date()
    ? `⏳ On cooldown until <t:${Math.floor(user.cooldownUntil.getTime() / 1000)}:R>`
    : '✅ Ready to open';

  const statsEmbed = new EmbedBuilder()
    .setColor(isPremium ? 0xfbbf24 : 0x1e40af)
    .setTitle(`📚 ${user.username}'s Collection`)
    .setDescription(`**Status:** ${premiumStatus}\n\n**Cooldown:** ${cooldownStatus}`)
    .addFields(
      { name: 'Total Pack Opens', value: `${user.totalPacksOpened}`, inline: true },
      { name: 'Account Bound', value: user.accountId ? `✅ Yes (\`${user.accountId}\`)` : '❌ No', inline: true }
    )
    .addFields({
      name: 'Member Since',
      value: `<t:${Math.floor(user.createdAt.getTime() / 1000)}:R>`,
      inline: true,
    })
    .setFooter({ text: 'DadDeck™ TCG • Your Collection' })
    .setTimestamp();

  await interaction.reply({ embeds: [statsEmbed], ephemeral: true });
}

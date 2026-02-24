/**
 * FS25 ModBot — /unban
 * Unbans a user by ID with mod-log.
 */

const {
    SlashCommandBuilder,
    EmbedBuilder,
    Colors,
    PermissionFlagsBits
} = require('discord.js');
const db = require('../../utils/database');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('unban')
        .setDescription('Unban a previously banned user')
        .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers)
        .addStringOption(opt =>
            opt.setName('user_id')
               .setDescription('Discord user ID to unban')
               .setRequired(true))
        .addStringOption(opt =>
            opt.setName('reason')
               .setDescription('Reason for unbanning')
               .setRequired(false)
               .setMaxLength(512)),

    async execute(interaction, client) {
        await interaction.deferReply({ ephemeral: true });

        const userId = interaction.options.getString('user_id').trim();
        const reason = interaction.options.getString('reason') ?? 'No reason provided';

        // Validate ID format
        if (!/^\d{17,20}$/.test(userId)) {
            return interaction.editReply({ content: '❌ That doesn\'t look like a valid Discord user ID.' });
        }

        // Check ban list
        let ban;
        try {
            ban = await interaction.guild.bans.fetch(userId);
        } catch {
            return interaction.editReply({ content: `❌ User \`${userId}\` is not currently banned.` });
        }

        await interaction.guild.members.unban(userId, `[${interaction.user.tag}] ${reason}`);

        // ── Mod-log ────────────────────────────────────────────────────────
        const settings = db.getSettings(interaction.guild.id);
        if (settings?.mod_log_channel) {
            const logChannel = interaction.guild.channels.cache.get(settings.mod_log_channel);
            if (logChannel) {
                const logEmbed = new EmbedBuilder()
                    .setColor(Colors.Green)
                    .setAuthor({ name: 'Member Unbanned', iconURL: ban.user.displayAvatarURL() })
                    .addFields(
                        { name: '👤 User',        value: `${ban.user.tag} (${ban.user.id})`,             inline: true  },
                        { name: '🛡️ Moderator',   value: `${interaction.user} (${interaction.user.id})`, inline: true  },
                        { name: '📝 Reason',      value: reason,                                           inline: false }
                    )
                    .setFooter({ text: 'Case — UNBAN' })
                    .setTimestamp();
                await logChannel.send({ embeds: [logEmbed] }).catch(() => null);
            }
        }

        const successEmbed = new EmbedBuilder()
            .setColor(Colors.Green)
            .setTitle('✅ User Unbanned')
            .addFields(
                { name: 'User',   value: `${ban.user.tag} (${ban.user.id})`, inline: true },
                { name: 'Reason', value: reason,                              inline: false }
            )
            .setTimestamp();

        await interaction.editReply({ embeds: [successEmbed] });
    }
};
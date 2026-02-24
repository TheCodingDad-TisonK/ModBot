/**
 * FS25 ModBot — /kick
 * Kicks a member with permission validation, DM notification, and mod-log embed.
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
        .setName('kick')
        .setDescription('Kick a member from the server')
        .setDefaultMemberPermissions(PermissionFlagsBits.KickMembers)
        .addUserOption(opt =>
            opt.setName('user')
               .setDescription('Member to kick')
               .setRequired(true))
        .addStringOption(opt =>
            opt.setName('reason')
               .setDescription('Reason for the kick (shown in audit log & DM)')
               .setRequired(false)
               .setMaxLength(512)),

    async execute(interaction, client) {
        await interaction.deferReply({ ephemeral: true });

        const target = interaction.options.getMember('user');
        const reason = interaction.options.getString('reason') ?? 'No reason provided';

        // ── Guards ──────────────────────────────────────────────────────────
        if (!target) {
            return interaction.editReply({ content: '❌ That user is not in this server.' });
        }
        if (target.id === interaction.user.id) {
            return interaction.editReply({ content: '❌ You cannot kick yourself.' });
        }
        if (target.id === client.user.id) {
            return interaction.editReply({ content: '❌ I cannot kick myself.' });
        }
        if (!target.kickable) {
            return interaction.editReply({ content: '❌ I cannot kick that member — they may have a higher role than me.' });
        }
        if (interaction.member.roles.highest.comparePositionTo(target.roles.highest) <= 0) {
            return interaction.editReply({ content: '❌ You cannot kick someone with an equal or higher role than yours.' });
        }

        // ── DM the target before kicking (best effort) ─────────────────────
        const dmEmbed = new EmbedBuilder()
            .setColor(Colors.Orange)
            .setTitle(`👢 You were kicked from ${interaction.guild.name}`)
            .addFields(
                { name: 'Reason',      value: reason,                      inline: false },
                { name: 'Moderator',   value: interaction.user.tag,         inline: true  },
                { name: 'Server',      value: interaction.guild.name,        inline: true  }
            )
            .setTimestamp();

        await target.send({ embeds: [dmEmbed] }).catch(() => null);

        // ── Perform kick ───────────────────────────────────────────────────
        await target.kick(`[${interaction.user.tag}] ${reason}`);

        // ── Log to mod-log channel ─────────────────────────────────────────
        const settings = db.getSettings(interaction.guild.id);
        if (settings?.mod_log_channel) {
            const logChannel = interaction.guild.channels.cache.get(settings.mod_log_channel);
            if (logChannel) {
                const logEmbed = new EmbedBuilder()
                    .setColor(Colors.Orange)
                    .setAuthor({ name: 'Member Kicked', iconURL: target.user.displayAvatarURL() })
                    .addFields(
                        { name: '👤 User',      value: `${target.user} (${target.user.id})`,          inline: true  },
                        { name: '🛡️ Moderator', value: `${interaction.user} (${interaction.user.id})`, inline: true  },
                        { name: '📝 Reason',    value: reason,                                          inline: false }
                    )
                    .setFooter({ text: `Case — KICK` })
                    .setTimestamp();
                await logChannel.send({ embeds: [logEmbed] }).catch(() => null);
            }
        }

        // ── Reply ──────────────────────────────────────────────────────────
        const successEmbed = new EmbedBuilder()
            .setColor(Colors.Green)
            .setTitle('✅ Member Kicked')
            .addFields(
                { name: 'User',      value: `${target.user.tag} (${target.user.id})`, inline: true },
                { name: 'Reason',    value: reason,                                    inline: false }
            )
            .setTimestamp();

        await interaction.editReply({ embeds: [successEmbed] });
    }
};
/**
 * FS25 ModBot — /ban
 * Bans a user with full permission checking, DM notification, and mod-log.
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
        .setName('ban')
        .setDescription('Ban a user from the server')
        .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers)
        .addUserOption(opt =>
            opt.setName('user')
               .setDescription('User to ban (can be someone not in the server)')
               .setRequired(true))
        .addStringOption(opt =>
            opt.setName('reason')
               .setDescription('Reason for the ban')
               .setRequired(false)
               .setMaxLength(512))
        .addIntegerOption(opt =>
            opt.setName('delete_days')
               .setDescription('Days of messages to delete (0–7)')
               .setMinValue(0)
               .setMaxValue(7)
               .setRequired(false)),

    async execute(interaction, client) {
        await interaction.deferReply({ ephemeral: true });

        const user        = interaction.options.getUser('user');
        const reason      = interaction.options.getString('reason') ?? 'No reason provided';
        const deleteDays  = interaction.options.getInteger('delete_days') ?? 0;
        const member      = interaction.guild.members.cache.get(user.id);

        // ── Guards ──────────────────────────────────────────────────────────
        if (user.id === interaction.user.id) {
            return interaction.editReply({ content: '❌ You cannot ban yourself.' });
        }
        if (user.id === client.user.id) {
            return interaction.editReply({ content: '❌ I cannot ban myself.' });
        }
        if (member) {
            if (!member.bannable) {
                return interaction.editReply({ content: '❌ I cannot ban that member — they may outrank me.' });
            }
            if (interaction.member.roles.highest.comparePositionTo(member.roles.highest) <= 0) {
                return interaction.editReply({ content: '❌ You cannot ban someone with an equal or higher role.' });
            }
        }

        // ── DM before ban ──────────────────────────────────────────────────
        if (member) {
            const dmEmbed = new EmbedBuilder()
                .setColor(Colors.Red)
                .setTitle(`🔨 You have been banned from ${interaction.guild.name}`)
                .addFields(
                    { name: 'Reason',    value: reason,              inline: false },
                    { name: 'Moderator', value: interaction.user.tag, inline: true  }
                )
                .setTimestamp();
            await user.send({ embeds: [dmEmbed] }).catch(() => null);
        }

        // ── Ban ────────────────────────────────────────────────────────────
        await interaction.guild.members.ban(user.id, {
            reason: `[${interaction.user.tag}] ${reason}`,
            deleteMessageDays: deleteDays
        });

        // ── Mod-log ────────────────────────────────────────────────────────
        const settings = db.getSettings(interaction.guild.id);
        if (settings?.mod_log_channel) {
            const logChannel = interaction.guild.channels.cache.get(settings.mod_log_channel);
            if (logChannel) {
                const logEmbed = new EmbedBuilder()
                    .setColor(Colors.Red)
                    .setAuthor({ name: 'Member Banned', iconURL: user.displayAvatarURL() })
                    .addFields(
                        { name: '👤 User',             value: `${user} (${user.id})`,                          inline: true  },
                        { name: '🛡️ Moderator',        value: `${interaction.user} (${interaction.user.id})`,  inline: true  },
                        { name: '🗑️ Messages Deleted', value: `${deleteDays} day(s)`,                          inline: true  },
                        { name: '📝 Reason',           value: reason,                                           inline: false }
                    )
                    .setFooter({ text: 'Case — BAN' })
                    .setTimestamp();
                await logChannel.send({ embeds: [logEmbed] }).catch(() => null);
            }
        }

        // ── Reply ──────────────────────────────────────────────────────────
        const successEmbed = new EmbedBuilder()
            .setColor(Colors.Green)
            .setTitle('✅ User Banned')
            .addFields(
                { name: 'User',              value: `${user.tag} (${user.id})`, inline: true },
                { name: 'Messages Deleted',  value: `${deleteDays} day(s)`,     inline: true },
                { name: 'Reason',            value: reason,                      inline: false }
            )
            .setTimestamp();

        await interaction.editReply({ embeds: [successEmbed] });
    }
};
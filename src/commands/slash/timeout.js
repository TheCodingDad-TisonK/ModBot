/**
 * FS25 ModBot — /timeout
 * Applies Discord's native timeout (communication disabled) to a member.
 */

const {
    SlashCommandBuilder,
    EmbedBuilder,
    Colors,
    PermissionFlagsBits
} = require('discord.js');
const { parseTime }     = require('../../utils/parseTime');
const { formatDuration } = require('../../utils/formatDuration');
const db = require('../../utils/database');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('timeout')
        .setDescription('Timeout (mute) or remove timeout from a member')
        .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers)
        .addSubcommand(sub =>
            sub.setName('add')
               .setDescription('Apply a timeout to a member')
               .addUserOption(opt =>
                   opt.setName('user').setDescription('Member to timeout').setRequired(true))
               .addStringOption(opt =>
                   opt.setName('duration')
                      .setDescription('Duration e.g. 10m, 1h, 1d (max 28 days)')
                      .setRequired(true))
               .addStringOption(opt =>
                   opt.setName('reason').setDescription('Reason for timeout').setRequired(false).setMaxLength(512)))
        .addSubcommand(sub =>
            sub.setName('remove')
               .setDescription('Remove an active timeout from a member')
               .addUserOption(opt =>
                   opt.setName('user').setDescription('Member to remove timeout from').setRequired(true))
               .addStringOption(opt =>
                   opt.setName('reason').setDescription('Reason for removing timeout').setRequired(false).setMaxLength(512))),

    async execute(interaction, client) {
        await interaction.deferReply({ ephemeral: true });

        const sub    = interaction.options.getSubcommand();
        const target = interaction.options.getMember('user');
        const reason = interaction.options.getString('reason') ?? 'No reason provided';

        if (!target) return interaction.editReply({ content: '❌ That user is not in this server.' });
        if (target.id === interaction.user.id)  return interaction.editReply({ content: '❌ You cannot timeout yourself.' });
        if (target.id === client.user.id)       return interaction.editReply({ content: '❌ I cannot timeout myself.' });
        if (!target.moderatable)                return interaction.editReply({ content: '❌ I cannot moderate that member — they may outrank me.' });
        if (interaction.member.roles.highest.comparePositionTo(target.roles.highest) <= 0) {
            return interaction.editReply({ content: '❌ You cannot timeout someone with an equal or higher role.' });
        }

        // ── Add ────────────────────────────────────────────────────────────
        if (sub === 'add') {
            const durationStr = interaction.options.getString('duration');
            const ms          = parseTime(durationStr);

            if (!ms)             return interaction.editReply({ content: '❌ Invalid duration. Try `10m`, `1h`, `1d`, etc.' });
            const MAX = 28 * 24 * 60 * 60 * 1000; // 28 days — Discord limit
            if (ms > MAX)        return interaction.editReply({ content: '❌ Maximum timeout duration is 28 days.' });

            await target.timeout(ms, `[${interaction.user.tag}] ${reason}`);

            const readableDuration = formatDuration(ms);

            // DM
            const dmEmbed = new EmbedBuilder()
                .setColor(Colors.Yellow)
                .setTitle(`🔇 You have been timed out in ${interaction.guild.name}`)
                .addFields(
                    { name: 'Duration',   value: readableDuration,        inline: true },
                    { name: 'Moderator',  value: interaction.user.tag,     inline: true },
                    { name: 'Reason',     value: reason,                    inline: false }
                )
                .setTimestamp();
            await target.send({ embeds: [dmEmbed] }).catch(() => null);

            // Mod-log
            const settings = db.getSettings(interaction.guild.id);
            if (settings?.mod_log_channel) {
                const logChannel = interaction.guild.channels.cache.get(settings.mod_log_channel);
                if (logChannel) {
                    const logEmbed = new EmbedBuilder()
                        .setColor(Colors.Yellow)
                        .setAuthor({ name: 'Member Timed Out', iconURL: target.user.displayAvatarURL() })
                        .addFields(
                            { name: '👤 User',       value: `${target.user} (${target.user.id})`,           inline: true  },
                            { name: '🛡️ Moderator',  value: `${interaction.user} (${interaction.user.id})`, inline: true  },
                            { name: '⏱️ Duration',   value: readableDuration,                                inline: true  },
                            { name: '📅 Expires',    value: `<t:${Math.floor((Date.now() + ms) / 1000)}:R>`, inline: true  },
                            { name: '📝 Reason',     value: reason,                                           inline: false }
                        )
                        .setFooter({ text: 'Case — TIMEOUT' })
                        .setTimestamp();
                    await logChannel.send({ embeds: [logEmbed] }).catch(() => null);
                }
            }

            const successEmbed = new EmbedBuilder()
                .setColor(Colors.Green)
                .setTitle('✅ Timeout Applied')
                .addFields(
                    { name: 'User',     value: `${target.user.tag}`, inline: true },
                    { name: 'Duration', value: readableDuration,      inline: true },
                    { name: 'Expires',  value: `<t:${Math.floor((Date.now() + ms) / 1000)}:R>`, inline: true },
                    { name: 'Reason',   value: reason,                 inline: false }
                )
                .setTimestamp();

            return interaction.editReply({ embeds: [successEmbed] });
        }

        // ── Remove ─────────────────────────────────────────────────────────
        if (sub === 'remove') {
            if (!target.communicationDisabledUntil) {
                return interaction.editReply({ content: '❌ That member is not currently timed out.' });
            }

            await target.timeout(null, `[${interaction.user.tag}] ${reason}`);

            const successEmbed = new EmbedBuilder()
                .setColor(Colors.Green)
                .setTitle('✅ Timeout Removed')
                .addFields(
                    { name: 'User',   value: `${target.user.tag}`, inline: true },
                    { name: 'Reason', value: reason,                inline: false }
                )
                .setTimestamp();

            return interaction.editReply({ embeds: [successEmbed] });
        }
    }
};
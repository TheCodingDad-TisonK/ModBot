/**
 * FS25 ModBot — /warn & /warnings
 * Warns a user and tracks history in the database.
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
        .setName('warn')
        .setDescription('Warn a member or view their warning history')
        .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers)
        .addSubcommand(sub =>
            sub.setName('add')
               .setDescription('Issue a warning to a member')
               .addUserOption(opt =>
                   opt.setName('user').setDescription('Member to warn').setRequired(true))
               .addStringOption(opt =>
                   opt.setName('reason').setDescription('Reason for the warning').setRequired(true).setMaxLength(512)))
        .addSubcommand(sub =>
            sub.setName('list')
               .setDescription('View warnings for a member')
               .addUserOption(opt =>
                   opt.setName('user').setDescription('Member to look up').setRequired(true)))
        .addSubcommand(sub =>
            sub.setName('remove')
               .setDescription('Remove a specific warning by ID')
               .addIntegerOption(opt =>
                   opt.setName('id').setDescription('Warning ID to remove').setRequired(true).setMinValue(1))),

    async execute(interaction, client) {
        await interaction.deferReply({ ephemeral: true });

        const sub = interaction.options.getSubcommand();

        // ── Add ────────────────────────────────────────────────────────────
        if (sub === 'add') {
            const target = interaction.options.getMember('user');
            const reason = interaction.options.getString('reason');

            if (!target) return interaction.editReply({ content: '❌ That user is not in this server.' });
            if (target.id === interaction.user.id)  return interaction.editReply({ content: '❌ You cannot warn yourself.' });
            if (target.user.bot)                    return interaction.editReply({ content: '❌ You cannot warn bots.' });

            const result = db.addWarning(interaction.guild.id, target.user.id, interaction.user.id, reason);

            // Count total warnings for this user in this guild
            const allWarnings = db.getWarnings(target.user.id).filter(w => w.guild_id === interaction.guild.id);

            // DM the warned user
            const dmEmbed = new EmbedBuilder()
                .setColor(Colors.Yellow)
                .setTitle(`⚠️ You received a warning in ${interaction.guild.name}`)
                .addFields(
                    { name: 'Reason',         value: reason,                   inline: false },
                    { name: 'Moderator',      value: interaction.user.tag,      inline: true  },
                    { name: 'Total Warnings', value: `${allWarnings.length}`,   inline: true  }
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
                        .setAuthor({ name: 'Member Warned', iconURL: target.user.displayAvatarURL() })
                        .addFields(
                            { name: '👤 User',           value: `${target.user} (${target.user.id})`,           inline: true  },
                            { name: '🛡️ Moderator',      value: `${interaction.user} (${interaction.user.id})`, inline: true  },
                            { name: '🔢 Total Warnings', value: `${allWarnings.length}`,                         inline: true  },
                            { name: '📝 Reason',         value: reason,                                           inline: false }
                        )
                        .setFooter({ text: `Warning ID: ${result.lastInsertRowid}` })
                        .setTimestamp();
                    await logChannel.send({ embeds: [logEmbed] }).catch(() => null);
                }
            }

            const successEmbed = new EmbedBuilder()
                .setColor(Colors.Green)
                .setTitle('✅ Warning Issued')
                .addFields(
                    { name: 'User',           value: `${target.user.tag}`,    inline: true },
                    { name: 'Total Warnings', value: `${allWarnings.length}`, inline: true },
                    { name: 'Reason',         value: reason,                   inline: false }
                )
                .setTimestamp();

            return interaction.editReply({ embeds: [successEmbed] });
        }

        // ── List ───────────────────────────────────────────────────────────
        if (sub === 'list') {
            const target = interaction.options.getUser('user');
            const user   = db.getUser(target.id);

            if (!user) {
                return interaction.editReply({ content: '📭 No records found for that user.' });
            }

            const warnings = db.getWarnings(user.id);
            const guildWarnings = warnings.filter(w => w.guild_id === interaction.guild.id);

            if (guildWarnings.length === 0) {
                return interaction.editReply({
                    embeds: [
                        new EmbedBuilder()
                            .setColor(Colors.Green)
                            .setTitle(`⚠️ Warnings — ${target.username}`)
                            .setDescription('✅ This user has no warnings on this server.')
                            .setThumbnail(target.displayAvatarURL())
                            .setTimestamp()
                    ]
                });
            }

            const warnList = guildWarnings.slice(0, 10).map((w, i) =>
                `**#${w.id}** — ${w.reason}\n┗ by <@${w.moderator_id}> • <t:${Math.floor(new Date(w.created_at).getTime() / 1000)}:R>`
            ).join('\n\n');

            const embed = new EmbedBuilder()
                .setColor(Colors.Yellow)
                .setTitle(`⚠️ Warnings — ${target.username}`)
                .setThumbnail(target.displayAvatarURL())
                .setDescription(warnList)
                .setFooter({ text: `Showing ${Math.min(guildWarnings.length, 10)} of ${guildWarnings.length} warnings` })
                .setTimestamp();

            return interaction.editReply({ embeds: [embed] });
        }

        // ── Remove ─────────────────────────────────────────────────────────
        if (sub === 'remove') {
            const warnId = interaction.options.getInteger('id');
            const result = db.deleteWarning(warnId);

            if (result.changes === 0) {
                return interaction.editReply({ content: `❌ No warning found with ID \`${warnId}\`.` });
            }

            return interaction.editReply({
                embeds: [
                    new EmbedBuilder()
                        .setColor(Colors.Green)
                        .setTitle('✅ Warning Removed')
                        .setDescription(`Warning \`#${warnId}\` has been deleted.`)
                        .setTimestamp()
                ]
            });
        }
    }
};
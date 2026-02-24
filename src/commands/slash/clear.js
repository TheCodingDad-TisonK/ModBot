/**
 * FS25 ModBot — /clear
 * Bulk-deletes messages with optional user filter.
 */

const {
    SlashCommandBuilder,
    EmbedBuilder,
    Colors,
    PermissionFlagsBits
} = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('clear')
        .setDescription('Bulk-delete messages in this channel')
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages)
        .addIntegerOption(opt =>
            opt.setName('amount')
               .setDescription('Number of messages to delete (1–100)')
               .setRequired(true)
               .setMinValue(1)
               .setMaxValue(100))
        .addUserOption(opt =>
            opt.setName('user')
               .setDescription('Only delete messages from this user')
               .setRequired(false))
        .addStringOption(opt =>
            opt.setName('reason')
               .setDescription('Reason for clearing (appears in audit log)')
               .setRequired(false)
               .setMaxLength(512)),

    async execute(interaction, client) {
        await interaction.deferReply({ ephemeral: true });

        const amount  = interaction.options.getInteger('amount');
        const target  = interaction.options.getUser('user');
        const reason  = interaction.options.getString('reason') ?? 'Bulk message clear';

        // Fetch messages (Discord bulkDelete only handles up to 100)
        const fetched = await interaction.channel.messages.fetch({ limit: 100 });

        // Filter by user if specified
        const toDelete = target
            ? fetched.filter(m => m.author.id === target.id).first(amount)
            : [...fetched.values()].slice(0, amount);

        // Discord cannot bulk-delete messages older than 14 days
        const twoWeeksAgo = Date.now() - 14 * 24 * 60 * 60 * 1000;
        const deletable   = toDelete.filter(m => m.createdTimestamp > twoWeeksAgo);
        const tooOld      = toDelete.length - deletable.length;

        if (deletable.length === 0) {
            return interaction.editReply({
                content: '❌ No messages to delete — they may all be older than 14 days.'
            });
        }

        const deleted = await interaction.channel.bulkDelete(deletable, true);

        const embed = new EmbedBuilder()
            .setColor(Colors.Green)
            .setTitle('🗑️ Messages Cleared')
            .addFields(
                { name: 'Deleted',   value: `${deleted.size}`,                               inline: true },
                { name: 'Channel',   value: `${interaction.channel}`,                         inline: true },
                { name: 'Moderator', value: `${interaction.user.tag}`,                         inline: true },
                { name: 'Filter',    value: target ? `Messages from ${target.tag}` : 'All',   inline: true },
                { name: 'Reason',    value: reason,                                             inline: false }
            )
            .setTimestamp();

        if (tooOld > 0) {
            embed.setFooter({ text: `${tooOld} message(s) skipped — older than 14 days` });
        }

        await interaction.editReply({ embeds: [embed] });

        // Auto-delete the ephemeral confirmation after 5 s
        setTimeout(() => interaction.deleteReply().catch(() => null), 5000);
    }
};
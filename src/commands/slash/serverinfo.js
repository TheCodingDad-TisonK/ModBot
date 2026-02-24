/**
 * FS25 ModBot — /serverinfo
 * Displays comprehensive information about the current guild.
 */

const { SlashCommandBuilder, EmbedBuilder, Colors } = require('discord.js');

const VERIFICATION_LEVELS = ['None', 'Low', 'Medium', 'High', 'Very High'];
const BOOST_LEVELS        = { 0: 'No Level', 1: '🥉 Level 1', 2: '🥈 Level 2', 3: '🥇 Level 3' };

module.exports = {
    data: new SlashCommandBuilder()
        .setName('serverinfo')
        .setDescription('Get detailed information about this server'),

    async execute(interaction, client) {
        await interaction.deferReply();

        const guild = interaction.guild;

        // Fetch members, roles, channels for accurate counts
        await guild.members.fetch().catch(() => null);

        const owner       = await guild.fetchOwner().catch(() => null);
        const bots        = guild.members.cache.filter(m => m.user.bot).size;
        const humans      = guild.memberCount - bots;
        const textChans   = guild.channels.cache.filter(c => c.type === 0).size;
        const voiceChans  = guild.channels.cache.filter(c => c.type === 2).size;
        const categories  = guild.channels.cache.filter(c => c.type === 4).size;
        const emojis      = guild.emojis.cache.size;
        const stickers    = guild.stickers.cache.size;
        const roles       = guild.roles.cache.size - 1; // exclude @everyone

        const embed = new EmbedBuilder()
            .setColor(Colors.Blurple)
            .setAuthor({ name: guild.name, iconURL: guild.iconURL({ dynamic: true }) ?? undefined })
            .setThumbnail(guild.iconURL({ dynamic: true, size: 256 }))
            .addFields(
                { name: '🪪 Server ID',      value: guild.id,                                        inline: true },
                { name: '👑 Owner',          value: owner ? `${owner.user.tag}` : 'Unknown',          inline: true },
                { name: '📅 Created',        value: `<t:${Math.floor(guild.createdTimestamp / 1000)}:R>`, inline: true },
                { name: '👥 Members',        value: `${guild.memberCount} total\n${humans} humans • ${bots} bots`, inline: true },
                { name: '📁 Channels',       value: `${textChans} text • ${voiceChans} voice\n${categories} categories`, inline: true },
                { name: '🎭 Roles',          value: `${roles}`,                                       inline: true },
                { name: '🔐 Verification',   value: VERIFICATION_LEVELS[guild.verificationLevel] ?? 'Unknown', inline: true },
                { name: '🚀 Boosts',         value: `${guild.premiumSubscriptionCount} (${BOOST_LEVELS[guild.premiumTier] ?? 'No Level'})`, inline: true },
                { name: '😀 Emojis/Stickers',value: `${emojis} emojis • ${stickers} stickers`,        inline: true }
            )
            .setFooter({ text: `Requested by ${interaction.user.tag}` })
            .setTimestamp();

        if (guild.description) {
            embed.setDescription(`> ${guild.description}`);
        }
        if (guild.bannerURL()) {
            embed.setImage(guild.bannerURL({ size: 1024 }));
        }

        await interaction.editReply({ embeds: [embed] });
    }
};
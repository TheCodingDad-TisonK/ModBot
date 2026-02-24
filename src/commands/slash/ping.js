/**
 * FS25 ModBot — /ping
 * Shows bot latency with a clean, informative embed.
 */

const { SlashCommandBuilder, EmbedBuilder, Colors } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('ping')
        .setDescription('Check bot latency and API status'),

    async execute(interaction, client) {
        // Send a placeholder so we can measure round-trip
        const sent = await interaction.reply({
            embeds: [
                new EmbedBuilder()
                    .setColor(Colors.Yellow)
                    .setDescription('📡 Measuring latency…')
            ],
            fetchReply: true
        });

        const roundTrip = sent.createdTimestamp - interaction.createdTimestamp;
        const wsPing    = client.ws.ping;

        const color =
            roundTrip < 150 ? Colors.Green :
            roundTrip < 400 ? Colors.Yellow :
            Colors.Red;

        const statusEmoji =
            roundTrip < 150 ? '🟢' :
            roundTrip < 400 ? '🟡' :
            '🔴';

        const embed = new EmbedBuilder()
            .setColor(color)
            .setAuthor({
                name: `${client.user.username} — Latency Check`,
                iconURL: client.user.displayAvatarURL()
            })
            .setDescription(`${statusEmoji} **Status:** ${roundTrip < 400 ? 'Operational' : 'Degraded'}`)
            .addFields(
                { name: '⏱️ Round-Trip', value: `\`${roundTrip} ms\``,  inline: true },
                { name: '🌐 WebSocket',  value: `\`${wsPing} ms\``,     inline: true },
                { name: '📅 Uptime',     value: `<t:${Math.floor((Date.now() - client.uptime) / 1000)}:R>`, inline: true }
            )
            .setFooter({ text: `Shard ${interaction.guild?.shardId ?? 0}` })
            .setTimestamp();

        await interaction.editReply({ embeds: [embed] });
    }
};
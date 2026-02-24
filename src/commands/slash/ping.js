const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('ping')
        .setDescription('Check bot latency'),
    
    async execute(interaction, client) {
        const ping = client.ws.ping;
        
        await interaction.reply({ 
            embeds: [{
                color: 0x2ecc71,
                title: '🏓 Pong!',
                fields: [
                    { name: 'Bot Latency', value: `${ping}ms`, inline: true },
                    { name: 'API Latency', value: `${Date.now() - interaction.createdTimestamp}ms`, inline: true }
                ]
            }],
            ephemeral: false
        });
    }
};

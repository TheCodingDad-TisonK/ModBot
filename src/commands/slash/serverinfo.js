const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('serverinfo')
        .setDescription('Get server information'),
    
    async execute(interaction, client) {
        const guild = interaction.guild;
        
        const embed = new EmbedBuilder()
            .setColor(0x2ecc71)
            .setTitle(`Server Info: ${guild.name}`)
            .setThumbnail(guild.iconURL())
            .addFields(
                { name: 'Server Name', value: guild.name, inline: true },
                { name: 'Server ID', value: guild.id, inline: true },
                { name: 'Members', value: `${guild.memberCount}`, inline: true },
                { name: 'Channels', value: `${guild.channels.cache.size}`, inline: true },
                { name: 'Roles', value: `${guild.roles.cache.size}`, inline: true },
                { name: 'Created', value: guild.createdAt.toDateString(), inline: true },
                { name: 'Owner', value: (await guild.fetchOwner()).user.tag, inline: true }
            );
        
        await interaction.reply({ embeds: [embed] });
    }
};

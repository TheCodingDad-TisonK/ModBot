const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('userinfo')
        .setDescription('Get user information')
        .addUserOption(option => 
            option.setName('user')
                .setDescription('The user to get info about')
                .setRequired(false)),
    
    async execute(interaction, client) {
        const user = interaction.options.getUser('user') || interaction.user;
        const member = interaction.guild.members.cache.get(user.id) || await interaction.guild.members.fetch(user.id);
        
        const embed = new EmbedBuilder()
            .setColor(0x2ecc71)
            .setTitle(`User Info: ${user.username}`)
            .setThumbnail(user.displayAvatarURL())
            .addFields(
                { name: 'Username', value: user.tag, inline: true },
                { name: 'ID', value: user.id, inline: true },
                { name: 'Joined Server', value: member.joinedAt.toDateString(), inline: true },
                { name: 'Joined Discord', value: user.createdAt.toDateString(), inline: true },
                { name: 'Roles', value: member.roles.cache.size > 1 ? member.roles.cache.filter(r => r.id !== interaction.guild.id).map(r => r).join(', ') : 'None' }
            );
        
        await interaction.reply({ embeds: [embed] });
    }
};

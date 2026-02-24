const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('ban')
        .setDescription('Ban a user from the server')
        .addUserOption(option => 
            option.setName('user')
                .setDescription('The user to ban')
                .setRequired(true))
        .addStringOption(option => 
            option.setName('reason')
                .setDescription('Reason for banning')
                .setRequired(false))
        .addIntegerOption(option =>
            option.setName('days')
                .setDescription('Number of days to delete messages (0-7)')
                .setRequired(false)
                .setMinValue(0)
                .setMaxValue(7)),
    
    async execute(interaction, client) {
        const user = interaction.options.getUser('user');
        const reason = interaction.options.getString('reason') || 'No reason provided';
        const days = interaction.options.getInteger('days') || 0;
        const member = interaction.guild.members.cache.get(user.id);
        
        if (!member) {
            return interaction.reply({ content: 'User not found in this server.', ephemeral: true });
        }
        
        if (!member.bannable) {
            return interaction.reply({ content: 'I cannot ban this user.', ephemeral: true });
        }
        
        try {
            await member.ban({ reason, deleteMessageDays: days });
            interaction.reply({ content: `Banned ${user.tag} for: ${reason}`, ephemeral: true });
        } catch (error) {
            interaction.reply({ content: 'Error banning user.', ephemeral: true });
        }
    }
};

const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('unban')
        .setDescription('Unban a user from the server')
        .addStringOption(option => 
            option.setName('user_id')
                .setDescription('The user ID to unban')
                .setRequired(true))
        .addStringOption(option => 
            option.setName('reason')
                .setDescription('Reason for unbanning')
                .setRequired(false)),
    
    async execute(interaction, client) {
        const userId = interaction.options.getString('user_id');
        const reason = interaction.options.getString('reason') || 'No reason provided';
        
        try {
            const bannedUsers = await interaction.guild.bans.fetch();
            const user = bannedUsers.get(userId);
            
            if (!user) {
                return interaction.reply({ content: 'User not found in ban list.', ephemeral: true });
            }
            
            await interaction.guild.bans.remove(userId, reason);
            interaction.reply({ content: `Unbanned user ID: ${userId}`, ephemeral: true });
        } catch (error) {
            interaction.reply({ content: 'Error unbanning user.', ephemeral: true });
        }
    }
};

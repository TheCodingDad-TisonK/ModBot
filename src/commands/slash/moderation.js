const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('kick')
        .setDescription('Kick a user from the server')
        .addUserOption(option => 
            option.setName('user')
                .setDescription('The user to kick')
                .setRequired(true))
        .addStringOption(option => 
            option.setName('reason')
                .setDescription('Reason for kicking')
                .setRequired(false)),
    
    async execute(interaction, client) {
        const user = interaction.options.getUser('user');
        const reason = interaction.options.getString('reason') || 'No reason provided';
        const member = interaction.guild.members.cache.get(user.id);
        
        if (!member) {
            return interaction.reply({ content: 'User not found in this server.', ephemeral: true });
        }
        
        if (!member.kickable) {
            return interaction.reply({ content: 'I cannot kick this user.', ephemeral: true });
        }
        
        try {
            await member.kick(reason);
            interaction.reply({ content: `Kicked ${user.tag} for: ${reason}`, ephemeral: true });
        } catch (error) {
            interaction.reply({ content: 'Error kicking user.', ephemeral: true });
        }
    }
};

const { SlashCommandBuilder } = require('discord.js');
const db = require('../../utils/database');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('warn')
        .setDescription('Warn a user')
        .addUserOption(option => 
            option.setName('user')
                .setDescription('The user to warn')
                .setRequired(true))
        .addStringOption(option => 
            option.setName('reason')
                .setDescription('Reason for warning')
                .setRequired(false)),
    
    async execute(interaction, client) {
        const user = interaction.options.getUser('user');
        const reason = interaction.options.getString('reason') || 'No reason provided';
        const guildId = interaction.guild.id;
        
        // Save warning to database
        db.addWarning(guildId, user.id, interaction.user.id, reason);
        
        const embed = {
            color: 0xffaa00,
            title: '⚠️ User Warned',
            fields: [
                { name: 'User', value: user.tag, inline: true },
                { name: 'Moderator', value: interaction.user.tag, inline: true },
                { name: 'Reason', value: reason }
            ],
            timestamp: new Date()
        };
        
        await interaction.reply({ embeds: [embed], ephemeral: true });
        
        // Try to DM the user
        try {
            await user.send({ embeds: [{
                color: 0xffaa00,
                title: '⚠️ You have been warned',
                description: `In ${interaction.guild.name}: ${reason}`
            }]});
        } catch (e) {
            // User might have DMs closed
        }
    }
};

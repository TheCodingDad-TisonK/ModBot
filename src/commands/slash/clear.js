const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('clear')
        .setDescription('Delete messages')
        .addIntegerOption(option => 
            option.setName('amount')
                .setDescription('Number of messages to delete (1-100)')
                .setRequired(true)
                .setMinValue(1)
                .setMaxValue(100)),
    
    async execute(interaction, client) {
        const amount = interaction.options.getInteger('amount');
        
        const messages = await interaction.channel.messages.fetch({ limit: amount });
        
        await interaction.channel.bulkDelete(messages, true);
        
        await interaction.reply({ content: `Deleted ${messages.size} messages.`, ephemeral: true });
        
        // Auto-delete after 3 seconds
        setTimeout(() => {
            interaction.deleteReply().catch(() => {});
        }, 3000);
    }
};

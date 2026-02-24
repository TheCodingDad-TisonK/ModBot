/**
 * FS25 ModBot - Modal Handler
 * Handles modal submit interactions
 */

const logger = require('../utils/logger');

/**
 * Handle modal submissions
 */
async function handle(interaction, client) {
    const { customId } = interaction;
    
    try {
        const [action, ...args] = customId.split('_');
        
        switch (action) {
            case 'ticket':
                await handleTicketModal(interaction, args, client);
                break;
            case 'warn':
                await handleWarnModal(interaction, args, client);
                break;
            case 'ban':
                await handleBanModal(interaction, args, client);
                break;
            case 'suggest':
                await handleSuggestModal(interaction, args, client);
                break;
            default:
                logger.warn(`Unknown modal action: ${action}`);
        }
    } catch (error) {
        logger.error('Error handling modal submission:', error);
        
        if (!interaction.replied) {
            await interaction.reply({ 
                content: 'An error occurred while processing your request.', 
                ephemeral: true 
            });
        }
    }
}

/**
 * Handle ticket modal
 */
async function handleTicketModal(interaction, args, client) {
    const subject = interaction.fields.getTextInputValue('subject');
    const description = interaction.fields.getTextInputValue('description');
    const category = interaction.fields.getTextInputValue('category') || 'General';
    
    await interaction.reply({ 
        content: `Ticket created: ${subject}\nCategory: ${category}`, 
        ephemeral: true 
    });
}

/**
 * Handle warn modal
 */
async function handleWarnModal(interaction, args, client) {
    const reason = interaction.fields.getTextInputValue('reason');
    const userId = args[0];
    
    await interaction.reply({ 
        content: `User ${userId} warned for: ${reason}`, 
        ephemeral: true 
    });
}

/**
 * Handle ban modal
 */
async function handleBanModal(interaction, args, client) {
    const reason = interaction.fields.getTextInputValue('reason');
    const userId = args[0];
    
    await interaction.reply({ 
        content: `User ${userId} banned for: ${reason}`, 
        ephemeral: true 
    });
}

/**
 * Handle suggest modal
 */
async function handleSuggestModal(interaction, args, client) {
    const suggestion = interaction.fields.getTextInputValue('suggestion');
    
    await interaction.reply({ 
        content: `Suggestion submitted: ${suggestion}`, 
        ephemeral: true 
    });
}

module.exports = {
    handle
};

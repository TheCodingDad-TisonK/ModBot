/**
 * FS25 ModBot - Select Menu Handler
 * Handles select menu interactions
 */

const logger = require('../utils/logger');

/**
 * Handle select menu interactions
 */
async function handle(interaction, client) {
    const { customId } = interaction;
    
    try {
        const [action, ...args] = customId.split('_');
        
        switch (action) {
            case 'ticket':
                await handleTicketSelect(interaction, args, client);
                break;
            case 'role':
                await handleRoleSelect(interaction, args, client);
                break;
            case 'lang':
                await handleLangSelect(interaction, args, client);
                break;
            default:
                logger.warn(`Unknown select menu action: ${action}`);
        }
    } catch (error) {
        logger.error('Error handling select menu interaction:', error);
        
        if (!interaction.replied) {
            await interaction.reply({ 
                content: 'An error occurred while processing your request.', 
                ephemeral: true 
            });
        }
    }
}

/**
 * Handle ticket select menus
 */
async function handleTicketSelect(interaction, args, client) {
    const category = interaction.values[0];
    
    await interaction.reply({ 
        content: `Selected category: ${category}. Creating ticket...`, 
        ephemeral: true 
    });
}

/**
 * Handle role select menus
 */
async function handleRoleSelect(interaction, args, client) {
    const roleId = interaction.values[0];
    const role = interaction.guild.roles.cache.get(roleId);
    
    if (!role) {
        return interaction.reply({ 
            content: 'Role not found.', 
            ephemeral: true 
        });
    }
    
    const member = interaction.member;
    const hasRole = member.roles.cache.has(roleId);
    
    if (hasRole) {
        await member.roles.remove(role);
        await interaction.reply({ 
            content: `Removed role: ${role.name}`, 
            ephemeral: true 
        });
    } else {
        await member.roles.add(role);
        await interaction.reply({ 
            content: `Added role: ${role.name}`, 
            ephemeral: true 
        });
    }
}

/**
 * Handle language select menus
 */
async function handleLangSelect(interaction, args, client) {
    const lang = interaction.values[0];
    
    await interaction.reply({ 
        content: `Language set to: ${lang}`, 
        ephemeral: true 
    });
}

module.exports = {
    handle
};

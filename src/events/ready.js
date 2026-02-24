/**
 * FS25 ModBot - Ready Event
 * Triggered when the bot is ready
 */

const logger = require('../utils/logger');

module.exports = {
    name: 'ready',
    once: true,
    
    async execute(client) {
        logger.info('='.repeat(50));
        logger.info('🎉 Bot is ready!');
        logger.info(`Logged in as: ${client.user.tag}`);
        logger.info(`Bot ID: ${client.user.id}`);
        logger.info(`Servers: ${client.guilds.cache.size}`);
        logger.info(`Users: ${client.users.cache.size}`);
        logger.info(`Channels: ${client.channels.cache.size}`);
        logger.info('='.repeat(50));
        
        // Set presence
        client.user.setPresence({
            status: 'online',
            activities: [{
                name: 'FS25 Modding Community | /help',
                type: 0
            }]
        });
        
        // Sync slash commands if guild ID is configured
        if (client.config.guildId && client.slashCommands.size > 0) {
            try {
                const guild = await client.guilds.fetch(client.config.guildId);
                if (guild) {
                    const commands = Array.from(client.slashCommands.values()).map(cmd => cmd.data);
                    await guild.commands.set(commands);
                    logger.info('Slash commands synced to server');
                }
            } catch (error) {
                logger.error('Failed to sync slash commands:', error);
            }
        }
        
        // Initialize client cache
        client.automodCache = new Map();
        client.levelCache = new Map();
        
        logger.info('Bot initialization complete!');
    }
};

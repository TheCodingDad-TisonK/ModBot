/**
 * FS25 ModBot - Event Handler
 * Loads and manages Discord events
 */

const fs = require('fs');
const path = require('path');
const logger = require('../utils/logger');
const { handleCommand } = require('./commandHandler');

/**
 * Load all events from the events directory
 */
async function loadEvents(client) {
    const eventsPath = path.join(__dirname, '../events');
    
    if (!fs.existsSync(eventsPath)) {
        logger.warn('Events directory not found');
        return;
    }
    
    const eventFiles = fs.readdirSync(eventsPath).filter(file => file.endsWith('.js'));
    
    for (const file of eventFiles) {
        const eventPath = path.join(eventsPath, file);
        
        try {
            const event = require(eventPath);
            
            if (!event.name) {
                logger.warn(`Event ${file} is missing name property`);
                continue;
            }
            
            // Bind event to client
            if (event.once) {
                client.once(event.name, (...args) => event.execute(...args, client));
            } else {
                client.on(event.name, (...args) => event.execute(...args, client));
            }
            
            logger.info(`Loaded event: ${event.name}`);
            
        } catch (error) {
            logger.error(`Failed to load event ${file}:`, error);
        }
    }
}

/**
 * Default ready event
 */
async function readyEvent(client) {
    logger.info(`Logged in as ${client.user.tag}`);
    
    // Update presence
    client.user.setPresence({
        status: 'online',
        activities: [{
            name: 'FS25 Modding Community | !help',
            type: 0
        }]
    });
    
    // Sync commands
    if (client.slashCommands.size > 0) {
        try {
            const guild = client.guilds.cache.get(client.config.guildId);
            if (guild) {
                await guild.commands.set(Array.from(client.slashCommands.values()).map(cmd => cmd.data));
                logger.info('Slash commands synced');
            }
        } catch (error) {
            logger.error('Failed to sync slash commands:', error);
        }
    }
}

/**
 * Default message event
 */
async function messageEvent(message, client) {
    if (message.guild) {
        await handleCommand(client, message);
    }
}

/**
 * Default guildCreate event
 */
async function guildCreateEvent(guild, client) {
    logger.info(`Joined guild: ${guild.name} (${guild.id})`);
    
    // Initialize settings for new guild
    const db = require('../utils/database');
    db.getSettings(guild.id);
}

/**
 * Default guildDelete event
 */
async function guildDeleteEvent(guild, client) {
    logger.info(`Left guild: ${guild.name} (${guild.id})`);
}

/**
 * Default error event
 */
async function errorEvent(error, client) {
    logger.error('Discord client error:', error);
}

/**
 * Default warn event
 */
async function warnEvent(warn, client) {
    logger.warn('Discord client warning:', warn);
}

module.exports = {
    loadEvents,
    ready: readyEvent,
    messageCreate: messageEvent,
    guildCreate: guildCreateEvent,
    guildDelete: guildDeleteEvent,
    error: errorEvent,
    warn: warnEvent
};

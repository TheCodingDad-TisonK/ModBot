/**
 * FS25 ModBot - Command Handler
 * Loads and manages text commands
 */

const fs = require('fs');
const path = require('path');
const logger = require('../utils/logger');
const db = require('../utils/database');

/**
 * Load all commands from the commands directory
 */
async function loadCommands(client) {
    const commandsPath = path.join(__dirname, '../commands');
    
    if (!fs.existsSync(commandsPath)) {
        logger.warn('Commands directory not found');
        return;
    }
    
    // Command categories
    const categories = fs.readdirSync(commandsPath).filter(file => 
        fs.statSync(path.join(commandsPath, file)).isDirectory()
    );
    
    for (const category of categories) {
        const categoryPath = path.join(commandsPath, category);
        const commandFiles = fs.readdirSync(categoryPath).filter(file => file.endsWith('.js'));
        
        for (const file of commandFiles) {
            const commandPath = path.join(categoryPath, file);
            
            try {
                const command = require(commandPath);
                
                // Validate command structure
                if (!command.name) {
                    logger.warn(`Command ${file} is missing name property`);
                    continue;
                }
                
                // Set category if not provided
                command.category = category;
                
                // Add aliases
                if (command.aliases && Array.isArray(command.aliases)) {
                    for (const alias of command.aliases) {
                        client.aliases.set(alias, command.name);
                    }
                }
                
                // Set cooldown
                if (!command.cooldown) {
                    command.cooldown = 3;
                }
                
                // Set cooldown collection
                client.cooldowns.set(command.name, new Map());
                
                // Add to commands collection
                client.commands.set(command.name, command);
                
                logger.info(`Loaded command: ${command.name} (${category})`);
                
            } catch (error) {
                logger.error(`Failed to load command ${file}:`, error);
            }
        }
    }
}

/**
 * Handle message commands
 */
async function handleCommand(client, message) {
    // Ignore bots
    if (message.author.bot) return;
    
    // Get settings
    const settings = db.getSettings(message.guild.id);
    const prefix = settings?.prefix || client.config.prefix || '!';
    
    // Check if message starts with prefix
    if (!message.content.startsWith(prefix)) {
        // Check for custom commands
        const customCommand = db.getCustomCommand(message.guild.id, message.content.slice(prefix.length).toLowerCase().trim());
        if (customCommand) {
            message.reply(customCommand.response);
            return;
        }
        return;
    }
    
    // Parse command and arguments
    const args = message.content.slice(prefix.length).trim().split(/\s+/);
    const commandName = args.shift().toLowerCase();
    
    // Get command from name or aliases
    const command = client.commands.get(commandName) || 
                   client.commands.get(client.aliases.get(commandName));
    
    if (!command) return;
    
    // Check if command is enabled
    if (command.enabled === false) {
        return message.reply('This command is currently disabled.');
    }
    
    // Check permissions
    if (command.permissions) {
        const member = message.member;
        if (!member.permissions.has(command.permissions)) {
            return message.reply(`You need the \`${command.permissions}\` permission to use this command.`);
        }
    }
    
    // Check user permissions (bot)
    if (command.botPermissions) {
        const botMember = message.guild.members.me;
        if (!botMember.permissions.has(command.botPermissions)) {
            return message.reply(`I need the \`${command.botPermissions}\` permission to run this command.`);
        }
    }
    
    // Check cooldown
    if (command.cooldown) {
        const cooldowns = client.cooldowns.get(command.name);
        const now = Date.now();
        const cooldownAmount = command.cooldown * 1000;
        
        if (cooldowns.has(message.author.id)) {
            const expirationTime = cooldowns.get(message.author.id) + cooldownAmount;
            
            if (now < expirationTime) {
                const timeLeft = (expirationTime - now) / 1000;
                return message.reply(`Please wait ${timeLeft.toFixed(1)} seconds before using this command again.`);
            }
        }
        
        cooldowns.set(message.author.id, now);
        setTimeout(() => cooldowns.delete(message.author.id), cooldownAmount);
    }
    
    // Execute command
    try {
        // Create user in database if not exists
        db.getOrCreateUser(message.author.id, message.author.username);
        
        // Log command usage
        if (client.features.leveling) {
            db.logCommandUsage(command.name, message.guild.id, message.author.id);
        }
        
        // Execute command
        await command.execute(message, args, client);
        
        logger.info(`Command executed: ${command.name} by ${message.author.tag} in ${message.guild.name}`);
        
    } catch (error) {
        logger.error(`Error executing command ${command.name}:`, error);
        message.reply('An error occurred while executing this command.');
    }
}

module.exports = {
    loadCommands,
    handleCommand
};

/**
 * FS25 ModBot - Message Create Event
 * Handles incoming messages
 */

const { handleCommand } = require('../handlers/commandHandler');
const logger = require('../utils/logger');
const db = require('../utils/database');

module.exports = {
    name: 'messageCreate',
    once: false,
    
    async execute(message, client) {
        // Ignore bots
        if (message.author.bot) return;
        
        // Ignore DMs
        if (!message.guild) return;
        
        // Get settings
        const settings = db.getSettings(message.guild.id);
        
        // Handle text commands
        if (settings) {
            const prefix = settings.prefix || client.config.prefix || '!';
            
            if (message.content.startsWith(prefix)) {
                await handleCommand(client, message);
                return;
            }
            
            // Check custom commands
            const customCommand = db.getCustomCommand(message.guild.id, message.content.trim().toLowerCase());
            if (customCommand) {
                message.reply(customCommand.response);
                return;
            }
        }
        
        // Auto-moderation
        if (settings?.automod_enabled) {
            await runAutoMod(message, settings, client);
        }
        
        // Leveling system
        if (settings?.level_enabled) {
            await handleLeveling(message, client);
        }
    }
};

/**
 * Run auto-moderation checks
 */
async function runAutoMod(message, settings, client) {
    const content = message.content.toLowerCase();
    const member = message.member;
    
    // Skip if member has bypass permission
    if (member.permissions.has('ManageMessages')) return;
    
    // Anti-spam
    if (settings.automod_antispam) {
        const spamPatterns = [
            /(.)\1{5,}/,  // Repeated characters
            /[a-z]{10,}/i  // Long random strings
        ];
        
        for (const pattern of spamPatterns) {
            if (pattern.test(content)) {
                await message.delete();
                await message.channel.send(`${member.user}, please don't spam!`);
                return;
            }
        }
    }
    
    // Anti-links
    if (settings.automod_antilinks) {
        const linkPattern = /(https?:\/\/[^\s]+)|(www\.[^\s]+)|(discord\.gg\/[^\s]+)/i;
        if (linkPattern.test(message.content)) {
            await message.delete();
            await message.channel.send(`${member.user}, links are not allowed!`);
            return;
        }
    }
    
    // Anti-profanity (basic word filter)
    if (settings.automod_antiprofanity) {
        const badWords = ['badword1', 'badword2', 'badword3']; // Add actual bad words
        for (const word of badWords) {
            if (content.includes(word)) {
                await message.delete();
                await message.channel.send(`${member.user}, inappropriate language is not allowed!`);
                return;
            }
        }
    }
    
    // Anti-mention spam
    if (settings.automod_antimention) {
        const mentionCount = message.mentions.users.size + message.mentions.roles.size;
        if (mentionCount > 5) {
            await message.delete();
            await message.channel.send(`${member.user}, don't mention too many people!`);
            return;
        }
    }
    
    // Anti-caps
    const capsCount = (message.content.match(/[A-Z]/g) || []).length;
    const totalChars = message.content.replace(/[^a-zA-Z]/g, '').length;
    if (totalChars > 10 && capsCount / totalChars > 0.7) {
        await message.delete();
        await message.channel.send(`${member.user}, please don't use too many caps!`);
        return;
    }
}

/**
 * Handle leveling system
 */
async function handleLeveling(message, client) {
    try {
        // Get or create user
        const user = db.getOrCreateUser(message.author.id, message.author.username);
        
        // Add XP for message
        const xpGain = Math.floor(Math.random() * 5) + 1; // 1-5 XP per message
        const result = db.updateUserXP(message.author.id, xpGain);
        
        // Check for level up
        if (result && result.level > user.level) {
            const settings = db.getSettings(message.guild.id);
            
            if (settings.level_up_messages) {
                const embed = {
                    color: 0x00ff00,
                    title: '🎉 Level Up!',
                    description: `${message.author} has reached level ${result.level}!`,
                    timestamp: new Date()
                };
                
                message.channel.send({ embeds: [embed] });
            }
            
            // Emit level up event for role rewards
            client.emit('levelUp', message.member, result.level);
        }
    } catch (error) {
        logger.error('Error in leveling system:', error);
    }
}

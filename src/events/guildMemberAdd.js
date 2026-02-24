/**
 * FS25 ModBot - Guild Member Add Event
 * Handles new member joins
 */

const { EmbedBuilder, Colors } = require('discord.js');
const logger = require('../utils/logger');
const db = require('../utils/database');

module.exports = {
    name: 'guildMemberAdd',
    once: false,
    
    async execute(member, client) {
        const guild = member.guild;
        
        // Create user in database
        db.getOrCreateUser(member.id, member.user.username);
        
        // Get settings
        const settings = db.getSettings(guild.id);
        
        // Welcome message
        if (settings?.welcome_channel && settings?.welcome_message) {
            const channel = guild.channels.cache.get(settings.welcome_channel);
            
            if (channel) {
                const embed = new EmbedBuilder()
                    .setColor(Colors.Green)
                    .setTitle('👋 Welcome!')
                    .setDescription(settings.welcome_message
                        .replace('{user}', member.user)
                        .replace('{username}', member.user.username)
                        .replace('{server}', guild.name)
                        .replace('{membercount}', guild.memberCount))
                    .setThumbnail(member.user.displayAvatarURL())
                    .setTimestamp();
                
                channel.send({ embeds: [embed] });
            }
        }
        
        // Log to mod log
        if (settings?.mod_log_channel) {
            const channel = guild.channels.cache.get(settings.mod_log_channel);
            
            if (channel) {
                const embed = new EmbedBuilder()
                    .setColor(Colors.Green)
                    .setTitle('✅ Member Joined')
                    .addFields(
                        { name: 'User', value: `${member.user} (${member.user.id})` },
                        { name: 'Account Created', value: `<t:${Math.floor(member.user.createdTimestamp / 1000)}:R>` },
                        { name: 'Member Count', value: guild.memberCount.toString() }
                    )
                    .setTimestamp();
                
                channel.send({ embeds: [embed] });
            }
        }
        
        logger.info(`${member.user.tag} joined ${guild.name}`);
    }
};

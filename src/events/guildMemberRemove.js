/**
 * FS25 ModBot - Guild Member Remove Event
 * Handles member leaves
 */

const { EmbedBuilder, Colors } = require('discord.js');
const logger = require('../utils/logger');
const db = require('../utils/database');

module.exports = {
    name: 'guildMemberRemove',
    once: false,
    
    async execute(member, client) {
        const guild = member.guild;
        
        // Get settings
        const settings = db.getSettings(guild.id);
        
        // Leave message
        if (settings?.leave_channel && settings?.leave_message) {
            const channel = guild.channels.cache.get(settings.leave_channel);
            
            if (channel) {
                const embed = new EmbedBuilder()
                    .setColor(Colors.Red)
                    .setTitle('👋 Goodbye!')
                    .setDescription(settings.leave_message
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
                    .setColor(Colors.Red)
                    .setTitle('❌ Member Left')
                    .addFields(
                        { name: 'User', value: `${member.user} (${member.user.id})` },
                        { name: 'Member Count', value: guild.memberCount.toString() }
                    )
                    .setTimestamp();
                
                channel.send({ embeds: [embed] });
            }
        }
        
        logger.info(`${member.user.tag} left ${guild.name}`);
    }
};

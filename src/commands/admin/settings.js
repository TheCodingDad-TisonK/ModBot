/**
 * FS25 ModBot - Settings Command
 * Configure bot settings (Admin only)
 */

const { EmbedBuilder, Colors } = require('discord.js');
const db = require('../../utils/database');

module.exports = {
    name: 'settings',
    aliases: ['config'],
    description: 'Configure bot settings (Admin only)',
    usage: '[setting] [value]',
    permissions: 'Administrator',
    botPermissions: 'ManageChannels',
    category: 'admin',
    cooldown: 10,
    
    async execute(message, args, client) {
        // Check for admin permission
        if (!message.member.permissions.has('Administrator')) {
            return message.reply('❌ You need Administrator permission to use this command.');
        }
        
        const settings = db.getSettings(message.guild.id);
        
        // If no args, show current settings
        if (!args[0]) {
            const embed = new EmbedBuilder()
                .setColor(Colors.Blue)
                .setTitle('⚙️ Server Settings')
                .addFields(
                    { name: 'Prefix', value: `\`${settings.prefix}\``, inline: true },
                    { name: 'Auto-Mod', value: settings.automod_enabled ? '✅ Enabled' : '❌ Disabled', inline: true },
                    { name: 'Leveling', value: settings.level_enabled ? '✅ Enabled' : '❌ Disabled', inline: true }
                )
                .setTimestamp();
            
            return message.reply({ embeds: [embed] });
        }
        
        const setting = args[0].toLowerCase();
        const value = args.slice(1).join(' ');
        
        // Handle different settings
        switch (setting) {
            case 'prefix':
                if (!value) {
                    return message.reply('Please provide a prefix.');
                }
                db.updateSettings(message.guild.id, { prefix: value });
                message.reply(`✅ Prefix set to \`${value}\``);
                break;
                
            case 'automod':
                const newAutoMod = settings.automod_enabled ? 0 : 1;
                db.updateSettings(message.guild.id, { automod_enabled: newAutoMod });
                message.reply(`✅ Auto-mod ${newAutoMod ? 'enabled' : 'disabled'}`);
                break;
                
            case 'leveling':
                const newLeveling = settings.level_enabled ? 0 : 1;
                db.updateSettings(message.guild.id, { level_enabled: newLeveling });
                message.reply(`✅ Leveling ${newLeveling ? 'enabled' : 'disabled'}`);
                break;
                
            case 'welcomelog':
            case 'leavelog':
            case 'modlog':
                const channel = message.mentions.channels.first() || message.guild.channels.cache.get(value);
                if (!channel) {
                    return message.reply('Please mention a valid channel.');
                }
                
                const logField = setting === 'welcomelog' ? 'welcome_channel' : 
                                setting === 'leavelog' ? 'leave_channel' : 'mod_log_channel';
                db.updateSettings(message.guild.id, { [logField]: channel.id });
                message.reply(`✅ ${setting} channel set to ${channel}`);
                break;
                
            default:
                message.reply('Unknown setting. Available: prefix, automod, leveling, welcomelog, leavelog, modlog');
        }
    }
};

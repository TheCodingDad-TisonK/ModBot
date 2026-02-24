/**
 * FS25 ModBot — messageCreate Event
 * Handles incoming messages: command dispatch, auto-mod, and leveling.
 */

const { handleCommand } = require('../handlers/commandHandler');
const logger            = require('../utils/logger');
const db                = require('../utils/database');

// ── Spam tracking (in-memory, per guild → per user) ───────────────────────────
// Map<guildId, Map<userId, { count: number, reset: NodeJS.Timeout }>>
const spamMap = new Map();
const SPAM_THRESHOLD    = 5;   // messages
const SPAM_WINDOW_MS    = 4000; // within 4 seconds

module.exports = {
    name: 'messageCreate',
    once: false,

    async execute(message, client) {
        if (message.author.bot) return;
        if (!message.guild)     return;

        const settings = db.getSettings(message.guild.id);

        // ── Text commands ──────────────────────────────────────────────────
        const prefix = settings?.prefix || client.config.prefix || '!';
        if (message.content.startsWith(prefix)) {
            await handleCommand(client, message);
            return;
        }

        // ── Auto-moderation ────────────────────────────────────────────────
        if (settings?.automod_enabled) {
            const actioned = await runAutoMod(message, settings);
            if (actioned) return;
        }

        // ── Leveling ───────────────────────────────────────────────────────
        if (settings?.level_enabled) {
            await handleLeveling(message, client, settings);
        }
    }
};

// ── Auto-Mod ──────────────────────────────────────────────────────────────────

async function runAutoMod(message, settings) {
    const member = message.member;
    if (!member) return false;

    // Bypass: members who can manage messages are excluded
    if (member.permissions.has('ManageMessages')) return false;

    const content = message.content;

    // 1. Spam detection (rate-based)
    if (settings.automod_antispam) {
        if (await checkSpam(message)) return true;
    }

    // 2. Link filter
    if (settings.automod_antilinks) {
        const linkRe = /https?:\/\/\S+|www\.\S+|discord\.gg\/\S+/i;
        if (linkRe.test(content)) {
            return await deleteAndWarn(message, '🔗 Links are not allowed in this server.');
        }
    }

    // 3. Profanity filter
    if (settings.automod_antiprofanity) {
        // Replace with your actual word list
        const badWords = ['badword1', 'badword2', 'badword3'];
        const lower    = content.toLowerCase();
        if (badWords.some(w => lower.includes(w))) {
            return await deleteAndWarn(message, '🤐 Inappropriate language is not permitted here.');
        }
    }

    // 4. Mass-mention guard
    if (settings.automod_antimention) {
        const mentionCount = message.mentions.users.size + message.mentions.roles.size;
        if (mentionCount > 5) {
            return await deleteAndWarn(message, '📢 Please don\'t mass-mention members or roles.');
        }
    }

    // 5. Excessive caps guard (>70% caps, >10 letters)
    const letters = content.replace(/[^a-zA-Z]/g, '');
    const caps    = (content.match(/[A-Z]/g) || []).length;
    if (letters.length > 10 && caps / letters.length > 0.7) {
        return await deleteAndWarn(message, '🔡 Please avoid using excessive caps.');
    }

    return false;
}

async function checkSpam(message) {
    const guildId = message.guild.id;
    const userId  = message.author.id;

    if (!spamMap.has(guildId))             spamMap.set(guildId, new Map());
    const guildSpam = spamMap.get(guildId);

    if (!guildSpam.has(userId)) {
        const entry = { count: 1, reset: null };
        entry.reset = setTimeout(() => guildSpam.delete(userId), SPAM_WINDOW_MS);
        guildSpam.set(userId, entry);
        return false;
    }

    const entry = guildSpam.get(userId);
    entry.count++;

    if (entry.count >= SPAM_THRESHOLD) {
        // Delete the offending message and warn
        await deleteAndWarn(message, `⏱️ Slow down! You're sending messages too quickly.`);
        // Reset counter
        clearTimeout(entry.reset);
        guildSpam.delete(userId);
        return true;
    }

    return false;
}

async function deleteAndWarn(message, warnText) {
    try {
        await message.delete();
        const notice = await message.channel.send(`${message.author} ${warnText}`);
        // Auto-delete the warning after 5 s to keep channel clean
        setTimeout(() => notice.delete().catch(() => null), 5000);
    } catch (err) {
        logger.error('automod deleteAndWarn error:', err);
    }
    return true;
}

// ── Leveling ──────────────────────────────────────────────────────────────────

async function handleLeveling(message, client, settings) {
    try {
        const user      = db.getOrCreateUser(message.author.id, message.author.username);
        const xpGain    = Math.floor(Math.random() * 5) + 1;
        const updated   = db.updateUserXP(message.author.id, xpGain);

        if (updated && updated.level > user.level) {
            if (settings?.level_up_messages) {
                const { EmbedBuilder, Colors } = require('discord.js');
                const levelEmbed = new EmbedBuilder()
                    .setColor(Colors.Gold)
                    .setTitle('🎉 Level Up!')
                    .setDescription(`${message.author} reached **Level ${updated.level}**! Keep it up!`)
                    .setThumbnail(message.author.displayAvatarURL())
                    .setTimestamp();
                await message.channel.send({ embeds: [levelEmbed] });
            }
            client.emit('levelUp', message.member, updated.level);
        }
    } catch (err) {
        logger.error('Leveling error:', err);
    }
}
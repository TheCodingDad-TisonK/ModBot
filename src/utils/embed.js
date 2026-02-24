/**
 * FS25 ModBot — Embed Utility
 * Centralised embed factory for consistent branding and formatting.
 */

const { EmbedBuilder, Colors } = require('discord.js');

// Brand colour used as default for neutral responses
const BRAND_COLOR = 0x2ecc71;

/**
 * Success embed (green) — confirmed actions.
 */
function success(title, description) {
    return new EmbedBuilder()
        .setColor(Colors.Green)
        .setTitle(`✅ ${title}`)
        .setDescription(description)
        .setTimestamp();
}

/**
 * Error embed (red) — failures and permission denials.
 */
function error(title, description) {
    return new EmbedBuilder()
        .setColor(Colors.Red)
        .setTitle(`❌ ${title}`)
        .setDescription(description)
        .setTimestamp();
}

/**
 * Info embed (brand blue-green) — informational responses.
 */
function info(title, description) {
    return new EmbedBuilder()
        .setColor(BRAND_COLOR)
        .setTitle(`ℹ️ ${title}`)
        .setDescription(description)
        .setTimestamp();
}

/**
 * Warning embed (yellow) — non-fatal alerts.
 */
function warning(title, description) {
    return new EmbedBuilder()
        .setColor(Colors.Yellow)
        .setTitle(`⚠️ ${title}`)
        .setDescription(description)
        .setTimestamp();
}

/**
 * Moderation action embed — consistent look for mod actions in channels & DMs.
 * @param {object} opts
 * @param {string}  opts.action      e.g. 'Banned', 'Kicked', 'Warned'
 * @param {string}  opts.emoji       e.g. '🔨'
 * @param {number}  opts.color       Discord.js Colors value
 * @param {import('discord.js').User} opts.target
 * @param {import('discord.js').User} opts.moderator
 * @param {string}  opts.reason
 * @param {Object[]} [opts.extraFields]  Additional { name, value, inline } fields
 * @param {string}  [opts.caseType]   Footer case label, e.g. 'BAN'
 */
function modAction({ action, emoji, color, target, moderator, reason, extraFields = [], caseType }) {
    const embed = new EmbedBuilder()
        .setColor(color)
        .setAuthor({ name: `Member ${action}`, iconURL: target.displayAvatarURL() })
        .addFields(
            { name: `${emoji} User`,      value: `${target} (${target.id})`,       inline: true  },
            { name: '🛡️ Moderator',       value: `${moderator} (${moderator.id})`, inline: true  },
            ...extraFields,
            { name: '📝 Reason',          value: reason,                             inline: false }
        )
        .setTimestamp();

    if (caseType) embed.setFooter({ text: `Case — ${caseType}` });
    return embed;
}

/**
 * DM notification embed sent to a moderated user.
 */
function dmNotice({ action, emoji, color, guildName, reason, moderatorTag, extraFields = [] }) {
    return new EmbedBuilder()
        .setColor(color)
        .setTitle(`${emoji} You have been ${action} in ${guildName}`)
        .addFields(
            { name: 'Reason',    value: reason,        inline: false },
            { name: 'Moderator', value: moderatorTag,  inline: true  },
            ...extraFields
        )
        .setTimestamp();
}

/**
 * Paginated list embed.
 */
function paginated(title, items, page = 1, perPage = 10) {
    const start      = (page - 1) * perPage;
    const slice      = items.slice(start, start + perPage);
    const totalPages = Math.ceil(items.length / perPage);

    return new EmbedBuilder()
        .setColor(BRAND_COLOR)
        .setTitle(title)
        .setDescription(slice.join('\n') || 'Nothing to show.')
        .setFooter({ text: `Page ${page} of ${totalPages} • ${items.length} total` })
        .setTimestamp();
}

/**
 * Generic custom embed builder — pass any EmbedBuilder options.
 */
function custom(options = {}) {
    const embed = new EmbedBuilder();

    if (options.color)       embed.setColor(options.color);
    if (options.title)       embed.setTitle(options.title);
    if (options.description) embed.setDescription(options.description);
    if (options.fields)      embed.addFields(options.fields);
    if (options.footer)      embed.setFooter(options.footer);
    if (options.image)       embed.setImage(options.image);
    if (options.thumbnail)   embed.setThumbnail(options.thumbnail);
    if (options.url)         embed.setURL(options.url);
    if (options.author)      embed.setAuthor(options.author);
    embed.setTimestamp(options.timestamp ?? new Date());

    return embed;
}

module.exports = { success, error, info, warning, modAction, dmNotice, paginated, custom, BRAND_COLOR };
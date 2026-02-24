/**
 * FS25 ModBot - Embed Utility
 * Creates consistent embed messages
 */

const { EmbedBuilder, Colors } = require('discord.js');

/**
 * Create a success embed
 */
function success(title, description) {
    return new EmbedBuilder()
        .setColor(Colors.Green)
        .setTitle(title)
        .setDescription(description)
        .setTimestamp();
}

/**
 * Create an error embed
 */
function error(title, description) {
    return new EmbedBuilder()
        .setColor(Colors.Red)
        .setTitle(title)
        .setDescription(description)
        .setTimestamp();
}

/**
 * Create an info embed
 */
function info(title, description) {
    return new EmbedBuilder()
        .setColor(Colors.Blue)
        .setTitle(title)
        .setDescription(description)
        .setTimestamp();
}

/**
 * Create a warning embed
 */
function warning(title, description) {
    return new EmbedBuilder()
        .setColor(Colors.Yellow)
        .setTitle(title)
        .setDescription(description)
        .setTimestamp();
}

/**
 * Create a neutral embed
 */
function neutral(title, description) {
    return new EmbedBuilder()
        .setColor(Colors.Grey)
        .setTitle(title)
        .setDescription(description)
        .setTimestamp();
}

/**
 * Create a custom embed
 */
function custom(options) {
    const embed = new EmbedBuilder();
    
    if (options.color) embed.setColor(options.color);
    if (options.title) embed.setTitle(options.title);
    if (options.description) embed.setDescription(options.description);
    if (options.fields) embed.addFields(options.fields);
    if (options.footer) embed.setFooter(options.footer);
    if (options.image) embed.setImage(options.image);
    if (options.thumbnail) embed.setThumbnail(options.thumbnail);
    if (options.url) embed.setURL(options.url);
    if (options.author) embed.setAuthor(options.author);
    embed.setTimestamp(options.timestamp || new Date());
    
    return embed;
}

/**
 * Create a paginated embed
 */
function paginated(title, items, page = 1, perPage = 10) {
    const start = (page - 1) * perPage;
    const end = start + perPage;
    const paginatedItems = items.slice(start, end);
    const totalPages = Math.ceil(items.length / perPage);
    
    const embed = new EmbedBuilder()
        .setColor(Colors.Blue)
        .setTitle(title)
        .setDescription(paginatedItems.join('\n'))
        .setFooter({ text: `Page ${page}/${totalPages} • ${items.length} items` })
        .setTimestamp();
    
    return embed;
}

module.exports = {
    success,
    error,
    info,
    warning,
    neutral,
    custom,
    paginated
};

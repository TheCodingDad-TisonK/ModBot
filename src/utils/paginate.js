/**
 * FS25 ModBot - Paginate Utility
 * Handles paginated embeds
 */

const { EmbedBuilder, Colors, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

/**
 * Create a paginated embed
 */
async function paginate(message, items, title, itemsPerPage = 10) {
    const pages = [];
    
    // Split items into pages
    for (let i = 0; i < items.length; i += itemsPerPage) {
        const pageItems = items.slice(i, i + itemsPerPage);
        const pageNum = Math.floor(i / itemsPerPage) + 1;
        const totalPages = Math.ceil(items.length / itemsPerPage);
        
        const embed = new EmbedBuilder()
            .setColor(Colors.Blue)
            .setTitle(title)
            .setDescription(pageItems.join('\n'))
            .setFooter({ text: `Page ${pageNum}/${totalPages} • ${items.length} items` })
            .setTimestamp();
        
        pages.push(embed);
    }
    
    // If only one page, send directly
    if (pages.length === 1) {
        await message.reply({ embeds: [pages[0]] });
        return;
    }
    
    // Create buttons
    const row = new ActionRowBuilder()
        .addComponents(
            new ButtonBuilder()
                .setCustomId('prev')
                .setLabel('◀️ Previous')
                .setStyle(ButtonStyle.Secondary),
            new ButtonBuilder()
                .setCustomId('next')
                .setLabel('Next ▶️')
                .setStyle(ButtonStyle.Secondary)
        );
    
    // Send first page
    const msg = await message.reply({ embeds: [pages[0]], components: [row] });
    
    // Handle button interactions
    let currentPage = 0;
    
    const filter = (interaction) => interaction.user.id === message.author.id;
    const collector = msg.createMessageComponentCollector({ filter, time: 60000 });
    
    collector.on('collect', async (interaction) => {
        if (interaction.customId === 'prev') {
            currentPage = currentPage > 0 ? currentPage - 1 : pages.length - 1;
        } else if (interaction.customId === 'next') {
            currentPage = currentPage < pages.length - 1 ? currentPage + 1 : 0;
        }
        
        await interaction.update({ embeds: [pages[currentPage]] });
    });
    
    collector.on('end', async () => {
        await msg.edit({ components: [] });
    });
}

/**
 * Simple paginate with array of strings
 */
function paginateArray(items, page, perPage) {
    const start = (page - 1) * perPage;
    const end = start + perPage;
    return {
        items: items.slice(start, end),
        page,
        totalPages: Math.ceil(items.length / perPage),
        total: items.length
    };
}

module.exports = {
    paginate,
    paginateArray
};

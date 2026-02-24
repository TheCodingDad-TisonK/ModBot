/**
 * FS25 ModBot - Main Entry Point
 * A comprehensive Discord moderation bot for the Farming Simulator modding community
 * Using Slash Commands only
 */

const fs = require('fs');
const path = require('path');

// Load environment variables
require('dotenv').config();

// Import required modules
const { Client, GatewayIntentBits, Partials, Collection } = require('discord.js');
const logger = require('./src/utils/logger');
const { initDatabase } = require('./src/utils/database');
const { loadEvents } = require('./src/handlers/eventHandler');
const { initDashboard } = require('./src/dashboard/server');

// Create Discord client
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.GuildMessageReactions,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildPresences,
        GatewayIntentBits.GuildVoiceStates,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.DirectMessages,
        GatewayIntentBits.DirectMessageReactions
    ],
    partials: [
        Partials.Channel,
        Partials.GuildMember,
        Partials.Message,
        Partials.Reaction,
        Partials.User
    ],
    presence: {
        status: 'online',
        activities: [{
            name: process.env.BOT_STATUS || 'FS25 Modding Community',
            type: 0
        }]
    }
});

// Extend client with collections
client.commands = new Collection();
client.slashCommands = new Collection();

// Add config to client from environment
client.config = {
    token: process.env.DISCORD_TOKEN,
    clientId: process.env.DISCORD_CLIENT_ID,
    clientSecret: process.env.DISCORD_CLIENT_SECRET,
    ownerId: process.env.DISCORD_OWNER_ID,
    guildId: process.env.GUILD_ID
};

// Add database to client
client.db = null;

// Global error handlers
process.on('uncaughtException', (error) => {
    logger.error('Uncaught Exception:', error);
    console.error(error);
});

process.on('unhandledRejection', (reason, promise) => {
    logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

// Initialize the bot
async function init() {
    // Check for required environment variables
    if (!process.env.DISCORD_TOKEN || process.env.DISCORD_TOKEN === 'your_discord_bot_token_here') {
        logger.error('Please set DISCORD_TOKEN in .env file');
        process.exit(1);
    }
    
    try {
        logger.info('='.repeat(50));
        logger.info('🚀 Starting FS25 ModBot (Slash Commands Only)...');
        logger.info('='.repeat(50));

        // Initialize database
        logger.info('📦 Initializing database...');
        client.db = initDatabase();
        logger.info('✅ Database initialized successfully');

        // Load slash commands
        logger.info('📚 Loading slash commands...');
        await loadSlashCommands(client);
        logger.info(`✅ Loaded ${client.slashCommands.size} slash commands`);

        // Load events
        logger.info('⚡ Loading events...');
        await loadEvents(client);
        logger.info('✅ Events loaded successfully');

        // Initialize dashboard
        if (process.env.DISCORD_CLIENT_ID && process.env.DISCORD_CLIENT_SECRET) {
            logger.info('🌐 Initializing dashboard...');
            await initDashboard(client);
            logger.info('✅ Dashboard initialized successfully');
        }

        // Login to Discord
        logger.info('🔐 Logging in to Discord...');
        await client.login(process.env.DISCORD_TOKEN);
        logger.info('✅ Logged in successfully!');

        // Set bot status
        logger.info('='.repeat(50));
        logger.info('🎉 FS25 ModBot is now online!');
        logger.info(`📌 Bot is in ${client.guilds.cache.size} servers`);
        logger.info(`👤 ${client.users.cache.size} users cached`);
        logger.info('='.repeat(50));

    } catch (error) {
        logger.error('Failed to initialize bot:', error);
        console.error(error);
        process.exit(1);
    }
}

// Load slash commands
async function loadSlashCommands(client) {
    const commandsPath = path.join(__dirname, 'src', 'commands', 'slash');
    
    if (!fs.existsSync(commandsPath)) {
        logger.warn('Slash commands directory not found');
        return;
    }

    const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

    for (const file of commandFiles) {
        const command = require(path.join(commandsPath, file));
        
        if (command.data && command.execute) {
            client.slashCommands.set(command.data.name, command);
            logger.info(`Loaded slash command: ${command.data.name}`);
        }
    }
}

// Handle slash commands
client.on('interactionCreate', async (interaction) => {
    if (!interaction.isCommand()) return;

    const command = client.slashCommands.get(interaction.commandName);
    
    if (!command) return;

    try {
        await command.execute(interaction, client);
    } catch (error) {
        logger.error(`Error executing slash command ${interaction.commandName}:`, error);
        
        const errorEmbed = {
            color: 0xff0000,
            title: '❌ Error',
            description: 'An error occurred while executing this command.',
            timestamp: new Date()
        };

        if (interaction.replied || interaction.deferred) {
            await interaction.followUp({ embeds: [errorEmbed], ephemeral: true });
        } else {
            await interaction.reply({ embeds: [errorEmbed], ephemeral: true });
        }
    }
});

// Start the bot
init();

module.exports = client;

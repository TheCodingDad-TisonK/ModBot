/**
 * FS25 ModBot — /help
 * Paginated help command with select-menu category navigation.
 */

const {
    SlashCommandBuilder,
    EmbedBuilder,
    Colors,
    ActionRowBuilder,
    StringSelectMenuBuilder,
    StringSelectMenuOptionBuilder,
    ComponentType
} = require('discord.js');

// ── Command catalogue ─────────────────────────────────────────────────────────
const CATEGORIES = [
    {
        id:    'moderation',
        label: '🛡️ Moderation',
        description: 'Ban, kick, warn and manage members',
        color: Colors.Red,
        commands: [
            { name: '/kick',    desc: 'Kick a member from the server',             usage: '/kick <user> [reason]'        },
            { name: '/ban',     desc: 'Ban a user (can be off-server)',             usage: '/ban <user> [reason] [days]'  },
            { name: '/unban',   desc: 'Unban a user by their ID',                  usage: '/unban <user_id> [reason]'    },
            { name: '/warn add',   desc: 'Issue a warning to a member',            usage: '/warn add <user> <reason>'    },
            { name: '/warn list',  desc: 'View all warnings for a member',         usage: '/warn list <user>'            },
            { name: '/warn remove',desc: 'Delete a warning by its ID',             usage: '/warn remove <id>'            },
            { name: '/clear',   desc: 'Bulk-delete messages (1–100), optional user filter', usage: '/clear <amount> [user] [reason]' },
            { name: '/timeout', desc: 'Timeout a member for a duration',           usage: '/timeout <user> <duration> [reason]' },
        ]
    },
    {
        id:    'utility',
        label: '🔧 Utility',
        description: 'Server info, user info, and tools',
        color: Colors.Blue,
        commands: [
            { name: '/ping',       desc: 'Check bot and API latency',               usage: '/ping'           },
            { name: '/userinfo',   desc: 'Get detailed info on a member',           usage: '/userinfo [user]' },
            { name: '/serverinfo', desc: 'Get detailed server statistics',          usage: '/serverinfo'      },
            { name: '/help',       desc: 'Show this help menu',                     usage: '/help'            },
        ]
    },
    {
        id:    'automod',
        label: '🤖 Auto-Mod',
        description: 'Automatic moderation features',
        color: Colors.Orange,
        commands: [
            { name: 'Anti-Spam',        desc: 'Auto-deletes repeated characters and spam patterns',    usage: 'Automatic' },
            { name: 'Anti-Links',       desc: 'Blocks URLs when enabled',                             usage: 'Configured via /settings' },
            { name: 'Anti-Profanity',   desc: 'Filters a configurable word list',                     usage: 'Automatic' },
            { name: 'Anti-Caps',        desc: 'Limits messages with >70% uppercase',                  usage: 'Automatic' },
            { name: 'Anti-MentionSpam', desc: 'Blocks messages mentioning 5+ users/roles at once',    usage: 'Automatic' },
        ]
    },
    {
        id:    'leveling',
        label: '📈 Leveling',
        description: 'XP, levels and leaderboard',
        color: Colors.Purple,
        commands: [
            { name: 'XP System',   desc: 'Earn 1–5 XP per message sent',       usage: 'Automatic'     },
            { name: 'Level Ups',   desc: 'Get notified when you level up',      usage: 'Automatic'     },
        ]
    },
    {
        id:    'dashboard',
        label: '🌐 Dashboard',
        description: 'Web admin panel features',
        color: Colors.Green,
        commands: [
            { name: 'Login',           desc: 'Sign in with Discord OAuth2',             usage: 'http://localhost:3000' },
            { name: 'Settings',        desc: 'Configure welcome, leave, and log channels', usage: 'Dashboard → Guild → Settings' },
            { name: 'Auto-Mod Config', desc: 'Toggle automod features per guild',        usage: 'Dashboard → Guild → Auto-Mod'  },
        ]
    }
];

// ── Build an embed for a category ─────────────────────────────────────────────
function buildCategoryEmbed(bot, category) {
    const cmdList = category.commands
        .map(c => `**${c.name}**\n┣ ${c.desc}\n┗ \`${c.usage}\``)
        .join('\n\n');

    return new EmbedBuilder()
        .setColor(category.color)
        .setAuthor({ name: `${bot.user.username} — Help`, iconURL: bot.user.displayAvatarURL() })
        .setTitle(category.label)
        .setDescription(cmdList || 'No commands in this category yet.')
        .setFooter({ text: 'Select a category below • Interaction expires in 60s' })
        .setTimestamp();
}

// ── Overview embed ────────────────────────────────────────────────────────────
function buildOverviewEmbed(bot) {
    const catList = CATEGORIES.map(c => `${c.label}\n┗ ${c.description}`).join('\n\n');

    return new EmbedBuilder()
        .setColor(Colors.Blurple)
        .setAuthor({ name: `${bot.user.username} — Help`, iconURL: bot.user.displayAvatarURL() })
        .setTitle('📖 Command Overview')
        .setDescription(
            'Welcome to **FS25 ModBot** — a full-featured moderation bot for the Farming Simulator 25 community.\n\n' +
            'Use the dropdown below to browse categories:\n\n' + catList
        )
        .setFooter({ text: 'Select a category below • Interaction expires in 60s' })
        .setTimestamp();
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName('help')
        .setDescription('Browse all bot commands by category'),

    async execute(interaction, client) {
        // ── Build select menu ──────────────────────────────────────────────
        const menu = new StringSelectMenuBuilder()
            .setCustomId('help_menu')
            .setPlaceholder('📂 Choose a category…')
            .addOptions(
                new StringSelectMenuOptionBuilder()
                    .setLabel('Overview')
                    .setDescription('All categories at a glance')
                    .setValue('overview')
                    .setEmoji('📖'),
                ...CATEGORIES.map(c =>
                    new StringSelectMenuOptionBuilder()
                        .setLabel(c.label)
                        .setDescription(c.description)
                        .setValue(c.id)
                )
            );

        const row = new ActionRowBuilder().addComponents(menu);

        const reply = await interaction.reply({
            embeds: [buildOverviewEmbed(client)],
            components: [row],
            ephemeral: true,
            fetchReply: true
        });

        // ── Collect interactions ───────────────────────────────────────────
        const collector = reply.createMessageComponentCollector({
            componentType: ComponentType.StringSelect,
            time: 60_000,
            filter: i => i.user.id === interaction.user.id
        });

        collector.on('collect', async i => {
            const selected = i.values[0];
            const category = CATEGORIES.find(c => c.id === selected);

            const embed = selected === 'overview' || !category
                ? buildOverviewEmbed(client)
                : buildCategoryEmbed(client, category);

            await i.update({ embeds: [embed], components: [row] });
        });

        collector.on('end', async () => {
            // Disable the menu when the collector expires
            menu.setDisabled(true);
            await interaction.editReply({ components: [row] }).catch(() => null);
        });
    }
};
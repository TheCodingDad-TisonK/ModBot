/**
 * FS25 ModBot — /userinfo
 * Displays detailed information about a guild member.
 */

const {
    SlashCommandBuilder,
    EmbedBuilder,
    Colors
} = require('discord.js');
const db = require('../../utils/database');

// Resolve Discord's UserFlags to readable badge names
const BADGE_MAP = {
    Staff:                  '👨‍💼 Discord Staff',
    Partner:                '🤝 Partnered Server Owner',
    Hypesquad:              '🏅 HypeSquad Events',
    BugHunterLevel1:        '🐛 Bug Hunter (Level 1)',
    HypeSquadOnlineHouse1:  '🏠 HypeSquad Bravery',
    HypeSquadOnlineHouse2:  '🏠 HypeSquad Brilliance',
    HypeSquadOnlineHouse3:  '🏠 HypeSquad Balance',
    PremiumEarlySupporter:  '💎 Early Supporter',
    VerifiedBotDeveloper:   '🤖 Verified Bot Developer',
    ActiveDeveloper:        '🛠️ Active Developer',
    BugHunterLevel2:        '🐛 Bug Hunter (Level 2)',
    CertifiedModerator:     '🛡️ Discord Certified Moderator',
};

module.exports = {
    data: new SlashCommandBuilder()
        .setName('userinfo')
        .setDescription('Get detailed information about a member')
        .addUserOption(opt =>
            opt.setName('user')
               .setDescription('Member to look up (defaults to you)')
               .setRequired(false)),

    async execute(interaction, client) {
        await interaction.deferReply();

        const target = interaction.options.getMember('user') ?? interaction.member;
        const user   = target.user;

        // Fetch fresh user data (for banner / accent colour)
        const fullUser = await client.users.fetch(user.id, { force: true });

        // Database stats
        const dbUser = db.getUser(user.id);
        const guildWarnings = dbUser
            ? db.getWarnings(dbUser.id).filter(w => w.guild_id === interaction.guild.id)
            : [];

        // Roles (sorted by position, skip @everyone, max 15 displayed)
        const roles = target.roles.cache
            .filter(r => r.id !== interaction.guild.id)
            .sort((a, b) => b.position - a.position);
        const rolesDisplay = roles.size
            ? [...roles.values()].slice(0, 15).map(r => r.toString()).join(' ')
            : 'None';

        // Badges
        const badges = Object.entries(BADGE_MAP)
            .filter(([flag]) => fullUser.flags?.has(flag))
            .map(([, label]) => label);

        // Acknowledgement (highest role name)
        const topRole = target.roles.highest.id !== interaction.guild.id
            ? target.roles.highest.name
            : 'No roles';

        const embed = new EmbedBuilder()
            .setColor(target.displayHexColor !== '#000000' ? target.displayHexColor : Colors.Blurple)
            .setAuthor({ name: user.tag, iconURL: user.displayAvatarURL({ dynamic: true }) })
            .setThumbnail(user.displayAvatarURL({ dynamic: true, size: 256 }))
            .addFields(
                { name: '🪪 User ID',         value: user.id,                                                   inline: true  },
                { name: '🤖 Bot?',            value: user.bot ? 'Yes' : 'No',                                   inline: true  },
                { name: '🏆 Top Role',        value: topRole,                                                    inline: true  },
                { name: '📅 Account Created', value: `<t:${Math.floor(user.createdTimestamp / 1000)}:F>\n(<t:${Math.floor(user.createdTimestamp / 1000)}:R>)`, inline: true },
                { name: '📥 Joined Server',   value: `<t:${Math.floor(target.joinedTimestamp / 1000)}:F>\n(<t:${Math.floor(target.joinedTimestamp / 1000)}:R>)`, inline: true },
                { name: '⚠️ Warnings',        value: `${guildWarnings.length}`,                                 inline: true  },
                { name: `🎭 Roles [${roles.size}]`, value: rolesDisplay,                                         inline: false }
            )
            .setFooter({ text: `Requested by ${interaction.user.tag}` })
            .setTimestamp();

        if (badges.length) {
            embed.addFields({ name: '🏅 Badges', value: badges.join('\n'), inline: false });
        }
        if (dbUser) {
            embed.addFields(
                { name: '⭐ Level',   value: `${dbUser.level}`, inline: true },
                { name: '💬 XP',     value: `${dbUser.xp}`,    inline: true }
            );
        }

        await interaction.editReply({ embeds: [embed] });
    }
};
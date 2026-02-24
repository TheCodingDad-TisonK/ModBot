<p align="center">
  <img src="https://img.shields.io/github/license/TheCodingDad-TisonK/ModBot?color=2ecc71&style=for-the-badge" alt="License">
  <img src="https://img.shields.io/github/v/release/TheCodingDad-TisonK/ModBot?color=2ecc71&include_prereleases&style=for-the-badge" alt="Release">
  <img src="https://img.shields.io/github/issues/TheCodingDad-TisonK/ModBot?color=2ecc71&style=for-the-badge" alt="Issues">
  <img src="https://img.shields.io/github/stars/TheCodingDad-TisonK/ModBot?color=2ecc71&style=for-the-badge" alt="Stars">
</p>

---

# 🚜 FS25 ModBot

A powerful, feature-rich Discord moderation bot designed specifically for the **Farming Simulator 25 Modding Community**. Built with Node.js and discord.js, utilizing modern slash commands for the best user experience.

---

## ✨ Features

### 🛡️ Moderation
- **Kick/Ban/Unban** - Full moderation actions with reasons
- **Warn** - Track user warnings in database
- **Clear** - Bulk message deletion (1-100 messages)
- All actions logged with timestamps

### 🤖 Auto-Moderation
- Anti-Spam detection
- Anti-Profanity filter
- Anti-Links (configurable)
- Anti-Mention spam protection

### 🌐 Web Dashboard
- **Admin Panel** - Server settings, automod, welcome/leave messages
- Discord OAuth2 login
- Real-time settings management
- Only accessible to server administrators

### 📈 Leveling System
- XP from messages
- Level up rewards
- Server leaderboard

### 🎉 Welcome/Leave Messages
- Customizable welcome messages
- Leave message notifications
- Variable support ({user}, {server}, {membercount})

---

## 📋 Commands

| Command | Description |
|---------|-------------|
| `/kick` | Kick a user from the server |
| `/ban` | Ban a user from the server |
| `/unban` | Unban a user by ID |
| `/warn` | Warn a user |
| `/clear` | Delete messages (1-100) |
| `/ping` | Check bot latency |
| `/userinfo` | Get user information |
| `/serverinfo` | Get server information |

---

## 🛠️ Installation

### Prerequisites
- Node.js 18+
- npm or yarn
- A Discord Bot Token

### Quick Start

1. **Clone the repository:**
```bash
git clone https://github.com/TheCodingDad-TisonK/ModBot.git
cd ModBot
```

2. **Install dependencies:**
```bash
npm install
```

3. **Configure the bot:**
Edit the `.env` file and add your Discord bot token:
```env
DISCORD_TOKEN=your_bot_token_here
DISCORD_CLIENT_ID=your_client_id
DISCORD_CLIENT_SECRET=your_client_secret
DISCORD_OWNER_ID=your_discord_id
GUILD_ID=your_server_id
```

4. **Start the bot:**
```bash
npm start
```

5. **Invite the bot to your server:**
```
https://discord.com/api/oauth2/authorize?client_id=YOUR_CLIENT_ID&permissions=8&scope=bot
```

---

## ⚙️ Configuration

All configuration is done through the `.env` file:

| Variable | Description | Required |
|----------|-------------|----------|
| `DISCORD_TOKEN` | Your Discord bot token | Yes |
| `DISCORD_CLIENT_ID` | Discord application client ID | For dashboard |
| `DISCORD_CLIENT_SECRET` | Discord application secret | For dashboard |
| `DISCORD_OWNER_ID` | Your Discord user ID | No |
| `GUILD_ID` | Your Discord server ID | No |
| `BOT_PREFIX` | Command prefix (default: !) | No |
| `DASHBOARD_PORT` | Dashboard port (default: 3001) | No |
| `ENABLE_LEVELING` | Enable leveling system | No |
| `ENABLE_AUTOMOD` | Enable auto-moderation | No |

---

## 🌐 Web Dashboard

Access the dashboard at `http://localhost:3001`

- Login with Discord
- Select a server to manage
- Configure settings in real-time
- Only Administrators can access

---

## 📁 Project Structure

```
ModBot/
├── index.js              # Main entry point
├── package.json          # Dependencies
├── .env                 # Environment variables
├── .gitignore           # Git ignore rules
├── README.md            # This file
├── CONTRIBUTING.md      # Contribution guidelines
├── LICENSE              # MIT License
└── src/
    ├── commands/
    │   └── slash/       # Slash commands
    ├── events/           # Discord events
    ├── handlers/         # Event handlers
    ├── dashboard/       # Web dashboard
    │   └── views/       # EJS templates
    └── utils/           # Utilities
```

---

## 🤝 Contributing

Contributions are welcome! Please read our [CONTRIBUTING.md](CONTRIBUTING.md) file for guidelines.

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- [discord.js](https://discord.js.org/) - Discord API library
- [Express.js](https://expressjs.com/) - Web framework
- [Better-SQLite3](https://github.com/WiseLibs/better-sqlite3) - SQLite database

---

<p align="center">
  Made with ❤️ for the FS25 Modding Community
</p>

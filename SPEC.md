t# FS25 ModBot - Comprehensive Discord Moderation Bot

## Project Overview

**Project Name:** FS25 ModBot  
**Type:** Discord Moderation & Management Bot  
**Core Feature Summary:** A full-featured Discord bot designed specifically for the FS25 (Farming Simulator 25) modding community, combining advanced moderation tools, admin/mod panels, GitHub integration, and AI capabilities.  
**Target Users:** FS25 modding community server administrators, moderators, and mod developers.

---

## Bot Features Overview

### 1. Moderation Commands
- **Kick**: Remove users from the server with reason
- **Ban**: Permanent or temporary ban with reason
- **Unban**: Remove bans by user ID or username
- **Mute**: Temporarily mute users (voice and text)
- **Unmute**: Remove mute from users
- **Warn**: Issue warnings to users (with tracking)
- **Warnings List**: View all warnings for a user
- **Clear/Wipe**: Delete messages in bulk (1-1000)
- **Slowmode**: Set channel slowmode
- **Lock/Unlock**: Lock/unlock channels
- **Nickname**: Change user nicknames
- **Role Management**: Add/remove roles from users

### 2. Auto-Moderation
- **Anti-Spam**: Detect and auto-delete spam messages
- **Anti-Profanity**: Filter inappropriate language
- **Anti-Links**: Block or warn about links (configurable)
- **Anti-Caps**: Limit excessive caps (configurable)
- **Anti-Raiding**: Detect and stop raid patterns
- **Mention Spam**: Prevent mass mention attacks

### 3. Logging System
- **Moderation Logs**: Log all moderation actions
- **Message Logs**: Log message edits/deletions
- **Voice Logs**: Track voice channel join/leave/move
- **Channel Logs**: Log channel create/delete/modify
- **Role Logs**: Log role changes
- **Member Logs**: Log member join/leave

### 4. Ticket System
- **Create Ticket**: Users can create support tickets
- **Close Ticket**: Close resolved tickets
- **Ticket Categories**: Multiple ticket categories
- **Ticket Transcripts**: Save ticket transcripts
- **Ticket Panels**: Interactive ticket creation panels

### 5. Leveling System
- **XP & Levels**: Earn XP for activity
- **Level Roles**: Auto-assign roles at certain levels
- **Leaderboard**: Server leaderboard
- **Level Rewards**: Custom rewards per level

### 6. GitHub Integration (From GitBot)
- **Webhook Forwarding**: Forward GitHub events to Discord
- **Multi-Repo Support**: Support multiple repositories
- **Rich Embeds**: Beautiful embed presentations
- **Channel Management**: Auto-create channels for repos
- **DM Setup**: Guided DM setup for repo owners

### 7. AI/Voice Features (From ClaudeBot)
- **AI Chat**: Chat with Claude AI in Discord
- **Voice Channels**: Text-to-speech in voice channels
- **Voice Commands**: Control bot with voice
- **Conversation Memory**: Remember context

### 8. Admin Panel (Web Dashboard)
- **Server Settings**: Configure server settings
- **Moderation Settings**: Configure auto-mod
- **Welcome/Leave Messages**: Set up automated messages
- **Role Management**: Manage roles visually
- **Channel Management**: Manage channels
- **Command Settings**: Enable/disable commands
- **Webhook Management**: Manage webhooks

### 9. Mod Panel (Web Dashboard)
- **Warning Management**: View/manage warnings
- **Ticket Management**: Handle support tickets
- **User Lookup**: Search users in database
- **Quick Actions**: Quick mod actions
- **Activity Log**: View recent mod actions

### 10. Additional Features
- **Custom Commands**: Create custom commands
- **Giveaways**: Run Discord giveaways
- **Announcements**: Make announcements with embed
- **Polls**: Create polls
- **Reminders**: Set reminders
- **Server Stats**: Show server statistics
- **Bot Stats**: Show bot statistics
- **Invite Tracker**: Track invite links

---

## Technical Architecture

### Technology Stack
- **Runtime:** Node.js 18+
- **Discord Library:** discord.js 14.x
- **Web Framework:** Express.js
- **Database:** SQLite (better-sqlite3) for simplicity
- **WebSocket:** Socket.io for real-time dashboard
- **Authentication:** Passport.js with Discord OAuth2
- **Template Engine:** EJS

### Project Structure
```
ModBot/
├── src/
│   ├── commands/          # Discord commands
│   │   ├── admin/         # Admin commands
│   │   ├── moderation/    # Moderation commands
│   │   ├── fun/           # Fun commands
│   │   ├── utility/       # Utility commands
│   │   └── github/        # GitHub commands
│   ├── events/            # Discord events
│   ├── handlers/          # Event handlers
│   ├── services/          # Business logic
│   ├── models/            # Database models
│   ├── utils/             # Utility functions
│   ├── dashboard/         # Web dashboard
│   │   ├── routes/        # Dashboard routes
│   │   ├── views/         # EJS templates
│   │   └── public/        # Static files
│   └── config/            # Configuration
├── data/                  # Database files
├── logs/                  # Log files
├── package.json
├── config.json
└── index.js
```

### Database Schema

#### users table
- id (INTEGER PRIMARY KEY)
- discord_id (TEXT UNIQUE)
- username (TEXT)
- warnings (INTEGER)
- kicks (INTEGER)
- bans (INTEGER)
- xp (INTEGER)
- level (INTEGER)
- created_at (DATETIME)

#### warnings table
- id (INTEGER PRIMARY KEY)
- user_id (INTEGER)
- moderator_id (TEXT)
- reason (TEXT)
- created_at (DATETIME)

#### tickets table
- id (INTEGER PRIMARY KEY)
- channel_id (TEXT)
- user_id (TEXT)
- category (TEXT)
- status (TEXT)
- created_at (DATETIME)

#### github_repos table
- id (INTEGER PRIMARY KEY)
- repo_name (TEXT)
- channel_id (TEXT)
- webhook_secret (TEXT)
- created_at (DATETIME)

#### settings table
- id (INTEGER PRIMARY KEY)
- guild_id (TEXT UNIQUE)
- settings (JSON)

---

## Configuration

### Environment Variables
```
DISCORD_TOKEN=your_bot_token
DISCORD_CLIENT_ID=your_client_id
DISCORD_CLIENT_SECRET=your_client_secret
GITHUB_WEBHOOK_SECRET=your_github_secret
PORT=3000
DATABASE_PATH=./data/modbot.db
```

### config.json
```json
{
  "token": "DISCORD_TOKEN",
  "prefix": "!",
  "ownerId": "your_discord_id",
  "guildId": "your_server_id",
  "dashboard": {
    "port": 3000,
    "callbackUrl": "http://localhost:3000"
  }
}
```

---

## API Endpoints

### Dashboard Routes
- `GET /` - Landing page
- `GET /dashboard` - Main dashboard (requires auth)
- `GET /dashboard/settings` - Server settings
- `GET /dashboard/moderation` - Moderation settings
- `GET /dashboard/tickets` - Ticket management
- `GET /dashboard/users` - User management
- `GET /dashboard/github` - GitHub settings
- `POST /api/settings` - Update settings
- `POST /api/warn` - Issue warning
- `POST /api/ban` - Ban user
- `POST /api/kick` - Kick user

---

## Command List

### Moderation
| Command | Description | Usage |
|---------|-------------|-------|
| /kick | Kick a user | /kick @user [reason] |
| /ban | Ban a user | /ban @user [reason] |
| /unban | Unban a user | /unban user_id |
| /mute | Mute a user | /mute @user [time] [reason] |
| /unmute | Unmute a user | /unmute @user |
| /warn | Warn a user | /warn @user [reason] |
| /warnings | Show user warnings | /warnings [@user] |
| /clear | Delete messages | /clear [amount] |
| /slowmode | Set slowmode | /slowmode [seconds] |
| /lock | Lock a channel | /lock [channel] |
| /unlock | Unlock a channel | /unlock [channel] |
| /nick | Change nickname | /nick @user [name] |
| /role | Manage roles | /role [add/remove] @user @role |

### Admin
| Command | Description | Usage |
|---------|-------------|-------|
| /settings | View settings | /settings |
| /setprefix | Set prefix | /setprefix [prefix] |
| /setwelcome | Set welcome msg | /setwelcome [message] |
| /setleave | Set leave msg | /setleave [message] |
| /automod | Configure auto-mod | /automod [setting] [value] |
| /logs | Configure logs | /logs [channel] |

### Utility
| Command | Description | Usage |
|---------|-------------|-------|
| /help | Show help | /help [command] |
| /ping | Bot latency | /ping |
| /stats | Bot stats | /stats |
| /serverinfo | Server info | /serverinfo |
| /userinfo | User info | /userinfo [@user] |
| /invite | Bot invite | /invite |
| /vote | Vote for bot | /vote |

### Fun
| Command | Description | Usage |
|---------|-------------|-------|
| /8ball | Magic 8ball | /8ball [question] |
| /roll | Roll dice | /roll [sides] |
| /choose | Choose option | /choose [option1] [option2] |
| /say | Make bot say | /say [message] |
| /embed | Create embed | /embed [title] [description] |

### Tickets
| Command | Description | Usage |
|---------|-------------|-------|
| /ticket create | Create ticket | /ticket create [category] |
| /ticket close | Close ticket | /ticket close |
| /ticket panel | Create panel | /ticket panel |

### GitHub
| Command | Description | Usage |
|---------|-------------|-------|
| /github add | Add repository | /github add [owner/repo] |
| /github remove | Remove repo | /github remove [repo] |
| /github list | List repos | /github list |

### AI (Claude)
| Command | Description | Usage |
|---------|-------------|-------|
| /ai | Chat with AI | /ai [message] |
| /imagine | Generate image | /imagine [prompt] |

---

## Acceptance Criteria

1. **Bot starts successfully** - Bot connects to Discord without errors
2. **All moderation commands work** - Kick, ban, mute, warn, clear, etc.
3. **Auto-moderation functions** - Spam, profanity, and link filters work
4. **Logging system works** - All events are logged to configured channels
5. **Ticket system operational** - Users can create and close tickets
6. **Leveling system active** - Users earn XP and levels
7. **Web dashboard accessible** - Admin and mod panels work
8. **GitHub integration works** - Webhook events forward to Discord
9. **AI chat works** - Claude AI responds to messages
10. **Database persists** - All data is saved correctly

---

## Security Considerations

- All commands check for proper permissions
- Rate limiting on commands
- Input sanitization on all user inputs
- Secure storage of bot token
- Dashboard requires authentication
- Audit logs for all admin actions

---

## Performance Targets

- Command response time < 500ms
- Dashboard load time < 2s
- Database queries < 100ms
- Memory usage < 500MB
- CPU usage < 10% idle

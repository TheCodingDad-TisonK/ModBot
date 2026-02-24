/**
 * FS25 ModBot - Database Utility
 * Handles all database operations with SQLite
 */

const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');
const logger = require('./logger');

// Get database path
const dbPath = process.env.DATABASE_PATH || path.join(__dirname, '../../data/modbot.db');

// Ensure data directory exists
const dataDir = path.dirname(dbPath);
if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
}

// Database instance
let db = null;

/**
 * Initialize the database
 */
function initDatabase() {
    try {
        db = new Database(dbPath);
        db.pragma('journal_mode = WAL');
        
        // Create tables
        createTables();
        
        logger.info('Database initialized at:', dbPath);
        return db;
    } catch (error) {
        logger.error('Failed to initialize database:', error);
        throw error;
    }
}

/**
 * Create all database tables
 */
function createTables() {
    // Users table
    db.exec(`
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            discord_id TEXT UNIQUE NOT NULL,
            username TEXT NOT NULL,
            display_name TEXT,
            warnings INTEGER DEFAULT 0,
            kicks INTEGER DEFAULT 0,
            bans INTEGER DEFAULT 0,
            xp INTEGER DEFAULT 0,
            level INTEGER DEFAULT 1,
            total_xp INTEGER DEFAULT 0,
            voice_time INTEGER DEFAULT 0,
            messages_count INTEGER DEFAULT 0,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    `);

    // Warnings table
    db.exec(`
        CREATE TABLE IF NOT EXISTS warnings (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            guild_id TEXT NOT NULL,
            moderator_id TEXT NOT NULL,
            moderator_name TEXT,
            reason TEXT NOT NULL,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users(id)
        )
    `);

    // Server settings table
    db.exec(`
        CREATE TABLE IF NOT EXISTS settings (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            guild_id TEXT UNIQUE NOT NULL,
            welcome_channel TEXT,
            welcome_message TEXT,
            leave_channel TEXT,
            leave_message TEXT,
            log_channel TEXT,
            mod_log_channel TEXT,
            automod_enabled INTEGER DEFAULT 1,
            automod_antispam INTEGER DEFAULT 1,
            automod_antilinks INTEGER DEFAULT 0,
            automod_antiprofanity INTEGER DEFAULT 1,
            level_enabled INTEGER DEFAULT 1,
            level_up_messages INTEGER DEFAULT 1,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    `);

    logger.info('All database tables created/verified');
}

/**
 * Get or create a user
 */
function getOrCreateUser(discordId, username) {
    const stmt = db.prepare(`
        INSERT INTO users (discord_id, username) VALUES (?, ?)
        ON CONFLICT(discord_id) DO UPDATE SET
            username = excluded.username,
            updated_at = CURRENT_TIMESTAMP
        RETURNING *
    `);
    return stmt.get(discordId, username);
}

/**
 * Get user by discord ID
 */
function getUser(discordId) {
    const stmt = db.prepare('SELECT * FROM users WHERE discord_id = ?');
    return stmt.get(discordId);
}

/**
 * Update user XP and level
 */
function updateUserXP(discordId, xp) {
    const user = getUser(discordId);
    if (!user) return null;

    const newXP = user.xp + xp;
    const newTotalXP = user.total_xp + xp;
    
    // Calculate level (100 XP per level, increases by 50 each level)
    let level = 1;
    let xpNeeded = 100;
    let tempXP = 0;
    
    while (tempXP + xpNeeded <= newTotalXP) {
        tempXP += xpNeeded;
        level++;
        xpNeeded = Math.floor(100 + (level - 1) * 50);
    }
    
    const remainingXP = newTotalXP - tempXP;
    
    const stmt = db.prepare(`
        UPDATE users SET xp = ?, total_xp = ?, level = ?, updated_at = CURRENT_TIMESTAMP
        WHERE discord_id = ?
    `);
    stmt.run(remainingXP, newTotalXP, level, discordId);
    
    return { ...user, xp: remainingXP, total_xp: newTotalXP, level };
}

/**
 * Get server settings
 */
function getSettings(guildId) {
    let stmt = db.prepare('SELECT * FROM settings WHERE guild_id = ?');
    let settings = stmt.get(guildId);
    
    if (!settings) {
        // Create default settings
        stmt = db.prepare(`
            INSERT INTO settings (guild_id) VALUES (?) RETURNING *
        `);
        settings = stmt.get(guildId);
    }
    
    return settings;
}

/**
 * Update server settings
 */
function updateSettings(guildId, newSettings) {
    const fields = Object.keys(newSettings).map(key => `${key} = ?`).join(', ');
    const values = Object.values(newSettings);
    
    const stmt = db.prepare(`
        UPDATE settings SET ${fields}, updated_at = CURRENT_TIMESTAMP
        WHERE guild_id = ?
    `);
    
    return stmt.run(...values, guildId);
}

/**
 * Add warning (for slash commands)
 */
function addWarning(guildId, userId, moderatorId, reason) {
    // Get or create user
    const user = getOrCreateUser(userId, 'User');
    
    const stmt = db.prepare(`
        INSERT INTO warnings (user_id, guild_id, moderator_id, moderator_name, reason)
        VALUES (?, ?, ?, ?, ?)
    `);
    const result = stmt.run(user.id, guildId, moderatorId, 'Moderator', reason);
    
    // Update user warning count
    db.prepare('UPDATE users SET warnings = warnings + 1 WHERE id = ?').run(user.id);
    
    return result;
}

/**
 * Get warnings for user
 */
function getWarnings(userId) {
    const stmt = db.prepare('SELECT * FROM warnings WHERE user_id = ? ORDER BY created_at DESC');
    return stmt.all(userId);
}

/**
 * Delete warning
 */
function deleteWarning(warningId) {
    const stmt = db.prepare('DELETE FROM warnings WHERE id = ?');
    return stmt.run(warningId);
}

/**
 * Export all database functions
 */
module.exports = {
    initDatabase,
    getOrCreateUser,
    getUser,
    updateUserXP,
    getSettings,
    updateSettings,
    addWarning,
    getWarnings,
    deleteWarning,
    get db() { return db; }
};

/**
 * FS25 ModBot - Parse Time Utility
 * Parses time strings like "1d", "2h", "30m" into milliseconds
 */

const ms = require('ms');

/**
 * Parse time string to milliseconds
 * Supports: s, m, h, d, w, y
 */
function parseTime(timeStr) {
    if (!timeStr) return null;
    
    // Try parsing with ms library first
    const parsed = ms(timeStr);
    if (parsed) return parsed;
    
    // Manual parsing
    const patterns = [
        { regex: /^(\d+)y$/, ms: 31536000000 },  // years
        { regex: /^(\d+)w$/, ms: 604800000 },     // weeks
        { regex: /^(\d+)d$/, ms: 86400000 },      // days
        { regex: /^(\d+)h$/, ms: 3600000 },       // hours
        { regex: /^(\d+)m$/, ms: 60000 },         // minutes
        { regex: /^(\d+)s$/, ms: 1000 }           // seconds
    ];
    
    for (const pattern of patterns) {
        const match = timeStr.match(pattern.regex);
        if (match) {
            return parseInt(match[1]) * pattern.ms;
        }
    }
    
    return null;
}

/**
 * Check if time string is valid
 */
function isValidTime(timeStr) {
    return parseTime(timeStr) !== null;
}

/**
 * Get expiry date from time string
 */
function getExpiryDate(timeStr) {
    const msValue = parseTime(timeStr);
    if (!msValue) return null;
    
    return new Date(Date.now() + msValue);
}

/**
 * Check if date is expired
 */
function isExpired(date) {
    if (!date) return false;
    return new Date(date) < new Date();
}

/**
 * Get remaining time string
 */
function getRemainingTime(expiresAt) {
    if (!expiresAt) return 'Permanent';
    
    const remaining = new Date(expiresAt) - new Date();
    if (remaining <= 0) return 'Expired';
    
    const { formatDuration } = require('./formatDuration');
    return formatDuration(remaining);
}

module.exports = {
    parseTime,
    isValidTime,
    getExpiryDate,
    isExpired,
    getRemainingTime
};

/**
 * FS25 ModBot - Format Duration Utility
 * Formats milliseconds into human readable time
 */

function formatDuration(ms) {
    if (!ms || ms < 0) return 'Permanent';
    
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    const weeks = Math.floor(days / 7);
    const months = Math.floor(days / 30);
    
    if (months > 0) {
        return `${months} month${months > 1 ? 's' : ''}`;
    } else if (weeks > 0) {
        return `${weeks} week${weeks > 1 ? 's' : ''}`;
    } else if (days > 0) {
        return `${days} day${days > 1 ? 's' : ''}`;
    } else if (hours > 0) {
        return `${hours} hour${hours > 1 ? 's' : ''}`;
    } else if (minutes > 0) {
        return `${minutes} minute${minutes > 1 ? 's' : ''}`;
    } else {
        return `${seconds} second${seconds > 1 ? 's' : ''}`;
    }
}

function formatTime(ms) {
    if (!ms || ms < 0) return 'N/A';
    
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    
    let result = [];
    
    if (days > 0) result.push(`${days}d`);
    if (hours % 24 > 0) result.push(`${hours % 24}h`);
    if (minutes % 60 > 0) result.push(`${minutes % 60}m`);
    if (seconds % 60 > 0 && days === 0) result.push(`${seconds % 60}s`);
    
    return result.join(' ') || '< 1s';
}

function formatBytes(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
}

function formatNumber(num) {
    if (num >= 1000000) {
        return (num / 1000000).toFixed(1) + 'M';
    } else if (num >= 1000) {
        return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
}

module.exports = {
    formatDuration,
    formatTime,
    formatBytes,
    formatNumber
};

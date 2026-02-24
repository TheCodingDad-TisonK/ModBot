/**
 * FS25 ModBot - Logger Utility
 * Handles all logging with Winston
 */

const winston = require('winston');
const path = require('path');
const fs = require('fs');

// Ensure logs directory exists
const logsDir = path.join(__dirname, '../../logs');
if (!fs.existsSync(logsDir)) {
    fs.mkdirSync(logsDir, { recursive: true });
}

// Define log format
const logFormat = winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    winston.format.errors({ stack: true }),
    winston.format.printf(({ timestamp, level, message, ...rest }) => {
        let log = `${timestamp} [${level.toUpperCase()}]: ${message}`;
        if (Object.keys(rest).length > 0) {
            log += ` ${JSON.stringify(rest)}`;
        }
        return log;
    })
);

// Create logger
const logger = winston.createLogger({
    level: 'info',
    format: logFormat,
    transports: [
        // Console transport
        new winston.transports.Console({
            format: winston.format.combine(
                winston.format.colorize(),
                logFormat
            )
        }),
        // File transport - General logs
        new winston.transports.File({ 
            filename: path.join(logsDir, 'error.log'), 
            level: 'error',
            maxsize: 5242880, // 5MB
            maxFiles: 5
        }),
        // File transport - All logs
        new winston.transports.File({ 
            filename: path.join(logsDir, 'combined.log'),
            maxsize: 5242880,
            maxFiles: 5
        })
    ]
});

// Export logger
module.exports = logger;

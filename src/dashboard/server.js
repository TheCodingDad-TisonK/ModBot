/**
 * FS25 ModBot - Dashboard Server
 * Web dashboard for bot management (Admin only)
 */

const express = require('express');
const session = require('express-session');
const passport = require('passport');
const { Strategy } = require('passport-discord');
const path = require('path');
const http = require('http');
const logger = require('../utils/logger');
const db = require('../utils/database');

/**
 * Initialize dashboard
 */
async function initDashboard(client) {
    const app = express();
    const port = parseInt(process.env.DASHBOARD_PORT) || 3000;
    
    // Middleware
    app.use(express.json());
    app.use(express.urlencoded({ extended: true }));
    app.use(express.static(path.join(__dirname, 'public')));
    
    // Session
    app.use(session({
        secret: process.env.SESSION_SECRET || 'default-secret',
        resave: false,
        saveUninitialized: false,
        cookie: { secure: false, maxAge: 24 * 60 * 60 * 1000 }
    }));
    
    // Passport
    passport.serializeUser((user, done) => done(null, user));
    passport.deserializeUser((obj, done) => done(null, obj));
    
    passport.use(new Strategy({
        clientID: process.env.DISCORD_CLIENT_ID,
        clientSecret: process.env.DISCORD_CLIENT_SECRET,
        callbackURL: (process.env.DASHBOARD_URL || 'http://localhost:3000') + '/callback',
        scope: ['identify', 'guilds']
    }, (accessToken, refreshToken, profile, done) => {
        process.nextTick(() => done(null, profile));
    }));
    
    app.use(passport.initialize());
    app.use(passport.session());
    
    // View engine
    app.set('view engine', 'ejs');
    app.set('views', path.join(__dirname, 'views'));
    
    // Auth check middleware - requires Discord login
    function isAuthenticated(req, res, next) {
        if (req.isAuthenticated()) return next();
        res.redirect('/login');
    }
    
    // Admin check middleware - requires Administrator permission
    async function isAdmin(req, res, next) {
        if (!req.user) return res.redirect('/login');
        
        const guildId = req.params.guildId || req.query.guildId;
        
        if (guildId) {
            const guild = client.guilds.cache.get(guildId);
            if (!guild) {
                return res.status(404).send('Server not found');
            }
            
            const member = await guild.members.fetch(req.user.id).catch(() => null);
            if (!member || !member.permissions.has('Administrator')) {
                return res.status(403).send('Access denied. You need Administrator permission to manage this server.');
            }
        }
        
        next();
    }
    
    // Routes
    app.get('/', (req, res) => {
        res.render('index', { 
            user: req.user,
            bot: client
        });
    });
    
    app.get('/login', passport.authenticate('discord'));
    
    app.get('/callback', 
        passport.authenticate('discord', { failureRedirect: '/' }),
        (req, res) => res.redirect('/dashboard')
    );
    
    app.get('/logout', (req, res) => {
        req.logout(() => res.redirect('/'));
    });
    
    app.get('/dashboard', isAuthenticated, (req, res) => {
        const userGuilds = req.user.guilds || [];
        const botGuilds = client.guilds.cache.map(g => g);
        
        // Find mutual guilds where user is admin
        const mutualGuilds = userGuilds.filter(ug => 
            botGuilds.some(bg => bg.id === ug.id) && ug.permissions & 0x8 // 0x8 = Administrator
        );
        
        res.render('dashboard', { 
            user: req.user,
            guilds: mutualGuilds,
            bot: client
        });
    });
    
    // Guild dashboard - requires admin
    app.get('/dashboard/:guildId', isAuthenticated, isAdmin, async (req, res) => {
        const guildId = req.params.guildId;
        const guild = client.guilds.cache.get(guildId);
        
        if (!guild) {
            return res.status(404).send('Guild not found');
        }
        
        // Double-check admin permission
        const member = await guild.members.fetch(req.user.id);
        if (!member.permissions.has('Administrator')) {
            return res.status(403).send('Access denied. You need Administrator permission.');
        }
        
        const settings = db.getSettings(guildId);
        
        res.render('guild', { 
            user: req.user,
            guild: guild,
            settings: settings,
            bot: client
        });
    });
    
    // API Routes - requires admin
    app.post('/api/:guildId/settings', isAuthenticated, isAdmin, async (req, res) => {
        const guildId = req.params.guildId;
        const guild = client.guilds.cache.get(guildId);
        
        if (!guild) {
            return res.status(404).json({ error: 'Guild not found' });
        }
        
        // Verify admin again
        const member = await guild.members.fetch(req.user.id);
        if (!member.permissions.has('Administrator')) {
            return res.status(403).json({ error: 'Access denied' });
        }
        
        try {
            db.updateSettings(guildId, req.body);
            res.json({ success: true });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    });
    
    // Start server with error handling
    const server = http.createServer(app);
    
    server.on('error', (err) => {
        if (err.code === 'EADDRINUSE') {
            logger.warn(`Port ${port} is already in use. Dashboard will not start.`);
            logger.warn('Change DASHBOARD_PORT in .env to use a different port.');
        } else {
            logger.error('Dashboard server error:', err);
        }
    });
    
    server.listen(port, () => {
        logger.info(`Dashboard running on http://localhost:${port}`);
    });
    
    return app;
}

module.exports = { initDashboard };

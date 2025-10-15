const express = require('express');
const axios = require('axios');
const cors = require('cors');
const session = require('express-session');
const fs = require('fs').promises;
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'https://klioxt.github.io',
  credentials: true
}));

app.use(express.json());
app.use(session({
  secret: process.env.SESSION_SECRET || 'exobot-dashboard-secret',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  }
}));

// Discord OAuth URLs
const DISCORD_API_BASE = 'https://discord.com/api/v10';
const OAUTH2_URL = `${DISCORD_API_BASE}/oauth2/authorize`;
const TOKEN_URL = `${DISCORD_API_BASE}/oauth2/token`;

// Settings storage path
const SETTINGS_DIR = path.join(__dirname, 'settings');
const ensureSettingsDir = async () => {
  try {
    await fs.access(SETTINGS_DIR);
  } catch {
    await fs.mkdir(SETTINGS_DIR);
  }
};

// Routes

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Initiate Discord OAuth
app.get('/auth/discord', (req, res) => {
  const params = new URLSearchParams({
    client_id: process.env.DISCORD_CLIENT_ID,
    redirect_uri: process.env.DISCORD_REDIRECT_URI,
    response_type: 'code',
    scope: 'identify guilds',
    state: Math.random().toString(36).substring(7) // CSRF protection
  });

  const authUrl = `${OAUTH2_URL}?${params}`;
  res.json({ authUrl });
});

// OAuth callback - exchange code for token
app.post('/auth/callback', async (req, res) => {
  try {
    const { code } = req.body;

    if (!code) {
      return res.status(400).json({ error: 'No authorization code provided' });
    }

    // Exchange code for access token
    const tokenResponse = await axios.post(TOKEN_URL, new URLSearchParams({
      client_id: process.env.DISCORD_CLIENT_ID,
      client_secret: process.env.DISCORD_CLIENT_SECRET,
      grant_type: 'authorization_code',
      code: code,
      redirect_uri: process.env.DISCORD_REDIRECT_URI
    }), {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    });

    const tokenData = tokenResponse.data;

    // Store token in session
    req.session.discord_token = tokenData.access_token;
    req.session.discord_refresh_token = tokenData.refresh_token;
    req.session.token_expires = Date.now() + (tokenData.expires_in * 1000);

    // Fetch user data
    const userResponse = await axios.get(`${DISCORD_API_BASE}/users/@me`, {
      headers: {
        Authorization: `Bearer ${tokenData.access_token}`
      }
    });

    const userData = userResponse.data;
    req.session.discord_user = userData;

    res.json({
      success: true,
      user: userData,
      expires_in: tokenData.expires_in
    });

  } catch (error) {
    console.error('OAuth callback error:', error.response?.data || error.message);
    res.status(500).json({
      error: 'Failed to authenticate with Discord',
      details: error.response?.data || error.message
    });
  }
});

// Get current user
app.get('/api/user', async (req, res) => {
  try {
    if (!req.session.discord_token) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    // Check if token is expired and refresh if needed
    if (Date.now() >= req.session.token_expires) {
      await refreshToken(req);
    }

    const userResponse = await axios.get(`${DISCORD_API_BASE}/users/@me`, {
      headers: {
        Authorization: `Bearer ${req.session.discord_token}`
      }
    });

    res.json(userResponse.data);
  } catch (error) {
    console.error('Get user error:', error.response?.data || error.message);
    res.status(500).json({ error: 'Failed to fetch user data' });
  }
});

// Get user guilds
app.get('/api/guilds', async (req, res) => {
  try {
    if (!req.session.discord_token) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    // Check if token is expired and refresh if needed
    if (Date.now() >= req.session.token_expires) {
      await refreshToken(req);
    }

    const guildsResponse = await axios.get(`${DISCORD_API_BASE}/users/@me/guilds`, {
      headers: {
        Authorization: `Bearer ${req.session.discord_token}`
      }
    });

    // Filter guilds where the user has manage_guild permission (0x20)
    const manageableGuilds = guildsResponse.data.filter(guild =>
      (guild.permissions & 0x20) === 0x20
    );

    res.json(manageableGuilds);
  } catch (error) {
    console.error('Get guilds error:', error.response?.data || error.message);
    res.status(500).json({ error: 'Failed to fetch guilds data' });
  }
});

// Get specific guild details
app.get('/api/guild/:guildId', async (req, res) => {
  try {
    if (!req.session.discord_token) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    const { guildId } = req.params;

    // Check if token is expired and refresh if needed
    if (Date.now() >= req.session.token_expires) {
      await refreshToken(req);
    }

    const guildResponse = await axios.get(`${DISCORD_API_BASE}/guilds/${guildId}`, {
      headers: {
        Authorization: `Bot ${process.env.DISCORD_BOT_TOKEN || 'YOUR_BOT_TOKEN'}`
      }
    });

    res.json(guildResponse.data);
  } catch (error) {
    console.error('Get guild error:', error.response?.data || error.message);
    res.status(500).json({ error: 'Failed to fetch guild data' });
  }
});

// Settings management
app.get('/api/settings/:guildId', async (req, res) => {
  try {
    const { guildId } = req.params;
    await ensureSettingsDir();

    const settingsPath = path.join(SETTINGS_DIR, `${guildId}.json`);

    try {
      const settingsData = await fs.readFile(settingsPath, 'utf8');
      const settings = JSON.parse(settingsData);
      res.json(settings);
    } catch {
      // Return default settings if file doesn't exist
      res.json(getDefaultSettings());
    }
  } catch (error) {
    console.error('Get settings error:', error);
    res.status(500).json({ error: 'Failed to load settings' });
  }
});

app.post('/api/settings/:guildId', async (req, res) => {
  try {
    const { guildId } = req.params;
    const settings = req.body;

    await ensureSettingsDir();
    const settingsPath = path.join(SETTINGS_DIR, `${guildId}.json`);

    await fs.writeFile(settingsPath, JSON.stringify(settings, null, 2));
    res.json({ success: true });
  } catch (error) {
    console.error('Save settings error:', error);
    res.status(500).json({ error: 'Failed to save settings' });
  }
});

// Logout
app.post('/auth/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).json({ error: 'Failed to logout' });
    }
    res.json({ success: true });
  });
});

// Helper functions
async function refreshToken(req) {
  try {
    const refreshResponse = await axios.post(TOKEN_URL, new URLSearchParams({
      client_id: process.env.DISCORD_CLIENT_ID,
      client_secret: process.env.DISCORD_CLIENT_SECRET,
      grant_type: 'refresh_token',
      refresh_token: req.session.discord_refresh_token
    }), {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    });

    const tokenData = refreshResponse.data;
    req.session.discord_token = tokenData.access_token;
    req.session.discord_refresh_token = tokenData.refresh_token;
    req.session.token_expires = Date.now() + (tokenData.expires_in * 1000);
  } catch (error) {
    console.error('Token refresh error:', error);
    throw error;
  }
}

function getDefaultSettings() {
  return {
    moderation: {
      antiSpam: false,
      spamThreshold: 5,
      linkFilter: false,
      allowedDomains: '',
      wordFilter: false,
      bannedWords: '',
      spamSanction: 'warn',
      linkSanction: 'delete',
      wordSanction: 'delete'
    },
    support: {
      tickets: false,
      ticketCategory: 'Support',
      logs: false,
      logChannel: '#logs',
      antiRaid: false,
      raidThreshold: 10,
      verification: false,
      verificationRole: 'Membre'
    },
    utilities: {
      games: false,
      info: false,
      tools: false
    },
    general: {
      botPrefix: '!',
      botLanguage: 'fr',
      botStatus: 'online',
      botActivity: 'J\'aide les membres !'
    }
  };
}

// Error handling middleware
app.use((error, req, res, next) => {
  console.error('Server error:', error);
  res.status(500).json({ error: 'Internal server error' });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 ExoBot Dashboard Backend running on port ${PORT}`);
  console.log(`🌐 Frontend URL: ${process.env.FRONTEND_URL || 'https://klioxt.github.io'}`);
});

module.exports = app;

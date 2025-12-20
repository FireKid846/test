// Enhanced Telegram Bot with Interactive Menus
// Install: npm install node-telegram-bot-api

const TelegramBot = require('node-telegram-bot-api');
const express = require('express');

// Replace with your bot token from @BotFather
const TELEGRAM_TOKEN = '8339300549:AAGUpYGRBMFFqMZLUl1NQetqIzKWcI4Sr2Y';
const API_KEY = 'sk_77cf0a45f40600b4d9454e4069372db217f9b442f6b0ccb6dc64efced45e6616';
const BASE_URL = 'https://gamingsensitivity.vercel.app';
const PORT = process.env.PORT || 3000;
const RENDER_URL = process.env.RENDER_EXTERNAL_URL || `http://localhost:${PORT}`;

const bot = new TelegramBot(TELEGRAM_TOKEN, { polling: true });
const app = express();

// Store user sessions
const userSessions = {};

// Express server for health checks and self-ping
app.get('/', (req, res) => {
  res.json({ 
    status: 'online', 
    message: '🤖 Telegram Bot is running!',
    uptime: process.uptime(),
    timestamp: new Date().toISOString()
  });
});

app.get('/health', (req, res) => {
  res.json({ 
    status: 'healthy',
    bot: 'active',
    sessions: Object.keys(userSessions).length
  });
});

app.get('/ping', (req, res) => {
  res.json({ 
    status: 'pong',
    timestamp: new Date().toISOString()
  });
});

// Start Express server
app.listen(PORT, () => {
  console.log(`🌐 Express server running on port ${PORT}`);
  console.log(`🤖 Bot started! Send /start to begin`);
  console.log(`📡 Health check available at: ${RENDER_URL}/health`);
});

// Self-ping to keep Render service alive
setInterval(async () => {
  try {
    const response = await fetch(`${RENDER_URL}/ping`);
    const data = await response.json();
    console.log(`✅ Self-ping successful: ${data.status} at ${data.timestamp}`);
  } catch (error) {
    console.error('❌ Self-ping failed:', error.message);
  }
}, 14 * 60 * 1000); // Ping every 14 minutes

console.log('⏰ Self-ping enabled - pinging every 14 minutes');

// Start command
bot.onText(/\/start/, (msg) => {
  const chatId = msg.chat.id;
  bot.sendMessage(chatId, 
    '🎮 *Gaming Sensitivity Bot*\n\n' +
    'Generate optimal sensitivity settings for your favorite games!\n\n' +
    '*Available Commands:*\n' +
    '/freefire - Generate Free Fire sensitivity\n' +
    '/codm - Generate CODM sensitivity\n' +
    '/help - Show help message\n\n' +
    '✨ Get started by choosing a game!',
    { parse_mode: 'Markdown' }
  );
});

// Free Fire command with interactive menus
bot.onText(/\/freefire/, async (msg) => {
  const chatId = msg.chat.id;
  userSessions[chatId] = { game: 'freefire', step: 'device' };
  
  bot.sendMessage(chatId, 
    '📱 *Free Fire Sensitivity Generator*\n\n' +
    'Please send your device name:\n' +
    '_(e.g., iPhone 14 Pro, Samsung Galaxy S23, iPad Pro)_',
    { parse_mode: 'Markdown' }
  );
});

// CODM command with interactive menus
bot.onText(/\/codm/, async (msg) => {
  const chatId = msg.chat.id;
  userSessions[chatId] = { game: 'codm', step: 'device' };
  
  bot.sendMessage(chatId,
    '📱 *CODM Sensitivity Generator*\n\n' +
    'Please send your device name:\n' +
    '_(e.g., iPhone 14 Pro, Samsung Galaxy S23, OnePlus 11)_',
    { parse_mode: 'Markdown' }
  );
});

// Handle all messages
bot.on('message', async (msg) => {
  const chatId = msg.chat.id;
  const text = msg.text;
  
  // Skip if command
  if (text && text.startsWith('/')) return;
  
  // Check if user has active session
  if (!userSessions[chatId]) return;
  
  const session = userSessions[chatId];
  
  // Handle device input
  if (session.step === 'device') {
    session.deviceName = text;
    
    if (session.game === 'freefire') {
      session.step = 'playstyle';
      
      const keyboard = {
        inline_keyboard: [
          [
            { text: '⚔️ Aggressive', callback_data: 'ps_aggressive' },
            { text: '🏃 Rusher', callback_data: 'ps_rusher' }
          ],
          [
            { text: '🎯 Precise', callback_data: 'ps_precise' },
            { text: '🔫 Sniper', callback_data: 'ps_sniper' }
          ],
          [
            { text: '⚖️ Balanced', callback_data: 'ps_balanced' },
            { text: '🎮 Versatile', callback_data: 'ps_versatile' }
          ],
          [
            { text: '🛡️ Defensive', callback_data: 'ps_defensive' }
          ]
        ]
      };
      
      bot.sendMessage(chatId, 
        '🎯 *Select Your Play Style:*\n\n' +
        '• *Aggressive* - Rush and push\n' +
        '• *Rusher* - Fast-paced gameplay\n' +
        '• *Precise* - Accuracy focused\n' +
        '• *Sniper* - Long-range specialist\n' +
        '• *Balanced* - All-around player\n' +
        '• *Versatile* - Adaptive style\n' +
        '• *Defensive* - Strategic positioning',
        { parse_mode: 'Markdown', reply_markup: keyboard }
      );
    } else if (session.game === 'codm') {
      session.step = 'fingercount';
      
      const keyboard = {
        inline_keyboard: [
          [
            { text: '2️⃣ 2 Fingers', callback_data: 'fc_2fingers' },
            { text: '3️⃣ 3 Fingers', callback_data: 'fc_3fingers' }
          ],
          [
            { text: '4️⃣ 4 Fingers', callback_data: 'fc_4fingers' },
            { text: '5️⃣ 4+ Fingers', callback_data: 'fc_4+' }
          ]
        ]
      };
      
      bot.sendMessage(chatId,
        '🖐️ *Select Your Finger Count:*\n\n' +
        'Choose how many fingers you use to play:',
        { parse_mode: 'Markdown', reply_markup: keyboard }
      );
    }
  }
});

// Handle callback queries (button presses)
bot.on('callback_query', async (query) => {
  const chatId = query.message.chat.id;
  const data = query.data;
  const session = userSessions[chatId];
  
  if (!session) {
    bot.answerCallbackQuery(query.id, { text: 'Session expired. Please start again.' });
    return;
  }
  
  // Handle play style selection for Free Fire
  if (data.startsWith('ps_')) {
    const playStyle = data.replace('ps_', '');
    session.playStyle = playStyle;
    session.step = 'experience';
    
    bot.answerCallbackQuery(query.id);
    
    const keyboard = {
      inline_keyboard: [
        [
          { text: '🌱 Beginner', callback_data: 'exp_beginner' },
          { text: '🎯 Novice', callback_data: 'exp_novice' }
        ],
        [
          { text: '⚙️ Intermediate', callback_data: 'exp_intermediate' },
          { text: '🎮 Casual', callback_data: 'exp_casual' }
        ],
        [
          { text: '🏆 Advanced', callback_data: 'exp_advanced' },
          { text: '💪 Experienced', callback_data: 'exp_experienced' }
        ],
        [
          { text: '⭐ Professional', callback_data: 'exp_professional' },
          { text: '👑 Expert', callback_data: 'exp_expert' }
        ]
      ]
    };
    
    bot.editMessageText(
      '🎓 *Select Your Experience Level:*\n\n' +
      '• *Beginner* - Just starting\n' +
      '• *Novice* - Learning basics\n' +
      '• *Intermediate* - Getting better\n' +
      '• *Casual* - Play for fun\n' +
      '• *Advanced* - Skilled player\n' +
      '• *Experienced* - Very skilled\n' +
      '• *Professional* - Competitive\n' +
      '• *Expert* - Top tier',
      {
        chat_id: chatId,
        message_id: query.message.message_id,
        parse_mode: 'Markdown',
        reply_markup: keyboard
      }
    );
  }
  
  // Handle experience level selection for Free Fire
  else if (data.startsWith('exp_')) {
    const experience = data.replace('exp_', '');
    session.experienceLevel = experience;
    session.step = 'calculator';
    
    bot.answerCallbackQuery(query.id);
    
    const keyboard = {
      inline_keyboard: [
        [
          { text: '🆓 Free Calculator', callback_data: 'calc_free' },
          { text: '⭐ VIP Calculator', callback_data: 'calc_vip' }
        ]
      ]
    };
    
    bot.editMessageText(
      '💎 *Select Calculator Type:*\n\n' +
      '• *Free* - Basic sensitivity settings\n' +
      '• *VIP* - Advanced optimization',
      {
        chat_id: chatId,
        message_id: query.message.message_id,
        parse_mode: 'Markdown',
        reply_markup: keyboard
      }
    );
  }
  
  // Handle calculator type selection for Free Fire
  else if (data.startsWith('calc_')) {
    const calcType = data.replace('calc_', '');
    session.calculatorType = calcType;
    
    bot.answerCallbackQuery(query.id, { text: 'Generating sensitivity...' });
    
    bot.editMessageText(
      '⚙️ *Generating Free Fire Sensitivity...*\n\n' +
      'Please wait a moment...',
      {
        chat_id: chatId,
        message_id: query.message.message_id,
        parse_mode: 'Markdown'
      }
    );
    
    // Generate Free Fire sensitivity
    await generateFreefireSensitivity(chatId, session);
  }
  
  // Handle finger count selection for CODM
  else if (data.startsWith('fc_')) {
    const fingerCount = data.replace('fc_', '');
    session.fingerCount = fingerCount;
    
    bot.answerCallbackQuery(query.id, { text: 'Generating sensitivity...' });
    
    bot.editMessageText(
      '⚙️ *Generating CODM Sensitivity...*\n\n' +
      'Please wait a moment...',
      {
        chat_id: chatId,
        message_id: query.message.message_id,
        parse_mode: 'Markdown'
      }
    );
    
    // Generate CODM sensitivity
    await generateCODMSensitivity(chatId, session);
  }
});

// Generate Free Fire sensitivity
async function generateFreefireSensitivity(chatId, session) {
  try {
    const response = await fetch(`${BASE_URL}/api/generate/freefire`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': API_KEY
      },
      body: JSON.stringify({
        device_name: session.deviceName,
        play_style: session.playStyle,
        experience_level: session.experienceLevel,
        calculator_type: session.calculatorType
      })
    });
    
    const data = await response.json();
    
    if (data.success) {
      const settings = data.data;
      bot.sendMessage(chatId,
        `✅ *Free Fire Sensitivity Generated!*\n\n` +
        `📱 *Device:* ${session.deviceName}\n` +
        `🎯 *Play Style:* ${session.playStyle}\n` +
        `🎓 *Level:* ${session.experienceLevel}\n` +
        `💎 *Type:* ${session.calculatorType}\n\n` +
        `━━━━━━━━━━━━━━━━━\n` +
        `📊 *Sensitivity Settings:*\n\n` +
        `• General: \`${settings.general}\`\n` +
        `• Red Dot: \`${settings.redDot}\`\n` +
        `• 2x Scope: \`${settings.scope2x}\`\n` +
        `• 4x Scope: \`${settings.scope4x}\`\n` +
        `• Sniper: \`${settings.sniperScope}\`\n` +
        `• Free Look: \`${settings.freeLook}\`\n` +
        `${settings.recommendedDPI ? `\n💡 *Recommended DPI:* ${settings.recommendedDPI}` : ''}\n\n` +
        `━━━━━━━━━━━━━━━━━\n` +
        `Use /freefire to generate again!`,
        { parse_mode: 'Markdown' }
      );
    } else {
      bot.sendMessage(chatId, 
        `❌ *Error:* ${data.message}\n\n` +
        (data.suggestions ? `💡 *Suggestions:*\n${data.suggestions.join('\n')}` : '') +
        '\n\nUse /freefire to try again.',
        { parse_mode: 'Markdown' }
      );
    }
  } catch (error) {
    bot.sendMessage(chatId, 
      `❌ *Error:* ${error.message}\n\nUse /freefire to try again.`,
      { parse_mode: 'Markdown' }
    );
  }
  
  // Clear session
  delete userSessions[chatId];
}

// Generate CODM sensitivity
async function generateCODMSensitivity(chatId, session) {
  try {
    const response = await fetch(`${BASE_URL}/api/generate/codm`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': API_KEY
      },
      body: JSON.stringify({
        device_name: session.deviceName,
        finger_count: session.fingerCount
      })
    });
    
    const data = await response.json();
    
    if (data.success) {
      const mp = data.data.mp;
      bot.sendMessage(chatId,
        `✅ *CODM Sensitivity Generated!*\n\n` +
        `📱 *Device:* ${session.deviceName}\n` +
        `🖐️ *Fingers:* ${session.fingerCount}\n\n` +
        `━━━━━━━━━━━━━━━━━\n` +
        `📸 *Camera & Movement:*\n\n` +
        `• Camera FPP: \`${mp.cameraFpp}\`\n` +
        `• Steering: \`${mp.steeringSensitivity}\`\n` +
        `• Vertical: \`${mp.verticalTurningSensitivity}\`\n\n` +
        `🎯 *ADS Sensitivity:*\n\n` +
        `• Red Dot: \`${mp.redDot}\`\n` +
        `• ADS: \`${mp.adsSensitivity}\`\n` +
        `• 4x Scope: \`${mp.scope4x}\`\n` +
        `• Sniper: \`${mp.sniperScope}\`\n\n` +
        `🔫 *Firing Sensitivity:*\n\n` +
        `• Firing Cam: \`${mp.firingCameraFpp}\`\n` +
        `• Firing Red: \`${mp.firingRedDot}\`\n` +
        `• Firing 4x: \`${mp.firingScope4x}\`\n\n` +
        `━━━━━━━━━━━━━━━━━\n` +
        `Use /codm to generate again!`,
        { parse_mode: 'Markdown' }
      );
    } else {
      bot.sendMessage(chatId,
        `❌ *Error:* ${data.message}\n\n` +
        (data.suggestions ? `💡 *Suggestions:*\n${data.suggestions.join('\n')}` : '') +
        '\n\nUse /codm to try again.',
        { parse_mode: 'Markdown' }
      );
    }
  } catch (error) {
    bot.sendMessage(chatId,
      `❌ *Error:* ${error.message}\n\nUse /codm to try again.`,
      { parse_mode: 'Markdown' }
    );
  }
  
  // Clear session
  delete userSessions[chatId];
}

// Help command
bot.onText(/\/help/, (msg) => {
  const chatId = msg.chat.id;
  bot.sendMessage(chatId,
    '🎮 *Gaming Sensitivity Bot Help*\n\n' +
    '*Available Commands:*\n\n' +
    '📱 /freefire - Generate Free Fire sensitivity\n' +
    '   → Choose device, play style, experience, calculator type\n\n' +
    '📱 /codm - Generate CODM sensitivity\n' +
    '   → Choose device and finger count\n\n' +
    '❓ /help - Show this help message\n\n' +
    '━━━━━━━━━━━━━━━━━\n\n' +
    '*How It Works:*\n\n' +
    '1️⃣ Choose your game (/freefire or /codm)\n' +
    '2️⃣ Enter your device name\n' +
    '3️⃣ Select your preferences using buttons\n' +
    '4️⃣ Get optimized sensitivity settings!\n\n' +
    '💡 *Tip:* Use the buttons for easy selection!\n\n' +
    '🔑 API Status: Active',
    { parse_mode: 'Markdown' }
  );
});

// Error handling
bot.on('polling_error', (error) => {
  console.error('❌ Polling error:', error.code, error.message);
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n👋 Bot shutting down gracefully...');
  bot.stopPolling();
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\n👋 Bot shutting down gracefully...');
  bot.stopPolling();
  process.exit(0);
});

// Simple Telegram Bot to Test API Key
// Install: npm install node-telegram-bot-api

const TelegramBot = require('node-telegram-bot-api');

// Replace with your bot token from @BotFather
const TELEGRAM_TOKEN = '8339300549:AAGUpYGRBMFFqMZLUl1NQetqIzKWcI4Sr2Y';
const API_KEY = 'sk_6b4d783014558370f70d62c2102d55b5e3c1c54e316807a166a779801359463';
const BASE_URL = 'https://gamingsensitivity.vercel.app';

const bot = new TelegramBot(TELEGRAM_TOKEN, { polling: true });

console.log('🤖 Bot started! Send /start to begin');

// Start command
bot.onText(/\/start/, (msg) => {
  const chatId = msg.chat.id;
  bot.sendMessage(chatId, 
    '🎮 *API Key Tester Bot*\n\n' +
    'Available commands:\n' +
    '/freefire - Generate Free Fire sensitivity\n' +
    '/codm - Generate CODM sensitivity\n' +
    '/help - Show this message',
    { parse_mode: 'Markdown' }
  );
});

// Free Fire command
bot.onText(/\/freefire/, async (msg) => {
  const chatId = msg.chat.id;
  
  bot.sendMessage(chatId, '🔍 Please send your device name (e.g., iPhone 14 Pro)');
  
  bot.once('message', async (deviceMsg) => {
    if (deviceMsg.text.startsWith('/')) return;
    
    const deviceName = deviceMsg.text;
    bot.sendMessage(chatId, '⚙️ Generating Free Fire sensitivity...');
    
    try {
      const response = await fetch(`${BASE_URL}/api/generate/freefire`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': API_KEY
        },
        body: JSON.stringify({
          device_name: deviceName,
          play_style: 'balanced',
          experience_level: 'intermediate',
          calculator_type: 'free'
        })
      });
      
      const data = await response.json();
      
      if (data.success) {
        const settings = data.data;
        bot.sendMessage(chatId,
          `✅ *Free Fire Sensitivity*\n\n` +
          `📱 Device: ${deviceName}\n\n` +
          `🎯 *Settings:*\n` +
          `• General: ${settings.general}\n` +
          `• Red Dot: ${settings.redDot}\n` +
          `• 2x Scope: ${settings.scope2x}\n` +
          `• 4x Scope: ${settings.scope4x}\n` +
          `• Sniper: ${settings.sniperScope}\n` +
          `• Free Look: ${settings.freeLook}\n\n` +
          `${settings.recommendedDPI ? `💡 Recommended DPI: ${settings.recommendedDPI}` : ''}`,
          { parse_mode: 'Markdown' }
        );
      } else {
        bot.sendMessage(chatId, `❌ Error: ${data.message}`);
        if (data.suggestions) {
          bot.sendMessage(chatId, `💡 Did you mean:\n${data.suggestions.join('\n')}`);
        }
      }
    } catch (error) {
      bot.sendMessage(chatId, `❌ Error: ${error.message}`);
    }
  });
});

// CODM command
bot.onText(/\/codm/, async (msg) => {
  const chatId = msg.chat.id;
  
  bot.sendMessage(chatId, '🔍 Please send your device name (e.g., Samsung Galaxy S23)');
  
  bot.once('message', async (deviceMsg) => {
    if (deviceMsg.text.startsWith('/')) return;
    
    const deviceName = deviceMsg.text;
    
    bot.sendMessage(chatId, 
      '🎮 Select finger count:\n\n' +
      '1️⃣ - 2 Fingers\n' +
      '2️⃣ - 3 Fingers\n' +
      '3️⃣ - 4 Fingers\n' +
      '4️⃣ - 4+ Fingers'
    );
    
    bot.once('message', async (fingerMsg) => {
      if (fingerMsg.text.startsWith('/')) return;
      
      const fingerMap = {
        '1': '2fingers',
        '2': '3fingers',
        '3': '4fingers',
        '4': '4+'
      };
      
      const fingerCount = fingerMap[fingerMsg.text] || '2fingers';
      bot.sendMessage(chatId, '⚙️ Generating CODM sensitivity...');
      
      try {
        const response = await fetch(`${BASE_URL}/api/generate/codm`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-API-Key': API_KEY
          },
          body: JSON.stringify({
            device_name: deviceName,
            finger_count: fingerCount
          })
        });
        
        const data = await response.json();
        
        if (data.success) {
          const mp = data.data.mp;
          bot.sendMessage(chatId,
            `✅ *CODM Sensitivity*\n\n` +
            `📱 Device: ${deviceName}\n` +
            `🖐️ Fingers: ${fingerCount}\n\n` +
            `📸 *Camera & Movement:*\n` +
            `• Camera FPP: ${mp.cameraFpp}\n` +
            `• Steering: ${mp.steeringSensitivity}\n` +
            `• Vertical: ${mp.verticalTurningSensitivity}\n\n` +
            `🎯 *ADS Sensitivity:*\n` +
            `• Red Dot: ${mp.redDot}\n` +
            `• ADS: ${mp.adsSensitivity}\n` +
            `• 4x Scope: ${mp.scope4x}\n` +
            `• Sniper: ${mp.sniperScope}\n\n` +
            `🔫 *Firing Sensitivity:*\n` +
            `• Firing Cam: ${mp.firingCameraFpp}\n` +
            `• Firing Red: ${mp.firingRedDot}\n` +
            `• Firing 4x: ${mp.firingScope4x}`,
            { parse_mode: 'Markdown' }
          );
        } else {
          bot.sendMessage(chatId, `❌ Error: ${data.message}`);
          if (data.suggestions) {
            bot.sendMessage(chatId, `💡 Did you mean:\n${data.suggestions.join('\n')}`);
          }
        }
      } catch (error) {
        bot.sendMessage(chatId, `❌ Error: ${error.message}`);
      }
    });
  });
});

// Help command
bot.onText(/\/help/, (msg) => {
  const chatId = msg.chat.id;
  bot.sendMessage(chatId,
    '🎮 *API Key Tester Bot*\n\n' +
    '*Commands:*\n' +
    '/freefire - Generate Free Fire sensitivity\n' +
    '/codm - Generate CODM sensitivity\n' +
    '/help - Show this message\n\n' +
    '*How to use:*\n' +
    '1. Send /freefire or /codm\n' +
    '2. Enter your device name\n' +
    '3. (CODM only) Select finger count\n' +
    '4. Get your sensitivity settings!\n\n' +
    '🔑 Testing API Key: `...de83`',
    { parse_mode: 'Markdown' }
  );
});

// Error handling
bot.on('polling_error', (error) => {
  console.error('Polling error:', error);
});

process.on('SIGINT', () => {
  console.log('\n👋 Bot stopped');
  process.exit();
});

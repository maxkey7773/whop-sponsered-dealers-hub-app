// Telegram Bot for InfluencerHub Notifications
// This is a standalone bot script that can be run separately

const TelegramBot = require('node-telegram-bot-api');

// Replace with your bot token from @BotFather
const token = process.env.TELEGRAM_BOT_TOKEN || 'YOUR_BOT_TOKEN_HERE';

// Create a bot that uses 'polling' to fetch new updates
const bot = new TelegramBot(token, { polling: true });

// Store user chat IDs (in production, store in database)
const userChatIds = new Map();

// Basic commands
bot.onText(/\/start/, (msg) => {
  const chatId = msg.chat.id;
  const firstName = msg.from.first_name || 'User';

  bot.sendMessage(chatId,
    `👋 Welcome to *InfluencerHub Bot*, ${firstName}!\n\n` +
    `I'll keep you updated on:\n` +
    `• 🆕 New deals matching your profile\n` +
    `• 📊 Application status changes\n` +
    `• 💰 Payment updates\n` +
    `• 💬 Messages from brands\n\n` +
    `Use /help for more commands.`,
    { parse_mode: 'Markdown' }
  );
});

bot.onText(/\/help/, (msg) => {
  const chatId = msg.chat.id;

  bot.sendMessage(chatId,
    `🤖 *InfluencerHub Bot Commands:*\n\n` +
    `📋 *Available Commands:*\n` +
    `/start - Initialize bot and get welcome message\n` +
    `/help - Show this help message\n` +
    `/status - Check your account status\n` +
    `/deals - Get latest deals\n\n` +
    `🔔 *Automatic Notifications:*\n` +
    `• New deals in your niche\n` +
    `• Application approvals/rejections\n` +
    `• Payment confirmations\n` +
    `• Direct messages from brands\n\n` +
    `💡 *Tip:* Connect your account in the app settings to receive personalized notifications!`,
    { parse_mode: 'Markdown' }
  );
});

bot.onText(/\/status/, (msg) => {
  const chatId = msg.chat.id;

  // In production, check user's actual status from database
  bot.sendMessage(chatId,
    `📊 *Your Account Status:*\n\n` +
    `🔗 *Connection:* Not connected\n` +
    `📱 *Role:* Not set\n` +
    `💼 *Active Deals:* 0\n` +
    `💰 *Pending Payments:* 0\n\n` +
    `⚙️ Connect your account in the InfluencerHub app to see real status updates!`,
    { parse_mode: 'Markdown' }
  );
});

bot.onText(/\/deals/, (msg) => {
  const chatId = msg.chat.id;

  // In production, fetch real deals from database
  bot.sendMessage(chatId,
    `🎯 *Latest Deals:*\n\n` +
    `🔍 *No deals available right now*\n\n` +
    `Check back later or browse deals directly in the app!\n\n` +
    `🌐 [Open InfluencerHub](https://your-app-url.com/deals)`,
    { parse_mode: 'Markdown' }
  );
});

// Function to send notification to specific user
function sendNotification(chatId, message, options = {}) {
  try {
    bot.sendMessage(chatId, message, {
      parse_mode: 'Markdown',
      disable_notification: false,
      ...options
    });
    console.log(`Notification sent to ${chatId}`);
  } catch (error) {
    console.error(`Failed to send notification to ${chatId}:`, error);
  }
}

// Export functions for use in other parts of the application
module.exports = {
  sendNotification,

  // Specific notification functions
  sendDealNotification: (chatId, dealTitle, brandName, budget) => {
    const message = `🎉 *New Deal Available!*\n\n` +
      `📝 *${dealTitle}*\n` +
      `🏢 Brand: ${brandName}\n` +
      `💰 Budget: $${budget}\n\n` +
      `Check it out in your dashboard!`;

    sendNotification(chatId, message);
  },

  sendApplicationStatusNotification: (chatId, dealTitle, status, brandName) => {
    const statusEmoji = {
      'APPROVED': '✅',
      'REJECTED': '❌',
      'IN_PROGRESS': '🚀',
      'COMPLETED': '🎉'
    }[status] || '📝';

    const message = `${statusEmoji} *Application Update*\n\n` +
      `📝 Deal: ${dealTitle}\n` +
      `🏢 Brand: ${brandName}\n` +
      `📊 Status: ${status}\n\n` +
      `View details in your dashboard.`;

    sendNotification(chatId, message);
  },

  sendPaymentNotification: (chatId, amount, type, status) => {
    const typeEmoji = type === 'DEPOSIT' ? '💳' : '💰';
    const statusEmoji = status === 'COMPLETED' ? '✅' : status === 'PENDING' ? '⏳' : '❌';

    const message = `${typeEmoji} *Payment ${type}*\n\n` +
      `💵 Amount: $${amount}\n` +
      `📊 Status: ${status}\n\n` +
      `${status === 'COMPLETED' ? 'Payment processed successfully!' : 'Processing your payment...'}`;

    sendNotification(chatId, message);
  },

  sendMessageNotification: (chatId, senderName, messageText) => {
    const truncatedMessage = messageText.length > 100 ?
      messageText.substring(0, 100) + '...' : messageText;

    const message = `💬 *New Message*\n\n` +
      `👤 From: ${senderName}\n` +
      `📝 Message: ${truncatedMessage}\n\n` +
      `Reply in your messages section.`;

    sendNotification(chatId, message);
  },

  // Function to register user chat ID (call this when user connects their Telegram)
  registerUser: (userId, chatId) => {
    userChatIds.set(userId, chatId);
    console.log(`User ${userId} registered with chat ID ${chatId}`);
  },

  // Function to get user's chat ID
  getUserChatId: (userId) => {
    return userChatIds.get(userId);
  }
};

// Handle polling errors
bot.on('polling_error', (error) => {
  console.error('Polling error:', error);
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('Bot shutting down...');
  bot.stopPolling();
  process.exit(0);
});

console.log('🤖 InfluencerHub Telegram Bot is running...');
console.log('Press Ctrl+C to stop the bot');
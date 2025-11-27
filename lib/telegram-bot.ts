import TelegramBot from 'node-telegram-bot-api';

const botToken = process.env.TELEGRAM_BOT_TOKEN;

if (!botToken) {
  console.warn('TELEGRAM_BOT_TOKEN not found. Telegram notifications will be disabled.');
}

export const telegramBot = botToken ? new TelegramBot(botToken, { polling: false }) : null;

// Function to send notification to user
export async function sendTelegramNotification(
  chatId: string,
  message: string,
  options?: {
    parse_mode?: 'Markdown' | 'HTML';
    disable_notification?: boolean;
  }
) {
  if (!telegramBot) {
    console.warn('Telegram bot not initialized');
    return;
  }

  try {
    await telegramBot.sendMessage(chatId, message, options);
  } catch (error) {
    console.error('Error sending Telegram notification:', error);
  }
}

// Function to send deal notification
export async function sendDealNotification(
  chatId: string,
  dealTitle: string,
  brandName: string,
  budget: number
) {
  const message = `🎉 New Deal Available!\n\n` +
    `📝 **${dealTitle}**\n` +
    `🏢 Brand: ${brandName}\n` +
    `💰 Budget: $${budget}\n\n` +
    `Check it out in your dashboard!`;

  await sendTelegramNotification(chatId, message, { parse_mode: 'Markdown' });
}

// Function to send application status update
export async function sendApplicationStatusNotification(
  chatId: string,
  dealTitle: string,
  status: string,
  brandName: string
) {
  const statusEmoji = {
    'APPROVED': '✅',
    'REJECTED': '❌',
    'IN_PROGRESS': '🚀',
    'COMPLETED': '🎉'
  }[status] || '📝';

  const message = `${statusEmoji} Application Update\n\n` +
    `📝 Deal: ${dealTitle}\n` +
    `🏢 Brand: ${brandName}\n` +
    `📊 Status: ${status}\n\n` +
    `View details in your dashboard.`;

  await sendTelegramNotification(chatId, message, { parse_mode: 'Markdown' });
}

// Function to send payment notification
export async function sendPaymentNotification(
  chatId: string,
  amount: number,
  type: 'DEPOSIT' | 'WITHDRAWAL',
  status: string
) {
  const typeEmoji = type === 'DEPOSIT' ? '💳' : '💰';
  const statusEmoji = status === 'COMPLETED' ? '✅' : status === 'PENDING' ? '⏳' : '❌';

  const message = `${typeEmoji} Payment ${type}\n\n` +
    `💵 Amount: $${amount}\n` +
    `📊 Status: ${status}\n\n` +
    `${status === 'COMPLETED' ? 'Payment processed successfully!' : 'Processing your payment...'}`;

  await sendTelegramNotification(chatId, message, { parse_mode: 'Markdown' });
}

// Function to send message notification
export async function sendMessageNotification(
  chatId: string,
  senderName: string,
  message: string
) {
  const truncatedMessage = message.length > 100 ? message.substring(0, 100) + '...' : message;

  const notificationMessage = `💬 New Message\n\n` +
    `👤 From: ${senderName}\n` +
    `📝 Message: ${truncatedMessage}\n\n` +
    `Reply in your messages section.`;

  await sendTelegramNotification(chatId, notificationMessage, {
    parse_mode: 'Markdown',
    disable_notification: false
  });
}

// Bot command handlers (for future expansion)
export function setupBotCommands() {
  if (!telegramBot) return;

  // Basic command handling
  telegramBot.onText(/\/start/, (msg) => {
    const chatId = msg.chat.id;
    const welcomeMessage = `👋 Welcome to InfluencerHub Bot!\n\n` +
      `I'll keep you updated on:\n` +
      `• New deals\n` +
      `• Application status changes\n` +
      `• Payment updates\n` +
      `• Messages from brands\n\n` +
      `Use /help for more commands.`;

    telegramBot.sendMessage(chatId, welcomeMessage, { parse_mode: 'Markdown' });
  });

  telegramBot.onText(/\/help/, (msg) => {
    const chatId = msg.chat.id;
    const helpMessage = `🤖 InfluencerHub Bot Commands:\n\n` +
      `/start - Initialize bot\n` +
      `/help - Show this help message\n` +
      `/status - Check your account status\n\n` +
      `You'll receive automatic notifications for:\n` +
      `• New deals matching your profile\n` +
      `• Application updates\n` +
      `• Payment confirmations\n` +
      `• Direct messages`;

    telegramBot.sendMessage(chatId, helpMessage, { parse_mode: 'Markdown' });
  });

  telegramBot.onText(/\/status/, (msg) => {
    const chatId = msg.chat.id;
    // This would need to be connected to user data
    const statusMessage = `📊 Your Status:\n\n` +
      `This feature is coming soon! Check your dashboard for the latest updates.`;

    telegramBot.sendMessage(chatId, statusMessage, { parse_mode: 'Markdown' });
  });
}

// Initialize bot commands
if (telegramBot) {
  setupBotCommands();
  console.log('Telegram bot initialized successfully');
}
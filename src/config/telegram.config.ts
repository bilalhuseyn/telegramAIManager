import dotenv from 'dotenv';

dotenv.config();

export default {
  botToken: process.env.TELEGRAM_BOT_TOKEN || '',
  adminChatId: process.env.TELEGRAM_ADMIN_CHAT_ID || '',
  allowedUserIds: (process.env.ALLOWED_USER_IDS || '').split(',')
}; 
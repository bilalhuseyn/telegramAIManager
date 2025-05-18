import dotenv from 'dotenv';
import { TelegramService } from './services/telegram.service';

// Load environment variables
dotenv.config();

class TelegramAIManager {
  private telegramService: TelegramService;

  constructor() {
    this.telegramService = new TelegramService();
  }

  async start() {
    try {
      console.log('Starting Telegram AI Manager...');
      await this.telegramService.initialize();
      console.log('Telegram AI Manager is now running.');
    } catch (error) {
      console.error('Failed to start Telegram AI Manager:', error);
      process.exit(1);
    }
  }

  async stop() {
    try {
      console.log('Stopping Telegram AI Manager...');
      await this.telegramService.stop();
      console.log('Telegram AI Manager stopped successfully.');
    } catch (error) {
      console.error('Error stopping Telegram AI Manager:', error);
    }
  }
}

const manager = new TelegramAIManager();

// Handle graceful shutdown
process.on('SIGINT', async () => {
  await manager.stop();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  await manager.stop();
  process.exit(0);
});

// Start the manager
manager.start(); 
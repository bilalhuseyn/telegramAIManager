import { TelegramBot } from '../types/telegram-bot.type';
import telegramConfig from '../config/telegram.config';
import { AIService } from './ai.service';
import { ConversationService } from './conversation.service';
import { TelegramMessage } from '../types/telegram.type';
import { readFileSync, writeFileSync, mkdirSync } from 'fs';
import path from 'path';

export class TelegramService {
  private bot: TelegramBot;
  private aiService: AIService;
  private conversationService: ConversationService;

  constructor() {
    this.bot = new TelegramBot(telegramConfig.botToken);
    this.aiService = new AIService();
    this.conversationService = new ConversationService();
  }

  async initialize() {
    try {
      // Ensure data directories exist
      this.ensureDataDirectories();

      // Load historical conversations for training
      const historicalData = this.loadHistoricalConversations();
      await this.conversationService.trainOnHistoricalData(historicalData);

      // Set up message handling
      this.bot.on('message', async (message: TelegramMessage) => {
        // Check if message is from an allowed user
        if (!telegramConfig.allowedUserIds.includes(message.from.id.toString())) {
          return;
        }

        try {
          // Process the message through conversation service
          const response = await this.conversationService.processMessage(message);
          
          // Send response back to Telegram
          await this.bot.sendMessage({
            chat_id: message.chat.id,
            text: response
          });

          // Optionally save conversation for future learning
          this.saveConversation(message, response);
        } catch (error) {
          console.error('Error processing message:', error);
          await this.notifyAdmin(`Critical error: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
      });

      // Start the bot
      await this.bot.start();
      console.log('Telegram Bot initialized successfully');
    } catch (error) {
      console.error('Telegram Service Initialization Error:', error);
      await this.notifyAdmin(`Initialization Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private ensureDataDirectories() {
    const dataDirectories = [
      path.resolve(__dirname, '../data/conversation_logs'),
      path.resolve(__dirname, '../data/historical_conversations')
    ];

    dataDirectories.forEach(dir => {
      try {
        mkdirSync(dir, { recursive: true });
      } catch (error) {
        console.error(`Failed to create directory ${dir}:`, error);
      }
    });
  }

  async notifyAdmin(message: string) {
    try {
      await this.bot.sendMessage({
        chat_id: parseInt(telegramConfig.adminChatId),
        text: `[ADMIN NOTIFICATION] ${message}`
      });
    } catch (error) {
      console.error('Failed to send admin notification:', error);
    }
  }

  private loadHistoricalConversations(): string[][] {
    const conversationPath = path.resolve(__dirname, '../data/historical_conversations.json');
    try {
      const rawData = readFileSync(conversationPath, 'utf-8');
      return JSON.parse(rawData);
    } catch {
      return [];
    }
  }

  private saveConversation(message: TelegramMessage, response: string) {
    const conversationPath = path.resolve(__dirname, '../data/conversation_logs');
    const timestamp = new Date().toISOString();
    
    const conversationEntry = {
      timestamp,
      userId: message.from.id,
      username: message.from.username,
      userMessage: message.text,
      botResponse: response
    };

    try {
      const logFile = path.join(conversationPath, `${timestamp}_conversation.json`);
      writeFileSync(logFile, JSON.stringify(conversationEntry, null, 2), 'utf-8');
    } catch (error) {
      console.error('Failed to save conversation log:', error);
    }
  }

  async stop() {
    await this.bot.stop();
  }
} 
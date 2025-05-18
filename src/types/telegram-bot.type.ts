import { TelegramMessage } from './telegram.type';

export interface TelegramBotOptions {
  token: string;
}

export interface SendMessageOptions {
  chat_id: number;
  text: string;
}

export interface TelegramBotInterface {
  start(): Promise<void>;
  stop(): Promise<void>;
  sendMessage(options: SendMessageOptions): Promise<void>;
  on(event: 'message', callback: (message: TelegramMessage) => void): void;
}

export class TelegramBot implements TelegramBotInterface {
  private token: string;
  private messageCallback?: (message: TelegramMessage) => void;

  constructor(token: string) {
    this.token = token;
  }

  async start(): Promise<void> {
    // Placeholder for bot initialization
    console.log('Telegram Bot starting...');
  }

  async stop(): Promise<void> {
    // Placeholder for bot shutdown
    console.log('Telegram Bot stopping...');
  }

  async sendMessage(options: SendMessageOptions): Promise<void> {
    // Placeholder for sending messages
    console.log(`Sending message to ${options.chat_id}: ${options.text}`);
  }

  on(event: 'message', callback: (message: TelegramMessage) => void): void {
    if (event === 'message') {
      this.messageCallback = callback;
    }
  }
} 
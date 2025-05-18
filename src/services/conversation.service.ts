import { AIService } from './ai.service';
import { ConversationContext } from '../types/conversation.type';

export class ConversationService {
  private aiService: AIService;
  private conversationHistory: Map<string, string[]> = new Map();

  constructor() {
    this.aiService = new AIService();
  }

  async processMessage(message: any): Promise<string> {
    const userId = message.from.id.toString();
    const chatId = message.chat.id.toString();
    const currentMessage = message.text || '';

    // Retrieve or initialize conversation history for this user
    const userHistory = this.conversationHistory.get(userId) || [];

    // Prepare conversation context
    const context: ConversationContext = {
      conversationHistory: userHistory,
      currentMessage,
      userId,
      chatId
    };

    // Generate AI response
    const response = await this.aiService.generateResponse(context);

    // Update conversation history
    userHistory.push(currentMessage);
    userHistory.push(response);

    // Limit conversation history to prevent unbounded growth
    if (userHistory.length > 20) {
      userHistory.splice(0, userHistory.length - 20);
    }

    this.conversationHistory.set(userId, userHistory);

    return response;
  }

  // Method to manually train the bot on historical conversations
  async trainOnHistoricalData(conversations: string[][]) {
    conversations.forEach(conversation => {
      const trainingData = conversation.filter(msg => msg.trim() !== '');
      this.aiService.trainStyleProfile(trainingData);
    });
  }
} 
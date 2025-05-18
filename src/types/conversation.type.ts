export interface ConversationContext {
  conversationHistory: string[];
  currentMessage: string;
  userId?: string;
  chatId?: string;
} 
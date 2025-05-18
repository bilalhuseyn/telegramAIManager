import { GoogleGenerativeAI } from '@google/generative-ai';
import { ConversationContext } from '../types/conversation.type';
import { readFileSync, writeFileSync } from 'fs';
import path from 'path';

export class AIService {
  private genAI: GoogleGenerativeAI;
  private styleProfile: StyleProfile;

  constructor() {
    // Initialize Google Generative AI 
    this.genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');
    
    // Load or initialize style profile
    this.styleProfile = this.loadStyleProfile();
  }

  private loadStyleProfile(): StyleProfile {
    const profilePath = path.resolve(__dirname, '../data/style_profile.json');
    try {
      const profileData = readFileSync(profilePath, 'utf-8');
      return JSON.parse(profileData);
    } catch {
      return {
        communicationStyle: {
          tone: 'Energetic and Casual',
          emojis: ['🎲', '💥', '🧠', '🎰', '💡', '🎉', '💸'],
          keyPhrases: [
            'high rollers', 
            'feeling lucky', 
            'pro tip', 
            'smart betting', 
            'responsible gaming'
          ]
        },
        frequentPhrases: [],
        toneVariations: {
          excited: ['epic', 'mega', 'dropped', 'special'],
          supportive: ['together', 'priority', 'help', 'concern']
        },
        responseTemplates: [
          "Hey {name}! {message} 🎲",
          "Quick update for you: {message} 💥",
          "Pro tip: {message} 🧠"
        ]
      };
    }
  }

  private saveStyleProfile() {
    const profilePath = path.resolve(__dirname, '../data/style_profile.json');
    writeFileSync(profilePath, JSON.stringify(this.styleProfile, null, 2), 'utf-8');
  }

  async generateResponse(context: ConversationContext): Promise<string> {
    const model = this.genAI.getGenerativeModel({ model: 'gemini-pro' });

    // Construct prompt with style learning
    const prompt = this.constructStyleAwarePrompt(context);

    try {
      const result = await model.generateContent(prompt);
      const response = result.response.text();

      // Update style profile based on generated response
      this.updateStyleProfile(response);

      // Apply communication style
      return this.applyCommStyle(response);
    } catch (error) {
      console.error('AI Response Generation Error:', error);
      return 'I apologize, but I encountered an issue generating a response.';
    }
  }

  private applyCommStyle(response: string): string {
    const { emojis, keyPhrases } = this.styleProfile.communicationStyle;
    
    // Add random emoji
    const randomEmoji = emojis[Math.floor(Math.random() * emojis.length)];
    
    // Sprinkle key phrases
    const spicedResponse = keyPhrases.reduce((acc, phrase) => 
      acc.replace(new RegExp(phrase, 'gi'), `*${phrase}*`), 
      response
    );

    return `${spicedResponse} ${randomEmoji}`;
  }

  private constructStyleAwarePrompt(context: ConversationContext): string {
    const styleContext = this.extractStyleContext();
    
    return `
      Context: ${context.conversationHistory.join('\n')}
      Current Message: ${context.currentMessage}
      
      Communication Style Guidelines:
      ${styleContext}
      
      Generate a response that:
      1. Matches the channel's energetic and casual tone
      2. Includes strategic and responsible messaging
      3. Uses emojis and engaging language
      4. Addresses the user's message directly
    `;
  }

  private extractStyleContext(): string {
    const { communicationStyle, frequentPhrases } = this.styleProfile;
    return `
      Preferred Communication Style:
      Tone: ${communicationStyle.tone}
      Key Phrases: ${communicationStyle.keyPhrases.join(', ')}
      Frequent Phrases: ${frequentPhrases.join(', ')}
    `;
  }

  private updateStyleProfile(response: string) {
    // Extract and learn from the generated response
    const words = response.toLowerCase().split(/\s+/);
    
    // Update frequent phrases
    words.forEach(word => {
      if (word.length > 3 && !this.styleProfile.frequentPhrases.includes(word)) {
        this.styleProfile.frequentPhrases.push(word);
      }
    });

    // Limit frequent phrases to prevent unbounded growth
    this.styleProfile.frequentPhrases = this.styleProfile.frequentPhrases.slice(0, 100);

    this.saveStyleProfile();
  }

  // Method to manually train the style profile
  trainStyleProfile(trainingData: string[]) {
    trainingData.forEach(message => {
      // Analyze and incorporate communication style
      const words = message.toLowerCase().split(/\s+/);
      words.forEach(word => {
        if (word.length > 3 && !this.styleProfile.frequentPhrases.includes(word)) {
          this.styleProfile.frequentPhrases.push(word);
        }
      });

      // Detect and update emojis
      const emojiMatches = message.match(/[\u{1F600}-\u{1F6FF}]/gu) || [];
      emojiMatches.forEach(emoji => {
        if (!this.styleProfile.communicationStyle.emojis.includes(emoji)) {
          this.styleProfile.communicationStyle.emojis.push(emoji);
        }
      });
    });

    this.saveStyleProfile();
  }
}

interface StyleProfile {
  communicationStyle: {
    tone: string;
    emojis: string[];
    keyPhrases: string[];
  };
  frequentPhrases: string[];
  toneVariations: Record<string, string[]>;
  responseTemplates: string[];
} 
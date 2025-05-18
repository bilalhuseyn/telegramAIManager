import dotenv from 'dotenv';

dotenv.config();

export interface AIConfig {
  apiKey: string;
  model: string;
  maxTokens: number;
  temperature: number;
  learningDataPath: string;
}

const aiConfig: AIConfig = {
  apiKey: process.env.GEMINI_API_KEY || '',
  model: 'gemini-pro', // Gemini's primary text model
  maxTokens: 1000,
  temperature: 0.7,
  learningDataPath: './resources/conversation-data'
};

export default aiConfig; 
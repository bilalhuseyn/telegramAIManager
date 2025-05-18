import dotenv from 'dotenv';
import { AIService } from '../services/ai.service';
import { readFileSync } from 'fs';
import path from 'path';

// Load environment variables
dotenv.config();

async function trainBot() {
  try {
    const aiService = new AIService();

    // Load historical conversation data
    const trainingDataPath = path.resolve(__dirname, '../data');
    const filePath = path.join(trainingDataPath, 'filtered_tarik_messages.json');
    
    try {
      // Read the entire file content
      const fileContent = readFileSync(filePath, 'utf-8');
      
      // Manual JSON parsing with error recovery
      const extractMessages = (content: string): string[] => {
        const messages: string[] = [];
        
        try {
          // Split content by JSON object boundaries
          const jsonObjects = content.split(/\}\s*\{/).map((obj, index) => {
            // Add back braces if they were stripped
            if (index > 0) obj = '{' + obj;
            if (index < content.split(/\}\s*\{/).length - 1) obj += '}';
            return obj;
          });

          // Parse each JSON object
          jsonObjects.forEach(jsonStr => {
            try {
              const data = JSON.parse(jsonStr);
              
              // Extract text from messages
              if (data.messages && Array.isArray(data.messages)) {
                data.messages.forEach(msg => {
                  if (msg.text) {
                    // Handle both string and array text formats
                    const text = Array.isArray(msg.text) 
                      ? msg.text.map(t => typeof t === 'string' ? t : t.text || '').join(' ') 
                      : msg.text;
                    
                    if (text && text.trim().length > 0) {
                      messages.push(text);
                    }
                  }
                });
              }
            } catch (parseError) {
              console.warn('Error parsing individual JSON object:', parseError);
            }
          });
        } catch (error) {
          console.error('Error extracting messages:', error);
        }
        
        return messages;
      };

      // Extract messages
      const messages = extractMessages(fileContent)
        .filter(text => text && text.trim().length > 0);

      // Train on extracted messages
      if (messages.length > 0) {
        console.log(`Training on ${messages.length} messages...`);
        await aiService.trainStyleProfile(messages);
        console.log('Bot training completed successfully.');
      } else {
        console.warn('No training data found in the JSON file.');
      }
    } catch (error) {
      console.error('Error reading or processing training data:', error);
      // Provide more detailed error information
      if (error instanceof Error) {
        console.error('Error details:', error.message);
      }
    }
  } catch (error) {
    console.error('Fatal error during bot training:', error);
    process.exit(1);
  }
}

// Run the training script
trainBot(); 
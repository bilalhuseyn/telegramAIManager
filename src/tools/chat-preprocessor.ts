import fs from 'fs/promises';
import path from 'path';

interface TelegramMessage {
  from: string;
  text: string;
  date: string;
}

interface TrainingData {
  conversations: {
    userId: string;
    messages: Array<{
      text: string;
      sender: 'user' | 'bot';
      timestamp: number;
    }>;
  }[];
}

export class ChatPreprocessor {
  private inputDir: string;
  private outputDir: string;

  constructor(inputDir: string, outputDir: string) {
    this.inputDir = inputDir;
    this.outputDir = outputDir;
  }

  async preprocessChats(): Promise<void> {
    try {
      // Ensure output directory exists
      await fs.mkdir(this.outputDir, { recursive: true });

      // Read all JSON files in input directory
      const files = await fs.readdir(this.inputDir);
      const jsonFiles = files.filter(file => file.endsWith('.json'));

      for (const file of jsonFiles) {
        const filePath = path.join(this.inputDir, file);
        const fileContent = await fs.readFile(filePath, 'utf-8');
        const messages: TelegramMessage[] = JSON.parse(fileContent);

        const processedData = this.processMessages(messages);
        
        // Write processed data to output file
        const outputFileName = `processed_${file}`;
        const outputPath = path.join(this.outputDir, outputFileName);
        await fs.writeFile(outputPath, JSON.stringify(processedData, null, 2));

        console.log(`Processed ${file} -> ${outputFileName}`);
      }
    } catch (error) {
      console.error('Error preprocessing chat files:', error);
    }
  }

  private processMessages(messages: TelegramMessage[]): TrainingData {
    const conversationMap = new Map<string, TrainingData['conversations'][0]>();

    messages.forEach(message => {
      const userId = this.sanitizeUserId(message.from);
      
      if (!conversationMap.has(userId)) {
        conversationMap.set(userId, {
          userId,
          messages: []
        });
      }

      const conversation = conversationMap.get(userId)!;
      conversation.messages.push({
        text: message.text,
        sender: this.determineSender(message),
        timestamp: new Date(message.date).getTime()
      });
    });

    return {
      conversations: Array.from(conversationMap.values())
    };
  }

  private sanitizeUserId(username: string): string {
    // Remove special characters and convert to lowercase
    return username.toLowerCase().replace(/[^a-z0-9]/g, '_');
  }

  private determineSender(message: TelegramMessage): 'user' | 'bot' {
    // You might need to customize this based on your specific chat export
    // For example, check if the message is from the admin/bot account
    const botUsername = 'YourBotUsername'; // Replace with actual bot username
    return message.from === botUsername ? 'bot' : 'user';
  }
}

// Example usage
async function runPreprocessor() {
  const preprocessor = new ChatPreprocessor(
    './resources/raw-chat-exports', 
    './resources/processed-chat-data'
  );
  await preprocessor.preprocessChats();
}

// Uncomment to run
// runPreprocessor(); 
# Telegram AI Manager for Casino Channel

## Project Overview
An advanced AI-powered Telegram bot designed to automate and enhance communication in a casino channel, with intelligent learning and response generation capabilities.

## Features
- 🤖 AI-driven message processing
- 📚 Conversation style learning
- 🔒 User access control
- 📊 Conversation context tracking
- 🧠 Adaptive response generation

## Prerequisites
- Node.js (v16+ recommended)
- npm or Yarn
- Telegram Bot Token
- Google Gemini API Key

## Installation
1. Clone the repository
```bash
git clone https://github.com/yourusername/telegram-ai-manager.git
cd telegram-ai-manager
```

2. Install dependencies
```bash
npm install
```

3. Configure environment variables
Create a `.env` file with the following:
```
TELEGRAM_BOT_TOKEN=your_telegram_bot_token
TELEGRAM_ADMIN_CHAT_ID=your_admin_chat_id
GEMINI_API_KEY=your_google_gemini_api_key
ALLOWED_USER_IDS=user1_id,user2_id
```

## Running the Bot
- Development Mode: `npm run dev`
- Production Mode: `npm start`
- Train the Bot: `npm run train`

## Configuration
- Modify `src/config/telegram.config.ts` for Telegram settings
- Adjust `src/config/ai.config.ts` for AI behavior
- Add training data in `src/data/training_data/`

## Training the Bot
The bot learns from historical conversations stored in JSON files. Prepare your training data in the `src/data/training_data/` directory.

## Security
- Implements user access control
- Supports admin notifications
- Conversation history management

## Contributing
1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License
ISC License

## Contact
Bilal Hüseynov - [Your Contact Information]

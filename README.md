# NOVA — AI Voice Chat

A modern, portfolio-grade AI voice chat application built with Next.js 14, featuring real-time speech-to-text, AI-powered conversations, and text-to-speech capabilities.

![NOVA AI Chat](https://img.shields.io/badge/Next.js-14.2.5-black?style=for-the-badge&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-blue?style=for-the-badge&logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4.1-38B2AC?style=for-the-badge&logo=tailwind-css)
![Ant Design](https://img.shields.io/badge/Ant%20Design-5.19.0-0170FE?style=for-the-badge&logo=antdesign)

## ✨ Features

- 🎙️ **Voice Input** - Real-time speech-to-text using Groq Whisper (`whisper-large-v3-turbo`)
- 🤖 **AI Chat** - LLaMA 3.3 70B model via Groq API for intelligent conversations
- 🔊 **Voice Output** - ElevenLabs TTS with Web Speech API fallback
- 🌐 **Secure API Calls** - All API requests routed through Next.js API routes
- 🔑 **Local Key Storage** - API keys stored securely in browser localStorage
- 📱 **Responsive Design** - Beautiful dark theme UI that works on all devices
- ⚡ **Real-time Status** - Live indicators for recording, transcribing, thinking, and speaking
- 🎨 **Modern UI** - Built with Ant Design components and custom Tailwind styling

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| **Framework** | Next.js 14 (App Router) |
| **Language** | TypeScript 5+ |
| **Styling** | Tailwind CSS + Ant Design 5 |
| **AI Chat** | Groq API (LLaMA 3.3 70B) |
| **Speech-to-Text** | Groq Whisper |
| **Text-to-Speech** | ElevenLabs / Web Speech API |
| **Icons** | Ant Design Icons |
| **Code Highlighting** | Highlight.js |
| **Markdown** | React Markdown with GitHub Flavored Markdown |

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ 
- npm or yarn package manager

### Installation

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd nova-ai-chat
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   # or
   bun install
   ```

3. **Start development server**
   ```bash
   npm run dev
   # or
   yarn dev
   # or
   bun dev
   ```

4. **Open in browser**
   ```
   http://localhost:3000
   ```

### API Keys Setup

1. Click the ⚙️ settings icon in the top-right corner
2. Add your **Groq API key** (required):
   - Get your key at [console.groq.com/keys](https://console.groq.com/keys)
3. Add your **ElevenLabs API key** (optional for premium TTS):
   - Get your key at [elevenlabs.io](https://elevenlabs.io)

> **Security Note**: API keys are stored only in your browser's localStorage and are never sent anywhere except to their respective APIs through secure server-side routes.

## 📁 Project Structure

```
nova-ai-chat/
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── chat/route.ts       # Groq LLM API endpoint
│   │   │   ├── stt/route.ts        # Groq Whisper STT endpoint
│   │   │   └── tts/route.ts        # ElevenLabs TTS endpoint
│   │   ├── globals.css             # Global styles and Tailwind imports
│   │   ├── layout.tsx              # Root layout with fonts
│   │   └── page.tsx                # Main chat interface
│   ├── components/
│   │   ├── MessageBubble.tsx       # Chat message display
│   │   ├── TypingIndicator.tsx     # "AI is thinking" indicator
│   │   ├── VoiceVisualizer.tsx     # Audio recording visualization
│   │   ├── WelcomeScreen.tsx       # Initial welcome UI
│   │   └── InputArea.tsx           # Chat input with mic button
│   ├── hooks/
│   │   ├── useChat.ts              # Chat state management + API calls
│   │   ├── useSTT.ts               # Speech recording + transcription
│   │   └── useTTS.ts               # Text-to-speech functionality
│   └── types/
│       └── index.ts                # TypeScript type definitions
├── public/                         # Static assets
├── .gitignore                      # Git ignore rules
├── next.config.js                  # Next.js configuration
├── tailwind.config.ts              # Tailwind CSS configuration
├── tsconfig.json                   # TypeScript configuration
└── package.json                    # Dependencies and scripts
```

## 🔧 Development Scripts

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm run start

# Run ESLint
npm run lint
```

## 🌐 Deployment

### Vercel (Recommended)

Deploy to Vercel with a single command:

```bash
npx vercel
```

Or connect your GitHub repository to Vercel for automatic deployments.

**Environment Variables for Vercel:**
- `NEXT_PUBLIC_GROQ_API_KEY` (optional - users can add in UI)
- `NEXT_PUBLIC_ELEVENLABS_API_KEY` (optional - users can add in UI)

### Other Platforms

This app can be deployed to any platform that supports Next.js:
- Netlify
- Railway
- Digital Ocean App Platform
- AWS Amplify

## 🎯 How It Works

1. **Voice Input**: User clicks microphone → browser records audio → sends to Groq Whisper API
2. **AI Processing**: Transcribed text sent to LLaMA 3.3 via Groq API
3. **Voice Output**: AI response sent to ElevenLabs TTS → audio played back to user
4. **Fallback**: If no ElevenLabs key, uses browser's built-in Web Speech API

## 🔒 Security Features

- **Server-side API calls** - All external API requests go through Next.js API routes
- **No key exposure** - API keys never exposed in client-side code
- **Local storage only** - Keys stored securely in browser localStorage
- **CORS handled** - No CORS issues with proper API routing

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Groq](https://groq.com/) for fast AI inference
- [ElevenLabs](https://elevenlabs.io/) for premium text-to-speech
- [Next.js](https://nextjs.org/) for the React framework
- [Ant Design](https://ant.design/) for beautiful UI components
- [Tailwind CSS](https://tailwindcss.com/) for utility-first styling

## 📞 Support

If you encounter any issues or have questions, please:
- Open an issue on GitHub
- Check the [FAQ](#faq) section below

## FAQ

**Q: Do I need to provide API keys to use the app?**
A: Yes, you need a Groq API key for chat functionality. ElevenLabs is optional - the app will use browser TTS if not provided.

**Q: Is my data secure?**
A: Yes. API keys are stored only in your browser and never sent to any third party except the intended AI services.

**Q: Can I use this commercially?**
A: Yes, this project is MIT licensed. However, you'll need your own API keys from Groq and ElevenLabs.

**Q: Why use server-side API routes?**
A: To avoid CORS issues and keep API keys secure. All external API calls go through your Next.js server.

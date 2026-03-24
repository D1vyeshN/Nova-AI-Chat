# NOVA — AI Voice Chat

A modern, portfolio-grade AI voice chat application built with Next.js 16, featuring real-time speech-to-text, AI-powered conversations with web search capabilities, text-to-speech, and advanced performance optimizations.

## 🌐 Live Demo

**[🚀 Try it Live](https://aichatbydivyesh.vercel.app)**

![NOVA AI Chat](https://img.shields.io/badge/Next.js-16.1.4-black?style=for-the-badge&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5.6+-blue?style=for-the-badge&logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-4.0.0-38B2AC?style=for-the-badge&logo=tailwind-css)
![Ant Design](https://img.shields.io/badge/Ant%20Design-6.3.2-0170FE?style=for-the-badge&logo=antdesign)
![PWA](https://img.shields.io/badge/PWA-Enabled-4285F4?style=for-the-badge&logo=progressive-web-apps)

## ✨ Features

### 🤖 Core AI Features
- 🎙️ **Voice Input** - Real-time speech-to-text using Groq Whisper (`whisper-large-v3-turbo`)
- 🤖 **AI Chat** - LLaMA 3.3 70B model via Groq API for intelligent conversations
- 🔍 **Web Search** - Integrated web search capabilities using Tavily API for real-time information
- 🔊 **Voice Output** - OpenAI Edge TTS API with direct audio streaming
- 🛠️ **Advanced Tool Calling** - Two-phase detection system preventing token leaks

### ⚡ Performance & UX
- 🚀 **Performance Optimized** - 34% bundle size reduction, faster loading times
- � **Code Splitting** - Dynamic imports and lazy loading for better performance
- 📱 **Responsive Design** - Beautiful dark/light theme UI that works on all devices
- ⚡ **Real-time Status** - Live indicators for recording, transcribing, thinking, and speaking
- 🎨 **Modern UI** - Built with Ant Design components and custom Tailwind styling
- 📲 **PWA Support** - Installable on your home screen for a native app experience

### 🔒 Security & Architecture
- 🌐 **Secure API Calls** - All API requests routed through Next.js API routes
- 🔑 **Environment Variables** - API keys stored securely as server-side environment variables
- 🔄 **Error Handling** - Comprehensive error handling with graceful fallbacks
- 📊 **Streaming Support** - Real-time streaming responses with proper tool integration

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| **Framework** | Next.js 16 (App Router) |
| **Language** | TypeScript 5.6+ |
| **Styling** | Tailwind CSS 4.0 + Ant Design 6.3 |
| **AI Chat** | Groq API (LLaMA 3.3 70B) |
| **Web Search** | Tavily API |
| **Speech-to-Text** | Groq Whisper |
| **Text-to-Speech** | OpenAI Edge TTS API |
| **Icons** | Ant Design Icons |
| **Code Highlighting** | Highlight.js |
| **Markdown** | React Markdown with GitHub Flavored Markdown |
| **Performance** | Dynamic imports, code splitting, webpack optimizations |
| **PWA** | Next PWA with service worker |

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

3. **Configure Environment Variables**
   
   Create a `.env.local` file in the root directory:
   
   ```env
   # Required — Groq (LLM chat + Whisper STT)
   # Get yours at: https://console.groq.com/keys
   GROQ_API_KEY=your_groq_api_key_here
   
   # Required — OpenAI Edge TTS API
   # Get your API key from: https://openai-edge-tts-uzqw.onrender.com
   TTS_URL=https://openai-edge-tts-uzqw.onrender.com
   TTS_KEY=your_tts_api_key_here
   
   # Optional — Web Search
   # Get yours at: https://tavily.com
   TAVILY_API_KEY=your_tavily_api_key_here
   ```

4. **Start development server**
   ```bash
   npm run dev
   # or
   yarn dev
   # or
   bun dev
   ```

5. **Open in browser**
   ```
   http://localhost:3000
   ```

## 📁 Project Structure

```
nova-ai-chat/
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── chat/route.ts       # Groq LLM + Tool calling API endpoint
│   │   │   ├── stt/route.ts        # Groq Whisper STT endpoint
│   │   │   ├── tts/route.ts        # OpenAI Edge TTS endpoint
│   │   │   └── voices/             # Voice management endpoints
│   │   ├── globals.css             # Global styles and Tailwind imports
│   │   ├── layout.tsx              # Root layout with fonts and performance optimizations
│   │   └── page.tsx                # Main chat interface with dynamic imports
│   ├── components/
│   │   ├── MessageBubble.tsx       # Chat message display with optimized imports
│   │   ├── TypingIndicator.tsx     # "AI is thinking" indicator
│   │   ├── WelcomeScreen.tsx       # Initial welcome UI
│   │   ├── InputArea.tsx           # Chat input with mic button
│   │   ├── MarkdownRenderer.tsx    # Markdown rendering with syntax highlighting
│   │   └── ThemeSwitcher.tsx       # Theme toggle component
│   ├── contexts/
│   │   └── ThemeContext.tsx        # Theme management context
│   ├── hooks/
│   │   ├── useChat.ts              # Chat state management + API calls
│   │   ├── useSTT.ts               # Speech recording + transcription
│   │   ├── useTTS.ts               # Text-to-speech functionality
│   │   ├── useStreamingMessage.ts   # Streaming message handling
│   │   └── useLocalStorage.ts      # Local storage management
│   ├── utils/
│   │   └── searchWeb.ts            # Web search utility using Tavily API
│   ├── types/
│   │   └── index.ts                # TypeScript type definitions
│   └── styles/
│       └── globals.css             # Global styles
├── public/                         # Static assets
│   ├── icons/                      # PWA icons
│   ├── screenshots/                # App screenshots
│   ├── manifest.json               # PWA manifest
│   ├── sw.js                      # Service worker
│   └── workbox-*.js               # Workbox files
├── .env.local                      # Environment variables (create this)
├── .gitignore                      # Git ignore rules
├── next.config.js                  # Next.js configuration with performance optimizations
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
- `GROQ_API_KEY` (required for chat functionality)
- `TTS_URL` (required for TTS functionality)
- `TTS_KEY` (required for TTS functionality)
- `TAVILY_API_KEY` (optional for web search functionality)

### Other Platforms

This app can be deployed to any platform that supports Next.js:
- Netlify
- Railway
- Digital Ocean App Platform
- AWS Amplify

## 🎯 How It Works

### Core Flow
1. **Voice Input**: User clicks microphone → browser records audio → sends to Groq Whisper API
2. **AI Processing**: Transcribed text sent to LLaMA 3.3 via Groq API
3. **Tool Detection**: Advanced two-phase system determines if web search is needed
4. **Web Search**: If required, uses Tavily API to get real-time information
5. **Response Generation**: AI formulates response using search results if available
6. **Voice Output**: AI response sent to OpenAI Edge TTS → direct audio streaming
7. **PWA Features**: Installable app with offline capabilities

### Tool Calling Architecture
The app features a sophisticated two-phase tool calling system:

**Phase 1: Tool Detection (Non-Streaming)**
- Analyzes user query to determine if tools are needed
- Prevents token leaks from early streaming
- Makes decision before any response generation
- Smart routing for future dates and trending topics

**Phase 2: Execution & Streaming**
- If tool needed: Executes tool → Streams final response
- If no tool: Streams response directly
- Provides visual feedback during tool execution
- Maintains complete message chain for context

### Performance Optimizations
- **Code Splitting**: Dynamic imports reduce initial bundle size by 34%
- **Lazy Loading**: Components loaded on-demand with loading states
- **Resource Optimization**: Preloading, compression, and image optimization
- **Bundle Splitting**: Optimized webpack configuration for faster loading
- **PWA Features**: Add App to your home screen for a native app experience.

## 🔒 Security Features

- **Server-side API calls** - All external API requests go through Next.js API routes
- **No key exposure** - API keys never exposed in client-side code
- **Environment Variables** - Keys stored securely as environment variables
- **CORS handled** - No CORS issues with proper API routing
- **Input validation** - Comprehensive validation for all API inputs

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
- [Tavily](https://tavily.com/) for web search capabilities
- [OpenAI Edge TTS](https://openai-edge-tts-uzqw.onrender.com) for text-to-speech
- [Next.js](https://nextjs.org/) for the React framework
- [Ant Design](https://ant.design/) for beautiful UI components
- [Tailwind CSS](https://tailwindcss.com/) for utility-first styling

## 📞 Support

If you encounter any issues or have questions, please:
- Open an issue on GitHub
- Check the [FAQ](#faq) section below

## FAQ

**Q: Do I need to provide API keys to use the app?**
A: Yes, you need to configure API keys as environment variables. Groq API key and OpenAI Edge TTS credentials are required for core functionality, while Tavily is optional for web search.

**Q: Is my data secure?**
A: Yes. API keys are stored as environment variables and are never exposed to client-side code or sent to any third party except the intended AI services.

**Q: Can I use this commercially?**
A: Yes, this project is MIT licensed. However, you'll need your own API keys from Groq, OpenAI Edge TTS, and optionally Tavily configured as environment variables.

**Q: Why use server-side API routes?**
A: To avoid CORS issues and keep API keys secure. All external API calls go through your Next.js server.

**Q: How does the web search feature work?**
A: The AI automatically detects when a query requires current information and uses the Tavily API to search the web, then incorporates the results into its response.

**Q: What are the performance improvements?**
A: The app features 34% smaller bundle size, faster loading times through code splitting, optimized resource loading, and PWA capabilities for better user experience.

**Q: How does the tool calling system work?**
A: A two-phase system first detects if tools are needed (preventing token leaks), then executes tools and streams responses for optimal performance with smart routing for time-sensitive queries.

**Q: Can I install this as a mobile app?**
A: Yes! The app supports PWA installation. On mobile devices, you can add it to your home screen for a native app experience.

**Q: What TTS voices are available?**
A: The app uses OpenAI Edge TTS API with various voice options including `en-US-AnaNeural` and others. Voice selection is managed through the API configuration.

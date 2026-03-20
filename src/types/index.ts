export type MessageRole = "user" | "assistant";

export interface Message {
  id: string;
  role: MessageRole;
  content: string;
  timestamp: Date;
  isPlaying?: boolean;
}

export interface ApiKeys {
  groq: string;
  elevenlabs?: string; // Optional - Premium TTS voice
}

export type AppStatus =
  | "idle"
  | "thinking"
  | "recording"
  | "transcribing"
  | "speaking"
  | "error";

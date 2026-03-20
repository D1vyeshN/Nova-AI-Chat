export type MessageRole = "user" | "assistant";

export interface Message {
  id: string;
  role: MessageRole;
  content: string;
  timestamp: Date;
  isPlaying?: boolean;
  isEditing?: boolean;
}

export interface Voice {
  name: string;
  language: string;
  gender: "Male" | "Female";
}

export interface ApiKeys {
  groq: string;
  elevenlabs?: string; // Optional - Premium TTS voice
  selectedVoice?: Voice; // Selected TTS voice
}

export type AppStatus =
  | "idle"
  | "thinking"
  | "recording"
  | "transcribing"
  | "speaking"
  | "error";

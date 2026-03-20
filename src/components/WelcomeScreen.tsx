"use client";

import { Tag } from "antd";

interface Props {
  onChipClick: (text: string) => void;
}

const CHIPS = [
  { emoji: "✨", text: "Tell me something interesting" },
  { emoji: "🤖", text: "What can you do?" },
  { emoji: "😄", text: "Tell me a short joke" },
  { emoji: "🌍", text: "Explain quantum physics simply" },
];

export function WelcomeScreen({ onChipClick }: Props) {
  return (
    <div className="flex flex-col items-center justify-center flex-1 text-center gap-5 px-6 py-12">
      {/* Orb */}
      <div
        className="w-20 h-20 rounded-full flex items-center justify-center text-3xl relative"
        style={{
          background: "radial-gradient(circle at 35% 35%, rgba(0,229,255,0.3), rgba(124,58,237,0.2), transparent 70%)",
          border: "1px solid rgba(0,229,255,0.2)",
          boxShadow: "0 0 40px rgba(0,229,255,0.1), inset 0 0 20px rgba(0,229,255,0.05)",
          animation: "float 3s ease-in-out infinite",
        }}
      >
        🎙️
        <div
          className="absolute inset-0 rounded-full"
          style={{
            border: "1px solid rgba(0,229,255,0.08)",
            animation: "float 3s ease-in-out infinite reverse",
            transform: "scale(1.15)",
          }}
        />
      </div>

      <div>
        <h2 className="font-display text-2xl font-bold text-nova-text mb-2">
          Hello, I&apos;m NOVA
        </h2>
        <p className="font-mono text-xs text-nova-muted max-w-xs leading-relaxed">
          Your AI voice assistant. Type or use the mic to speak.
        </p>
      </div>

      <div className="flex flex-wrap gap-2 justify-center">
        {CHIPS.map(({ emoji, text }) => (
          <button
            key={text}
            onClick={() => onChipClick(text)}
            className="font-mono text-xs px-3 py-1.5 rounded-full border border-nova-border bg-nova-surface2 text-nova-dim 
              hover:border-nova-accent hover:text-nova-accent hover:bg-[rgba(0,229,255,0.05)] transition-all duration-200"
          >
            {emoji} {text}
          </button>
        ))}
      </div>

    </div>
  );
}

"use client";

import { useState, useEffect, useRef } from "react";
import { Tooltip } from "antd";
import {
  AudioOutlined,
  StopOutlined,
  ArrowUpOutlined,
} from "@ant-design/icons";
import clsx from "clsx";

interface InputAreaProps {
  inputText: string;
  setInputText: (text: string) => void;
  onSend: () => void;
  onMic: () => void;
  onStop: () => void;
  isRecording: boolean;
  isTranscribing: boolean;
  isStreaming: boolean;
  isBusy: boolean;
}

export function InputArea({
  inputText,
  setInputText,
  onSend,
  onMic,
  onStop,
  isRecording,
  isTranscribing,
  isStreaming,
  isBusy,
}: InputAreaProps) {
  const hasText = inputText.trim().length > 0;
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // ── recording timer ──────────────────────────────────────────────────────────
  const [recSeconds, setRecSeconds] = useState(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (isRecording) {
      setRecSeconds(0);
      timerRef.current = setInterval(() => setRecSeconds((s) => s + 1), 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
      setRecSeconds(0);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isRecording]);

  const formatTime = (s: number) =>
    `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;

  // ── auto-resize textarea ─────────────────────────────────────────────────────
  useEffect(() => {
    const ta = textareaRef.current;
    if (!ta) return;
    ta.style.height = "auto";
    ta.style.height = `${Math.min(ta.scrollHeight, 160)}px`;
  }, [inputText]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (hasText && !isBusy) onSend();
    }
  };

  // ── right button — one slot, three states ────────────────────────────────────
  const RightButton = () => {
    if (isStreaming) {
      return (
        <Tooltip title="Stop generation" placement="top">
          <button
            onClick={onStop}
            className="flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center transition-all"
            style={{
              background: "rgba(239,68,68,0.15)",
              border: "1px solid #ef4444",
              transition: "background-color 0.3s ease, border-color 0.3s ease, box-shadow 0.3s ease",
            }}
          >
            {/* stop square */}
            <svg width="14" height="14" viewBox="0 0 24 24" fill="#ef4444">
              <rect x="4" y="4" width="18" height="18" rx="2" />
            </svg>
          </button>
        </Tooltip>
      );
    }

    if (hasText) {
      return (
        <Tooltip title="Send (Enter)" placement="top">
          <button
            onClick={onSend}
            disabled={isBusy}
            className="flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center transition-all disabled:opacity-40"
            style={{
              background: "linear-gradient(135deg, var(--nova-accent), #00b4d8)",
              border: "none",
              boxShadow: "0 0 16px rgba(0,229,255,0.25)",
            }}
          >
            {/* up arrow */}
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="var(--nova-bg)"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="12" y1="19" x2="12" y2="5" />
              <polyline points="5 12 12 5 19 12" />
            </svg>
          </button>
        </Tooltip>
      );
    }

    return (
      <Tooltip
        title={isRecording ? "Stop recording" : "Use Voice"}
        placement="top"
      >
        <button
          onClick={onMic}
          disabled={isBusy && !isRecording}
          className={clsx(
            "flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center transition-all",
            isRecording && "animate-pulse",
          )}
          style={{
            background: isRecording
              ? "rgba(239,68,68,0.15)"
              : "var(--nova-surface)",
            border: `1px solid ${isRecording ? "#ef4444" : "var(--nova-border)"}`,
            boxShadow: isRecording ? "0 0 12px rgba(239,68,68,0.3)" : "none",
            transition: "background-color 0.3s ease, border-color 0.3s ease, box-shadow 0.3s ease",
          }}
        >
          {isRecording ? (
            // stop square while recording
            <svg width="13" height="13" viewBox="0 0 24 24" fill="#ef4444">
              <rect x="4" y="4" width="16" height="16" rx="2" />
            </svg>
          ) : (
            // mic icon
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="var(--nova-dim)"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
              <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
              <line x1="12" y1="19" x2="12" y2="23" />
              <line x1="8" y1="23" x2="16" y2="23" />
            </svg>
          )}
        </button>
      </Tooltip>
    );
  };

  return (
    <div
      className="pt-0 px-4 pb-2 md:px-8 bg-transparent"
      // style={{ background: "rgba(8,11,15,0.95)", backdropFilter: "blur(20px)" }}
    >
      {/* ── input area — switches between textarea and waveform ── */}
      <div
        className={clsx(
          "flex items-end gap-2 p-2 w-full rounded-xl border overflow-hidden relative min-h-fit max-h-full",
          "border-nova-border focus-within:border-nova-accent/40 shadow-lg",
        )}
        style={{
          background: "var(--nova-surface)",
          transition: "background-color 0.3s ease, border-color 0.3s ease, box-shadow 0.3s ease",
          // boxShadow: "0px 2px 6px var(--nova-border)",
        }}
      >
        <div className={clsx(
          "flex items-center w-full overflow-hidden relative min-h-fit max-h-full",
        )}
        style={{
          background: "var(--nova-surface)",
          transition: "background-color 0.3s ease",
          // boxShadow: "0px 2px 6px var(--nova-border)",
        }}>
        {isRecording ? (
          /* ── waveform replaces the input while recording ── */
          <div className="flex items-center gap-3 px-4 py-3 h-14">
            <Waveform />
            <span className="text-[13px] font-mono">Listening...</span>
            <span className="text-[12px] text-nova-muted font-mono ml-auto">
              {formatTime(recSeconds)}
            </span>
          </div>
        ) : isTranscribing ? (
          /* ── transcribing state ── */
          <div className="flex items-center gap-3 px-4 py-3 h-14">
            <span className="text-[13px] font-mono animate-pulse">
              Transcribing...
            </span>
          </div>
        ) : (
          /* ── normal textarea ── */
          <textarea
            ref={textareaRef}
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type a message or press the mic..."
            disabled={isBusy}
            rows={1}
            className="w-full h-full border-none bg-transparent outline-none resize-none disabled:opacity-50 p-2 placeholder:text-nova-muted"
            style={{
              color: "var(--nova-text)",
              fontFamily: "'Syne', sans-serif",
              fontSize: 14,
              // padding: "17px 14px",
              lineHeight: "1.5",
              minHeight: "40px",
              maxHeight: "260px",
              transition: "color 0.3s ease",
              // height: "260px",
            }}
          />
        )}
        </div>
        <div className="flex items-center bottom-2">
          {/* ── right button slot ── */}
          <RightButton />
        </div>
      </div>
      <p className="text-center text-[10px] leading-[14px] md:text-xs text-nova-muted mt-2">
        Press Enter to send, Shift+Enter for new line, Ai can make mistakes.
      </p>
    </div>
  );
}

// ── Waveform bars ─────────────────────────────────────────────────────────────
function Waveform() {
  return (
    <div className="flex items-center gap-[3px]">
      {[8, 16, 22, 14, 20, 10, 18].map((h, i) => (
        <span
          key={i}
          className="block w-[3px] rounded-sm bg-nova-accent"
          style={{
            height: `${h}px`,
            animation: `waveBar 1s ease-in-out infinite`,
            animationDelay: `${i * 0.1}s`,
          }}
        />
      ))}
      <style>{`
        @keyframes waveBar {
          0%, 100% { transform: scaleY(0.4); opacity: 0.5; }
          50%       { transform: scaleY(1);   opacity: 1;   }
        }
      `}</style>
    </div>
  );
}

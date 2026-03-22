"use client";

import { Button, Tag, Tooltip } from "antd";
import {
  SoundOutlined,
  PauseOutlined,
  RobotOutlined,
  UserOutlined,
  CheckOutlined,
  CopyOutlined,
  LoadingOutlined,
  EditOutlined,
  CloseOutlined,
} from "@ant-design/icons";
import { Message } from "@/types";
import { useEffect, useRef, useState } from "react";
import clsx from "clsx";
import { MarkdownRenderer } from "./MarkdownRenderer";
import { Input } from "antd";

// Language code to name mapping
const LANGUAGE_NAMES: Record<string, string> = {
  en: "English",
  // Indian Languages (priority order)
  hi: "Hindi",
  bn: "Bengali",
  ta: "Tamil",
  te: "Telugu",
  mr: "Marathi",
  gu: "Gujarati",
  pa: "Punjabi",
  kn: "Kannada",
  ml: "Malayalam",
  or: "Odia",
  as: "Assamese",
  // European Languages
  es: "Spanish",
  fr: "French",
  de: "German",
  it: "Italian",
  pt: "Portuguese",
  ru: "Russian",
  nl: "Dutch",
  sv: "Swedish",
  da: "Danish",
  no: "Norwegian",
  pl: "Polish",
  // Asian Languages
  zh: "Chinese",
  ja: "Japanese",
  ko: "Korean",
  ar: "Arabic",
  th: "Thai",
  vi: "Vietnamese",
  // Other
  el: "Greek",
  he: "Hebrew",
  tr: "Turkish",
  fa: "Persian",
  ur: "Urdu",
};

function getLanguageName(langCode: string): string {
  return LANGUAGE_NAMES[langCode] || langCode;
}

export interface Props {
  message: Message;
  isPlaying: boolean;
  isLoading: boolean;
  isStreaming: boolean;
  onSpeak: (text: string, id: string) => void;
  onStop: () => void;
  streamingDomRef: React.MutableRefObject<HTMLSpanElement | null>;
  onEditMessage?: (messageId: string, isEditing: boolean) => void;
  onUpdateMessage?: (messageId: string, newContent: string) => void;
  onRegenerateResponse?: (messageId: string) => Promise<Message | null>;
}

export function MessageBubble({
  message,
  isPlaying,
  isLoading,
  isStreaming: messageStreaming,
  onSpeak,
  onStop,
  streamingDomRef,
  onEditMessage,
  onUpdateMessage,
  onRegenerateResponse,
}: Props) {
  const spanRef = useRef<HTMLSpanElement>(null);

  const isAI = message.role === "assistant";
  const isError = message.content.startsWith("⚠️");

  const [copied, setCopied] = useState(false);
  const [editText, setEditText] = useState(message.content);
  const textAreaRef = useRef<any>(null);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(message.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const el = e.target;
    el.style.height = "auto";
    el.style.height = el.scrollHeight + "px";
    el.style.width = "100%";
    setEditText(el.value);
  };
  const handleEdit = () => {
    setEditText(message.content);
    onEditMessage?.(message.id, true);
    setTimeout(() => textAreaRef.current?.focus(), 0);
  };

  const handleSaveEdit = async () => {
    if (editText.trim() && editText !== message.content) {
      // Then update the message content
      onUpdateMessage?.(message.id, editText.trim());
      // First trigger regeneration of AI response for user messages
      if (message.role === "user" && onRegenerateResponse) {
        await onRegenerateResponse(message.id);
      }
    }
    onEditMessage?.(message.id, false);
  };

  const handleCancelEdit = () => {
    setEditText(message.content);
    onEditMessage?.(message.id, false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSaveEdit();
    } else if (e.key === "Escape") {
      handleCancelEdit();
    }
  };

  // Sync streaming content when message content changes
  useEffect(() => {
    if (messageStreaming && spanRef.current) {
      // ✅ Register this span as the direct write target
      streamingDomRef.current = spanRef.current;
      // Seed it with whatever content exists already
      try {
        if (spanRef.current) {
          spanRef.current.textContent = message.content;
        }
      } catch (error) {
        console.warn('Error setting text content:', error);
      }
    }
    return () => {
      // ✅ Unregister when this bubble is no longer streaming
      try {
        if (streamingDomRef.current === spanRef.current) {
          streamingDomRef.current = null;
        }
      } catch (error) {
        console.warn('Error cleaning up streaming ref:', error);
      }
    };
  }, [messageStreaming, message.content]); // Remove streamingDomRef from dependencies

  const displayContent = isAI && !isError ? "" : message.content;

  const time = message.timestamp.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });

  useEffect(() => {
    if (message.isEditing && textAreaRef.current) {
      const el = textAreaRef.current;
      el.style.height = "auto";
      el.style.width = "100%";
      el.style.height = el.scrollHeight + "px";
    }
  }, [message.isEditing]);

  return (
    <div
      className={clsx(
        "flex gap-3 group",
        isAI ? "justify-start mt-6" : "justify-end w-full",
      )}
    >
      {/* Avatar */}
      {/* {isAI && (
        <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 mt-1 border border-nova-border"
          style={{ background: "linear-gradient(135deg, rgba(0,229,255,0.15), rgba(124,58,237,0.15))" }}>
          <RobotOutlined style={{ color: "#00e5ff", fontSize: 14 }} />
        </div>
      )} */}

      <div
        className={clsx("flex flex-col gap-1 ", !isAI && "items-end w-full")}
      >
        {/* Meta */}
        {/* <div className={clsx("flex items-center gap-2 font-mono text-[10px] text-nova-muted",
          !isAI && "flex-row-reverse")}>
          <span>{!isAI && "You"}</span>
          <span>{!isAI && time}</span>
        </div> */}

        {/* Bubble */}
        <div
          className={clsx(
            "rounded-xl text-sm leading-relaxed",
            isAI ? "bg-transparent border-0 pt-0" : "rounded-tr-sm w-full",
            isError && "border-red-500/30 bg-red-500/5",
          )}
        >
          <div className="flex w-full justify-end">
            <div
              className={clsx(
                "flex items-center py-2 rounded-xl text-sm leading-relaxed text-justify",
                isAI
                  ? "bg-transparent border-0 pt-0 px-0 md:pl-2"
                  : message.isEditing ? "border rounded-br-sm md:mr-2 px-4 w-full max-w-[75%]" : "border rounded-br-sm md:mr-2 px-4 w-fit max-w-[75%]",
                isError && "border-red-500/30 bg-red-500/5",
              )}
              style={
                !isAI
                  ? {
                      background: "var(--nova-surface2)",
                      borderColor: "var(--nova-accent)",
                      transition:
                        "background-color 0.3s ease, border-color 0.3s ease",
                    }
                  : {
                      transition:
                        "background-color 0.3s ease, border-color 0.3s ease",
                    }
              }
            >
              {/* <p className="text-nova-text whitespace-pre-wrap">{displayContent}</p> */}
              {/* ✅ span is the direct DOM write target during stream */}
              {message.isEditing ? (
                <textarea
                  ref={textAreaRef}
                  value={editText}
                  onChange={handleInput}
                  onKeyDown={handleKeyDown}
                  placeholder="Edit your message..."
                  className="w-full h-full bg-transparent border-none outline-none disabled:opacity-50"
                  style={{
                    color: "var(--nova-text)",
                    fontFamily: "'Syne', sans-serif",
                    fontSize: 14,
                    transition: "color 0.3s ease",
                    minHeight: "40px",
                    maxHeight: "260px",
                  }}
                />
              ) : messageStreaming ? (
                // During stream: still write directly to DOM for perf,
                // but wrap in markdown on final commit
                <span
                  ref={spanRef}
                  style={{
                    whiteSpace: "pre-wrap",
                    color: "var(--nova-text)",
                    transition: "color 0.3s ease",
                  }}
                />
              ) : isAI ? (
                <MarkdownRenderer content={message.content} />
              ) : (
                <span
                  style={{
                    whiteSpace: "pre-wrap",
                    color: "var(--nova-text)",
                    transition: "color 0.3s ease",
                  }}
                >
                  {message.content}
                </span>
              )}

              {messageStreaming && <span className="streaming-cursor" />}
            </div>
          </div>

          {/* Action buttons */}
          <div
            className={`flex ${isAI ? "ml-2" : "justify-end mr-2"} gap-2 mt-2`}
          >
            {message.isEditing ? (
              <div className="flex gap-2">
                <Button
                  size="small"
                  type="text"
                  onClick={handleCancelEdit}
                  aria-label="Cancel editing"
                  className="font-mono component-label h-6 flex items-center gap-1 transition-all !border-nova-muted"
                >
                  Cancel
                </Button>
                <Button
                  size="small"
                  type="text"
                  onClick={handleSaveEdit}
                  aria-label="Save edited message"
                  className="font-mono component-label h-6 flex items-center gap-1 transition-all !border-nova-muted !bg-nova-border"
                >
                  Save
                </Button>
              </div>
            ) : (
              !messageStreaming && (
                <>
                  {isAI && !isError && (
                    <Tooltip
                      title={isPlaying ? "Stop speaking" : "Play voice"}
                      placement="bottom"
                    >
                      <Button
                        size="small"
                        onClick={() =>
                          isPlaying
                            ? onStop()
                            : onSpeak(message.content, message.id)
                        }
                        aria-label={isPlaying ? "Stop speaking" : "Play voice"}
                        className={clsx(
                          "flex items-center justify-center font-mono component-label h-6 w-6 gap-1 transition-all",
                          isLoading
                            ? "!text-purple-400 !border-purple-500/30 !bg-purple-500/10"
                            : isPlaying
                              ? "!text-purple-400 !border-purple-500/30 !bg-purple-500/10"
                              : "text-nova-muted !border-nova-muted hover:!text-cyan-400 hover:!border-cyan-500/30 hover:!bg-cyan-500/10",
                        )}
                      >
                        {isLoading ? (
                          <LoadingOutlined spin />
                        ) : isPlaying ? (
                          <PauseOutlined />
                        ) : (
                          <SoundOutlined />
                        )}
                      </Button>
                    </Tooltip>
                  )}
                  {!isAI && (
                    <Tooltip title="Edit message" placement="bottom">
                      <Button
                        size="small"
                        icon={<EditOutlined />}
                        onClick={handleEdit}
                        aria-label="Edit message"
                        className="size-1 flex items-center transition-all text-nova-muted !border-nova-muted hover:!text-cyan-400 hover:!border-cyan-500/30 hover:!bg-cyan-500/10"
                        // style={{ borderColor: "transparent" }}
                      />
                    </Tooltip>
                  )}
                  <Tooltip
                    title={copied ? "✓ Copied" : "Copy"}
                    placement="bottom"
                  >
                    <Button
                      size="small"
                      onClick={handleCopy}
                      aria-label={copied ? "Text copied" : "Copy message"}
                      className={clsx(
                        "flex items-center justify-center font-mono component-label h-6 w-6 gap-1 transition-all",
                        "text-nova-muted !border-nova-muted hover:!text-purple-400 hover:!border-purple-500/30 hover:!bg-purple-500/10",
                      )}
                    >
                      {copied ? <CheckOutlined /> : <CopyOutlined />}
                    </Button>
                  </Tooltip>
                </>
              )
            )}
          </div>
        </div>
      </div>

      {/* User avatar */}
      {/* {!isAI && (
        <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 mt-1 bg-nova-surface2 border border-nova-border">
          <UserOutlined style={{ color: "#8a94a8", fontSize: 14 }} />
        </div>
      )} */}
    </div>
  );
}

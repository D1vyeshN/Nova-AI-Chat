"use client";

import { Button, Tag, Tooltip } from "antd";
import {
  SoundOutlined,
  PauseOutlined,
  RobotOutlined,
  UserOutlined,
  CheckOutlined,
  CopyOutlined,
} from "@ant-design/icons";
import { Message } from "@/types";
import { useEffect, useRef, useState } from "react";
import clsx from "clsx";
import { MarkdownRenderer } from "./MarkdownRenderer";

interface Props {
  message: Message;
  isPlaying: boolean;
  onSpeak: (text: string, id: string) => void;
  isStreaming: boolean;
  streamingDomRef: React.MutableRefObject<HTMLSpanElement | null>;
}

export function MessageBubble({
  message,
  isPlaying,
  onSpeak,
  isStreaming,
  streamingDomRef,
}: Props) {
  const spanRef = useRef<HTMLSpanElement>(null);

  const isAI = message.role === "assistant";
  const isError = message.content.startsWith("⚠️");

  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(message.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Sync streaming content when message content changes
  useEffect(() => {
    if (isStreaming && spanRef.current) {
      // ✅ Register this span as the direct write target
      streamingDomRef.current = spanRef.current;
      // Seed it with whatever content exists already
      spanRef.current.textContent = message.content;
    }
    return () => {
      // ✅ Unregister when this bubble is no longer streaming
      if (streamingDomRef.current === spanRef.current) {
        streamingDomRef.current = null;
      }
    };
  }, [isStreaming]);

  const displayContent = isAI && !isError ? "" : message.content;

  const time = message.timestamp.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });

  console.log("message", message.content);
  return (
    <div
      className={clsx(
        "flex gap-3 group",
        isAI ? "justify-start" : "justify-end",
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
        className={clsx(
          "flex flex-col gap-1 max-w-full",
          !isAI && "items-end max-w-xl",
        )}
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
            "p-1 rounded-xl text-sm leading-relaxed",
            isAI ? "bg-transparent border-0 pt-0" : "rounded-tr-sm",
            isError && "border-red-500/30 bg-red-500/5",
          )}
          // style={
          //   !isAI
          //     ? {
          //         background: "#1a2035",
          //         borderColor: "rgba(0,229,255,0.15)",
          //       }
          //     : undefined
          // }
        >
          <div
            className={clsx(
              "px-4 py-2 rounded-xl text-sm leading-relaxed",
              isAI ? "bg-transparent border-0 pt-0" : "border rounded-tr-sm",
              isError && "border-red-500/30 bg-red-500/5",
            )}
            style={
              !isAI
                ? {
                    background: "#1a2035",
                    borderColor: "rgba(0,229,255,0.15)",
                  }
                : undefined
            }
          >
            {/* <p className="text-nova-text whitespace-pre-wrap">{displayContent}</p> */}
            {/* ✅ span is the direct DOM write target during stream */}
            {isStreaming ? (
              // During stream: still write directly to DOM for perf,
              // but wrap in markdown on final commit
              <span ref={spanRef} style={{ whiteSpace: "pre-wrap" }} />
            ) : (
              <MarkdownRenderer content={message.content} />
            )}

            {isStreaming && <span className="streaming-cursor" />}
          </div>

          {/* TTS button for AI messages */}
          <div
            className={`flex ${isAI ? "" : "justify-end"} gap-2 mt-2 border-t border-nova-border/50`}
          >
            {isAI && !isError && (
              <Tooltip title={isPlaying ? "Stop speaking" : "Play voice"} placement="bottom">
                <Button
                  size="small"
                  type="text"
                  icon={isPlaying ? <PauseOutlined /> : <SoundOutlined />}
                  onClick={() => onSpeak(message.content, message.id)}
                  className={clsx(
                    "font-mono text-[10px] h-6 flex items-center gap-1 transition-all",
                    isPlaying
                      ? "text-purple-400 border-purple-500/30 bg-purple-500/10"
                      : "text-nova-muted hover:text-purple-400 hover:border-purple-500/30 hover:bg-purple-500/10",
                  )}
                  style={{ borderColor: isPlaying ? undefined : "transparent" }}
                >
                  {/* {isPlaying ? "Stop" : "Play Voice"} */}
                </Button>
              </Tooltip>
            )}
            <Tooltip title={copied ? "✓ Copied" : "Copy"} placement="bottom">
              <Button
                size="small"
                type="text"
                icon={copied ? <CheckOutlined /> : <CopyOutlined />}
                onClick={handleCopy}
                className={clsx(
                  "font-mono text-[10px] h-6 flex items-center gap-1 transition-all",
                  "text-nova-muted hover:text-purple-400 hover:border-purple-500/30 hover:bg-purple-500/10",
                )}
                style={{ borderColor: isPlaying ? undefined : "transparent" }}
              >
                {/* {copied ? "✓ Copied" : "Copy"} */}
              </Button>
            </Tooltip>
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

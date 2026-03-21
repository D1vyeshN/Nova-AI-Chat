"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import {
  Button,
  Input,
  Tooltip,
  Badge,
  notification,
  ConfigProvider,
  theme,
} from "antd";
import {
  AudioOutlined,
  SendOutlined,
  DeleteOutlined,
  StopOutlined,
  LoadingOutlined,
  SettingOutlined,
} from "@ant-design/icons";
import { AppStatus } from "@/types";
import { useChat } from "@/hooks/useChat";
import { useSTT } from "@/hooks/useSTT";
import { useTTS } from "@/hooks/useTTS";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { MessageBubble } from "@/components/MessageBubble";
import { TypingIndicator } from "@/components/TypingIndicator";
import { WelcomeScreen } from "@/components/WelcomeScreen";
import { InputArea } from "@/components/InputArea";

const { TextArea } = Input;

export default function ChatPage() {
  const [inputText, setInputText] = useState("");
  const [api, contextHolder] = notification.useNotification();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [settingsModalOpen, setSettingsModalOpen] = useState(false);

  const { selectedVoice, updateVoice, isLoaded } = useLocalStorage();

  const {
    messages,
    status,
    setStatus,
    sendMessage,
    clearMessages,
    stopStreaming,
    isStreaming,
    streamingDomRef,
    updateMessage,
    editMessage,
    regenerateResponse,
  } = useChat();
  const { isRecording, isTranscribing, startRecording, stopRecording } =
    useSTT();
  const { 
    isSpeaking, 
    playingId, 
    isLoading,
    isVoiceStreaming,
    speak, 
    stop
  } = useTTS(selectedVoice);

  // Auto-scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, status]);

  const handleSend = useCallback(async () => {
    const text = inputText.trim();
    if (!text || status === "thinking") return;
    await sendMessage(text);
    setInputText("");
  }, [inputText, status, sendMessage]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleMic = async () => {
    if (isRecording) {
      try {
        const text = await stopRecording();
        if (text?.trim()) {
          setInputText(text);
          await sendMessage(text);
          setInputText("");
        } else {
          api.warning({
            message: "No speech detected",
            placement: "bottom",
            duration: 2,
          });
        }
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : String(err);
        api.error({
          message: "Recording error",
          description: msg,
          placement: "bottom",
          duration: 3,
        });
      }
    } else {
      try {
        await startRecording();
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : String(err);
        api.error({ message: msg, placement: "bottom", duration: 3 });
      }
    }
  };

  const getStatusDisplay = (): { label: string; color: string } => {
    if (isRecording) return { label: "recording...", color: "#ef4444" };
    if (isTranscribing) return { label: "transcribing...", color: "#f59e0b" };
    if (status === "thinking")
      return { label: "thinking...", color: "#00e5ff" };
    if (isSpeaking) return { label: "speaking...", color: "#a78bfa" };
    if (status === "error") return { label: "error", color: "#ef4444" };
    return { label: "ready", color: "#10b981" };
  };

  const { label: statusLabel, color: statusColor } = getStatusDisplay();
  const isBusy = status === "thinking" || isTranscribing || isStreaming;

  return (
    <ConfigProvider
      theme={{
        algorithm: theme.darkAlgorithm,
        token: {
          colorBgBase: "#080b0f",
          colorBgContainer: "#0e1117",
          colorBgElevated: "#0e1117",
          colorBorder: "#1e2530",
          colorPrimary: "#00e5ff",
          colorText: "#e8eaf0",
          colorTextSecondary: "#8a94a8",
          borderRadius: 8,
          fontFamily: "'Syne', sans-serif",
        },
      }}
    >
      {contextHolder}

      <div className="h-screen flex flex-col bg-nova-bg overflow-hidden relative">
        {/* Background atmosphere */}
        <div className="fixed inset-0 pointer-events-none z-0">
          <div
            className="absolute inset-0"
            style={{
              background: `
                radial-gradient(ellipse 60% 40% at 10% 0%, rgba(0,229,255,0.04) 0%, transparent 60%),
                radial-gradient(ellipse 50% 50% at 90% 100%, rgba(124,58,237,0.05) 0%, transparent 60%)
              `,
            }}
          />
        </div>

        {/* ===== HEADER ===== */}
        <header
          className="relative z-10 flex items-center justify-between px-6 py-3 border-b border-nova-border"
          style={{
            background: "rgba(8,11,15,0.9)",
            backdropFilter: "blur(20px)",
          }}
        >
          <div className="flex items-center gap-3">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold"
              style={{
                background: "linear-gradient(135deg, #00e5ff, #7c3aed)",
              }}
            >
              ⬡
            </div>
            <span className="font-display text-lg font-extrabold tracking-widest">
              NO<span className="text-nova-accent">VA</span>
            </span>
          </div>

          <div className="flex items-center gap-4">
            {/* Status badge */}
            <div
              className="flex items-center gap-2 font-mono text-[11px]"
              style={{ color: "#5a6478" }}
            >
              <Badge
                status="processing"
                color={statusColor}
                style={{ "--ant-badge-dot-size": "6px" } as React.CSSProperties}
              />
              {statusLabel}
            </div>

            {/* Action buttons */}
            <Tooltip title="Settings">
              <Button
                type="text"
                size="small"
                icon={<SettingOutlined />}
                onClick={() => setSettingsModalOpen(true)}
                style={{ color: "#5a6478" }}
              />
            </Tooltip>
            <Tooltip title="Clear chat">
              <Button
                type="text"
                size="small"
                icon={<DeleteOutlined />}
                onClick={() => {
                  stop();
                  clearMessages();
                  stopRecording();
                }}
                style={{ color: "#5a6478" }}
                disabled={messages.length === 0}
              />
            </Tooltip>
          </div>
        </header>

        {/* ===== MAIN CONTENT ===== */}
        <div className="flex-1 flex justify-center relative z-10 max-h-[calc(100vh-60px)]">
          <div className="w-full max-w-4xl flex flex-col h-full">
            {/* ===== MESSAGES ===== */}
            <div
              className="flex-1 overflow-y-auto px-4 md:px-6 py-4 space-y-4 relative z-1 scroll-smooth"
              style={{
                scrollbarWidth: "thin",
                scrollbarColor: "#1e2530 transparent",
              }}
            >
              {messages.length === 0 ? (
                <WelcomeScreen
                  onChipClick={(text) => {
                    setInputText(text);
                    sendMessage(text);
                    setInputText("");
                  }}
                />
              ) : (
                <>
                  {messages.map((msg, index) => {
                    return (
                      <MessageBubble
                        key={msg.id}
                        message={msg}
                        isStreaming={isStreaming && index === messages.length - 1}
                        streamingDomRef={streamingDomRef}
                        isPlaying={playingId === msg.id}
                        isLoading={isVoiceStreaming && playingId === msg.id}
                        onSpeak={speak}
                        onEditMessage={editMessage}
                        onUpdateMessage={updateMessage}
                        onRegenerateResponse={regenerateResponse}
                      />
                    );
                  })}
                  {isBusy && <TypingIndicator />}
                </>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* ===== INPUT AREA ===== */}
            <InputArea
              inputText={inputText}
              setInputText={setInputText}
              onSend={handleSend}
              onMic={handleMic}
              onStop={stopStreaming}
              isRecording={isRecording}
              isTranscribing={isTranscribing}
              isStreaming={isStreaming}
              isBusy={isBusy}
            />
          </div>
        </div>
      </div>

    </ConfigProvider>
  );
}

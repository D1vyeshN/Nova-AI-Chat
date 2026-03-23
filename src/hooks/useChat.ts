"use client";

import { useState, useCallback, useRef } from "react";
import { Message, AppStatus } from "@/types";

export function useChat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [status, setStatus] = useState<AppStatus>("idle");
  const [isStreaming, setIsStreaming] = useState(false);

  const messagesRef = useRef<Message[]>([]);
  const abortControllerRef = useRef<AbortController | null>(null);
  const streamingDomRef = useRef<HTMLSpanElement | null>(null);
  const accumulatedRef = useRef<string>("");

  // ── Typing queue ─────────────────────────────────────────────────────────────
  const charQueueRef = useRef<string[]>([]);
  const typingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  // tracks what's actually visible in the DOM span right now
  const displayedRef = useRef<string>("");

  function startTypingQueue() {
    if (typingIntervalRef.current) return;

    typingIntervalRef.current = setInterval(() => {
      if (charQueueRef.current.length === 0) return;

      const charsPerTick = 3; // tweak for speed — see table below
      const batch = charQueueRef.current.splice(0, charsPerTick).join("");
      displayedRef.current += batch;

      if (streamingDomRef.current) {
        try {
          streamingDomRef.current.textContent = displayedRef.current;
        } catch (error) {
          console.warn('Error updating streaming DOM:', error);
        }
      }
    }, 16);
  }

  // ✅ Fix 3: stop interval but DON'T clear the queue here
  // caller decides whether to flush or discard
  function stopTypingInterval() {
    if (typingIntervalRef.current) {
      clearInterval(typingIntervalRef.current);
      typingIntervalRef.current = null;
    }
  }

  // flush all remaining queued chars to DOM instantly
  function flushQueue() {
    if (charQueueRef.current.length === 0) return;
    const remaining = charQueueRef.current.splice(0).join("");
    displayedRef.current += remaining;
    if (streamingDomRef.current) {
      try {
        streamingDomRef.current.textContent = displayedRef.current;
      } catch (error) {
        console.warn('Error updating streaming DOM in flushQueue:', error);
      }
    }
  }

  // discard queue without showing (used on abort)
  function discardQueue() {
    charQueueRef.current = [];
    displayedRef.current = "";
  }

  const stopStreaming = useCallback(() => {
    // Abort any ongoing chat request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort("aborted by user");
      abortControllerRef.current = null;
    }
    
    // Stop typing animation
    stopTypingInterval();
    discardQueue();
    
    // Reset all streaming states
    setIsStreaming(false);
    setStatus("idle");
    streamingDomRef.current = null;
    accumulatedRef.current = "";
    displayedRef.current = "";
  }, []);

  const sendMessage = useCallback(
    async (userText: string) => {
      if (!userText.trim()) return null;
      if (abortControllerRef.current) stopStreaming();

      const abortController = new AbortController();
      abortControllerRef.current = abortController;
      accumulatedRef.current = "";
      displayedRef.current = "";

      const userMsg: Message = {
        id: `${Date.now()}-${Math.random()}`,
        role: "user",
        content: userText,
        timestamp: new Date(),
      };

      const history = [...messagesRef.current, userMsg].map(
        ({ role, content }) => ({ role, content })
      );
      messagesRef.current = [...messagesRef.current, userMsg];
      setMessages(messagesRef.current);
      setStatus("thinking");

      let aiMsgId: string | null = null;

      try {
        const res = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ messages: history }),
          signal: abortController.signal,
        });

        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.error || "Chat failed");
        }
        if (!res.body) throw new Error("No response body");

        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        let buffer = "";
        let hasStartedStreaming = false;

        const processLine = (line: string) => {
          const trimmed = line.trim();
          if (!trimmed || !trimmed.startsWith("data: ")) return;
          const data = trimmed.slice(6).trim();
          if (data === "[DONE]") return;

          try {
            const json = JSON.parse(data);
            const delta = json.choices?.[0]?.delta?.content;
            if (!delta) return;

            accumulatedRef.current += delta;

            // push chars to queue
            charQueueRef.current.push(...delta.split(""));

            if (!hasStartedStreaming) {
              hasStartedStreaming = true;
              aiMsgId = `${Date.now()}-ai-${Math.random()}`;

              const aiMsg: Message = {
                id: aiMsgId,
                role: "assistant",
                content: "",
                timestamp: new Date(),
              };
              messagesRef.current = [...messagesRef.current, aiMsg];
              setMessages([...messagesRef.current]);
              setIsStreaming(true);
              setStatus("idle");

              // ✅ Fix 1: start the queue drip NOW
              startTypingQueue();
            }
          } catch {
            // malformed chunk, skip
          }
        };

        while (true) {
          if (abortController.signal.aborted) break;
          const { done, value } = await reader.read();

          if (done) {
            if (buffer.trim()) processLine(buffer.trim());
            break;
          }

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split("\n");
          buffer = lines.pop() ?? "";
          for (const line of lines) processLine(line);
        }

        // ✅ Fix 3: stop interval first, THEN flush remaining chars
        stopTypingInterval();
        flushQueue();

        // commit full accumulated content to React state
        setMessages((prev) => {
          const next = prev.map((m) =>
            m.id === aiMsgId
              ? { ...m, content: accumulatedRef.current }
              : m
          );
          messagesRef.current = next;
          return next;
        });

        setIsStreaming(false);
        streamingDomRef.current = null;
        abortControllerRef.current = null;

        return messagesRef.current.find((m) => m.id === aiMsgId) ?? null;

      } catch (err: unknown) {
        const errMessage = err instanceof Error ? err.message : "Unknown error";

        if (err instanceof Error && err.name === "AbortError") {
          stopTypingInterval();

          // ✅ Fix 2: commit only what was actually displayed in the DOM
          // not accumulatedRef which may have more than was shown
          const visibleContent = displayedRef.current;

          if (aiMsgId) {
            setMessages((prev) => {
              const next = prev.map((m) =>
                m.id === aiMsgId
                  ? { ...m, content: visibleContent || accumulatedRef.current }
                  : m
              );
              messagesRef.current = next;
              return next;
            });
          }

          discardQueue();
          setIsStreaming(false);
          setStatus("idle");
          streamingDomRef.current = null;
          abortControllerRef.current = null;
          return null;
        }

        stopTypingInterval();
        discardQueue();

        if (aiMsgId) {
          setMessages((prev) =>
            prev.map((m) =>
              m.id === aiMsgId ? { ...m, content: `⚠️ ${errMessage}` } : m
            )
          );
        }
        setIsStreaming(false);
        setStatus("error");
        streamingDomRef.current = null;
        abortControllerRef.current = null;
        return null;
      }
    },
    [stopStreaming]
  );

  const clearMessages = useCallback(() => {
    stopStreaming();
    stopTypingInterval();
    discardQueue();
    setMessages([]);
    messagesRef.current = [];
    accumulatedRef.current = "";
    displayedRef.current = "";
    streamingDomRef.current = null;
  }, [stopStreaming]);

  const updateMessage = useCallback((messageId: string, newContent: string) => {
    setMessages(prev => {
      const newUpdatedMsg = prev.slice(0, prev.findIndex(msg => msg.id === messageId) + 1);
      const next = newUpdatedMsg.map(msg =>
        msg.id === messageId ? { ...msg, content: newContent } : msg
      );
      messagesRef.current = next;
      return next;
    });
  }, []);

  const editMessage = useCallback((messageId: string, isEditing: boolean) => {
    setMessages(prev => {
      const next = prev.map(msg =>
        msg.id === messageId ? { ...msg, isEditing } : msg
      );
      messagesRef.current = next;
      return next;
    });
  }, []);

  const regenerateResponse = useCallback(async (messageId: string) => {
    const messageIndex = messagesRef.current.findIndex(msg => msg.id === messageId);
    if (messageIndex === -1 || messagesRef.current[messageIndex].role !== "user") return null;

    // Remove all messages after the edited user message (including AI responses)
    const messagesBeforeEdit = messagesRef.current.slice(0, messageIndex + 1);
    
    // Update messages state to remove old responses
    setMessages(messagesRef.current);
    messagesRef.current = messagesBeforeEdit;

    // Generate new response for the edited message
    const history = messagesBeforeEdit.map(({ role, content }) => ({ role, content }));
    
    if (abortControllerRef.current) stopStreaming();

    const abortController = new AbortController();
    abortControllerRef.current = abortController;
    accumulatedRef.current = "";
    displayedRef.current = "";

    let aiMsgId: string | null = null;

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: history }),
        signal: abortController.signal,
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Chat failed");
      }
      if (!res.body) throw new Error("No response body");

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      let hasStartedStreaming = false;

      const processLine = (line: string) => {
        const trimmed = line.trim();
        if (!trimmed || !trimmed.startsWith("data: ")) return;
        const data = trimmed.slice(6).trim();
        if (data === "[DONE]") return;

        try {
          const json = JSON.parse(data);
          const delta = json.choices?.[0]?.delta?.content;
          if (!delta) return;

          accumulatedRef.current += delta;
          charQueueRef.current.push(...delta.split(""));

          if (!hasStartedStreaming) {
            hasStartedStreaming = true;
            aiMsgId = `${Date.now()}-ai-${Math.random()}`;

            const aiMsg: Message = {
              id: aiMsgId,
              role: "assistant",
              content: "",
              timestamp: new Date(),
            };
            messagesRef.current = [...messagesRef.current, aiMsg];
            setMessages([...messagesRef.current]);
            setIsStreaming(true);
            setStatus("idle");
            startTypingQueue();
          }
        } catch {
          // malformed chunk, skip
        }
      };

      while (true) {
        if (abortController.signal.aborted) break;
        const { done, value } = await reader.read();

        if (done) {
          if (buffer.trim()) processLine(buffer.trim());
          break;
        }

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() ?? "";
        for (const line of lines) processLine(line);
      }

      stopTypingInterval();
      flushQueue();

      setMessages((prev) => {
        const next = prev.map((m) =>
          m.id === aiMsgId
            ? { ...m, content: accumulatedRef.current }
            : m
        );
        messagesRef.current = next;
        return next;
      });

      setIsStreaming(false);
      streamingDomRef.current = null;
      abortControllerRef.current = null;

      return messagesRef.current.find((m) => m.id === aiMsgId) ?? null;

    } catch (err: unknown) {
      const errMessage = err instanceof Error ? err.message : "Unknown error";

      if (err instanceof Error && err.name === "AbortError") {
        stopTypingInterval();
        const visibleContent = displayedRef.current;

        if (aiMsgId) {
          setMessages((prev) => {
            const next = prev.map((m) =>
              m.id === aiMsgId
                ? { ...m, content: visibleContent || accumulatedRef.current }
                : m
            );
            messagesRef.current = next;
            return next;
          });
        }

        discardQueue();
        setIsStreaming(false);
        setStatus("idle");
        streamingDomRef.current = null;
        abortControllerRef.current = null;
        return null;
      }

      stopTypingInterval();
      discardQueue();

      if (aiMsgId) {
        setMessages((prev) =>
          prev.map((m) =>
            m.id === aiMsgId ? { ...m, content: `⚠️ ${errMessage}` } : m
          )
        );
      }
      setIsStreaming(false);
      setStatus("error");
      streamingDomRef.current = null;
      abortControllerRef.current = null;
      return null;
    }
  }, [stopStreaming]);

  return {
    messages,
    status,
    setStatus,
    isStreaming,
    sendMessage,
    clearMessages,
    stopStreaming,
    streamingDomRef,
    updateMessage,
    editMessage,
    regenerateResponse,
  };
}
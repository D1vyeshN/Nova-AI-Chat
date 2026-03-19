"use client";

import { useRef, useEffect, useState } from "react";

export function useStreamingMessage(messageId: string, initialContent: string = "") {
  const [displayContent, setDisplayContent] = useState(initialContent);
  const contentRef = useRef(initialContent);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Update content without triggering re-render
  const updateContent = (newContent: string) => {
    contentRef.current = newContent;
  };

  // Start smooth typing effect
  const startTyping = (targetContent: string, speed: number = 30) => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    let currentIndex = displayContent.length;
    
    if (currentIndex >= targetContent.length) {
      setDisplayContent(targetContent);
      return;
    }

    intervalRef.current = setInterval(() => {
      if (currentIndex >= targetContent.length) {
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
          intervalRef.current = null;
        }
        return;
      }

      currentIndex++;
      const newContent = targetContent.slice(0, currentIndex);
      setDisplayContent(newContent);
    }, speed);
  };

  // Sync with external content changes
  const syncContent = (targetContent: string) => {
    if (contentRef.current !== targetContent) {
      contentRef.current = targetContent;
      startTyping(targetContent);
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  return {
    content: displayContent,
    updateContent,
    syncContent,
    startTyping
  };
}

"use client";

import { useState, useRef, useCallback, useEffect } from "react";

// ── strip everything except plain speakable text ──────────────────────────────
function stripToSpeakable(text: string): string {
  return (
    text
      // fenced code blocks — replace with placeholder
      .replace(/```[\s\S]*?```/g, "you can see the code in the conversation history")
      // inline code — keep the word
      .replace(/`([^`]+)`/g, "$1")
      // headings
      .replace(/#{1,6}\s+/g, "")
      // bold / italic / strikethrough
      .replace(/\*{1,3}(.+?)\*{1,3}/gs, "$1")
      .replace(/_{1,2}(.+?)_{1,2}/gs, "$1")
      .replace(/~~(.+?)~~/gs, "$1")
      // links — keep label only
      .replace(/\[(.+?)\]\(.+?\)/g, "$1")
      // images — replace with placeholder
      .replace(/!\[.*?\]\(.*?\)/g, "you can see the image in the conversation history")
      // blockquotes
      .replace(/^>\s*/gm, "")
      // horizontal rules
      .replace(/^[-*_]{3,}\s*$/gm, "")
      // html tags
      .replace(/<[^>]+>/g, "")
      // table alignment rows
      .replace(/^\|[-:| ]+\|$/gm, "")
      // table pipes
      .replace(/\|/g, " ")
      // urls — keep as-is for speaking
      // Note: URLs will be spoken as-is by the TTS
      // ── emojis — all unicode emoji ranges ──
      .replace(/[\u{1F600}-\u{1F64F}]/gu, "") // emoticons
      .replace(/[\u{1F300}-\u{1F5FF}]/gu, "") // misc symbols & pictographs
      .replace(/[\u{1F680}-\u{1F6FF}]/gu, "") // transport & map
      .replace(/[\u{1F700}-\u{1F77F}]/gu, "") // alchemical symbols
      .replace(/[\u{1F780}-\u{1F7FF}]/gu, "") // geometric shapes extended
      .replace(/[\u{1F800}-\u{1F8FF}]/gu, "") // supplemental arrows
      .replace(/[\u{1F900}-\u{1F9FF}]/gu, "") // supplemental symbols
      .replace(/[\u{1FA00}-\u{1FA6F}]/gu, "") // chess symbols
      .replace(/[\u{1FA70}-\u{1FAFF}]/gu, "") // symbols and pictographs extended
      .replace(/[\u{2600}-\u{26FF}]/gu, "")   // misc symbols ☀️ ⚡
      .replace(/[\u{2700}-\u{27BF}]/gu, "")   // dingbats
      .replace(/[\u{FE00}-\u{FE0F}]/gu, "")   // variation selectors
      .replace(/[\u{1F1E0}-\u{1F1FF}]/gu, "") // flags
      .replace(/\u{200D}/gu, "")              // zero width joiner
      .replace(/\u{FE0F}/gu, "")              // variation selector-16
      // special chars not useful in speech
      .replace(/[#*_~`^\\]/g, "")
      // html entities
      .replace(/&[a-z]+;/gi, " ")
      .replace(/&#{0,1}[0-9a-z]+;/gi, " ")
      // normalize punctuation
      .replace(/\.{2,}/g, ".")
      // paragraph breaks → natural pause
      .replace(/\n{2,}/g, ". ")
      .replace(/\n/g, " ")
      .replace(/\s{2,}/g, " ")
      .trim()
  );
}

export function useTTS() {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [playingId, setPlayingId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isVoiceStreaming, setIsVoiceStreaming] = useState(false);

  // refs to avoid stale closures
  const isSpeakingRef = useRef(false);
  const currentIdRef = useRef<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const stop = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.src = "";
      audioRef.current = null;
    }
    window.speechSynthesis?.cancel();
    isSpeakingRef.current = false;
    currentIdRef.current = null;
    setIsSpeaking(false);
    setPlayingId(null);
    setIsLoading(false);
    setIsVoiceStreaming(false);
  }, []);

  // ── OpenAI Edge TTS with Direct Audio Streaming ───────────────────────────
  const speakWithOpenAI = useCallback(
    async (text: string, messageId: string) => {
      const clean = stripToSpeakable(text);
      if (!clean) return;

      // Stop any existing audio
      stop();

      setIsLoading(true);
      setIsVoiceStreaming(true);
      isSpeakingRef.current = true;
      currentIdRef.current = messageId;
      setIsSpeaking(true);
      setPlayingId(messageId);

      try {
        const response = await fetch('/api/tts', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            input: clean,
            voice: 'nova',
            response_format: 'mp3',
            speed: 1.0
          })
        });

        if (!response.ok) {
          throw new Error(`TTS API error: ${response.status}`);
        }

        if (!response.body) {
          throw new Error('No response body from TTS API');
        }

        // Create audio from direct stream
        const audioBlob = await response.blob();
        const audioUrl = URL.createObjectURL(audioBlob);
        
        const audio = new Audio(audioUrl);
        audioRef.current = audio;
        
        audio.onended = () => {
          stop();
          URL.revokeObjectURL(audioUrl);
        };
        
        audio.onerror = () => {
          stop();
          URL.revokeObjectURL(audioUrl);
        };
        
        setIsLoading(false);
        await audio.play();

      } catch (error) {
        console.error('OpenAI Edge TTS error:', error);
        stop();
      } finally {
        setIsLoading(false);
        setIsVoiceStreaming(false);
      }
    },
    [stop]
  );

  // ── Main speak function (uses OpenAI Edge TTS) ──────────────────────────
  const speak = useCallback(
    async (text: string, messageId: string) => {
      // Stop if already speaking
      if (isSpeakingRef.current) {
        stop();
        return;
      }
      
      const clean = stripToSpeakable(text);
      if (!clean) return;

      // Use OpenAI Edge TTS
      await speakWithOpenAI(clean, messageId);
    },
    [stop, speakWithOpenAI]
  );

  return { 
    isSpeaking, 
    playingId, 
    speak, 
    stop, 
    isLoading,
    isVoiceStreaming
  };
}
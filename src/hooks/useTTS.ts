"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { loadModule } from "cld3-asm";
import { Voice } from "@/types";
import { allVoices } from "@/utils/voices";

// Cache for language detection module
let cldModuleCache: any = null;
let cldModuleLoading = false;

// Simple cache for detected languages (last 50 texts)
const languageCache = new Map<string, string>();
const MAX_CACHE_SIZE = 50;

// Helper function to get cached language detector
async function getLanguageDetector() {
  if (cldModuleCache) return cldModuleCache;
  
  if (!cldModuleLoading) {
    cldModuleLoading = true;
    try {
      const cldFactory = await loadModule();
      cldModuleCache = cldFactory.create();
    } catch (error) {
      console.error("Failed to load language detection module:", error);
      throw error;
    } finally {
      cldModuleLoading = false;
    }
  }
  
  // Wait for loading to complete if it was in progress
  while (cldModuleLoading) {
    await new Promise(resolve => setTimeout(resolve, 10));
  }
  
  return cldModuleCache;
}

// ── strip everything except plain speakable text ──────────────────────────────
function stripToSpeakable(text: string): string {
  return (
    text
      // fenced code blocks — replace with placeholder
      .replace(
        /```[\s\S]*?```/g,
        "you can see the code in the conversation history",
      )
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
      .replace(
        /!\[.*?\]\(.*?\)/g,
        "you can see the image in the conversation history",
      )
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
      .replace(/[\u{2600}-\u{26FF}]/gu, "") // misc symbols ☀️ ⚡
      .replace(/[\u{2700}-\u{27BF}]/gu, "") // dingbats
      .replace(/[\u{FE00}-\u{FE0F}]/gu, "") // variation selectors
      .replace(/[\u{1F1E0}-\u{1F1FF}]/gu, "") // flags
      .replace(/\u{200D}/gu, "") // zero width joiner
      .replace(/\u{FE0F}/gu, "") // variation selector-16
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

export function useTTS(selectedVoice?: Voice) {
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
      const audio = audioRef.current;
      audio.pause();
      // Clean up the audio URL if it exists
      if (audio.src && audio.src.startsWith('blob:')) {
        URL.revokeObjectURL(audio.src);
      }
      audio.src = "";
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

      setIsLoading(true);
      setIsVoiceStreaming(true);
      isSpeakingRef.current = true;
      currentIdRef.current = messageId;
      setIsSpeaking(true);
      setPlayingId(messageId);

      // Use default voice immediately for faster response
      let voiceToUse = selectedVoice?.name || "en-US-AvaMultilingualNeural";

      try {
        // Start language detection asynchronously (non-blocking)
        const languageDetectionPromise = (async () => {
          try {
            // Check cache first
            const cacheKey = clean.substring(0, 100); // Use first 100 chars as cache key
            if (languageCache.has(cacheKey)) {
              const cachedVoice = languageCache.get(cacheKey);
              if (cachedVoice) {
                const detectedVoice = allVoices.find((v) => v.name === cachedVoice);
                return detectedVoice?.name || voiceToUse;
              }
            }

            const identifier = await getLanguageDetector();
            const result = identifier.findMostFrequentLanguages(clean, 2);
            const detectedVoice = allVoices.find((v) => v.language.startsWith(result?.[0]?.language));
            const optimalVoice = detectedVoice?.name || voiceToUse;

            // Cache the result
            if (languageCache.size >= MAX_CACHE_SIZE) {
              // Remove oldest entry (first in Map)
              const firstKey = languageCache.keys().next().value;
              if (firstKey) {
                languageCache.delete(firstKey);
              }
            }
            languageCache.set(cacheKey, optimalVoice);

            return optimalVoice;
          } catch (error) {
            console.warn("Language detection failed, using default voice:", error);
            return voiceToUse;
          }
        })();

        const response = await fetch("/api/tts", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            input: clean,
            voice: voiceToUse,
            response_format: "mp3",
            speed: 1.0,
          }),
        });

        if (!response.ok) {
          throw new Error(`TTS API error: ${response.status}`);
        }

        if (!response.body) {
          throw new Error("No response body from TTS API");
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

        // Check if language detection found a better voice
        try {
          const optimalVoice = await languageDetectionPromise;
          if (optimalVoice !== voiceToUse && audioRef.current) {
            console.log(`Switching to better voice: ${optimalVoice}`);
            // Optional: Restart with better voice for future optimization
            // For now, continue with current audio to avoid interruption
          }
        } catch (error) {
          // Language detection failed, but audio is already playing
          console.warn("Language detection failed after audio start");
        }
        
      } catch (error) {
        console.error("OpenAI Edge TTS error:", error);
        stop();
      } finally {
        setIsLoading(false);
        setIsVoiceStreaming(false);
      }
    },
    [stop, selectedVoice],
  );

  // ── Main speak function (uses OpenAI Edge TTS) ──────────────────────────
  const speak = useCallback(
    async (text: string, messageId: string) => {
      // Stop current audio if playing, but continue with new audio
      if (isSpeakingRef.current) {
        stop();
        // Small delay to ensure cleanup before starting new audio
        await new Promise(resolve => setTimeout(resolve, 100));
      }

      const clean = stripToSpeakable(text);
      if (!clean) return;

      // Use OpenAI Edge TTS
      await speakWithOpenAI(clean, messageId);
    },
    [stop, speakWithOpenAI],
  );

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stop();
    };
  }, [stop]);

  return {
    isSpeaking,
    playingId,
    speak,
    stop,
    isLoading,
    isVoiceStreaming,
  };
}

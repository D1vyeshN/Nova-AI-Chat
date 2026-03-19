"use client";

import { useState, useRef, useCallback } from "react";

// ── strip everything except plain speakable text ──────────────────────────────
function stripToSpeakable(text: string): string {
  return (
    text
      // fenced code blocks — remove entirely
      .replace(/```[\s\S]*?```/g, "")
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
      // images — remove entirely
      .replace(/!\[.*?\]\(.*?\)/g, "")
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
      // urls
      .replace(/https?:\/\/\S+/g, "")
      .replace(/www\.\S+/g, "")
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

// ── language detection ────────────────────────────────────────────────────────
function detectLang(text: string): string {
  const sample = text.slice(0, 300);

  // script-based — most reliable
  if (/[\u0900-\u097F]/.test(sample)) return "hi"; // Devanagari → Hindi
  if (/[\u0600-\u06FF]/.test(sample)) return "ar"; // Arabic
  if (/[\u4E00-\u9FFF\u3400-\u4DBF]/.test(sample)) return "zh"; // Chinese
  if (/[\u3040-\u30FF\u31F0-\u31FF]/.test(sample)) return "ja"; // Japanese
  if (/[\uAC00-\uD7AF\u1100-\u11FF]/.test(sample)) return "ko"; // Korean
  if (/[\u0400-\u04FF]/.test(sample)) return "ru"; // Cyrillic
  if (/[\u0370-\u03FF]/.test(sample)) return "el"; // Greek
  if (/[\u0590-\u05FF]/.test(sample)) return "he"; // Hebrew
  if (/[\u0E00-\u0E7F]/.test(sample)) return "th"; // Thai

  // latin script word patterns
  if (/\b(le|la|les|des|une|pour|avec|dans|est|qui)\b/i.test(sample)) return "fr";
  if (/\b(der|die|das|und|ist|nicht|auch|ein|eine)\b/i.test(sample)) return "de";
  if (/\b(el|la|los|las|una|para|con|que|por|como)\b/i.test(sample)) return "es";
  if (/\b(il|lo|gli|per|con|una|che|del|alla)\b/i.test(sample)) return "it";
  if (/\b(de|het|een|voor|met|niet|zijn|van|aan)\b/i.test(sample)) return "nl";
  if (/\b(o|a|os|as|em|para|com|uma|não|que)\b/i.test(sample)) return "pt";
  if (/\b(och|att|det|som|för|med|till|från)\b/i.test(sample)) return "sv";
  if (/\b(og|at|det|som|for|med|til|fra|er)\b/i.test(sample)) return "da";

  return "en";
}

// ── BCP-47 map for Web Speech fallback ───────────────────────────────────────
const SPEECH_LANG_MAP: Record<string, string> = {
  en: "en-US",
  hi: "hi-IN",
  ar: "ar-SA",
  zh: "zh-CN",
  ja: "ja-JP",
  ko: "ko-KR",
  ru: "ru-RU",
  fr: "fr-FR",
  de: "de-DE",
  es: "es-ES",
  it: "it-IT",
  nl: "nl-NL",
  pt: "pt-BR",
  sv: "sv-SE",
  da: "da-DK",
  el: "el-GR",
  he: "he-IL",
  th: "th-TH",
};

export function useTTS() {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [playingId, setPlayingId] = useState<string | null>(null);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  // refs to avoid stale closures
  const isSpeakingRef = useRef(false);
  const currentIdRef = useRef<string | null>(null);

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
  }, []);

  // ── web speech fallback ───────────────────────────────────────────────────
  const speakFallback = useCallback(
    (text: string, messageId: string, lang: string) => {
      if (!window.speechSynthesis) {
        stop();
        return;
      }
      window.speechSynthesis.cancel();

      const utterance = new SpeechSynthesisUtterance(text);
      const bcp47 = SPEECH_LANG_MAP[lang] ?? "en-US";
      utterance.lang = bcp47;

      const assignVoice = () => {
        const voices = window.speechSynthesis.getVoices();
        const match =
          voices.find((v) => v.lang === bcp47) ??
          voices.find((v) => v.lang.startsWith(lang)) ??
          voices.find((v) => v.lang.startsWith("en-"));
        if (match) utterance.voice = match;
      };

      assignVoice();
      // voices may not be loaded yet on first call
      if (!utterance.voice) {
        window.speechSynthesis.onvoiceschanged = () => {
          assignVoice();
          window.speechSynthesis.onvoiceschanged = null;
        };
      }

      utterance.rate = 1.0;
      utterance.pitch = 1.0;
      utterance.onend = stop;
      utterance.onerror = stop;

      isSpeakingRef.current = true;
      currentIdRef.current = messageId;
      setIsSpeaking(true);
      setPlayingId(messageId);
      window.speechSynthesis.speak(utterance);
    },
    [stop]
  );

  const speak = useCallback(
    async (text: string, messageId: string) => {
      // read from ref — never stale
      if (isSpeakingRef.current) {
        stop();
        return;
      }

      // detect lang BEFORE stripping — stripping may remove detection clues
      const lang = detectLang(text);
      const clean = stripToSpeakable(text);
      if (!clean) return;

      isSpeakingRef.current = true;
      currentIdRef.current = messageId;
      setIsSpeaking(true);
      setPlayingId(messageId);

      try {
        const res = await fetch("/api/tts", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text: clean, lang }),
        });

        if (!res.ok) {
          const err = await res.json().catch(() => ({}));
          throw new Error(err.error || `TTS failed: ${res.status}`);
        }

        const blob = await res.blob();
        const url = URL.createObjectURL(blob);
        const audio = new Audio(url);
        audioRef.current = audio;

        audio.onended = () => {
          stop();
          URL.revokeObjectURL(url);
        };
        audio.onerror = () => {
          stop();
          URL.revokeObjectURL(url);
          speakFallback(clean, messageId, lang);
        };

        await audio.play();
      } catch (err) {
        console.warn("ElevenLabs TTS failed, falling back to Web Speech:", err);
        isSpeakingRef.current = false;
        setIsSpeaking(false);
        speakFallback(clean, messageId, lang);
      }
    },
    [stop, speakFallback]
  );

  return { isSpeaking, playingId, speak, stop };
}
import { NextRequest, NextResponse } from "next/server";

const DEFAULT_VOICE_ID = "cgSgspJ2msm6clMCkdW9";

const LANG_VOICE_MAP: Record<string, string> = {
  en: DEFAULT_VOICE_ID,
  hi: DEFAULT_VOICE_ID,
  ar: DEFAULT_VOICE_ID,
  fr: DEFAULT_VOICE_ID,
  de: DEFAULT_VOICE_ID,
  es: DEFAULT_VOICE_ID,
  zh: DEFAULT_VOICE_ID,
  ja: DEFAULT_VOICE_ID,
  ko: DEFAULT_VOICE_ID,
  ru: DEFAULT_VOICE_ID,
  it: DEFAULT_VOICE_ID,
  pt: DEFAULT_VOICE_ID,
  sv: DEFAULT_VOICE_ID,
  da: DEFAULT_VOICE_ID,
  el: DEFAULT_VOICE_ID,
  he: DEFAULT_VOICE_ID,
  th: DEFAULT_VOICE_ID,
};

// server-side safety net — strips anything the client may have missed
function stripToSpeakable(text: string): string {
  return (
    text
      .replace(/```[\s\S]*?```/g, "")
      .replace(/`([^`]+)`/g, "$1")
      .replace(/#{1,6}\s+/g, "")
      .replace(/\*{1,3}(.+?)\*{1,3}/gs, "$1")
      .replace(/_{1,2}(.+?)_{1,2}/gs, "$1")
      .replace(/~~(.+?)~~/gs, "$1")
      .replace(/\[(.+?)\]\(.+?\)/g, "$1")
      .replace(/!\[.*?\]\(.*?\)/g, "")
      .replace(/^>\s*/gm, "")
      .replace(/^[-*_]{3,}\s*$/gm, "")
      .replace(/<[^>]+>/g, "")
      .replace(/^\|[-:| ]+\|$/gm, "")
      .replace(/\|/g, " ")
      .replace(/https?:\/\/\S+/g, "")
      .replace(/www\.\S+/g, "")
      .replace(/[\u{1F600}-\u{1F64F}]/gu, "")
      .replace(/[\u{1F300}-\u{1F5FF}]/gu, "")
      .replace(/[\u{1F680}-\u{1F6FF}]/gu, "")
      .replace(/[\u{1F700}-\u{1F77F}]/gu, "")
      .replace(/[\u{1F780}-\u{1F7FF}]/gu, "")
      .replace(/[\u{1F800}-\u{1F8FF}]/gu, "")
      .replace(/[\u{1F900}-\u{1F9FF}]/gu, "")
      .replace(/[\u{1FA00}-\u{1FA6F}]/gu, "")
      .replace(/[\u{1FA70}-\u{1FAFF}]/gu, "")
      .replace(/[\u{2600}-\u{26FF}]/gu, "")
      .replace(/[\u{2700}-\u{27BF}]/gu, "")
      .replace(/[\u{FE00}-\u{FE0F}]/gu, "")
      .replace(/[\u{1F1E0}-\u{1F1FF}]/gu, "")
      .replace(/\u{200D}/gu, "")
      .replace(/\u{FE0F}/gu, "")
      .replace(/[#*_~`^\\]/g, "")
      .replace(/&[a-z]+;/gi, " ")
      .replace(/&#{0,1}[0-9a-z]+;/gi, " ")
      .replace(/\.{2,}/g, ".")
      .replace(/\n{2,}/g, ". ")
      .replace(/\n/g, " ")
      .replace(/\s{2,}/g, " ")
      .trim()
  );
}

export async function POST(req: NextRequest) {
  try {
    const { text, lang = "en" } = await req.json();

    if (!text?.trim()) {
      return NextResponse.json({ error: "Empty text" }, { status: 400 });
    }

    const apiKey = process.env.ELEVENLABS_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "ElevenLabs API key not configured" },
        { status: 500 }
      );
    }

    const clean = stripToSpeakable(text);
    if (!clean) {
      return NextResponse.json(
        { error: "No speakable text after cleaning" },
        { status: 400 }
      );
    }

    // free tier: 10k chars/month — keep truncation tight
    const truncated =
      clean.length > 2500 ? clean.slice(0, 2497) + "..." : clean;

    const voiceId = LANG_VOICE_MAP[lang] ?? DEFAULT_VOICE_ID;

    const response = await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "xi-api-key": apiKey,
        },
        body: JSON.stringify({
          text: truncated,
          // eleven_multilingual_v2 — free tier, 29 languages
          // no language_code field — model auto-detects from text
          model_id: "eleven_multilingual_v2",
          voice_settings: {
            stability: 0.5,
            similarity_boost: 0.8,
            style: 0.0,
            use_speaker_boost: true,
          },
        }),
      }
    );

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      console.error("ElevenLabs error:", err);
      return NextResponse.json(
        {
          error:
            err.detail?.message ||
            err.detail ||
            `ElevenLabs error: ${response.status}`,
        },
        { status: response.status }
      );
    }

    const audioBuffer = await response.arrayBuffer();
    return new NextResponse(audioBuffer, {
      headers: {
        "Content-Type": "audio/mpeg",
        "Content-Length": audioBuffer.byteLength.toString(),
        "Cache-Control": "no-store",
      },
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("TTS route error:", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
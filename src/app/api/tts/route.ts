import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { input, voice = 'en-US-AnaNeural', response_format = 'mp3', speed = 1.0,model="gpt-4o-mini-tts" } = body;

    // Get API configuration from environment variables
    const ttsUrl = process.env.TTS_URL || 'https://openai-edge-tts-uzqw.onrender.com';
    const ttsKey = process.env.TTS_KEY;

    if (!ttsKey || ttsKey === 'your_api_key_here') {
      return NextResponse.json(
        { error: 'OpenAI Edge TTS API key not configured' },
        { status: 500 }
      );
    }

    // Direct audio playback request (no SSE streaming)
    const response = await fetch(`${ttsUrl}/v1/audio/speech`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${ttsKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model:"gpt-4o-mini-tts",
        input,
        voice,
        response_format,
        speed
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('OpenAI Edge TTS API error:', response.status, errorText);
      return NextResponse.json(
        { error: `TTS API error: ${response.status}` },
        { status: response.status }
      );
    }

    // Stream the audio directly back to client
    if (!response.body) {
      return NextResponse.json(
        { error: 'No response body from TTS API' },
        { status: 500 }
      );
    }

    // Create a new response with the same headers and body for direct audio streaming
    const headers = new Headers({
      'Content-Type': 'audio/mpeg',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    });

    return new Response(response.body, {
      status: response.status,
      headers,
    });

  } catch (error) {
    console.error('TTS proxy error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Handle CORS preflight requests
export async function OPTIONS() {
  return new Response(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}

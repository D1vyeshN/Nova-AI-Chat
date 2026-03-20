import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    // Get API configuration from environment variables
    const ttsUrl = process.env.TTS_URL || 'https://openai-edge-tts-uzqw.onrender.com';
    const ttsKey = process.env.TTS_KEY;

    if (!ttsKey || ttsKey === 'your_api_key_here') {
      return NextResponse.json(
        { error: 'OpenAI Edge TTS API key not configured' },
        { status: 500 }
      );
    }

    // Fetch all available voices
    const response = await fetch(`${ttsUrl}/v1/voices/all`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${ttsKey}`,
        'Content-Type': 'application/json',
      }
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('OpenAI Edge TTS All Voices API error:', response.status, errorText);
      return NextResponse.json(
        { error: `All Voices API error: ${response.status}` },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);

  } catch (error) {
    console.error('All Voices proxy error:', error);
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

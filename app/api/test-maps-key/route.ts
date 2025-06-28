import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
  
  if (!apiKey) {
    return NextResponse.json({
      error: 'Google Maps API key is not configured',
      message: 'Please set NEXT_PUBLIC_GOOGLE_MAPS_API_KEY in your environment variables'
    }, { status: 400 });
  }

  if (!apiKey.startsWith('AIza')) {
    return NextResponse.json({
      error: 'Invalid API key format',
      message: 'Google Maps API keys should start with "AIza"',
      keyPrefix: apiKey.substring(0, 10) + '...'
    }, { status: 400 });
  }

  return NextResponse.json({
    status: 'API key configured',
    message: 'Google Maps API key is properly configured',
    keyPrefix: apiKey.substring(0, 10) + '...',
    keyLength: apiKey.length
  });
} 
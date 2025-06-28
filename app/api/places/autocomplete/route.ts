import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { input, types, apiKey } = await request.json();

    if (!input || !apiKey) {
      return NextResponse.json(
        { error: 'Missing required parameters' },
        { status: 400 }
      );
    }

    // Debug: Check if API key looks valid
    if (!apiKey.startsWith('AIza')) {
      console.error('Invalid API key format. Google Maps API keys should start with "AIza"');
      return NextResponse.json(
        { 
          status: 'REQUEST_DENIED',
          error_message: 'Invalid API key format. Google Maps API keys should start with "AIza"'
        },
        { status: 400 }
      );
    }

    // Construct the Google Places API URL
    const url = new URL('https://maps.googleapis.com/maps/api/place/autocomplete/json');
    url.searchParams.append('input', input);
    url.searchParams.append('types', types || '(regions)');
    url.searchParams.append('key', apiKey);

    console.log('Making request to Google Places API with URL:', url.toString().replace(apiKey, 'API_KEY_HIDDEN'));

    // Make the request to Google Places API
    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Google API responded with status: ${response.status}`);
    }

    const data = await response.json();
    
    console.log('Google API response status:', data.status);
    if (data.status !== 'OK') {
      console.error('Google API error details:', data);
    }

    // Return the Google API response
    return NextResponse.json(data);

  } catch (error) {
    console.error('Error in places autocomplete proxy:', error);
    return NextResponse.json(
      { 
        error: 'Failed to fetch place predictions',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
} 
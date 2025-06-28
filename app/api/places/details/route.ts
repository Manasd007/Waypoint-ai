import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { placeId, fields, apiKey } = await request.json();

    if (!placeId || !apiKey) {
      return NextResponse.json(
        { error: 'Missing required parameters' },
        { status: 400 }
      );
    }

    // Construct the Google Places Details API URL
    const url = new URL('https://maps.googleapis.com/maps/api/place/details/json');
    url.searchParams.append('place_id', placeId);
    url.searchParams.append('fields', fields || 'name,geometry');
    url.searchParams.append('key', apiKey);

    // Make the request to Google Places Details API
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

    // Return the Google API response
    return NextResponse.json(data);

  } catch (error) {
    console.error('Error in places details proxy:', error);
    return NextResponse.json(
      { 
        error: 'Failed to fetch place details',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
} 
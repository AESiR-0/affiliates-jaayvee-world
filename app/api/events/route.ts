import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    // Fetch events from Talaash production API
    const talaashBaseUrl = 'https://talaash.thejaayveeworld.com';
    
    console.log('Fetching events from:', talaashBaseUrl);
    
    const eventsResponse = await fetch(`${talaashBaseUrl}/api/events`, {
      cache: 'no-store',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'AffiliateHub/1.0',
      }
    });
    
    console.log('Talaash API response status:', eventsResponse.status);

    if (!eventsResponse.ok) {
      throw new Error(`Talaash API returned ${eventsResponse.status}`);
    }

    const contentType = eventsResponse.headers.get('content-type');
    console.log('Response content-type:', contentType);
    
    if (!contentType || !contentType.includes('application/json')) {
      throw new Error('Talaash API returned non-JSON response');
    }

    const eventsData = await eventsResponse.json();
    console.log('Events data received:', eventsData);
    
    return NextResponse.json({
      success: true,
      data: eventsData.data || eventsData || []
    });
  } catch (error) {
    console.error('Events API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch events from Talaash API' },
      { status: 500 }
    );
  }
}

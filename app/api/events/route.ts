import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    // Fetch events from Talaash production API
    const talaashBaseUrl = 'https://talaash.thejaayveeworld.com';
    
    const eventsResponse = await fetch(`${talaashBaseUrl}/api/events`, {
      cache: 'no-store',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'AffiliateHub/1.0',
      }
    });

    if (!eventsResponse.ok) {
      throw new Error(`Talaash API returned ${eventsResponse.status}`);
    }

    const contentType = eventsResponse.headers.get('content-type');
    
    if (!contentType || !contentType.includes('application/json')) {
      throw new Error('Talaash API returned non-JSON response');
    }

    const eventsData = await eventsResponse.json();
    
    return NextResponse.json({
      success: true,
      data: eventsData.data || eventsData || []
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch events from Talaash API' },
      { status: 500 }
    );
  }
}

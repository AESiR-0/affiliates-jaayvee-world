import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    // Fetch events from Talaash API
    const talaashBaseUrl = process.env.TALAASH_PUBLIC_BASE_URL || 'https://talaash.thejaayveeworld.com';
    const localhostUrl = 'http://localhost:3000';
    
    console.log('Fetching events from:', localhostUrl);
    
    // Try localhost first, then fallback to production
    let eventsResponse;
    try {
      eventsResponse = await fetch(`${localhostUrl}/api/events`, {
        cache: 'no-store',
        headers: {
          'Content-Type': 'application/json',
        }
      });
      console.log('Localhost response status:', eventsResponse.status);
    } catch (error) {
      console.log('Localhost API not available, trying production...', error);
      eventsResponse = await fetch(`${talaashBaseUrl}/api/events`, {
        cache: 'no-store',
        headers: {
          'Content-Type': 'application/json',
        }
      });
      console.log('Production response status:', eventsResponse.status);
    }

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

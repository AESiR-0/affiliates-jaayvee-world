import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    // Fetch events from jaayvee-world backend API (live data)
    const jaayveeWorldUrl = process.env.JAAYVEE_WORLD_API_URL || 'http://localhost:3000';
    
    const eventsResponse = await fetch(`${jaayveeWorldUrl}/api/talaash/events/summary`, {
      cache: 'no-store',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'AffiliateHub/1.0',
      }
    });

    if (!eventsResponse.ok) {
      throw new Error(`Jaayvee-world API returned ${eventsResponse.status}`);
    }

    const contentType = eventsResponse.headers.get('content-type');
    
    if (!contentType || !contentType.includes('application/json')) {
      throw new Error('Jaayvee-world API returned non-JSON response');
    }

    const eventsData = await eventsResponse.json();
    
    // Combine recent and upcoming events
    const allEvents = [
      ...(eventsData.data?.summary?.recentEvents || []),
      ...(eventsData.data?.summary?.upcomingEvents || [])
    ];
    
    return NextResponse.json({
      success: true,
      data: allEvents
    });
  } catch (error) {
    console.error('Failed to fetch events:', error);
    return NextResponse.json(
      { error: 'Failed to fetch events from Jaayvee-world API' },
      { status: 500 }
    );
  }
}

import { requireAuth } from '@/lib/auth';
import EventsSection from '@/components/EventsSection';

// Force dynamic rendering
export const dynamic = 'force-dynamic';

export default async function EventsPage() {
  const { user, affiliate } = await requireAuth();
    
  // Check if user is affiliate
  if (!affiliate) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-gradient-to-r from-red-500 to-pink-500 rounded-full mx-auto mb-4 flex items-center justify-center">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h1>
          <p className="text-gray-600 mb-6">Affiliate access required to view this page.</p>
        </div>
      </div>
    );
  }

  // Fetch events
  let events = [];
  try {
    const eventsResponse = await fetch('/api/events', {
      cache: 'no-store'
    });
    if (eventsResponse.ok) {
      const contentType = eventsResponse.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        const eventsData = await eventsResponse.json();
        events = eventsData.data || [];
      } else {
        console.error('Events API returned non-JSON response');
      }
    } else {
      console.error('Events API returned error:', eventsResponse.status);
    }
  } catch (error) {
    console.error('Failed to fetch events:', error);
  }

  return (
    <div className="bg-gradient-to-br from-gray-900 via-gray-800 to-black">
      <div className="container mx-auto px-4 py-8">
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-white mb-2">Upcoming Events</h1>
              <p className="text-gray-300 text-lg">Discover and promote upcoming events</p>
            </div>
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-full p-3">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
          </div>
        </div>

        {/* Events Section */}
        <EventsSection events={events} />
      </div>
    </div>
  );
}

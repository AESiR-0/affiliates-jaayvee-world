'use client';

import EventCard from './EventCard';

interface Event {
  id: string;
  title: string;
  description: string | null;
  startDate: Date;
  endDate: Date | null;
  venue: any;
  banner: string | null;
  slug: string | null;
  ventureId?: string;
}

interface EventsSectionProps {
  events: Event[];
}

export default function EventsSection({ events }: EventsSectionProps) {
  const handleGenerateLink = (eventId: string, eventTitle: string) => {
    // TODO: Implement affiliate link generation for events
    // This could open a modal or redirect to a link generation page
    alert(`Generate affiliate link for: ${eventTitle}`);
  };

  return (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-white">Upcoming Events</h2>
        <div className="bg-gradient-to-r from-orange-500 to-red-500 text-white px-4 py-2 rounded-full text-sm font-medium">
          {events.length} Events Available
        </div>
      </div>
      
      {events.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {events.map((event) => (
            <EventCard
              key={event.id}
              id={event.id}
              title={event.title}
              description={event.description}
              startDate={event.startDate}
              endDate={event.endDate}
              venue={event.venue}
              banner={event.banner}
              slug={event.slug}
              ventureId={event.ventureId}
              onGenerateLink={handleGenerateLink}
            />
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-2xl p-8 text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-full mx-auto mb-4 flex items-center justify-center">
            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No Events Available</h3>
          <p className="text-gray-600">Check back later for upcoming events to promote.</p>
        </div>
      )}
    </div>
  );
}

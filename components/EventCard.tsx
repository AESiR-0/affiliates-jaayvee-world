'use client';

import { useState } from 'react';
import CopyButton from './CopyButton';

interface EventCardProps {
  id: string;
  title: string;
  description: string | null;
  startDate: Date;
  endDate: Date | null;
  venue: any;
  banner: string | null;
  slug: string | null;
  onGenerateLink: (eventId: string, eventTitle: string) => void;
}

export default function EventCard({ 
  id, 
  title, 
  description, 
  startDate, 
  endDate, 
  venue, 
  banner, 
  slug,
  onGenerateLink 
}: EventCardProps) {
  const [generatedLink, setGeneratedLink] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerateLink = async () => {
    setIsGenerating(true);
    try {
      const eventSlug = slug || id;
      const originalUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3001'}/events/${eventSlug}`;
      
      const response = await fetch('/api/affiliate-links/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          eventId: id,
          eventTitle: title,
          originalUrl: originalUrl,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setGeneratedLink(data.data.originalUrl);
        onGenerateLink(id, title);
      } else {
        throw new Error('Failed to generate affiliate link');
      }
    } catch (error) {
      console.error('Error generating link:', error);
      alert('Failed to generate affiliate link. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(new Date(date));
  };

  const formatVenue = (venue: any) => {
    if (!venue) return 'Venue TBA';
    if (typeof venue === 'string') return venue;
    if (venue.name) return venue.name;
    if (venue.address) return venue.address;
    return 'Venue TBA';
  };

  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300">
      {banner && (
        <div className="h-48 bg-gray-200 overflow-hidden">
          <img 
            src={banner} 
            alt={title}
            className="w-full h-full object-cover"
          />
        </div>
      )}
      
      <div className="p-6">
        <div className="flex justify-between items-start mb-4">
          <h3 className="text-xl font-bold text-gray-900 line-clamp-2">{title}</h3>
          <span className="bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
            Upcoming
          </span>
        </div>
        
        {description && (
          <p className="text-gray-600 text-sm mb-4 line-clamp-3">{description}</p>
        )}
        
        <div className="space-y-2 mb-4">
          <div className="flex items-center text-sm text-gray-700">
            <svg className="w-4 h-4 mr-2 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <span className="font-medium">Start:</span>
            <span className="ml-1">{formatDate(startDate)}</span>
          </div>
          
          {endDate && (
            <div className="flex items-center text-sm text-gray-700">
              <svg className="w-4 h-4 mr-2 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span className="font-medium">End:</span>
              <span className="ml-1">{formatDate(endDate)}</span>
            </div>
          )}
          
          <div className="flex items-center text-sm text-gray-700">
            <svg className="w-4 h-4 mr-2 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <span className="font-medium">Venue:</span>
            <span className="ml-1">{formatVenue(venue)}</span>
          </div>
        </div>
        
        {!generatedLink ? (
          <button
            onClick={handleGenerateLink}
            disabled={isGenerating}
            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 px-4 rounded-lg font-medium hover:from-blue-700 hover:to-purple-700 transition-all duration-200 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
          >
            {isGenerating ? (
              <div className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Generating...
              </div>
            ) : (
              'Generate Affiliate Link'
            )}
          </button>
        ) : (
          <div className="space-y-3">
            <div className="bg-green-50 border border-green-200 rounded-lg p-3">
              <div className="text-sm text-green-800 font-medium mb-2">Generated Affiliate Link:</div>
              <div className="font-mono text-sm text-green-900 bg-white p-2 rounded border break-all">
                {generatedLink}
              </div>
            </div>
            <div className="flex gap-2">
              <CopyButton text={generatedLink} />
              <button
                onClick={() => setGeneratedLink(null)}
                className="flex-1 bg-gray-100 text-gray-700 py-2 px-4 rounded-lg font-medium hover:bg-gray-200 transition-colors duration-200"
              >
                Generate New Link
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

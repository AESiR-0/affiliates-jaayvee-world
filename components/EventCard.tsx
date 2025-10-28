'use client';

import { useState } from 'react';
import CopyButton from './CopyButton';
import ShareModal from './ShareModal';

interface EventCardProps {
  id: string;
  title: string;
  description: string | null;
  startDate: Date;
  endDate: Date | null;
  venue: any;
  banner: string | null;
  slug: string | null;
  ventureId?: string;
  affiliateCode?: string;
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
  ventureId,
  affiliateCode
}: EventCardProps) {
  const [shareModal, setShareModal] = useState<{ isOpen: boolean; url: string; title: string }>({
    isOpen: false,
    url: '',
    title: ''
  });

  const generateAffiliateLink = () => {
    if (!affiliateCode) return '';
    const eventSlug = slug || id;
    const baseUrl = process.env.NEXT_PUBLIC_TALAASH_BASE_URL || 'https://talaash.thejaayveeworld.com';
    return `${baseUrl}/events/${eventSlug}?ref=${affiliateCode}`;
  };

  const affiliateLink = generateAffiliateLink();

  const openShareModal = (url: string, title: string) => {
    setShareModal({
      isOpen: true,
      url,
      title
    });
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
        
        {affiliateCode && affiliateLink ? (
          <div className="space-y-3">
            <div className="bg-green-50 border border-green-200 rounded-lg p-3">
              <div className="text-sm text-green-800 font-medium mb-2">Your Affiliate Link:</div>
              <div className="font-mono text-sm text-green-900 bg-white p-2 rounded border break-all">
                {affiliateLink}
              </div>
            </div>
            <div className="flex gap-2">
              <CopyButton text={affiliateLink} />
              <button
                onClick={() => openShareModal(affiliateLink, title)}
                className="flex-1 bg-green-500 hover:bg-green-600 text-white py-2 px-4 rounded-lg font-medium transition-colors duration-200 flex items-center justify-center space-x-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
                </svg>
                <span>Share</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="text-center py-4">
            <p className="text-gray-500 text-sm">Affiliate code not available</p>
          </div>
        )}
      </div>
      
      {/* Share Modal */}
      <ShareModal
        isOpen={shareModal.isOpen}
        onClose={() => setShareModal({ isOpen: false, url: '', title: '' })}
        url={shareModal.url}
        title={shareModal.title}
      />
    </div>
  );
}

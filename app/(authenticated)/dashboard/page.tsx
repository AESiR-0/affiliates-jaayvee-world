import { requireAuth } from '@/lib/auth';
import { getAffiliateByUserId, getDashboardStats, generateReferralLink } from '@/lib/affiliates';
import KpiCard from '@/components/KpiCard';
import CopyButton from '@/components/CopyButton';
import BrandCard from '@/components/BrandCard';
import EventsSection from '@/components/EventsSection';
import QRCodeDisplay from '@/components/QRCodeDisplay';
import { UpdatesPanel } from '@/components/UpdatesPanel';

// Force dynamic rendering
export const dynamic = 'force-dynamic';

export default async function DashboardPage() {
  const { user, affiliate } = await requireAuth();
    
    // Check if user is affiliate
    if (!affiliate) {
      return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full text-center">
            <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full mx-auto mb-4 flex items-center justify-center">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Admin/Staff Dashboard</h1>
            <p className="text-gray-600 mb-6">Welcome to the admin panel. Affiliate features are not available for your role.</p>
            <div className="space-y-4">
              <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-4 border border-blue-200">
                <h3 className="font-semibold text-gray-900 mb-2">Available Features:</h3>
                <ul className="text-sm text-gray-700 space-y-1">
                  <li>• User management</li>
                  <li>• System administration</li>
                  <li>• Analytics overview</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      );
    }

    const data = await getAffiliateByUserId(user.id);
    const stats = await getDashboardStats(affiliate.id);

    // Fetch events from jaayvee-world backend API (live data)
    let events: any[] = [];
    try {
      const jaayveeWorldUrl = process.env.JAAYVEE_WORLD_API_URL || 'https://talaash.thejaayveeworld.com';
      const eventsResponse = await fetch(`${jaayveeWorldUrl}/api/talaash/events/summary`, {
        cache: 'no-store',
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': 'AffiliateHub/1.0',
        }
      });
      
      if (eventsResponse.ok) {
        const contentType = eventsResponse.headers.get('content-type');
        
        if (contentType && contentType.includes('application/json')) {
          const eventsData = await eventsResponse.json();
          // Combine recent and upcoming events
          events = [
            ...(eventsData.data?.summary?.recentEvents || []),
            ...(eventsData.data?.summary?.upcomingEvents || [])
          ];
        }
      }
    } catch (error) {
      console.error('Failed to fetch events:', error);
    }

  if (!data) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-gradient-to-r from-red-500 to-pink-500 rounded-full mx-auto mb-4 flex items-center justify-center">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-4">No Affiliate Data Found</h1>
          <p className="text-gray-600 mb-6">Please contact support to set up your affiliate account.</p>
          <button className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-lg font-medium hover:from-blue-700 hover:to-purple-700 transition-all duration-200">
            Contact Support
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black">
      <div className="container mx-auto px-4 py-8">
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-white mb-2">Affiliate Dashboard</h1>
              <p className="text-gray-300 text-lg">Track your performance and manage your referral links</p>
            </div>
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-full p-3">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
            </div>
          </div>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl p-6 text-white shadow-xl">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm font-medium">Total Visits</p>
                <p className="text-3xl font-bold">{stats.visitsTotal.toLocaleString()}</p>
              </div>
              <div className="bg-blue-500 rounded-full p-3">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              </div>
            </div>
          </div>
          
          <div className="bg-gradient-to-r from-green-600 to-green-700 rounded-2xl p-6 text-white shadow-xl">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100 text-sm font-medium">Conversions</p>
                <p className="text-3xl font-bold">{stats.conversionsTotal.toLocaleString()}</p>
              </div>
              <div className="bg-green-500 rounded-full p-3">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>
          
          <div className="bg-gradient-to-r from-purple-600 to-purple-700 rounded-2xl p-6 text-white shadow-xl">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100 text-sm font-medium">Conversion Rate</p>
                <p className="text-3xl font-bold">{stats.conversionRate.toFixed(1)}%</p>
              </div>
              <div className="bg-purple-500 rounded-full p-3">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Events Section */}
        <div className="mb-8">
          <EventsSection events={events} affiliateCode={data.aff.code} />
        </div>

        {/* Referral Code & Links */}
        <div className="bg-white rounded-2xl p-8 shadow-xl mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Your Referral Code</h2>
          
          </div>
          
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-6 mb-6 border border-blue-200">
            <div className="text-sm text-gray-600 mb-2 font-medium">Primary Affiliate Code</div>
            <div className="text-3xl font-mono font-bold text-gray-900">{data.aff.code}</div>
          </div>

          <h3 className="text-xl font-semibold text-gray-900 mb-4">Generated Links</h3>
          <div className="space-y-6">
            {data.links.map((link) => {
              const referralUrl = generateReferralLink(link.code, link.urlPath);
              const isEventLink = link.eventId !== null;
              
              return (
                <div key={link.id} className="bg-gray-50 rounded-xl p-6 border border-gray-200 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="font-semibold text-gray-900">
                          Code: {link.code}
                        </span>
                        {isEventLink && (
                          <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2 py-1 rounded-full">
                            Event Link
                          </span>
                        )}
                      </div>
                      <div className="text-sm text-gray-600 mb-2">
                        URL: {link.urlPath || '/r/{code}'}
                      </div>
                      <div className="font-mono text-sm text-gray-700 bg-white p-2 rounded border mb-3">
                        {referralUrl}
                      </div>
                      
                      {/* Stats for this specific link */}
                      <div className="flex gap-4 text-sm">
                        <div className="flex items-center gap-1">
                          <svg className="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                          <span className="text-gray-600">Clicks: {link.clicks || 0}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <span className="text-gray-600">Conversions: {link.conversions || 0}</span>
                        </div>
                        {link.clicks && link.clicks > 0 && (
                          <div className="flex items-center gap-1">
                            <svg className="w-4 h-4 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                            </svg>
                            <span className="text-gray-600">
                              Rate: {((link.conversions || 0) / link.clicks * 100).toFixed(1)}%
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                    <CopyButton text={referralUrl} />
                  </div>
                  
                  {/* QR Code Display */}
                  {link.qrCodeUrl && (
                    <div className="mt-4">
                      <QRCodeDisplay 
                        qrCodeUrl={link.qrCodeUrl}
                        linkUrl={referralUrl}
                        eventTitle={link.eventTitle}
                      />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Updates Panel */}
        <div className="mb-8">
          <UpdatesPanel 
            audience="affiliates" 
            apiBaseUrl={process.env.JAAYVEE_WORLD_API_URL || 'https://thejaayveeworld.com'}
          />
        </div>

        {/* Brands Section */}
        <div className="bg-white rounded-2xl p-8 shadow-xl">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Connected Brands</h2>
          {data.brands.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {data.brands.map((brand) => (
                <BrandCard
                  key={brand.ventureId}
                  name={brand.name}
                  logoUrl={brand.logoUrl}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-100 rounded-full mx-auto mb-4 flex items-center justify-center">
                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No Brands Connected</h3>
              <p className="text-gray-600 mb-4">Contact support to get connected with brands.</p>
              <button className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-lg font-medium hover:from-blue-700 hover:to-purple-700 transition-all duration-200">
                Contact Support
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

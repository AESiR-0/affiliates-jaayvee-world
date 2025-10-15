import { requireAuth } from '@/lib/auth';
import { getAffiliateByUserId, getDashboardStats, generateReferralLink } from '@/lib/affiliates';
import CopyButton from '@/components/CopyButton';
import QRCodeDisplay from '@/components/QRCodeDisplay';

export default async function LinksPage() {
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

    const data = await getAffiliateByUserId(user.id);
  const stats = await getDashboardStats(affiliate.id);

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
              <h1 className="text-4xl font-bold text-white mb-2">Link Performance</h1>
              <p className="text-gray-300 text-lg">Track and analyze your affiliate link performance</p>
            </div>
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-full p-3">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
          </div>
        </div>

        {/* Overall Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl p-6 text-white shadow-xl">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm font-medium">Total Links</p>
                <p className="text-3xl font-bold">{data.links.length}</p>
              </div>
              <div className="bg-blue-500 rounded-full p-3">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                </svg>
              </div>
            </div>
          </div>
          
          <div className="bg-gradient-to-r from-green-600 to-green-700 rounded-2xl p-6 text-white shadow-xl">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100 text-sm font-medium">Total Clicks</p>
                <p className="text-3xl font-bold">{stats.visitsTotal.toLocaleString()}</p>
              </div>
              <div className="bg-green-500 rounded-full p-3">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
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

        {/* Links Performance Table */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          <div className="px-8 py-6 border-b border-gray-200">
            <h2 className="text-2xl font-bold text-gray-900">Link Performance Analytics</h2>
            <p className="text-gray-600 mt-1">Detailed performance metrics for each affiliate link</p>
          </div>
        
        {data.links.length > 0 ? (
            <div className="divide-y divide-gray-200">
            {data.links.map((link) => {
              const referralUrl = generateReferralLink(link.code, link.urlPath);
                const isEventLink = link.eventId !== null;
                const conversionRate = link.clicks && link.clicks > 0 ? ((link.conversions || 0) / link.clicks * 100) : 0;
                
              return (
                  <div key={link.id} className="p-8 hover:bg-gray-50 transition-colors">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-4">
                    <div className="flex items-center gap-2">
                            <span className="text-lg font-semibold text-gray-900">
                              {link.code}
                            </span>
                            {isEventLink && (
                              <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2 py-1 rounded-full">
                                Event Link
                      </span>
                            )}
                          </div>
                        </div>
                        
                        <div className="mb-4">
                          <p className="text-sm text-gray-600 mb-1">Affiliate URL:</p>
                          <div className="font-mono text-sm text-gray-800 bg-gray-100 p-3 rounded-lg break-all">
                            {referralUrl}
                    </div>
                  </div>
                  
                        {/* Performance Metrics */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                          <div className="bg-blue-50 rounded-lg p-4">
                            <div className="flex items-center gap-2 mb-1">
                              <svg className="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                              </svg>
                              <span className="text-sm font-medium text-blue-900">Clicks</span>
                            </div>
                            <p className="text-2xl font-bold text-blue-900">{link.clicks || 0}</p>
                          </div>

                          <div className="bg-green-50 rounded-lg p-4">
                            <div className="flex items-center gap-2 mb-1">
                              <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                              <span className="text-sm font-medium text-green-900">Conversions</span>
                            </div>
                            <p className="text-2xl font-bold text-green-900">{link.conversions || 0}</p>
                          </div>

                          <div className="bg-purple-50 rounded-lg p-4">
                            <div className="flex items-center gap-2 mb-1">
                              <svg className="w-4 h-4 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                              </svg>
                              <span className="text-sm font-medium text-purple-900">Rate</span>
                            </div>
                            <p className="text-2xl font-bold text-purple-900">{conversionRate.toFixed(1)}%</p>
                          </div>

                          <div className="bg-orange-50 rounded-lg p-4">
                            <div className="flex items-center gap-2 mb-1">
                              <svg className="w-4 h-4 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                              <span className="text-sm font-medium text-orange-900">Status</span>
                            </div>
                            <p className="text-sm font-bold text-orange-900">
                              {link.active ? 'Active' : 'Inactive'}
                            </p>
                          </div>
                        </div>

                        {/* QR Code */}
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
                  
                      <div className="ml-4">
                  <CopyButton text={referralUrl} />
                      </div>
                    </div>
                </div>
              );
            })}
          </div>
        ) : (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-100 rounded-full mx-auto mb-4 flex items-center justify-center">
                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No Links Generated Yet</h3>
              <p className="text-gray-600 mb-4">Start by generating affiliate links for events to track their performance.</p>
              <button className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-lg font-medium hover:from-blue-700 hover:to-purple-700 transition-all duration-200">
                Generate Your First Link
              </button>
          </div>
        )}
        </div>
      </div>
    </div>
  );
}
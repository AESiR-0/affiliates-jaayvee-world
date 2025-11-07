'use client';

import { useEffect, useState } from 'react';
import { Wallet, TrendingUp, DollarSign, History } from 'lucide-react';
import MilestoneProgress from '@/components/milestone-progress';

interface WalletData {
  wallet: {
    balance: number;
    currency: string;
  };
  earnings: {
    totalEarnings: string;
    totalReferrals: number;
    currentCommissionRate?: number;
    pendingEarnings?: string;
    milestoneProgress?: {
      current: number;
      next: number | null;
      progress: number;
      currentRate: number;
      nextRate: number | null;
    };
  };
  transactions: Array<{
    id: string;
    type: string;
    amount: number;
    reference: string | null;
    createdAt: Date | string;
  }>;
}

export default function WalletPage() {
  const [walletData, setWalletData] = useState<WalletData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchWalletData();
  }, []);

  const fetchWalletData = async () => {
    try {
      setLoading(true);
      setError(null);
      const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://talaash.thejaayveeworld.com';
      const token = localStorage.getItem('authToken');
      const response = await fetch(`${API_BASE_URL}/api/affiliates/wallet`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch wallet data');
      }

      const result = await response.json();
      if (result.success) {
        setWalletData(result.data);
      } else {
        throw new Error(result.error || 'Failed to load wallet');
      }
    } catch (err: any) {
      console.error('Error fetching wallet:', err);
      setError(err.message || 'Failed to load wallet data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p className="ml-3 text-gray-600">Loading wallet...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">{error}</p>
          <button
            onClick={fetchWalletData}
            className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!walletData) {
    return (
      <div className="p-6">
        <p className="text-gray-600">No wallet data available</p>
      </div>
    );
  }

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Wallet & Earnings</h1>

      {/* Wallet Balance Card */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl shadow-lg p-6 mb-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-blue-100 text-sm mb-2">Wallet Balance</p>
            <p className="text-4xl font-bold">
              {walletData.wallet.currency === 'INR' ? '₹' : walletData.wallet.currency + ' '}
              {parseFloat(String(walletData.wallet.balance)).toLocaleString('en-IN', { 
                minimumFractionDigits: 2,
                maximumFractionDigits: 2 
              })}
            </p>
          </div>
          <Wallet className="h-12 w-12 text-blue-200" />
        </div>
      </div>

      {/* Earnings Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Total Earnings</h3>
            <TrendingUp className="h-6 w-6 text-green-500" />
          </div>
          <p className="text-3xl font-bold text-gray-900">
            ₹{parseFloat(walletData.earnings.totalEarnings).toLocaleString('en-IN', {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2
            })}
          </p>
          <p className="text-sm text-gray-500 mt-2">All-time earnings from referrals</p>
          {walletData.earnings.currentCommissionRate !== undefined && (
            <p className="text-sm text-purple-600 mt-1 font-medium">
              Current rate: {walletData.earnings.currentCommissionRate}%
            </p>
          )}
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Total Referrals</h3>
            <DollarSign className="h-6 w-6 text-blue-500" />
          </div>
          <p className="text-3xl font-bold text-gray-900">
            {walletData.earnings.totalReferrals.toLocaleString()}
          </p>
          <p className="text-sm text-gray-500 mt-2">Users referred through your links</p>
        </div>
      </div>

      {/* Milestone Progress */}
      {walletData.earnings.milestoneProgress && (
        <div className="mb-6">
          <MilestoneProgress
            current={walletData.earnings.milestoneProgress.current}
            next={walletData.earnings.milestoneProgress.next}
            progress={walletData.earnings.milestoneProgress.progress}
            currentRate={walletData.earnings.milestoneProgress.currentRate}
            nextRate={walletData.earnings.milestoneProgress.nextRate}
            currentCommissionRate={walletData.earnings.currentCommissionRate || 0}
            pendingEarnings={walletData.earnings.pendingEarnings || '0.00'}
          />
        </div>
      )}

      {/* Transactions */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center gap-2 mb-4">
          <History className="h-5 w-5 text-gray-700" />
          <h2 className="text-xl font-semibold text-gray-900">Recent Transactions</h2>
        </div>
        
        {walletData.transactions.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <p>No transactions yet</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Type</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Amount</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Reference</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Date</th>
                </tr>
              </thead>
              <tbody>
                {walletData.transactions.map((transaction) => (
                  <tr key={transaction.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-4">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                        transaction.type === 'credit' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {transaction.type}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-gray-900 font-medium">
                      {transaction.type === 'credit' ? '+' : '-'}
                      ₹{Math.abs(transaction.amount).toLocaleString('en-IN', {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2
                      })}
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-600">
                      {transaction.reference || '-'}
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-600">
                      {new Date(transaction.createdAt).toLocaleDateString('en-IN', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}


"use client";

import { TrendingUp, Target } from "lucide-react";

interface MilestoneProgressProps {
  current: number;
  next: number | null;
  progress: number; // 0-100
  currentRate: number;
  nextRate: number | null;
  currentCommissionRate: number;
  pendingEarnings: string;
}

export default function MilestoneProgress({
  current,
  next,
  progress,
  currentRate,
  nextRate,
  currentCommissionRate,
  pendingEarnings,
}: MilestoneProgressProps) {
  const referralsNeeded = next ? next - current : 0;
  const isAtMax = next === null;

  return (
    <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="bg-purple-100 rounded-lg p-2">
            <Target className="h-5 w-5 text-purple-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900">Milestone Progress</h3>
        </div>
        <div className="text-right">
          <p className="text-sm text-gray-500">Current Rate</p>
          <p className="text-xl font-bold text-purple-600">{currentCommissionRate}%</p>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-700">
            {current} referrals
          </span>
          {!isAtMax && (
            <span className="text-sm font-medium text-gray-700">
              {next} referrals needed
            </span>
          )}
        </div>
        <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-purple-500 to-pink-500 transition-all duration-500 flex items-center justify-end pr-2"
            style={{ width: `${progress}%` }}
          >
            {progress > 10 && (
              <span className="text-xs font-bold text-white">{Math.round(progress)}%</span>
            )}
          </div>
        </div>
      </div>

      {/* Next Milestone Info */}
      {!isAtMax && (
        <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="h-4 w-4 text-purple-600" />
            <p className="text-sm font-semibold text-purple-900">Next Milestone</p>
          </div>
          <p className="text-sm text-purple-700 mb-1">
            Reach <span className="font-bold">{next}</span> referrals to unlock <span className="font-bold">{nextRate}%</span> commission rate
          </p>
          <p className="text-xs text-purple-600">
            {referralsNeeded} more {referralsNeeded === 1 ? 'referral' : 'referrals'} needed
          </p>
        </div>
      )}

      {/* Pending Earnings */}
      {parseFloat(pendingEarnings) > 0 && (
        <div className="mt-4 bg-yellow-50 rounded-lg p-4 border border-yellow-200">
          <p className="text-sm font-semibold text-yellow-900 mb-1">Pending Earnings</p>
          <p className="text-lg font-bold text-yellow-700">
            ₹{parseFloat(pendingEarnings).toLocaleString('en-IN', {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2
            })}
          </p>
          <p className="text-xs text-yellow-600 mt-1">
            Will be credited when you reach the next milestone
          </p>
        </div>
      )}

      {isAtMax && (
        <div className="bg-green-50 rounded-lg p-4 border border-green-200">
          <p className="text-sm font-semibold text-green-900">
            🎉 Congratulations! You've reached the highest milestone!
          </p>
          <p className="text-xs text-green-700 mt-1">
            You're earning at the maximum commission rate of {currentRate}%
          </p>
        </div>
      )}
    </div>
  );
}


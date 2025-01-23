import React from 'react';
import { Shield, AlertTriangle, Check, Clock } from 'lucide-react';
import { useNavigation } from '../../contexts/NavigationContext';

interface CopyrightStatsProps {
  totalSongs: number;
  protectedSongs: number;
  pendingRegistrations: number;
  quotaUsed: number;
  quotaTotal: number;
  subscriptionType: 'basic' | 'pro';
}

export function CopyrightStats({
  totalSongs,
  protectedSongs,
  pendingRegistrations,
  quotaUsed,
  quotaTotal,
  subscriptionType
}: CopyrightStatsProps) {
  const { setActiveSection } = useNavigation();
  const protectionPercentage = Math.round((protectedSongs / totalSongs) * 100) || 0;
  const quotaPercentage = quotaTotal === -1 ? 0 : Math.round((quotaUsed / quotaTotal) * 100);
  const isQuotaLow = quotaTotal !== -1 && quotaUsed >= quotaTotal * 0.8;

  const handleUpgrade = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setActiveSection('premium');
    window.scrollTo(0, 0);
  };

  return (
    <div className="bg-zinc-900/50 rounded-lg p-6 border border-red-900/20">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-2">
          <Shield className="w-6 h-6 text-red-400" />
          <h3 className="text-lg font-semibold">Copyright Overview</h3>
        </div>
        <span className={`text-sm px-3 py-1 rounded-full ${
          subscriptionType === 'pro' 
            ? 'bg-red-900/20 text-red-400' 
            : 'bg-zinc-700 text-gray-400'
        }`}>
          {subscriptionType.toUpperCase()} Plan
        </span>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-zinc-800/50 p-4 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <Shield className="w-5 h-5 text-green-400" />
            <span className="text-sm text-green-400">{protectionPercentage}%</span>
          </div>
          <p className="text-2xl font-bold">{protectedSongs}</p>
          <p className="text-sm text-gray-400">Protected Songs</p>
        </div>

        <div className="bg-zinc-800/50 p-4 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <Clock className="w-5 h-5 text-yellow-400" />
            <span className="text-sm text-yellow-400">Pending</span>
          </div>
          <p className="text-2xl font-bold">{pendingRegistrations}</p>
          <p className="text-sm text-gray-400">Registrations</p>
        </div>

        <div className="bg-zinc-800/50 p-4 rounded-lg col-span-2">
          <div className="flex items-center justify-between mb-2">
            <h4 className="font-medium">Registration Quota</h4>
            <span className="text-sm text-gray-400">
              {quotaTotal === -1 ? 'Unlimited' : `${quotaUsed}/${quotaTotal}`}
            </span>
          </div>
          {quotaTotal !== -1 && (
            <>
              <div className="w-full bg-zinc-700 rounded-full h-2 mb-2">
                <div 
                  className={`h-full rounded-full ${
                    isQuotaLow ? 'bg-yellow-500' : 'bg-green-500'
                  }`}
                  style={{ width: `${quotaPercentage}%` }}
                />
              </div>
              {isQuotaLow && (
                <div className="flex items-center space-x-2 text-yellow-400 text-sm">
                  <AlertTriangle className="w-4 h-4" />
                  <span>Quota running low</span>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {subscriptionType === 'basic' && (
        <div className="mt-6 p-4 bg-red-900/20 rounded-lg">
          <div className="flex items-start space-x-2">
            <Shield className="w-5 h-5 text-red-400 flex-shrink-0 mt-1" />
            <div>
              <p className="text-sm text-red-400">
                Upgrade to Pro for unlimited registrations and automatic protection
              </p>
              <button 
                onClick={handleUpgrade}
                className="mt-2 text-sm text-white bg-red-600 px-4 py-2 rounded-lg hover:bg-red-700 transition flex items-center space-x-2 cursor-pointer transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-red-500"
              >
                <Shield className="w-4 h-4" />
                <span>Upgrade Now</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
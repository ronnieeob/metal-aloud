import React, { useState, useEffect } from 'react';
import { DollarSign, Save, TrendingUp, BarChart2, Download, Calendar } from 'lucide-react';

interface CommissionTier {
  id: string;
  minAmount: number;
  maxAmount: number | null;
  rate: number;
  description: string;
  active: boolean;
}

interface EarningsSummary {
  totalEarnings: number;
  totalCommission: number;
  pendingPayouts: number;
  artistCount: number;
  monthlyTrend: {
    month: string;
    earnings: number;
    commission: number;
  }[];
}

export function CommissionManagement() {
  const [tiers, setTiers] = useState<CommissionTier[]>([
    {
      id: '1',
      minAmount: 0,
      maxAmount: 1000,
      rate: 8,
      description: 'Standard rate for earnings up to $1,000',
      active: true
    },
    {
      id: '2',
      minAmount: 1000.01,
      maxAmount: 5000,
      rate: 7,
      description: 'Reduced rate for earnings between $1,000 and $5,000',
      active: true
    },
    {
      id: '3',
      minAmount: 5000.01,
      maxAmount: 10000,
      rate: 6,
      description: 'Premium rate for earnings between $5,000 and $10,000',
      active: true
    },
    {
      id: '4',
      minAmount: 10000.01,
      maxAmount: null,
      rate: 5,
      description: 'Elite rate for earnings above $10,000',
      active: true
    }
  ]);

  const [summary, setSummary] = useState<EarningsSummary>({
    totalEarnings: 0,
    totalCommission: 0,
    pendingPayouts: 0,
    artistCount: 0,
    monthlyTrend: []
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedPeriod, setSelectedPeriod] = useState<'weekly' | 'monthly' | 'yearly'>('monthly');

  useEffect(() => {
    loadSummary();
  }, [selectedPeriod]);

  const loadSummary = () => {
    // In development, use mock data
    if (import.meta.env.DEV) {
      setSummary({
        totalEarnings: 125000,
        totalCommission: 8750,
        pendingPayouts: 2500,
        artistCount: 45,
        monthlyTrend: [
          { month: 'Jan', earnings: 15000, commission: 1200 },
          { month: 'Feb', earnings: 18000, commission: 1440 },
          { month: 'Mar', earnings: 22000, commission: 1760 },
          { month: 'Apr', earnings: 25000, commission: 1875 },
          { month: 'May', earnings: 28000, commission: 1960 }
        ]
      });
    }
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      setError(null);

      // Validate tiers
      let lastMax = 0;
      for (const tier of tiers) {
        if (tier.minAmount < lastMax) {
          throw new Error('Tier ranges must not overlap');
        }
        if (tier.maxAmount !== null && tier.maxAmount <= tier.minAmount) {
          throw new Error('Maximum amount must be greater than minimum amount');
        }
        lastMax = tier.maxAmount || Infinity;
      }

      // Save to localStorage for development
      localStorage.setItem('metal_aloud_commission_tiers', JSON.stringify(tiers));

      // Show success message
      const message = document.createElement('div');
      message.className = 'fixed top-4 right-4 bg-green-600 text-white px-6 py-3 rounded-lg shadow-lg z-50';
      message.textContent = 'Commission tiers updated successfully';
      document.body.appendChild(message);
      setTimeout(() => message.remove(), 3000);

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save commission tiers');
    } finally {
      setLoading(false);
    }
  };

  const downloadReport = () => {
    // Generate CSV
    const headers = ['Period', 'Total Earnings', 'Commission', 'Net Artist Earnings'];
    const rows = summary.monthlyTrend.map(month => [
      month.month,
      month.earnings.toFixed(2),
      month.commission.toFixed(2),
      (month.earnings - month.commission).toFixed(2)
    ]);

    const csv = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');

    // Create and download file
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `commission-report-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="bg-zinc-800/50 rounded-lg p-6 border border-red-900/20">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-red-500">Commission Management</h2>
        <div className="flex items-center space-x-4">
          <select
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value as any)}
            className="bg-zinc-900 border border-red-900/20 rounded px-3 py-2 text-sm"
          >
            <option value="weekly">Weekly</option>
            <option value="monthly">Monthly</option>
            <option value="yearly">Yearly</option>
          </select>
          <button
            onClick={downloadReport}
            className="flex items-center space-x-2 px-4 py-2 bg-zinc-900 text-white rounded hover:bg-zinc-800 transition"
          >
            <Download className="w-4 h-4" />
            <span>Export Report</span>
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-900/20 text-red-400 p-4 rounded-lg mb-6">
          {error}
        </div>
      )}

      {/* Earnings Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-zinc-900/50 p-6 rounded-lg border border-red-900/10">
          <div className="flex items-center justify-between mb-2">
            <DollarSign className="w-8 h-8 text-green-400" />
            <span className="text-sm text-green-400">Total Earnings</span>
          </div>
          <p className="text-3xl font-bold">${summary.totalEarnings.toLocaleString()}</p>
        </div>

        <div className="bg-zinc-900/50 p-6 rounded-lg border border-red-900/10">
          <div className="flex items-center justify-between mb-2">
            <TrendingUp className="w-8 h-8 text-red-400" />
            <span className="text-sm text-red-400">Platform Commission</span>
          </div>
          <p className="text-3xl font-bold">${summary.totalCommission.toLocaleString()}</p>
        </div>

        <div className="bg-zinc-900/50 p-6 rounded-lg border border-red-900/10">
          <div className="flex items-center justify-between mb-2">
            <BarChart2 className="w-8 h-8 text-yellow-400" />
            <span className="text-sm text-yellow-400">Pending Payouts</span>
          </div>
          <p className="text-3xl font-bold">${summary.pendingPayouts.toLocaleString()}</p>
        </div>

        <div className="bg-zinc-900/50 p-6 rounded-lg border border-red-900/10">
          <div className="flex items-center justify-between mb-2">
            <DollarSign className="w-8 h-8 text-blue-400" />
            <span className="text-sm text-blue-400">Active Artists</span>
          </div>
          <p className="text-3xl font-bold">{summary.artistCount}</p>
        </div>
      </div>

      {/* Earnings Trend */}
      <div className="bg-zinc-900/50 p-6 rounded-lg border border-red-900/10 mb-8">
        <h3 className="text-lg font-semibold mb-4">Earnings Trend</h3>
        <div className="relative h-64">
          <div className="absolute inset-0 flex items-end justify-between">
            {summary.monthlyTrend.map((month, index) => (
              <div key={index} className="flex flex-col items-center w-1/6">
                <div className="relative w-full h-48">
                  {/* Commission Bar */}
                  <div
                    className="absolute bottom-0 left-1/2 w-4 bg-red-500/50 rounded-t transform -translate-x-1/2 transition-all duration-300"
                    style={{ height: `${(month.commission / 2000) * 100}%` }}
                  />
                  {/* Earnings Bar */}
                  <div
                    className="absolute bottom-0 left-1/2 w-4 bg-green-500/50 rounded-t transform -translate-x-1/2 transition-all duration-300"
                    style={{ height: `${(month.earnings / 30000) * 100}%` }}
                  />
                </div>
                <span className="text-xs text-gray-400 mt-2">{month.month}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="flex justify-center space-x-8 mt-4">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-green-500/50 rounded" />
            <span className="text-sm text-gray-400">Total Earnings</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-red-500/50 rounded" />
            <span className="text-sm text-gray-400">Commission</span>
          </div>
        </div>
      </div>

      {/* Commission Tiers */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Commission Tiers</h3>
          <button
            onClick={() => setTiers([...tiers, {
              id: crypto.randomUUID(),
              minAmount: 0,
              maxAmount: null,
              rate: 8,
              description: 'New tier',
              active: true
            }])}
            className="text-sm text-red-400 hover:text-red-300"
          >
            + Add Tier
          </button>
        </div>

        <div className="space-y-4">
          {tiers.map((tier, index) => (
            <div key={tier.id} className="bg-zinc-900/50 p-4 rounded-lg border border-red-900/10">
              <div className="grid grid-cols-6 gap-4">
                <div className="col-span-1">
                  <label className="block text-sm font-medium mb-2">Min Amount ($)</label>
                  <input
                    type="number"
                    value={tier.minAmount}
                    onChange={(e) => {
                      const newTiers = [...tiers];
                      newTiers[index].minAmount = parseFloat(e.target.value);
                      setTiers(newTiers);
                    }}
                    className="w-full bg-zinc-800 border border-red-900/20 rounded px-3 py-2"
                    min="0"
                    step="0.01"
                  />
                </div>

                <div className="col-span-1">
                  <label className="block text-sm font-medium mb-2">Max Amount ($)</label>
                  <input
                    type="number"
                    value={tier.maxAmount || ''}
                    onChange={(e) => {
                      const newTiers = [...tiers];
                      newTiers[index].maxAmount = e.target.value ? parseFloat(e.target.value) : null;
                      setTiers(newTiers);
                    }}
                    className="w-full bg-zinc-800 border border-red-900/20 rounded px-3 py-2"
                    min={tier.minAmount}
                    step="0.01"
                    placeholder="Unlimited"
                  />
                </div>

                <div className="col-span-1">
                  <label className="block text-sm font-medium mb-2">Rate (%)</label>
                  <input
                    type="number"
                    value={tier.rate}
                    onChange={(e) => {
                      const newTiers = [...tiers];
                      newTiers[index].rate = parseFloat(e.target.value);
                      setTiers(newTiers);
                    }}
                    className="w-full bg-zinc-800 border border-red-900/20 rounded px-3 py-2"
                    min="0"
                    max="100"
                    step="0.1"
                  />
                </div>

                <div className="col-span-2">
                  <label className="block text-sm font-medium mb-2">Description</label>
                  <input
                    type="text"
                    value={tier.description}
                    onChange={(e) => {
                      const newTiers = [...tiers];
                      newTiers[index].description = e.target.value;
                      setTiers(newTiers);
                    }}
                    className="w-full bg-zinc-800 border border-red-900/20 rounded px-3 py-2"
                  />
                </div>

                <div className="col-span-1">
                  <label className="block text-sm font-medium mb-2">Status</label>
                  <select
                    value={tier.active ? 'active' : 'inactive'}
                    onChange={(e) => {
                      const newTiers = [...tiers];
                      newTiers[index].active = e.target.value === 'active';
                      setTiers(newTiers);
                    }}
                    className="w-full bg-zinc-800 border border-red-900/20 rounded px-3 py-2"
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
              </div>

              <button
                onClick={() => setTiers(tiers.filter(t => t.id !== tier.id))}
                className="mt-2 text-sm text-red-400 hover:text-red-300"
              >
                Remove Tier
              </button>
            </div>
          ))}
        </div>

        <div className="flex justify-end pt-4">
          <button
            onClick={handleSave}
            disabled={loading}
            className="flex items-center space-x-2 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span>{loading ? 'Saving...' : 'Save Changes'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
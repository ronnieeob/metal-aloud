import React from 'react';
import { useReports } from '../../hooks/admin/useReports';
import { BarChart2, TrendingUp, Users, DollarSign, Loader } from 'lucide-react';

export function Reports() {
  const { reports, period, setPeriod, loading, error } = useReports();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader className="w-8 h-8 text-red-500 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center text-red-500 py-8">
        {error}
      </div>
    );
  }

  if (!reports) return null;

  return (
    <div className="bg-zinc-800/50 rounded-lg p-6 border border-red-900/20">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-red-500">Reports</h2>
        <select
          value={period}
          onChange={(e) => setPeriod(e.target.value as any)}
          className="bg-zinc-700 rounded border border-red-900/20 px-3 py-2"
        >
          <option value="daily">Daily</option>
          <option value="weekly">Weekly</option>
          <option value="monthly">Monthly</option>
          <option value="yearly">Yearly</option>
        </select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-zinc-900/50 rounded-lg p-6 border border-red-900/10">
          <div className="flex items-center justify-between">
            <DollarSign className="w-8 h-8 text-red-400" />
            <span className="text-sm text-green-400">
              +{((reports.revenue.data[reports.revenue.data.length - 1]?.revenue || 0) /
                (reports.revenue.total || 1) * 100).toFixed(1)}%
            </span>
          </div>
          <h3 className="text-2xl font-bold mt-4">
            ${reports.revenue.total.toFixed(2)}
          </h3>
          <p className="text-sm text-gray-400">Total Revenue</p>
        </div>

        <div className="bg-zinc-900/50 rounded-lg p-6 border border-red-900/10">
          <div className="flex items-center justify-between">
            <BarChart2 className="w-8 h-8 text-red-400" />
            <span className="text-sm text-green-400">
              +{((reports.sales.data[reports.sales.data.length - 1]?.sales || 0) /
                (reports.sales.total || 1) * 100).toFixed(1)}%
            </span>
          </div>
          <h3 className="text-2xl font-bold mt-4">
            {reports.sales.total}
          </h3>
          <p className="text-sm text-gray-400">Total Sales</p>
        </div>

        <div className="bg-zinc-900/50 rounded-lg p-6 border border-red-900/10">
          <div className="flex items-center justify-between">
            <Users className="w-8 h-8 text-red-400" />
            <span className="text-sm text-green-400">
              +{((reports.users.data[reports.users.data.length - 1]?.users || 0) /
                (reports.users.total || 1) * 100).toFixed(1)}%
            </span>
          </div>
          <h3 className="text-2xl font-bold mt-4">
            {reports.users.total}
          </h3>
          <p className="text-sm text-gray-400">Total Users</p>
        </div>
      </div>

      {/* Charts would go here */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-zinc-900/50 rounded-lg p-6 border border-red-900/10">
          <h3 className="text-lg font-semibold mb-4 flex items-center">
            <TrendingUp className="w-5 h-5 mr-2 text-red-400" />
            Revenue Trend
          </h3>
          {/* Revenue chart would go here */}
        </div>

        <div className="bg-zinc-900/50 rounded-lg p-6 border border-red-900/10">
          <h3 className="text-lg font-semibold mb-4 flex items-center">
            <BarChart2 className="w-5 h-5 mr-2 text-red-400" />
            Sales Trend
          </h3>
          {/* Sales chart would go here */}
        </div>
      </div>
    </div>
  );
}
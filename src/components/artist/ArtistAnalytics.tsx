import React, { useState, useEffect } from 'react';
import { BarChart2, Users, Music, ShoppingBag, TrendingUp, DollarSign } from 'lucide-react';

export function ArtistAnalytics() {
  const [analyticsData, setAnalyticsData] = useState({
    monthlyListeners: 2500,
    songPlays: 12800,
    merchSales: 3200,
    revenue: 5400,
    topSongs: [
      { name: 'Song A', plays: 4500 },
      { name: 'Song B', plays: 3200 },
      { name: 'Song C', plays: 2800 }
    ],
    topProducts: [
      { name: 'Product A', sales: 45 },
      { name: 'Product B', sales: 32 },
      { name: 'Product C', sales: 28 }
    ]
  });

  useEffect(() => {
    loadAnalytics();
  }, []);

  const loadAnalytics = async () => {
    try {
      // Load analytics data from local storage
      const storedData = localStorage.getItem('metal_aloud_artist_analytics');
      if (storedData) {
        setAnalyticsData(JSON.parse(storedData));
      }
    } catch (err) {
      console.error('Failed to load analytics:', err);
    }
  };

  const stats = [
    { 
      label: 'Monthly Listeners', 
      value: analyticsData.monthlyListeners.toLocaleString(), 
      icon: Users, 
      change: '+15%' 
    },
    { 
      label: 'Song Plays', 
      value: analyticsData.songPlays.toLocaleString(), 
      icon: Music, 
      change: '+24%' 
    },
    { 
      label: 'Merch Sales', 
      value: `$${analyticsData.merchSales.toLocaleString()}`, 
      icon: ShoppingBag, 
      change: '+18%' 
    },
    { 
      label: 'Revenue', 
      value: `$${analyticsData.revenue.toLocaleString()}`, 
      icon: DollarSign, 
      change: '+22%' 
    }
  ];

  return (
    <div className="bg-zinc-800/50 rounded-lg p-6 border border-red-900/20">
      <h2 className="text-2xl font-bold text-red-500 mb-6">Analytics</h2>
      
      {/* Interactive Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Revenue Trend Chart */}
        <div className="bg-zinc-900/50 p-6 rounded-lg border border-red-900/10">
          <h3 className="text-lg font-semibold mb-4">Revenue Trend</h3>
          <div className="relative h-64">
            <div className="absolute inset-0 flex items-end space-x-2">
              {[...Array(12)].map((_, i) => {
                const height = 30 + Math.random() * 70;
                return (
                  <div key={i} className="flex-1 flex flex-col items-center">
                    <div 
                      className="w-full bg-red-500/20 rounded-t transition-all duration-500 ease-in-out hover:bg-red-500/40"
                      style={{ height: `${height}%` }}
                    />
                    <span className="text-xs text-gray-400 mt-2">
                      {new Date(Date.now() - (11-i) * 30 * 24 * 60 * 60 * 1000).toLocaleDateString('default', { month: 'short' })}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Listener Demographics */}
        <div className="bg-zinc-900/50 p-6 rounded-lg border border-red-900/10">
          <h3 className="text-lg font-semibold mb-4">Listener Demographics</h3>
          <div className="relative h-64">
            <div className="absolute inset-0 flex">
              {[
                { region: 'North America', percentage: 45, color: 'bg-red-500/40' },
                { region: 'Europe', percentage: 30, color: 'bg-blue-500/40' },
                { region: 'Asia', percentage: 15, color: 'bg-green-500/40' },
                { region: 'Other', percentage: 10, color: 'bg-yellow-500/40' }
              ].map((region, i) => (
                <div 
                  key={i}
                  className={`h-full ${region.color} transition-all duration-300 hover:opacity-80`}
                  style={{ width: `${region.percentage}%` }}
                >
                  <div className="p-2">
                    <span className="text-xs font-medium">{region.region}</span>
                    <span className="text-xs block">{region.percentage}%</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat, index) => (
          <div
            key={index}
            className="bg-zinc-900/50 rounded-lg p-6 border border-red-900/10"
          >
            <div className="flex items-center justify-between">
              <stat.icon className="w-8 h-8 text-red-400" />
              <span className={`text-sm ${
                stat.change.startsWith('+') ? 'text-green-400' : 'text-red-400'
              }`}>
                {stat.change}
              </span>
            </div>
            <h3 className="text-2xl font-bold mt-4">{stat.value}</h3>
            <p className="text-sm text-gray-400">{stat.label}</p>
          </div>
        ))}
      </div>
      
      {/* Detailed Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
        <div className="bg-zinc-900/50 p-6 rounded-lg border border-red-900/10">
          <h3 className="text-lg font-semibold mb-4">Engagement Metrics</h3>
          <div className="space-y-4">
            {[
              { label: 'Average Listen Time', value: '4:32', change: '+12%' },
              { label: 'Completion Rate', value: '78%', change: '+5%' },
              { label: 'Repeat Listeners', value: '45%', change: '+8%' },
              { label: 'Social Shares', value: '234', change: '+15%' }
            ].map((metric, i) => (
              <div key={i} className="flex items-center justify-between">
                <span className="text-gray-400">{metric.label}</span>
                <div className="text-right">
                  <span className="font-medium">{metric.value}</span>
                  <span className={`ml-2 text-sm ${
                    metric.change.startsWith('+') ? 'text-green-400' : 'text-red-400'
                  }`}>{metric.change}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-zinc-900/50 p-6 rounded-lg border border-red-900/10">
          <h3 className="text-lg font-semibold mb-4">Platform Distribution</h3>
          <div className="space-y-4">
            {[
              { platform: 'Mobile App', percentage: 65, color: 'bg-red-500' },
              { platform: 'Desktop Web', percentage: 25, color: 'bg-blue-500' },
              { platform: 'Tablet', percentage: 10, color: 'bg-green-500' }
            ].map((platform, i) => (
              <div key={i} className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span>{platform.platform}</span>
                  <span>{platform.percentage}%</span>
                </div>
                <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
                  <div 
                    className={`h-full ${platform.color} transition-all duration-500`}
                    style={{ width: `${platform.percentage}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-zinc-900/50 rounded-lg p-6 border border-red-900/10">
          <h3 className="text-lg font-semibold mb-4 flex items-center">
            <TrendingUp className="w-5 h-5 mr-2 text-red-400" />
            Top Performing Songs
          </h3>
          <div className="space-y-4">
            {analyticsData.topSongs.map((song, index) => (
              <div key={index} className="flex items-center justify-between">
                <span>{song.name}</span>
                <span className="text-red-400">{song.plays.toLocaleString()} plays</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-zinc-900/50 rounded-lg p-6 border border-red-900/10">
          <h3 className="text-lg font-semibold mb-4 flex items-center">
            <ShoppingBag className="w-5 h-5 mr-2 text-red-400" />
            Best Selling Merch
          </h3>
          <div className="space-y-4">
            {analyticsData.topProducts.map((product, index) => (
              <div key={index} className="flex items-center justify-between">
                <span>{product.name}</span>
                <span className="text-red-400">{product.sales} units</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
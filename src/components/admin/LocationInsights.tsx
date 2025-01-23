import React, { useState } from 'react';
import { MapPin, Users, Globe, TrendingUp, Filter } from 'lucide-react';
import { useLocationInsights } from '../../hooks/admin/useLocationInsights';

interface LocationData {
  country: string;
  userCount: number;
  activeUsers: number;
  topGenres: string[];
  growth: number;
}

interface RegionStats {
  region: string;
  countries: string[];
  totalUsers: number;
  activeUsers: number;
  percentageGrowth: number;
}

export function LocationInsights() {
  const { locationData, regionStats, loading, error, refresh } = useLocationInsights();
  const [selectedRegion, setSelectedRegion] = useState<string>('all');
  const [timeRange, setTimeRange] = useState<'week' | 'month' | 'year'>('month');

  const regions: Record<string, string[]> = {
    'North America': ['United States', 'Canada', 'Mexico'],
    'Europe': ['Germany', 'United Kingdom', 'Sweden', 'Norway', 'Finland'],
    'Asia': ['Japan', 'South Korea', 'China', 'India'],
    'South America': ['Brazil', 'Argentina', 'Chile'],
    'Oceania': ['Australia', 'New Zealand']
  };

  const handleTimeRangeChange = (range: 'week' | 'month' | 'year') => {
    setTimeRange(range);
    refresh(range);
  };

  const getRegionStats = (): RegionStats[] => {
    const stats: Record<string, RegionStats> = {};
    
    Object.entries(regions).forEach(([region, countries]) => {
      const regionData = locationData.filter(data => 
        countries.includes(data.country)
      );
      
      if (regionData.length > 0) {
        stats[region] = {
          region,
          countries: countries,
          totalUsers: regionData.reduce((sum, data) => sum + data.userCount, 0),
          activeUsers: regionData.reduce((sum, data) => sum + data.activeUsers, 0),
          percentageGrowth: regionData.reduce((sum, data) => sum + data.growth, 0) / regionData.length
        };
      }
    });

    return Object.values(stats);
  };

  const filteredData = selectedRegion === 'all' 
    ? locationData 
    : locationData.filter(data => regions[selectedRegion]?.includes(data.country));

  return (
    <div className="bg-zinc-800/50 rounded-lg p-6 border border-red-900/20">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-2">
          <Globe className="w-6 h-6 text-red-400" />
          <h2 className="text-2xl font-bold text-red-500">Location Insights</h2>
        </div>
        <div className="flex items-center space-x-4">
          <select
            value={selectedRegion}
            onChange={(e) => setSelectedRegion(e.target.value)}
            className="bg-zinc-900 border border-red-900/20 rounded px-3 py-2 text-sm"
          >
            <option value="all">All Regions</option>
            {Object.keys(regions).map(region => (
              <option key={region} value={region}>{region}</option>
            ))}
          </select>
          <select
            value={timeRange}
            onChange={(e) => handleTimeRangeChange(e.target.value as any)}
            className="bg-zinc-900 border border-red-900/20 rounded px-3 py-2 text-sm"
          >
            <option value="week">Last Week</option>
            <option value="month">Last Month</option>
            <option value="year">Last Year</option>
          </select>
        </div>
      </div>

      {/* Region Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {getRegionStats().map((stat) => (
          <div key={stat.region} className="bg-zinc-900/50 p-4 rounded-lg border border-red-900/10">
            <h3 className="font-semibold text-lg mb-2">{stat.region}</h3>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Total Users</span>
                <span className="font-bold">{stat.totalUsers.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Active Users</span>
                <span className="font-bold text-green-400">
                  {stat.activeUsers.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Growth</span>
                <span className="font-bold text-blue-400">
                  +{stat.percentageGrowth.toFixed(1)}%
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Country Details */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold mb-4">Country Details</h3>
        <div className="grid gap-4">
          {filteredData.map((data) => (
            <div key={data.country} className="bg-zinc-900/50 p-4 rounded-lg border border-red-900/10">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center space-x-2">
                    <MapPin className="w-4 h-4 text-red-400" />
                    <h4 className="font-medium">{data.country}</h4>
                  </div>
                  <div className="mt-2 space-y-1">
                    <div className="flex items-center space-x-2 text-sm">
                      <Users className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-400">Users:</span>
                      <span>{data.userCount.toLocaleString()}</span>
                    </div>
                    <div className="flex items-center space-x-2 text-sm">
                      <TrendingUp className="w-4 h-4 text-green-400" />
                      <span className="text-gray-400">Growth:</span>
                      <span className="text-green-400">+{data.growth}%</span>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm text-gray-400 mb-1">Top Genres</div>
                  <div className="flex flex-wrap justify-end gap-2">
                    {data.topGenres.map((genre, index) => (
                      <span
                        key={index}
                        className="text-xs px-2 py-1 rounded-full bg-red-900/20 text-red-400"
                      >
                        {genre}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
              
              {/* Activity Bar */}
              <div className="mt-4">
                <div className="flex justify-between text-xs text-gray-400 mb-1">
                  <span>Active Users</span>
                  <span>{Math.round((data.activeUsers / data.userCount) * 100)}%</span>
                </div>
                <div className="w-full h-2 bg-zinc-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-green-500 rounded-full transition-all duration-300"
                    style={{ width: `${(data.activeUsers / data.userCount) * 100}%` }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
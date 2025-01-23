import { useState, useEffect } from 'react';
import { LocationService } from '../../services/api/locationService';
import { LocationData, RegionStats } from '../../types/admin';

export function useLocationInsights() {
  const [locationData, setLocationData] = useState<LocationData[]>([]);
  const [regionStats, setRegionStats] = useState<RegionStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const locationService = new LocationService();

  const loadData = async (timeRange: 'week' | 'month' | 'year' = 'month') => {
    try {
      setLoading(true);
      setError(null);
      
      if (import.meta.env.DEV) {
        // Use mock data in development
        const mockLocationData: LocationData[] = [
          {
            country: 'United States',
            userCount: 15000,
            activeUsers: 12000,
            topGenres: ['Thrash Metal', 'Death Metal', 'Heavy Metal'],
            growth: 15
          },
          {
            country: 'Germany',
            userCount: 8000,
            activeUsers: 6500,
            topGenres: ['Power Metal', 'Folk Metal', 'Black Metal'],
            growth: 12
          },
          {
            country: 'Japan',
            userCount: 6000,
            activeUsers: 4800,
            topGenres: ['Visual Kei', 'Death Metal', 'Power Metal'],
            growth: 18
          }
        ];

        const mockRegionStats: RegionStats[] = [
          {
            region: 'North America',
            countries: ['United States', 'Canada', 'Mexico'],
            totalUsers: 25000,
            activeUsers: 20000,
            percentageGrowth: 15
          },
          {
            region: 'Europe',
            countries: ['Germany', 'United Kingdom', 'Sweden'],
            totalUsers: 18000,
            activeUsers: 15000,
            percentageGrowth: 12
          },
          {
            region: 'Asia',
            countries: ['Japan', 'South Korea', 'China'],
            totalUsers: 12000,
            activeUsers: 9000,
            percentageGrowth: 20
          }
        ];

        setLocationData(mockLocationData);
        setRegionStats(mockRegionStats);
      } else {
        // Production: fetch real data
        const [insights, stats] = await Promise.all([
          locationService.getLocationInsights(timeRange),
          locationService.getRegionStats()
        ]);

        setLocationData(insights);
        setRegionStats(stats);
      }
    } catch (err) {
      console.error('Failed to load location insights:', err);
      setError('Failed to load location data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  return {
    locationData,
    regionStats,
    loading,
    error,
    refresh: loadData
  };
}
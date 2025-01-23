import { useState, useEffect } from 'react';
import { AdminService } from '../../services/api/adminService';
import { useApi } from '../useApi';

interface AnalyticsData {
  totalUsers: number;
  activeArtists: number;
  totalSongs: number;
  totalRevenue: number;
  recentOrders: Order[];
  userGrowth: { date: string; count: number }[];
  topSongs: { song: Song; plays: number }[];
}

export function useAnalytics() {
  const adminService = new AdminService();
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);

  const {
    loading,
    error,
    execute: fetchAnalytics
  } = useApi(
    () => adminService.getAnalytics(),
    {
      onSuccess: (data) => setAnalytics(data),
    }
  );

  useEffect(() => {
    fetchAnalytics();
    const interval = setInterval(fetchAnalytics, 300000); // Refresh every 5 minutes
    return () => clearInterval(interval);
  }, []);

  return {
    analytics,
    loading,
    error,
    refresh: fetchAnalytics
  };
}
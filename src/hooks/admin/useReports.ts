import { useState, useEffect } from 'react';
import { AdminService } from '../../services/api/adminService';
import { useApi } from '../useApi';

type Period = 'daily' | 'weekly' | 'monthly' | 'yearly';

interface ReportData {
  revenue: {
    data: { date: string; revenue: number }[];
    total: number;
  };
  sales: {
    data: { date: string; sales: number }[];
    total: number;
  };
  users: {
    data: { date: string; users: number }[];
    total: number;
  };
}

export function useReports(initialPeriod: Period = 'monthly') {
  const adminService = new AdminService();
  const [period, setPeriod] = useState<Period>(initialPeriod);
  const [reports, setReports] = useState<ReportData | null>(null);

  const {
    loading,
    error,
    execute: fetchReports
  } = useApi(
    async () => {
      const [revenue, sales, users] = await Promise.all([
        adminService.getRevenueReport(period),
        adminService.getSalesReport(period),
        adminService.getUserReport(period)
      ]);
      return { revenue, sales, users };
    },
    {
      onSuccess: (data) => setReports(data),
    }
  );

  useEffect(() => {
    fetchReports();
  }, [period]);

  return {
    reports,
    period,
    setPeriod,
    loading,
    error,
    refresh: fetchReports
  };
}
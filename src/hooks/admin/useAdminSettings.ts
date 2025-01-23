import { useState, useEffect } from 'react';
import { AdminService } from '../../services/api/adminService';
import { MockService } from '../../services/mockService';
import { ApiError } from '../../services/api/apiClient';
import { useApi } from '../useApi';
import { AdminSettings } from '../../types/admin';

export function useAdminSettings() {
  const adminService = new AdminService();
  const [settings, setSettings] = useState<AdminSettings | null>(null);
  const isDev = import.meta.env.DEV;
  const mockService = new MockService();

  const {
    loading,
    error,
    execute: fetchSettings
  } = useApi(
    async () => {
      if (isDev) {
        return mockService.getAdminSettings();
      }
      return adminService.getSettings();
    },
    {
      onSuccess: (data) => setSettings(data),
      onError: (error) => {
        console.error('Failed to fetch settings:', error);
        if (isDev) {
          const mockSettings = mockService.getAdminSettings();
          setSettings(mockSettings);
        }
      }
    }
  );

  useEffect(() => {
    fetchSettings();
  }, []);

  const updateSettings = async (newSettings: AdminSettings) => {
    try {
      if (isDev) {
        mockService.updateAdminSettings(newSettings);
      } else {
        await adminService.updateSettings(newSettings);
      }
      setSettings(newSettings);
      return true;
    } catch (error) {
      console.error('Failed to update settings:', error);
      return false;
    }
  };

  return {
    settings,
    loading,
    error,
    updateSettings,
    refresh: fetchSettings
  };
}
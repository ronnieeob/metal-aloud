import React, { useState, useEffect } from 'react';
import { Smartphone, Download, X } from 'lucide-react';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { useAuth } from '../contexts/AuthContext';
import { getBannerState, dismissBanner } from '../utils/bannerState';

interface AppConfig {
  androidAppUrl: string;
  minimumVersion: string;
  recommendedVersion: string;
  forceUpdate: boolean;
  updateMessage: string;
}

interface SiteSettings {
  appBanner: {
    title: string;
    subtitle: string;
    enabled: boolean;
  };
}

export function AppDownloadBanner() {
  const { user } = useAuth();
  const [showBanner, setShowBanner] = useState(true);
  const [initialized, setInitialized] = useState(false);
  const [appConfig] = useLocalStorage<AppConfig>('metal_aloud_app_config', {
    androidAppUrl: 'https://play.google.com/store/apps/details?id=com.metalaloud',
    appStoreUrl: '',
    appStoreLogo: '',
    playStoreLogo: '',
    crLogo: '/cr-logo.png',
    minimumVersion: '1.0.0',
    recommendedVersion: '1.0.0',
    forceUpdate: false,
    updateMessage: 'A new version of Metal Aloud is available!'
  });

  const [siteSettings] = useLocalStorage<SiteSettings>('metal_aloud_site_settings', {
    appBanner: {
      title: 'Get the Metal Aloud App',
      subtitle: 'Download our Android app for the best metal experience',
      enabled: true
    }
  });

  useEffect(() => {
    if (!initialized && user) {
      const bannerState = getBannerState(user);
      setShowBanner(bannerState && siteSettings.appBanner.enabled);
      setInitialized(true);
    }
  }, [initialized, user, siteSettings.appBanner.enabled]);

  // Listen for storage changes
  useEffect(() => {
    const handleStorageChange = () => {
      const newSettings = JSON.parse(localStorage.getItem('metal_aloud_site_settings') || '{}');
      if (!newSettings.appBanner?.enabled) {
        setShowBanner(false);
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const handleDismiss = () => {
    setShowBanner(false);
    dismissBanner(user);
  };

  if (!showBanner || !appConfig.androidAppUrl || !siteSettings.appBanner.enabled) return null;

  return (
    <div className="bg-gradient-to-r from-red-900/30 to-black/30 rounded-lg p-4 mb-6 relative overflow-hidden">
      <div className="absolute inset-0 bg-pattern opacity-10"></div>
      <div className="flex items-center justify-between relative z-10">
        <div className="flex items-center space-x-4">
          <Smartphone className="w-12 h-12 text-red-400" />
          <div>
            <h3 className="font-bold text-lg">{siteSettings.appBanner.title}</h3>
            <p className="text-sm text-gray-300">{siteSettings.appBanner.subtitle}</p>
          </div>
        </div>
        <div className="flex items-center space-x-4">
          <a
            href={appConfig.androidAppUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition flex items-center space-x-2"
          >
            <Download className="w-4 h-4" />
            <span>Download Now</span>
          </a>
          <button
            onClick={handleDismiss}
            className="text-gray-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
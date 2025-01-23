import React, { useState, useEffect, useRef } from 'react';
import { Smartphone, Save, Download, X, Upload } from 'lucide-react';
import { useLocalStorage } from '../../hooks/useLocalStorage';
import { useAdminSettings } from '../../hooks/useAdminSettings';

interface AppConfig {
  androidAppUrl: string;
  minimumVersion: string;
  recommendedVersion: string;
  forceUpdate: boolean;
  updateMessage: string;
  crLogo: string;
}

export function AppSettings() {
  const [config, setConfig] = useLocalStorage<AppConfig>('metal_aloud_app_config', {
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
  const { loading, saveSettings } = useAdminSettings();
  const [showAppBanner, setShowAppBanner] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadLoading, setUploadLoading] = useState(false);

  useEffect(() => {
    // Check if app banner was previously dismissed
    const dismissed = localStorage.getItem('metal_aloud_app_banner_dismissed');
    if (dismissed) {
      setShowAppBanner(false);
    }
  }, []);

  const handleDismissBanner = () => {
    setShowAppBanner(false);
    localStorage.setItem('metal_aloud_app_banner_dismissed', 'true');
  };

  const handleSave = async () => {
    try {
      setError(null);

      // Validate URL
      if (config.androidAppUrl && !isValidUrl(config.androidAppUrl)) {
        throw new Error('Please enter a valid URL for the Android app');
      }

      // Validate versions
      if (!isValidVersion(config.minimumVersion) || !isValidVersion(config.recommendedVersion)) {
        throw new Error('Please enter valid version numbers (e.g., 1.0.0)');
      }

      const result = await saveSettings('metal_aloud_app_config', config, (data) => {
        return isValidUrl(data.androidAppUrl) && 
               isValidVersion(data.minimumVersion) && 
               isValidVersion(data.recommendedVersion);
      });

      if (!result.success) {
        throw new Error(result.error);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save settings');
    }
  };

  const isValidUrl = (url: string): boolean => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  const isValidVersion = (version: string): boolean => {
    return /^\d+\.\d+\.\d+$/.test(version);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('Please upload an image file');
      return;
    }

    // Validate file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      setError('Image size must be less than 2MB');
      return;
    }

    setUploadLoading(true);
    const reader = new FileReader();
    reader.onloadend = () => {
      if (typeof reader.result === 'string') {
        setConfig(prev => ({ ...prev, crLogo: reader.result }));
        setUploadLoading(false);
      }
    };
    reader.onerror = () => {
      setError('Failed to read file');
      setUploadLoading(false);
    };
    reader.readAsDataURL(file);
  };
  return (
    <div className="bg-zinc-800/50 rounded-lg p-6 border border-red-900/20">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-2">
          <Smartphone className="w-6 h-6 text-red-400" />
          <h2 className="text-2xl font-bold text-red-500">App Settings</h2>
        </div>
      </div>

      {error && (
        <div className="bg-red-900/20 text-red-400 p-4 rounded-lg mb-6">
          {error}
        </div>
      )}

      {/* CR Logo Settings */}
      <div>
        <h3 className="text-lg font-semibold mb-4">CR Logo</h3>
        <div className="space-y-6">
          <div className="flex items-center justify-center bg-zinc-900/50 rounded-lg p-4 border border-red-900/20">
            <img
              src={config.crLogo}
              alt="CR Logo"
              className={`w-32 h-32 rounded-full border-4 border-red-500/20 shadow-2xl ${uploadLoading ? 'opacity-50' : ''}`}
            />
          </div>
          
          {/* File Upload */}
          <div className="space-y-2">
            <label className="block text-sm font-medium mb-2">Upload Logo</label>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => fileInputRef.current?.click()}
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition flex items-center space-x-2"
                disabled={uploadLoading}
              >
                <Upload className="w-4 h-4" />
                <span>{uploadLoading ? 'Uploading...' : 'Choose File'}</span>
              </button>
              <span className="text-sm text-gray-400">
                Max size: 2MB, Recommended: 256x256px
              </span>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileUpload}
              className="hidden"
            />
          </div>

          {/* URL Input */}
          <div>
            <label className="block text-sm font-medium mb-2">Or Enter Logo URL</label>
            <input
              type="url"
              value={config.crLogo}
              onChange={(e) => setConfig({ ...config, crLogo: e.target.value })}
              className="w-full bg-zinc-700 border border-red-900/20 rounded px-3 py-2"
              placeholder="https://example.com/cr-logo.png"
            />
          </div>
        </div>
      </div>
      <div className="space-y-6">
        {/* App Download Banner */}
        {showAppBanner && config.androidAppUrl && (
          <div className="bg-gradient-to-r from-red-900/30 to-black/30 rounded-lg p-4 mb-6 relative overflow-hidden">
            <div className="absolute inset-0 bg-pattern opacity-10"></div>
            <div className="flex items-center justify-between relative z-10">
              <div className="flex items-center space-x-4">
                <Smartphone className="w-12 h-12 text-red-400" />
                <div>
                  <h3 className="font-bold text-lg">Get the Metal Aloud App</h3>
                  <p className="text-sm text-gray-300">Download our Android app for the best metal experience</p>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <a
                  href={config.androidAppUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition flex items-center space-x-2"
                >
                  <Download className="w-4 h-4" />
                  <span>Download Now</span>
                </a>
                <button
                  onClick={handleDismissBanner}
                  className="text-gray-400 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* App Store Links */}
        <div>
          <h3 className="text-lg font-semibold mb-4">App Store Links</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium mb-2">Google Play Store URL</label>
              <input
                type="url"
                value={config.androidAppUrl}
                onChange={(e) => setConfig({ ...config, androidAppUrl: e.target.value })}
                className="w-full bg-zinc-700 border border-red-900/20 rounded px-3 py-2"
                placeholder="https://play.google.com/store/apps/..."
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">App Store URL</label>
              <input
                type="url"
                value={config.appStoreUrl}
                onChange={(e) => setConfig({ ...config, appStoreUrl: e.target.value })}
                className="w-full bg-zinc-700 border border-red-900/20 rounded px-3 py-2"
                placeholder="https://apps.apple.com/..."
              />
            </div>
          </div>
        </div>

        {/* Store Logos */}
        <div>
          <h3 className="text-lg font-semibold mb-4">Store Logos</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium mb-2">Google Play Logo</label>
              <div className="space-y-2">
                {config.playStoreLogo && (
                  <img
                    src={config.playStoreLogo}
                    alt="Google Play Logo"
                    className="h-14 object-contain bg-zinc-800 rounded p-2"
                  />
                )}
                <input
                  type="url"
                  value={config.playStoreLogo}
                  onChange={(e) => setConfig({ ...config, playStoreLogo: e.target.value })}
                  className="w-full bg-zinc-700 border border-red-900/20 rounded px-3 py-2"
                  placeholder="https://example.com/play-store-logo.png"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">App Store Logo</label>
              <div className="space-y-2">
                {config.appStoreLogo && (
                  <img
                    src={config.appStoreLogo}
                    alt="App Store Logo"
                    className="h-14 object-contain bg-zinc-800 rounded p-2"
                  />
                )}
                <input
                  type="url"
                  value={config.appStoreLogo}
                  onChange={(e) => setConfig({ ...config, appStoreLogo: e.target.value })}
                  className="w-full bg-zinc-700 border border-red-900/20 rounded px-3 py-2"
                  placeholder="https://example.com/app-store-logo.png"
                />
              </div>
            </div>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Android App URL</label>
          <input
            type="url"
            value={config.androidAppUrl}
            onChange={(e) => setConfig({ ...config, androidAppUrl: e.target.value })}
            className="w-full bg-zinc-700 border border-red-900/20 rounded px-3 py-2"
            placeholder="Enter Google Play Store URL"
          />
          <p className="text-sm text-gray-400 mt-1">
            Enter the Google Play Store URL for your Android app
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">Minimum Version</label>
            <input
              type="text"
              value={config.minimumVersion}
              onChange={(e) => setConfig({ ...config, minimumVersion: e.target.value })}
              className="w-full bg-zinc-700 border border-red-900/20 rounded px-3 py-2"
              placeholder="1.0.0"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Recommended Version</label>
            <input
              type="text"
              value={config.recommendedVersion}
              onChange={(e) => setConfig({ ...config, recommendedVersion: e.target.value })}
              className="w-full bg-zinc-700 border border-red-900/20 rounded px-3 py-2"
              placeholder="1.0.0"
            />
          </div>
        </div>

        <div>
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={config.forceUpdate}
              onChange={(e) => setConfig({ ...config, forceUpdate: e.target.checked })}
              className="rounded bg-zinc-700 border-red-900/20 text-red-500"
            />
            <span>Force users to update to latest version</span>
          </label>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Update Message</label>
          <textarea
            value={config.updateMessage}
            onChange={(e) => setConfig({ ...config, updateMessage: e.target.value })}
            className="w-full h-24 bg-zinc-700 border border-red-900/20 rounded px-3 py-2"
            placeholder="Enter the message to show users when an update is available"
          />
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
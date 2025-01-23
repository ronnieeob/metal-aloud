import React, { useState } from 'react';
import { DollarSign, Save, Key } from 'lucide-react';
import { useAdminSettings } from '../../hooks/useAdminSettings';

interface AdsSettings {
  enabled: boolean;
  googleAdsId: string;
  facebookAdsId: string;
  adPositions: {
    header: boolean;
    sidebar: boolean;
    betweenSongs: boolean;
    footer: boolean;
  };
  frequency: {
    songInterval: number;
    maxAdsPerHour: number;
  };
}

export function AdsSettings() {
  const [settings, setSettings] = useState<AdsSettings>({
    enabled: true,
    googleAdsId: '',
    facebookAdsId: '',
    adPositions: {
      header: true,
      sidebar: true,
      betweenSongs: true,
      footer: false
    },
    frequency: {
      songInterval: 5,
      maxAdsPerHour: 10
    }
  });
  const { loading, saveSettings } = useAdminSettings();
  const [error, setError] = useState<string | null>(null);

  const handleSave = async () => {
    try {
      setError(null);
      
      const result = await saveSettings('metal_aloud_ads_settings', settings);
      if (!result.success) {
        throw new Error(result.error);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save settings');
      console.error(err);
    }
  };

  return (
    <div className="bg-zinc-800/50 rounded-lg p-6 border border-red-900/20">
      <h2 className="text-2xl font-bold text-red-500 mb-6">Ads Settings</h2>

      {error && (
        <div className="bg-red-900/20 text-red-400 p-4 rounded-lg mb-6">
          {error}
        </div>
      )}

      <div className="space-y-6">
        {/* Enable/Disable Ads */}
        <div className="flex items-center justify-between p-4 bg-zinc-900/50 rounded-lg">
          <div>
            <h3 className="font-semibold">Enable Advertisements</h3>
            <p className="text-sm text-gray-400">Show ads to non-premium users</p>
          </div>
          <button
            onClick={() => setSettings(prev => ({ ...prev, enabled: !prev.enabled }))}
            className={`relative w-14 h-7 transition-colors rounded-full ${
              settings.enabled ? 'bg-red-600' : 'bg-zinc-700'
            }`}
          >
            <div
              className={`absolute w-5 h-5 bg-white rounded-full top-1 transition-transform ${
                settings.enabled ? 'right-1' : 'left-1'
              }`}
            />
          </button>
        </div>

        {/* Ad Network Keys */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold flex items-center space-x-2">
            <Key className="w-5 h-5 text-red-400" />
            <span>Ad Network Keys</span>
          </h3>
          
          <div className="grid gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Google Ads Client ID</label>
              <input
                type="text"
                value={settings.googleAdsId}
                onChange={(e) => setSettings(prev => ({ 
                  ...prev, 
                  googleAdsId: e.target.value 
                }))}
                className="w-full bg-zinc-700 border border-red-900/20 rounded px-3 py-2"
                placeholder="ca-pub-..."
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">Facebook Ads ID</label>
              <input
                type="text"
                value={settings.facebookAdsId}
                onChange={(e) => setSettings(prev => ({ 
                  ...prev, 
                  facebookAdsId: e.target.value 
                }))}
                className="w-full bg-zinc-700 border border-red-900/20 rounded px-3 py-2"
                placeholder="FB-..."
              />
            </div>
          </div>
        </div>

        {/* Ad Positions */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Ad Positions</h3>
          <div className="grid grid-cols-2 gap-4">
            {Object.entries(settings.adPositions).map(([position, enabled]) => (
              <div key={position} className="flex items-center justify-between p-4 bg-zinc-900/50 rounded-lg">
                <span className="capitalize">{position.replace(/([A-Z])/g, ' $1')}</span>
                <button
                  onClick={() => setSettings(prev => ({
                    ...prev,
                    adPositions: {
                      ...prev.adPositions,
                      [position]: !enabled
                    }
                  }))}
                  className={`relative w-14 h-7 transition-colors rounded-full ${
                    enabled ? 'bg-red-600' : 'bg-zinc-700'
                  }`}
                >
                  <div
                    className={`absolute w-5 h-5 bg-white rounded-full top-1 transition-transform ${
                      enabled ? 'right-1' : 'left-1'
                    }`}
                  />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Ad Frequency */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Ad Frequency</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Songs Between Ads</label>
              <input
                type="number"
                min="1"
                max="20"
                value={settings.frequency.songInterval}
                onChange={(e) => setSettings(prev => ({
                  ...prev,
                  frequency: {
                    ...prev.frequency,
                    songInterval: parseInt(e.target.value)
                  }
                }))}
                className="w-full bg-zinc-700 border border-red-900/20 rounded px-3 py-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Max Ads Per Hour</label>
              <input
                type="number"
                min="1"
                max="20"
                value={settings.frequency.maxAdsPerHour}
                onChange={(e) => setSettings(prev => ({
                  ...prev,
                  frequency: {
                    ...prev.frequency,
                    maxAdsPerHour: parseInt(e.target.value)
                  }
                }))}
                className="w-full bg-zinc-700 border border-red-900/20 rounded px-3 py-2"
              />
            </div>
          </div>
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
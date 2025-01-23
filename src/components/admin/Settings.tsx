import React, { useState } from 'react';
import { Save, Image, Upload } from 'lucide-react';
import { SpotifySettings } from './SpotifySettings';
import { FileUploadZone } from './FileUploadZone';
import { useAdminSettings } from '../../hooks/useAdminSettings';

interface BrandingSettings {
  websiteImage: string;
  favicon: string;
}

export function Settings() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { saveSettings } = useAdminSettings();
  const [branding, setBranding] = useState<BrandingSettings>({
    websiteImage: localStorage.getItem('metal_aloud_website_image') || '',
    favicon: localStorage.getItem('metal_aloud_favicon') || ''
  });

  const handleSave = async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await saveSettings('metal_aloud_branding', branding, (data) => {
        return data.websiteImage && data.favicon;
      });

      if (!result.success) {
        throw new Error(result.error);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save settings');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-zinc-800/50 rounded-lg p-6 border border-red-900/20">
      <h2 className="text-2xl font-bold text-red-500 mb-6">System Settings</h2>

      {error && (
        <div className="bg-red-900/20 text-red-400 p-4 rounded-lg mb-6">
          {error}
        </div>
      )}

      <div className="space-y-6">
        {/* Branding Settings */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold flex items-center space-x-2">
            <Image className="w-5 h-5 text-red-400" />
            <span>Branding</span>
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Website Image */}
            <div>
              <label className="block text-sm font-medium mb-2">Website Image</label>
              <div className="space-y-4">
                {branding.websiteImage && (
                  <img
                    src={branding.websiteImage}
                    alt="Website"
                    className="w-48 h-48 object-contain bg-zinc-900/50 rounded-lg border border-red-900/20"
                  />
                )}
                <FileUploadZone
                  type="images"
                  accept="image/*"
                  multiple={false}
                  maxSize={2}
                  onFilesSelected={(files) => {
                    if (files[0]) {
                      const reader = new FileReader();
                      reader.onloadend = () => {
                        setBranding(prev => ({
                          ...prev,
                          websiteImage: reader.result as string
                        }));
                      };
                      reader.readAsDataURL(files[0]);
                    }
                  }}
                />
              </div>
            </div>
            
            {/* Favicon */}
            <div>
              <label className="block text-sm font-medium mb-2">Favicon</label>
              <div className="space-y-4">
                {branding.favicon && (
                  <img
                    src={branding.favicon}
                    alt="Favicon"
                    className="w-16 h-16 object-contain bg-zinc-900/50 rounded-lg border border-red-900/20"
                  />
                )}
                <FileUploadZone
                  type="images"
                  accept=".ico,.png"
                  multiple={false}
                  maxSize={0.5}
                  onFilesSelected={(files) => {
                    if (files[0]) {
                      const reader = new FileReader();
                      reader.onloadend = () => {
                        setBranding(prev => ({
                          ...prev,
                          favicon: reader.result as string
                        }));
                      };
                      reader.readAsDataURL(files[0]);
                    }
                  }}
                />
                <p className="text-xs text-gray-400">
                  Recommended: 32x32 or 16x16 ICO/PNG file, max 500KB
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Spotify Settings */}
        <SpotifySettings />

        <div className="flex justify-end space-x-4 pt-6 mt-6 border-t border-blue-900/20">
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 text-gray-400 hover:text-white transition"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={loading}
            className="flex items-center space-x-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span>{loading ? 'Saving...' : 'Save Changes'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
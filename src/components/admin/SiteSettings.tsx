import React, { useState, useRef } from 'react';
import { Globe, Save, Image, Upload } from 'lucide-react';
import { syncBackgroundImage } from '../../utils/imageSync';
import { useLocalStorage } from '../../hooks/useLocalStorage';

interface SiteSettings {
  title: string;
  description: string;
  keywords: string;
  appBanner: {
    title: string;
    subtitle: string;
    enabled: boolean;
  };
  social: {
    twitter: string;
    facebook: string;
    instagram: string;
    youtube: string;
  };
  contact: {
    email: string;
    phone: string;
    address: string;
  };
  meta: {
    googleAnalyticsId: string;
    facebookPixelId: string;
    twitterHandle: string;
    backgroundImage: string;
  };
}

export function SiteSettings() {
  const [settings, setSettings] = useLocalStorage<SiteSettings>('metal_aloud_site_settings', {
    title: 'Metal Aloud | Ultimate Metal Music Streaming Platform 🤘',
    description: 'Discover and stream the heaviest metal music. Join Metal Aloud for unlimited access to thrash, death, black, and power metal. Start headbanging today! 🎸',
    keywords: 'metal music, streaming, heavy metal, thrash metal, death metal, black metal, power metal, metal bands, metal songs, metal albums',
    appBanner: {
      title: 'Get the Metal Aloud App',
      subtitle: 'Download our Android app for the best metal experience',
      enabled: true
    },
    social: {
      twitter: '',
      facebook: '',
      instagram: '',
      youtube: ''
    },
    contact: {
      email: 'support@metalaloud.com',
      phone: '',
      address: ''
    },
    meta: {
      googleAnalyticsId: '',
      facebookPixelId: '',
      twitterHandle: '',
      backgroundImage: 'https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3'
    }
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploadLoading, setUploadLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSave = async () => {
    try {
      setLoading(true);
      setError(null);

      // Validate required fields
      if (!settings.title.trim() || !settings.description.trim()) {
        throw new Error('Title and description are required');
      }

      // Ensure backgroundImage has a value
      if (!settings.meta.backgroundImage) {
        setSettings(prev => ({
          ...prev,
          meta: {
            ...prev.meta,
            backgroundImage: 'https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3'
          }
        }));
      }
      // Update meta tags
      document.title = settings.title;
      document.querySelector('meta[name="description"]')?.setAttribute('content', settings.description);
      document.querySelector('meta[name="keywords"]')?.setAttribute('content', settings.keywords);
      
      // Update social meta tags
      document.querySelector('meta[property="og:title"]')?.setAttribute('content', settings.title);
      document.querySelector('meta[property="og:description"]')?.setAttribute('content', settings.description);
      document.querySelector('meta[name="twitter:title"]')?.setAttribute('content', settings.title);
      document.querySelector('meta[name="twitter:description"]')?.setAttribute('content', settings.description);

      // Show success message
      const message = document.createElement('div');
      message.className = 'fixed top-4 right-4 bg-green-600 text-white px-6 py-3 rounded-lg shadow-lg z-50';
      message.textContent = 'Site settings saved successfully';
      document.body.appendChild(message);
      setTimeout(() => message.remove(), 3000);

      // Force refresh app banners
      window.dispatchEvent(new Event('storage'));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save settings');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-zinc-800/50 rounded-lg p-6 border border-red-900/20">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-2">
          <Globe className="w-6 h-6 text-red-400" />
          <h2 className="text-2xl font-bold text-red-500">Site Settings</h2>
        </div>
      </div>

      {error && (
        <div className="bg-red-900/20 text-red-400 p-4 rounded-lg mb-6">
          {error}
        </div>
      )}

      <div className="space-y-6">
        {/* Background Image Settings */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold flex items-center space-x-2">
            <Image className="w-5 h-5 text-red-400" />
            <span>Background Image</span>
          </h3>
          
          <div className="bg-zinc-900/50 p-6 rounded-lg border border-red-900/10 space-y-4">
            <div className="relative">
              <img
                src={settings.meta.backgroundImage}
                alt="Background Preview"
                className="w-full h-48 object-cover rounded-lg"
              />
              <div className="absolute inset-0 bg-black/50 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center">
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition flex items-center space-x-2"
                >
                  <Upload className="w-4 h-4" />
                  <span>Change Background</span>
                </button>
              </div>
            </div>
            
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (!file) return;

                // Validate file size (max 5MB)
                if (file.size > 5 * 1024 * 1024) {
                  setError('Image must be less than 5MB');
                  return;
                }

                setUploadLoading(true);
                const reader = new FileReader();
                reader.onloadend = () => {
                  if (typeof reader.result === 'string') {
                    setSettings(prev => ({
                      ...prev,
                      meta: {
                        ...prev.meta,
                        backgroundImage: reader.result
                      }
                    }));
                    // Sync background image
                    syncBackgroundImage(reader.result);
                  }
                  setUploadLoading(false);
                };
                reader.readAsDataURL(file);
              }}
              className="hidden"
            />
            
            <div className="text-sm text-gray-400">
              Recommended: 1920x1080px or larger, max 5MB. Image will be automatically resized and optimized.
            </div>
            
            {/* Background URL Input */}
            <div>
              <label className="block text-sm font-medium mb-2">Or enter image URL</label>
              <input
                type="url"
                value={settings.meta.backgroundImage}
                onChange={(e) => {
                  setSettings(prev => ({
                    ...prev,
                    meta: {
                      ...prev.meta,
                      backgroundImage: e.target.value
                    }
                  }));
                  // Sync background image
                  syncBackgroundImage(e.target.value);
                }}
                className="w-full bg-zinc-800 border border-red-900/20 rounded px-3 py-2"
                placeholder="https://example.com/background.jpg"
              />
            </div>
          </div>
        </div>

        {/* SEO Settings */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">SEO Settings</h3>
          
          <div>
            <label className="block text-sm font-medium mb-2">Site Title</label>
            <input
              type="text"
              value={settings.title}
              onChange={(e) => setSettings({ ...settings, title: e.target.value })}
              className="w-full bg-zinc-700 border border-red-900/20 rounded px-3 py-2"
              placeholder="Metal Aloud | Ultimate Metal Music Streaming Platform"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Meta Description</label>
            <textarea
              value={settings.description}
              onChange={(e) => setSettings({ ...settings, description: e.target.value })}
              className="w-full h-24 bg-zinc-700 border border-red-900/20 rounded px-3 py-2"
              placeholder="Describe your site in 150-160 characters"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Keywords</label>
            <input
              type="text"
              value={settings.keywords}
              onChange={(e) => setSettings({ ...settings, keywords: e.target.value })}
              className="w-full bg-zinc-700 border border-red-900/20 rounded px-3 py-2"
              placeholder="metal, music, streaming, heavy metal (comma separated)"
            />
          </div>
        </div>

        {/* App Banner Settings */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">App Banner Settings</h3>
          
          <div className="flex items-center justify-between p-4 bg-zinc-900/50 rounded-lg">
            <div>
              <h4 className="font-medium">Show App Banner</h4>
              <p className="text-sm text-gray-400">Display app download banner to users</p>
            </div>
            <button
              onClick={() => setSettings(prev => ({
                ...prev,
                appBanner: { ...prev.appBanner, enabled: !prev.appBanner.enabled }
              }))}
              className={`relative w-14 h-7 transition-colors rounded-full ${
                settings.appBanner.enabled ? 'bg-red-600' : 'bg-zinc-700'
              }`}
            >
              <div
                className={`absolute w-5 h-5 bg-white rounded-full top-1 transition-transform ${
                  settings.appBanner.enabled ? 'right-1' : 'left-1'
                }`}
              />
            </button>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Banner Title</label>
            <input
              type="text"
              value={settings.appBanner.title}
              onChange={(e) => setSettings(prev => ({
                ...prev,
                appBanner: { ...prev.appBanner, title: e.target.value }
              }))}
              className="w-full bg-zinc-700 border border-red-900/20 rounded px-3 py-2"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Banner Subtitle</label>
            <input
              type="text"
              value={settings.appBanner.subtitle}
              onChange={(e) => setSettings(prev => ({
                ...prev,
                appBanner: { ...prev.appBanner, subtitle: e.target.value }
              }))}
              className="w-full bg-zinc-700 border border-red-900/20 rounded px-3 py-2"
            />
          </div>
        </div>

        {/* Social Media Settings */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Social Media</h3>
          {Object.entries(settings.social).map(([platform, url]) => (
            <div key={platform}>
              <label className="block text-sm font-medium mb-2 capitalize">{platform}</label>
              <input
                type="url"
                value={url}
                onChange={(e) => setSettings(prev => ({
                  ...prev,
                  social: { ...prev.social, [platform]: e.target.value }
                }))}
                className="w-full bg-zinc-700 border border-red-900/20 rounded px-3 py-2"
                placeholder={`https://${platform}.com/metalaloud`}
              />
            </div>
          ))}
        </div>

        {/* Contact Information */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Contact Information</h3>
          <div>
            <label className="block text-sm font-medium mb-2">Support Email</label>
            <input
              type="email"
              value={settings.contact.email}
              onChange={(e) => setSettings(prev => ({
                ...prev,
                contact: { ...prev.contact, email: e.target.value }
              }))}
              className="w-full bg-zinc-700 border border-red-900/20 rounded px-3 py-2"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Phone</label>
            <input
              type="tel"
              value={settings.contact.phone}
              onChange={(e) => setSettings(prev => ({
                ...prev,
                contact: { ...prev.contact, phone: e.target.value }
              }))}
              className="w-full bg-zinc-700 border border-red-900/20 rounded px-3 py-2"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Address</label>
            <textarea
              value={settings.contact.address}
              onChange={(e) => setSettings(prev => ({
                ...prev,
                contact: { ...prev.contact, address: e.target.value }
              }))}
              className="w-full h-24 bg-zinc-700 border border-red-900/20 rounded px-3 py-2"
            />
          </div>
        </div>

        {/* Analytics Settings */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Analytics & Tracking</h3>

          <div>
            <label className="block text-sm font-medium mb-2">Google Analytics ID</label>
            <input
              type="text"
              value={settings.meta.googleAnalyticsId}
              onChange={(e) => setSettings(prev => ({
                ...prev,
                meta: { ...prev.meta, googleAnalyticsId: e.target.value }
              }))}
              className="w-full bg-zinc-700 border border-red-900/20 rounded px-3 py-2"
              placeholder="G-XXXXXXXXXX"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Facebook Pixel ID</label>
            <input
              type="text"
              value={settings.meta.facebookPixelId}
              onChange={(e) => setSettings(prev => ({
                ...prev,
                meta: { ...prev.meta, facebookPixelId: e.target.value }
              }))}
              className="w-full bg-zinc-700 border border-red-900/20 rounded px-3 py-2"
              placeholder="XXXXXXXXXX"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Twitter Handle</label>
            <input
              type="text"
              value={settings.meta.twitterHandle}
              onChange={(e) => setSettings(prev => ({
                ...prev,
                meta: { ...prev.meta, twitterHandle: e.target.value }
              }))}
              className="w-full bg-zinc-700 border border-red-900/20 rounded px-3 py-2"
              placeholder="@metalaloud"
            />
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
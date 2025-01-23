import React, { useState } from 'react';
import { Type, Save } from 'lucide-react';
import { FontFamily } from '../../contexts/SettingsContext';
import { useSettings } from '../../contexts/SettingsContext';
import { FontConfig } from '../../types/settings';

export function FontSettings() {
  const { adminSettings, updateFontFamily } = useSettings();
  const [fonts] = useState<FontConfig[]>([
    {
      id: 'metal',
      name: 'Metal',
      family: "'Metal Mania', cursive",
      enabled: true,
      default: true,
      previewText: 'METAL ALOUD 🤘'
    },
    {
      id: 'gothic',
      name: 'Gothic',
      family: "'Gothic A1', sans-serif",
      enabled: true,
      previewText: 'Dark & Mysterious'
    },
    {
      id: 'brutal',
      name: 'Brutal',
      family: "'Roboto Condensed', sans-serif",
      enabled: true,
      previewText: 'HARDCORE STYLE'
    },
    {
      id: 'elegant',
      name: 'Elegant',
      family: "'Cinzel', serif",
      enabled: true,
      previewText: 'Symphonic Metal'
    },
    {
      id: 'system',
      name: 'System',
      family: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
      enabled: true,
      previewText: 'Clean & Clear'
    }
  ]);

  const [loading, setLoading] = useState(false);

  const handleToggleFont = (id: FontFamily) => {
    updateFontFamily(id);
  };

  const handleSetDefault = (id: FontFamily) => {
    updateFontFamily(id);
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      
      // Show success message
      const message = document.createElement('div');
      message.className = 'fixed top-4 right-4 bg-green-600 text-white px-6 py-3 rounded-lg shadow-lg z-50';
      message.textContent = 'Font settings saved successfully';
      document.body.appendChild(message);
      setTimeout(() => message.remove(), 3000);
    } catch (err) {
      console.error('Failed to save font settings:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-zinc-800/50 rounded-lg p-6 border border-red-900/20">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-2">
          <Type className="w-6 h-6 text-red-400" />
          <h2 className="text-xl font-bold text-red-500">Font Settings</h2>
        </div>
        <button
          onClick={handleSave}
          disabled={loading}
          className="flex items-center space-x-2 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition disabled:opacity-50"
        >
          <Save className="w-4 h-4" />
          <span>{loading ? 'Saving...' : 'Save Changes'}</span>
        </button>
      </div>

      <div className="grid gap-4">
        {fonts.map((font) => (
          <div
            key={font.id}
            className="flex items-center justify-between p-4 bg-zinc-900/50 rounded-lg border border-red-900/10"
          >
            <div className="flex-1 relative">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-3">
                  <div className={`w-4 h-4 rounded-full border-2 ${
                    adminSettings.fontFamily === font.id ? 'border-white bg-red-600' : 'border-gray-400'
                  }`} />
                  <h3 className="font-medium">{font.name}</h3>
                </div>
                <div className="flex items-center space-x-4">
                  <label className="flex items-center space-x-2">
                    <input
                      type="radio"
                      name="default_font"
                      checked={font.default || false}
                      onChange={() => handleSetDefault(font.id)}
                      className="form-radio text-red-600"
                    />
                    <span className="text-sm">Default</span>
                  </label>

                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={font.enabled || false}
                      onChange={() => handleToggleFont(font.id)}
                      className="form-checkbox text-red-600"
                    />
                    <span className="text-sm">Enabled</span>
                  </label>
                </div>
              </div>
              <div className="mt-2 p-3 bg-zinc-800 rounded">
                <p style={{ fontFamily: font.family }} className="text-lg">
                  {font.previewText}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
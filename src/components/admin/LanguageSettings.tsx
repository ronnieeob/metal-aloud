import React, { useState } from 'react';
import { Globe, Save } from 'lucide-react';
import { Language } from '../../contexts/SettingsContext';
import { useLocalStorage } from '../../hooks/useLocalStorage';
import { LanguageConfig } from '../../types/settings';

export function LanguageSettings() {
  const [languages, setLanguages] = useLocalStorage<LanguageConfig[]>('metal_aloud_language_config', [
    { code: 'en', name: 'English', flag: '🇺🇸', enabled: true, default: true },
    { code: 'es', name: 'Español', flag: '🇪🇸', enabled: true },
    { code: 'de', name: 'Deutsch', flag: '🇩🇪', enabled: true },
    { code: 'fr', name: 'Français', flag: '🇫🇷', enabled: true },
    { code: 'ja', name: '日本語', flag: '🇯🇵', enabled: true },
    { code: 'zh', name: '中文', flag: '🇨🇳', enabled: true },
    { code: 'ko', name: '한국어', flag: '🇰🇷', enabled: true },
    { code: 'ru', name: 'Русский', flag: '🇷🇺', enabled: true }
  ]);

  const [loading, setLoading] = useState(false);

  const handleToggleLanguage = (code: Language) => {
    setLanguages(prev => prev.map(lang => 
      lang.code === code ? { ...lang, enabled: !lang.enabled } : lang
    ));
  };

  const handleSetDefault = (code: Language) => {
    setLanguages(prev => prev.map(lang => ({
      ...lang,
      default: lang.code === code
    })));
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      // In production, save to database
      localStorage.setItem('metal_aloud_language_config', JSON.stringify(languages));
      
      // Show success message
      const message = document.createElement('div');
      message.className = 'fixed top-4 right-4 bg-green-600 text-white px-6 py-3 rounded-lg shadow-lg z-50';
      message.textContent = 'Language settings saved successfully';
      document.body.appendChild(message);
      setTimeout(() => message.remove(), 3000);
    } catch (err) {
      console.error('Failed to save language settings:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-zinc-800/50 rounded-lg p-6 border border-red-900/20">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-2">
          <Globe className="w-6 h-6 text-red-400" />
          <h2 className="text-xl font-bold text-red-500">Language Settings</h2>
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
        {languages.map((lang) => (
          <div
            key={lang.code}
            className="flex items-center justify-between p-4 bg-zinc-900/50 rounded-lg border border-red-900/10"
          >
            <div className="flex items-center space-x-4">
              <span className="text-2xl">{lang.flag}</span>
              <div>
                <h3 className="font-medium">{lang.name}</h3>
                <p className="text-sm text-gray-400">{lang.code.toUpperCase()}</p>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <label className="flex items-center space-x-2">
                <input
                  type="radio"
                  name="default_language"
                  checked={lang.default || false}
                  onChange={() => handleSetDefault(lang.code)}
                  className="form-radio text-red-600"
                />
                <span className="text-sm">Default</span>
              </label>

              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={lang.enabled || false}
                  onChange={() => handleToggleLanguage(lang.code)}
                  className="form-checkbox text-red-600"
                />
                <span className="text-sm">Enabled</span>
              </label>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
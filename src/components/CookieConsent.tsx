import React, { useState, useEffect } from 'react';
import { Cookie, X, ChevronDown, ChevronUp } from 'lucide-react';

interface CookieSettings {
  necessary: boolean;
  analytics: boolean;
  marketing: boolean;
  preferences: boolean;
}

export function CookieConsent() {
  const [show, setShow] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [settings, setSettings] = useState<CookieSettings>({
    necessary: true, // Always true and unchangeable
    analytics: true,
    marketing: false,
    preferences: true
  });

  useEffect(() => {
    // Check if user has already consented
    const consent = localStorage.getItem('metal_aloud_cookie_consent');
    if (!consent) {
      setShow(true);
    }
  }, []);

  const handleAcceptAll = () => {
    setSettings({
      necessary: true,
      analytics: true,
      marketing: true,
      preferences: true
    });
    saveCookiePreferences({
      necessary: true,
      analytics: true,
      marketing: true,
      preferences: true
    });
  };

  const handleAcceptSelected = () => {
    saveCookiePreferences(settings);
  };

  const saveCookiePreferences = (preferences: CookieSettings) => {
    localStorage.setItem('metal_aloud_cookie_consent', JSON.stringify({
      preferences,
      timestamp: new Date().toISOString()
    }));
    setShow(false);

    // Show success message
    const message = document.createElement('div');
    message.className = 'fixed bottom-4 left-4 bg-green-600 text-white px-4 py-2 rounded-lg shadow-lg z-50';
    message.textContent = 'Cookie preferences saved!';
    document.body.appendChild(message);
    setTimeout(() => message.remove(), 3000);
  };

  if (!show) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-zinc-900/95 border-t border-red-900/20 p-4 z-50 backdrop-blur-lg">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-start justify-between">
          <div className="flex items-start space-x-4">
            <Cookie className="w-6 h-6 text-red-400 flex-shrink-0 mt-1" />
            <div>
              <h3 className="text-lg font-semibold mb-2">Cookie Preferences</h3>
              <p className="text-sm text-gray-400 max-w-2xl">
                We use cookies to enhance your metal experience, analyze site traffic, and provide personalized content. 
                Click "Accept All" to consent to all cookies, or customize your preferences below.
              </p>
              
              <button
                onClick={() => setShowDetails(!showDetails)}
                className="flex items-center space-x-1 text-red-400 hover:text-red-300 mt-2 text-sm"
              >
                <span>Cookie Settings</span>
                {showDetails ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>

              {showDetails && (
                <div className="mt-4 space-y-3">
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={settings.necessary}
                      disabled
                      className="rounded bg-zinc-700 border-red-900/20 text-red-500 cursor-not-allowed"
                    />
                    <div>
                      <span className="font-medium">Necessary</span>
                      <p className="text-xs text-gray-400">Required for the website to function properly</p>
                    </div>
                  </label>

                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={settings.analytics}
                      onChange={(e) => setSettings(prev => ({ ...prev, analytics: e.target.checked }))}
                      className="rounded bg-zinc-700 border-red-900/20 text-red-500"
                    />
                    <div>
                      <span className="font-medium">Analytics</span>
                      <p className="text-xs text-gray-400">Help us improve by tracking usage patterns</p>
                    </div>
                  </label>

                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={settings.marketing}
                      onChange={(e) => setSettings(prev => ({ ...prev, marketing: e.target.checked }))}
                      className="rounded bg-zinc-700 border-red-900/20 text-red-500"
                    />
                    <div>
                      <span className="font-medium">Marketing</span>
                      <p className="text-xs text-gray-400">Personalized recommendations and promotions</p>
                    </div>
                  </label>

                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={settings.preferences}
                      onChange={(e) => setSettings(prev => ({ ...prev, preferences: e.target.checked }))}
                      className="rounded bg-zinc-700 border-red-900/20 text-red-500"
                    />
                    <div>
                      <span className="font-medium">Preferences</span>
                      <p className="text-xs text-gray-400">Remember your settings and preferences</p>
                    </div>
                  </label>
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <button
              onClick={handleAcceptSelected}
              className="px-4 py-2 text-sm text-gray-400 hover:text-white transition"
            >
              Accept Selected
            </button>
            <button
              onClick={handleAcceptAll}
              className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition text-sm"
            >
              Accept All
            </button>
            <button
              onClick={() => setShow(false)}
              className="text-gray-400 hover:text-white p-1"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
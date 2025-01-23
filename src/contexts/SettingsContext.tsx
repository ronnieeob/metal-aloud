import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { useAuth } from './AuthContext';

export type FontFamily = 'metal' | 'gothic' | 'brutal' | 'elegant' | 'system';

interface Settings {
  fontFamily: FontFamily;
  appBanner: {
    enabled: boolean;
    title: string;
    subtitle: string;
  };
}

interface SettingsContextType {
  settings: Settings;
  adminSettings: Settings;
  updateFontFamily: (font: FontFamily) => void;
}

const SettingsContext = createContext<SettingsContextType | null>(null);

export const DEFAULT_SETTINGS: Settings = {
  fontFamily: 'metal',
  appBanner: {
    enabled: true,
    title: 'Get the Metal Aloud App',
    subtitle: 'Download our Android app for the best metal experience'
  }
};

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useLocalStorage<Settings>('metal_aloud_user_settings', DEFAULT_SETTINGS);
  const [adminSettings, setAdminSettings] = useLocalStorage<Settings>('metal_aloud_admin_settings', DEFAULT_SETTINGS);
  const { user } = useAuth();

  useEffect(() => {
    // Update font styles
    updateFontStyles(settings.fontFamily);
  }, [settings.fontFamily]);

  const updateFontStyles = (font: FontFamily) => {
    const root = document.documentElement;
    root.style.setProperty('--font-family', getFontFamily(font));
    
    // Remove all existing font classes
    document.body.classList.remove('font-metal', 'font-gothic', 'font-brutal', 'font-elegant', 'font-system');
    
    // Add new font class
    document.body.classList.add(`font-${font}`);
  };

  const getFontFamily = (font: FontFamily): string => {
    switch (font) {
      case 'metal':
        return "'Metal Mania', cursive";
      case 'gothic':
        return "'Gothic A1', sans-serif";
      case 'brutal':
        return "'Brutal Type', sans-serif";
      case 'elegant':
        return "'Cinzel', serif";
      default:
        return "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
    }
  };

  const updateFontFamily = (font: FontFamily) => {
    if (!user) return;
    
    const isAdmin = user?.role === 'admin';
    const storageKey = isAdmin ? 'metal_aloud_admin_settings' : 'metal_aloud_user_settings';
    
    // Update settings in localStorage
    if (isAdmin) {
      setAdminSettings(prev => ({ ...prev, fontFamily: font }));
    } else {
      setSettings(prev => ({ ...prev, fontFamily: font }));
    }
    
    // Apply font changes immediately
    updateFontStyles(font);
  };

  return (
    <SettingsContext.Provider value={{
      settings,
      adminSettings,
      updateFontFamily
    }}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
}
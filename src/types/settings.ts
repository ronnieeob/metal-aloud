import { Language, FontFamily } from '../contexts/SettingsContext';

export interface LanguageConfig {
  code: Language;
  name: string;
  flag: string;
  enabled: boolean;
  default?: boolean;
}

export interface FontConfig {
  id: FontFamily;
  name: string;
  family: string;
  enabled: boolean;
  default?: boolean;
  previewText: string;
}

export interface UserSettings {
  language: Language;
  fontFamily: FontFamily;
  theme: 'light' | 'dark';
  notifications: {
    email: boolean;
    push: boolean;
    inApp: boolean;
  };
}
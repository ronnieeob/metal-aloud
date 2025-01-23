import React from 'react';
import { Type } from 'lucide-react';
import { FontFamily, useSettings } from '../../contexts/SettingsContext';

const fonts: { id: FontFamily; name: string; sample: string; description: string }[] = [
  { id: 'metal', name: 'Metal', sample: 'METAL ALOUD 🤘' },
  { id: 'gothic', name: 'Gothic', sample: 'Dark & Mysterious', description: 'Modern gothic style' },
  { id: 'brutal', name: 'Brutal', sample: 'HARDCORE STYLE', description: 'Bold and aggressive' },
  { id: 'elegant', name: 'Elegant', sample: 'Symphonic Metal', description: 'Refined and classic' },
  { id: 'system', name: 'System', sample: 'Clean & Clear', description: 'Default system font' }
];

export function FontSelector() {
  const { settings, updateFontFamily } = useSettings();

  return (
    <div className="space-y-4">
      <div className="flex items-center space-x-2 text-red-400">
        <Type className="w-5 h-5" />
        <h3 className="text-lg font-semibold">Font Style</h3>
      </div>

      <div className="grid gap-4">
        {fonts.map(({ id, name, sample, description }) => (
          <button
            key={id}
            onClick={() => updateFontFamily(id)}
            className={`flex items-center justify-between p-4 rounded-lg transition ${
              settings.fontFamily === id
                ? 'bg-red-600 text-white'
                : 'bg-zinc-800 hover:bg-red-900/20'
            }`}
          >
            <div className="text-left">
              <span className="font-medium block">{name}</span>
              <span className="text-sm text-gray-400">{description}</span>
            </div>
            <span className={`font-${id} text-lg`}>{sample}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
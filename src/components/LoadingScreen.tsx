import React from 'react';
import { Music } from 'lucide-react';

export function LoadingScreen() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-black via-red-900/20 to-black">
      <div className="text-center space-y-4">
        <Music className="w-16 h-16 text-red-500 animate-bounce mx-auto" />
        <h2 className="text-2xl font-metal text-red-500">Loading Metal Aloud</h2>
        <div className="w-48 h-2 bg-zinc-800 rounded-full overflow-hidden">
          <div className="h-full bg-red-500 animate-pulse" style={{ width: '60%' }} />
        </div>
      </div>
    </div>
  );
}
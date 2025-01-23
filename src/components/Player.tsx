import React from 'react';
import { Play, SkipBack, SkipForward, Volume2 } from 'lucide-react';

export function Player() {
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-black text-white p-4">
      <div className="flex items-center justify-between max-w-screen-xl mx-auto">
        <div className="flex items-center space-x-4">
          <img
            src="https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17"
            alt="Current track"
            className="w-14 h-14 rounded"
          />
          <div>
            <h4 className="text-sm font-semibold">Midnight Rain</h4>
            <p className="text-xs text-gray-400">Electronic Dreams</p>
          </div>
        </div>
        
        <div className="flex flex-col items-center">
          <div className="flex items-center space-x-6">
            <button className="hover:text-gray-300">
              <SkipBack className="w-5 h-5" />
            </button>
            <button className="p-2 rounded-full bg-white text-black hover:scale-105 transition">
              <Play className="w-6 h-6" />
            </button>
            <button className="hover:text-gray-300">
              <SkipForward className="w-5 h-5" />
            </button>
          </div>
          <div className="w-80 mt-2">
            <div className="h-1 bg-gray-600 rounded-full">
              <div className="h-1 bg-white rounded-full w-1/3"></div>
            </div>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <Volume2 className="w-5 h-5" />
          <div className="w-24">
            <div className="h-1 bg-gray-600 rounded-full">
              <div className="h-1 bg-white rounded-full w-2/3"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
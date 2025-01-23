import React from 'react';
import { WifiOff } from 'lucide-react';

export function Offline() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-black via-red-900/20 to-black">
      <div className="text-center space-y-4">
        <WifiOff className="w-16 h-16 text-red-500 mx-auto" />
        <h2 className="text-2xl font-metal text-red-500">You're Offline</h2>
        <p className="text-gray-400 max-w-md">
          Please check your internet connection and try again.
        </p>
        <button
          onClick={() => window.location.reload()}
          className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
        >
          Retry
        </button>
      </div>
    </div>
  );
}
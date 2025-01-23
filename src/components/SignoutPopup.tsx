import React from 'react';
import { LogOut } from 'lucide-react';

interface SignoutPopupProps {
  onConfirm: () => void;
  onCancel: () => void;
}

export function SignoutPopup({ onConfirm, onCancel }: SignoutPopupProps) {
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-gradient-to-br from-zinc-900 to-black rounded-lg p-6 w-full max-w-sm border border-red-500/20 shadow-2xl transform transition-all duration-300 hover:border-red-500/40">
        <div className="flex flex-col items-center text-center space-y-4">
          <div className="p-3 bg-red-900/20 rounded-full animate-pulse">
            <LogOut className="w-8 h-8 text-red-500" />
          </div>
          <h2 className="text-2xl font-bold text-red-500">Sign Out</h2>
          <p className="text-gray-400">
            Are you sure you want to sign out?
          </p>
          <div className="flex space-x-4 w-full mt-4">
            <button
              onClick={onCancel}
              className="flex-1 px-4 py-2 text-gray-400 hover:text-white transition-colors rounded-lg hover:bg-zinc-800"
            >
              Cancel
            </button>
            <button
              onClick={onConfirm}
              className="flex-1 px-4 py-2 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-lg hover:from-red-500 hover:to-red-600 transition-all duration-300 transform hover:scale-105 shadow-lg"
            >
              Sign Out
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
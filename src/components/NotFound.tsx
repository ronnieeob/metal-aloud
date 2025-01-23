import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Home } from 'lucide-react';

export function NotFound() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-black via-red-900/20 to-black">
      <div className="text-center space-y-6">
        <h1 className="text-6xl font-metal text-red-500">404</h1>
        <h2 className="text-2xl text-white">Page Not Found</h2>
        <p className="text-gray-400 max-w-md">
          The page you're looking for has been moved, deleted, or never existed.
        </p>
        <button
          onClick={() => navigate('/')}
          className="inline-flex items-center space-x-2 px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
        >
          <Home className="w-5 h-5" />
          <span>Return Home</span>
        </button>
      </div>
    </div>
  );
}
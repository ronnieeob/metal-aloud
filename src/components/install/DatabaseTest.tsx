import React, { useState } from 'react';
import { Database, Check, X, Loader } from 'lucide-react';

interface DatabaseTestProps {
  credentials: {
    host: string;
    port: string;
    user: string;
    password: string;
    database: string;
  };
  onTestComplete: (success: boolean) => void;
}

export function DatabaseTest({ credentials, onTestComplete }: DatabaseTestProps) {
  const [testing, setTesting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const testConnection = async () => {
    setTesting(true);
    setError(null);
    setSuccess(false);

    try {
      const response = await fetch('/api/test-database', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials)
      });

      if (!response.ok) {
        const error = await response.text();
        throw new Error(error);
      }

      setSuccess(true);
      onTestComplete(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to connect to database');
      onTestComplete(false);
    } finally {
      setTesting(false);
    }
  };

  return (
    <div className="mt-4">
      <button
        onClick={testConnection}
        disabled={testing}
        className="flex items-center space-x-2 px-4 py-2 bg-zinc-700 hover:bg-zinc-600 rounded transition"
      >
        <Database className="w-4 h-4" />
        <span>Test Connection</span>
      </button>

      {testing && (
        <div className="flex items-center space-x-2 mt-2 text-gray-400">
          <Loader className="w-4 h-4 animate-spin" />
          <span>Testing connection...</span>
        </div>
      )}

      {error && (
        <div className="flex items-center space-x-2 mt-2 text-red-400">
          <X className="w-4 h-4" />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="flex items-center space-x-2 mt-2 text-green-400">
          <Check className="w-4 h-4" />
          <span>Connection successful!</span>
        </div>
      )}
    </div>
  );
}
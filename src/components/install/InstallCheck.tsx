import React, { useEffect, useState } from 'react';
import { Check, X } from 'lucide-react';

interface Requirement {
  name: string;
  check: () => Promise<boolean>;
  required: boolean;
}

export function InstallCheck() {
  const [requirements, setRequirements] = useState<(Requirement & { status?: boolean })[]>([
    {
      name: 'PHP Version >= 8.1',
      check: async () => {
        try {
          const response = await fetch('/api/check-php');
          const { version } = await response.json();
          return parseFloat(version) >= 8.1;
        } catch {
          return false;
        }
      },
      required: true
    },
    {
      name: 'MySQL >= 5.7',
      check: async () => {
        try {
          const response = await fetch('/api/check-mysql');
          const { version } = await response.json();
          return parseFloat(version) >= 5.7;
        } catch {
          return false;
        }
      },
      required: true
    },
    {
      name: 'Node.js >= 18.x',
      check: async () => {
        try {
          const response = await fetch('/api/check-node');
          const { version } = await response.json();
          return parseInt(version) >= 18;
        } catch {
          return false;
        }
      },
      required: true
    },
    {
      name: 'Required PHP Extensions',
      check: async () => {
        try {
          const response = await fetch('/api/check-extensions');
          const { missing } = await response.json();
          return missing.length === 0;
        } catch {
          return false;
        }
      },
      required: true
    },
    {
      name: 'Write Permissions',
      check: async () => {
        try {
          const response = await fetch('/api/check-permissions');
          const { writable } = await response.json();
          return writable;
        } catch {
          return false;
        }
      },
      required: true
    }
  ]);

  const [checking, setChecking] = useState(true);
  const [canProceed, setCanProceed] = useState(false);

  useEffect(() => {
    checkRequirements();
  }, []);

  const checkRequirements = async () => {
    setChecking(true);
    
    const results = await Promise.all(
      requirements.map(async (req) => ({
        ...req,
        status: await req.check()
      }))
    );

    setRequirements(results);
    setCanProceed(results.every(req => !req.required || req.status));
    setChecking(false);
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-red-500 mb-4">System Requirements Check</h2>
      
      <div className="space-y-4">
        {requirements.map((req, index) => (
          <div
            key={index}
            className="flex items-center justify-between p-4 bg-zinc-900/50 rounded-lg"
          >
            <div>
              <span className="font-medium">{req.name}</span>
              {req.required && (
                <span className="ml-2 text-xs text-red-400">(Required)</span>
              )}
            </div>
            <div>
              {checking ? (
                <div className="w-5 h-5 border-2 border-red-500 border-t-transparent rounded-full animate-spin" />
              ) : req.status ? (
                <Check className="w-5 h-5 text-green-500" />
              ) : (
                <X className="w-5 h-5 text-red-500" />
              )}
            </div>
          </div>
        ))}
      </div>

      {!checking && !canProceed && (
        <div className="bg-red-900/20 text-red-400 p-4 rounded-lg">
          Please fix the above requirements before proceeding with the installation.
        </div>
      )}

      <div className="flex justify-end">
        <button
          onClick={checkRequirements}
          disabled={checking}
          className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition disabled:opacity-50"
        >
          {checking ? 'Checking...' : 'Check Again'}
        </button>
      </div>
    </div>
  );
}
import React, { useState } from 'react';
import { Key, Check, X, Loader } from 'lucide-react';

interface LicenseValidatorProps {
  licenseKey: string;
  onValidationComplete: (valid: boolean) => void;
}

export function LicenseValidator({ licenseKey, onValidationComplete }: LicenseValidatorProps) {
  const [validating, setValidating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [valid, setValid] = useState(false);

  const validateLicense = async () => {
    if (!licenseKey.trim()) {
      setError('License key is required');
      onValidationComplete(false);
      return;
    }

    setValidating(true);
    setError(null);
    setValid(false);

    try {
      const response = await fetch('/api/validate-license', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ licenseKey })
      });

      if (!response.ok) {
        const error = await response.text();
        throw new Error(error);
      }

      setValid(true);
      onValidationComplete(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to validate license');
      onValidationComplete(false);
    } finally {
      setValidating(false);
    }
  };

  return (
    <div className="mt-4">
      <button
        onClick={validateLicense}
        disabled={validating || !licenseKey.trim()}
        className="flex items-center space-x-2 px-4 py-2 bg-zinc-700 hover:bg-zinc-600 rounded transition disabled:opacity-50"
      >
        <Key className="w-4 h-4" />
        <span>Validate License</span>
      </button>

      {validating && (
        <div className="flex items-center space-x-2 mt-2 text-gray-400">
          <Loader className="w-4 h-4 animate-spin" />
          <span>Validating license...</span>
        </div>
      )}

      {error && (
        <div className="flex items-center space-x-2 mt-2 text-red-400">
          <X className="w-4 h-4" />
          <span>{error}</span>
        </div>
      )}

      {valid && (
        <div className="flex items-center space-x-2 mt-2 text-green-400">
          <Check className="w-4 h-4" />
          <span>License validated successfully!</span>
        </div>
      )}
    </div>
  );
}
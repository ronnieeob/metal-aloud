import React, { useEffect, useState } from 'react';
import { Shield, Check, X } from 'lucide-react';
import { SecurityManager } from '../../utils/security';

export function SecurityCheck() {
  const [isValid, setIsValid] = useState<boolean | null>(null);
  const [error, setError] = useState<string | null>(null);
  const securityManager = SecurityManager.getInstance();

  useEffect(() => {
    validateSecurity();
  }, []);

  const validateSecurity = () => {
    try {
      const valid = securityManager.validateInstallation();
      setIsValid(valid);
      if (!valid) {
        setError('Invalid installation detected. Please contact support.');
      }
    } catch (err) {
      setIsValid(false);
      setError('Security validation failed');
    }
  };

  return (
    <div className="bg-zinc-800/50 rounded-lg p-6 border border-red-900/20">
      <div className="flex items-center space-x-2 mb-6">
        <Shield className="w-6 h-6 text-red-500" />
        <h2 className="text-xl font-bold text-red-500">Security Verification</h2>
      </div>

      <div className="space-y-4">
        {isValid === null ? (
          <div className="flex items-center space-x-2 text-gray-400">
            <div className="animate-spin h-4 w-4 border-2 border-red-500 border-t-transparent rounded-full" />
            <span>Verifying installation...</span>
          </div>
        ) : isValid ? (
          <div className="flex items-center space-x-2 text-green-500">
            <Check className="w-5 h-5" />
            <span>Installation verified</span>
          </div>
        ) : (
          <div className="bg-red-900/20 p-4 rounded-lg">
            <div className="flex items-center space-x-2 text-red-400 mb-2">
              <X className="w-5 h-5" />
              <span>Security Check Failed</span>
            </div>
            {error && <p className="text-sm text-red-400">{error}</p>}
          </div>
        )}

        <div className="text-sm text-gray-400">
          Installation ID: {securityManager.getInstallationId()}
        </div>
      </div>
    </div>
  );
}
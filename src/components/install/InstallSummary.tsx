import React from 'react';
import { Check, AlertTriangle } from 'lucide-react';

interface InstallSummaryProps {
  config: {
    siteName: string;
    siteUrl: string;
    adminEmail: string;
    adminUsername: string;
    enableRegistration: boolean;
    enableUploads: boolean;
    maxUploadSize: number;
  };
}

export function InstallSummary({ config }: InstallSummaryProps) {
  return (
    <div className="space-y-6">
      <div className="bg-zinc-900/50 p-4 rounded-lg">
        <h3 className="font-bold mb-4">Installation Summary</h3>
        <div className="space-y-2">
          <div className="flex justify-between">
            <span className="text-gray-400">Site Name:</span>
            <span>{config.siteName}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">Site URL:</span>
            <span>{config.siteUrl}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">Admin Email:</span>
            <span>{config.adminEmail}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">Admin Username:</span>
            <span>{config.adminUsername}</span>
          </div>
        </div>
      </div>

      <div className="bg-zinc-900/50 p-4 rounded-lg">
        <h3 className="font-bold mb-4">Features</h3>
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <Check className={`w-4 h-4 ${config.enableRegistration ? 'text-green-400' : 'text-gray-400'}`} />
            <span>Public Registration</span>
          </div>
          <div className="flex items-center space-x-2">
            <Check className={`w-4 h-4 ${config.enableUploads ? 'text-green-400' : 'text-gray-400'}`} />
            <span>File Uploads (Max: {config.maxUploadSize}MB)</span>
          </div>
        </div>
      </div>

      <div className="bg-red-900/20 p-4 rounded-lg">
        <div className="flex items-start space-x-2">
          <AlertTriangle className="w-5 h-5 text-red-400 flex-shrink-0 mt-1" />
          <div>
            <h4 className="font-bold text-red-400">Important Security Steps</h4>
            <ul className="list-disc list-inside text-sm space-y-1 mt-2">
              <li>Delete install.php after installation</li>
              <li>Set proper file permissions (755 for directories, 644 for files)</li>
              <li>Configure your firewall</li>
              <li>Set up SSL certificate</li>
              <li>Configure automated backups</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
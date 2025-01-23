import React from 'react';
import { Shield } from 'lucide-react';

export function CopyrightNotice() {
  const currentYear = new Date().getFullYear();

  return (
    <div className="bg-zinc-800/50 rounded-lg p-6 border border-red-900/20">
      <div className="flex items-center space-x-2 mb-4">
        <Shield className="w-6 h-6 text-red-500" />
        <h2 className="text-xl font-bold text-red-500">Copyright Protection</h2>
      </div>

      <div className="space-y-4">
        <p className="text-gray-300">
          © {currentYear} Metal Aloud. All rights reserved.
        </p>

        <div className="bg-red-900/20 p-4 rounded-lg">
          <h3 className="font-semibold mb-2">Legal Notice</h3>
          <p className="text-sm text-gray-300">
            This software and its content are protected by international copyright laws. 
            Unauthorized reproduction or distribution of this software, or any portion of it, 
            may result in severe civil and criminal penalties, and will be prosecuted to 
            the maximum extent possible under law.
          </p>
        </div>

        <div className="space-y-2">
          <h3 className="font-semibold">Protected Elements:</h3>
          <ul className="list-disc list-inside text-sm text-gray-300 space-y-1">
            <li>Source code and software architecture</li>
            <li>Graphics, logos, and visual design</li>
            <li>Documentation and written content</li>
            <li>Database structure and schemas</li>
            <li>User interface and experience design</li>
          </ul>
        </div>

        <div className="text-sm text-gray-400">
          For licensing inquiries, please contact: legal@metalaloud.com
        </div>
      </div>
    </div>
  );
}
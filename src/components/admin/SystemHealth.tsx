import React from 'react';
import { Activity, Server, Database, Cloud } from 'lucide-react';

interface SystemMetrics {
  serverUptime: number;
  databaseConnections: number;
  apiLatency: number;
  storageUsage: number;
  lastBackup: string;
}

export function SystemHealth() {
  const [metrics, setMetrics] = React.useState<SystemMetrics>({
    serverUptime: 99.99,
    databaseConnections: 150,
    apiLatency: 45,
    storageUsage: 75,
    lastBackup: '2024-01-30T15:30:00Z'
  });

  return (
    <div className="bg-zinc-800/50 rounded-lg p-6 border border-red-900/20">
      <h2 className="text-2xl font-bold text-red-500 mb-6">System Health</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-zinc-900/50 p-4 rounded-lg border border-red-900/10">
          <div className="flex items-center justify-between mb-2">
            <Server className="w-6 h-6 text-green-400" />
            <span className="text-xs text-green-400">Server Status</span>
          </div>
          <p className="text-2xl font-bold">{metrics.serverUptime}%</p>
          <p className="text-sm text-gray-400">Uptime</p>
        </div>

        <div className="bg-zinc-900/50 p-4 rounded-lg border border-red-900/10">
          <div className="flex items-center justify-between mb-2">
            <Database className="w-6 h-6 text-blue-400" />
            <span className="text-xs text-blue-400">Database</span>
          </div>
          <p className="text-2xl font-bold">{metrics.databaseConnections}</p>
          <p className="text-sm text-gray-400">Active connections</p>
        </div>

        <div className="bg-zinc-900/50 p-4 rounded-lg border border-red-900/10">
          <div className="flex items-center justify-between mb-2">
            <Activity className="w-6 h-6 text-yellow-400" />
            <span className="text-xs text-yellow-400">API</span>
          </div>
          <p className="text-2xl font-bold">{metrics.apiLatency}ms</p>
          <p className="text-sm text-gray-400">Average latency</p>
        </div>

        <div className="bg-zinc-900/50 p-4 rounded-lg border border-red-900/10">
          <div className="flex items-center justify-between mb-2">
            <Cloud className="w-6 h-6 text-purple-400" />
            <span className="text-xs text-purple-400">Storage</span>
          </div>
          <p className="text-2xl font-bold">{metrics.storageUsage}%</p>
          <p className="text-sm text-gray-400">Usage</p>
        </div>
      </div>

      <div className="mt-6 p-4 bg-zinc-900/30 rounded-lg border border-red-900/10">
        <h3 className="text-lg font-semibold mb-2">System Maintenance</h3>
        <p className="text-sm text-gray-400">
          Last backup: {new Date(metrics.lastBackup).toLocaleString()}
        </p>
      </div>
    </div>
  );
}
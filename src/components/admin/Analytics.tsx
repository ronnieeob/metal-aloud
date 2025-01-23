import React from 'react';
import { BarChart2, Users, Music, ShoppingBag } from 'lucide-react';

export function Analytics() {
  const stats = [
    { label: 'Total Users', value: '1.2k', icon: Users, change: '+12%' },
    { label: 'Active Artists', value: '245', icon: Music, change: '+8%' },
    { label: 'Songs Played', value: '45.2k', icon: BarChart2, change: '+24%' },
    { label: 'Merch Sales', value: '$12.4k', icon: ShoppingBag, change: '+18%' }
  ];

  return (
    <div className="bg-zinc-800/50 rounded-lg p-6 border border-red-900/20">
      <h2 className="text-2xl font-bold text-red-500 mb-6">Analytics</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <div
            key={index}
            className="bg-zinc-900/50 rounded-lg p-6 border border-red-900/10"
          >
            <div className="flex items-center justify-between">
              <stat.icon className="w-8 h-8 text-red-400" />
              <span className={`text-sm ${
                stat.change.startsWith('+') ? 'text-green-400' : 'text-red-400'
              }`}>
                {stat.change}
              </span>
            </div>
            <h3 className="text-2xl font-bold mt-4">{stat.value}</h3>
            <p className="text-sm text-gray-400">{stat.label}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
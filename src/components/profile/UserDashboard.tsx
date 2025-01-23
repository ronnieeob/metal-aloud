import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { UserProfile } from './UserProfile';
import { UserPlaylists } from './UserPlaylists';
import { UserPurchases } from './UserPurchases';
import { UserStats } from './UserStats';
import { UserPreferences } from './UserPreferences';
import { Music, ListMusic, ShoppingBag, Settings } from 'lucide-react';

export function UserDashboard() {
  const { user } = useAuth();

  if (!user || user.role !== 'user') {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-red-500">Access denied. User privileges required.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col md:flex-row h-screen bg-gradient-to-br from-blue-900 via-black to-black">
      {/* Sidebar */}
      <div className="w-full md:w-64 bg-black/50 p-4 md:p-6 border-b md:border-r border-blue-900/20">
        <h2 className="text-xl font-bold text-blue-500 mb-8">Your Profile</h2>
        <nav className="flex md:block overflow-x-auto md:overflow-x-visible space-x-4 md:space-x-0 md:space-y-4 pb-2 md:pb-0">
          <a href="#profile" className="flex items-center space-x-2 text-gray-300 hover:text-blue-400 transition-colors">
            <Music className="w-5 h-5" />
            <span>Profile</span>
          </a>
          <a href="#playlists" className="flex items-center space-x-2 text-gray-300 hover:text-red-400 transition-colors">
            <ListMusic className="w-5 h-5" />
            <span>Playlists</span>
          </a>
          <a href="#purchases" className="flex items-center space-x-2 text-gray-300 hover:text-red-400 transition-colors">
            <ShoppingBag className="w-5 h-5" />
            <span>Purchases</span>
          </a>
          <a href="#preferences" className="flex items-center space-x-2 text-gray-300 hover:text-red-400 transition-colors">
            <Settings className="w-5 h-5" />
            <span>Preferences</span>
          </a>
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto p-4 md:p-8">
        <div className="space-y-8">
          <section id="profile">
            <UserStats />
            <UserProfile />
          </section>
          
          <section id="playlists">
            <UserPlaylists />
          </section>
          
          <section id="purchases">
            <UserPurchases />
          </section>
          
          <section id="preferences">
            <UserPreferences />
          </section>
        </div>
      </div>
    </div>
  );
}
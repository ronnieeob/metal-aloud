import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { UserManagement } from './UserManagement';
import { ArtistVerification } from './ArtistVerification';
import { ContentModeration } from './ContentModeration';
import { Analytics } from './Analytics';
import { FontSettings } from './FontSettings';
import { BandManagement } from './BandManagement';
import { AdminProfile } from './AdminProfile';
import { AdminRoleManagement } from './AdminRoleManagement';
import { Settings } from './Settings';
import { User, Type } from 'lucide-react';
import { CommissionManagement } from './CommissionManagement';
import { AdsSettings } from './AdsSettings';
import { PremiumSettings } from './PremiumSettings';
import { AppSettings } from './AppSettings';
import { LocationInsights } from './LocationInsights';
import { SiteSettings } from './SiteSettings';
import { PlayerProvider } from '../../contexts/PlayerContext';
import { Users, Music, BarChart2, Settings as SettingsIcon, Shield, Radio, LogOut, DollarSign, DollarSign as Ads, Smartphone } from 'lucide-react';
import { SignoutPopup } from '../SignoutPopup';
import { getWebsiteLogo } from '../../utils/imageSync';
import { useNavigation } from '../../contexts/NavigationContext';
import { AppDownloadBanner } from '../AppDownloadBanner';

export function AdminDashboard() {
  const { user, logout } = useAuth();
  const { activeSection, setActiveSection } = useNavigation();
  const [showSignoutPopup, setShowSignoutPopup] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isInitialized) {
      // Initialize admin data
      loadInitialData();
      setIsInitialized(true);
    }
  }, [isInitialized]);

  const loadInitialData = async () => {
    try {
      setError(null);

      // Load all required data for admin dashboard
      const [users, artists, content, analytics] = await Promise.all([
        // Load users
        JSON.parse(localStorage.getItem('metal_aloud_users') || '[]'),
        // Load artist profiles
        JSON.parse(localStorage.getItem('metal_aloud_artist_profiles') || '[]'),
        // Load content
        JSON.parse(localStorage.getItem('metal_aloud_songs') || '[]'),
        // Load analytics
        JSON.parse(localStorage.getItem('metal_aloud_analytics') || '{}')
      ]);

      // Validate data integrity
      if (!Array.isArray(users) || !Array.isArray(artists) || !Array.isArray(content)) {
        throw new Error('Invalid data format');
      }

      // Store in local state if needed
      localStorage.setItem('metal_aloud_admin_data', JSON.stringify({
        users,
        artists,
        content,
        analytics,
        lastUpdated: new Date().toISOString()
      }));

      // Show success message
      const message = document.createElement('div');
      message.className = 'fixed top-4 right-4 bg-green-600 text-white px-6 py-3 rounded-lg shadow-lg z-50';
      message.textContent = 'Admin dashboard initialized successfully';
      document.body.appendChild(message);
      setTimeout(() => message.remove(), 3000);

    } catch (err) {
      console.error('Failed to load admin data:', err);
      setError(err instanceof Error ? err.message : 'Failed to load admin data');

      // Show error message
      const message = document.createElement('div');
      message.className = 'fixed top-4 right-4 bg-red-600 text-white px-6 py-3 rounded-lg shadow-lg z-50';
      message.textContent = 'Failed to load admin data. Please try again.';
      document.body.appendChild(message);
      setTimeout(() => message.remove(), 3000);
    }
  };

  if (user?.role !== 'admin') {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-red-500">Access denied. Admin privileges required.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col md:flex-row h-screen bg-gradient-to-br from-black via-red-900/20 to-black relative overflow-hidden">
      {error && (
        <div className="fixed top-4 right-4 bg-red-600 text-white px-6 py-3 rounded-lg shadow-lg z-50">
          {error}
        </div>
      )}
      {/* Animated background elements */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-red-600/10 rounded-full filter blur-3xl animate-pulse"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-600/10 rounded-full filter blur-3xl animate-pulse delay-1000"></div>
      </div>

      {/* Sidebar */}
      <div className="w-full md:w-64 bg-black/60 backdrop-blur-lg p-6 border-b md:border-r border-red-500/20 relative z-10">
        <div className="flex justify-center mb-6">
          <img
            src={getWebsiteLogo()}
            alt="Metal Aloud"
            className="w-32 h-32 rounded-2xl shadow-2xl transform hover:scale-105 transition-transform duration-300"
          />
        </div>
        <div className="flex items-center space-x-3 mb-8 p-3 bg-gradient-to-r from-red-900/20 to-transparent rounded-lg hover:from-red-900/30 transition-all duration-300">
          <img
            src={user.avatarUrl}
            alt={user.name}
            className="w-10 h-10 rounded-full border-2 border-red-500 shadow-lg transform hover:scale-110 transition-all duration-300"
          />
          <div>
            <h2 className="text-sm font-bold bg-gradient-to-r from-red-500 to-red-300 bg-clip-text text-transparent">{user.name}</h2>
            <p className="text-xs text-red-400">System Administrator</p>
          </div>
        </div>
        <nav className="flex md:block overflow-x-auto md:overflow-x-visible space-x-4 md:space-x-0 md:space-y-3 pb-2 md:pb-0">
          <a href="#users" className="flex items-center space-x-2 text-gray-300 hover:text-blue-400 transition-colors">
            <Users className="w-4 h-4" />
            <span className="text-xs">User Management</span>
          </a>
          <a href="#app" className="flex items-center space-x-2 text-gray-300 hover:text-red-400 transition-colors">
            <Smartphone className="w-4 h-4" />
            <span className="text-xs">App Settings</span>
          </a>
          <a href="#artists" className="flex items-center space-x-2 text-gray-300 hover:text-red-400 transition-colors">
            <Shield className="w-4 h-4" />
            <span className="text-xs">Artist Verification</span>
          </a>
          <a href="#premium" className="flex items-center space-x-2 text-gray-300 hover:text-red-400 transition-colors">
            <DollarSign className="w-5 h-5" />
            <span className="text-xs">Premium Settings</span>
          </a>
          <a href="#commission" className="flex items-center space-x-2 text-gray-300 hover:text-red-400 transition-colors">
            <DollarSign className="w-5 h-5" />
            <span className="text-xs">Commission</span>
          </a>
          <a href="#ads" className="flex items-center space-x-2 text-gray-300 hover:text-red-400 transition-colors">
            <Ads className="w-5 h-5" />
            <span className="text-xs">Ads Settings</span>
          </a>
          <a href="#content" className="flex items-center space-x-2 text-gray-300 hover:text-red-400 transition-colors">
            <Music className="w-5 h-5" />
            <span className="text-xs">Content Moderation</span>
          </a>
          <a href="#bands" className="flex items-center space-x-2 text-gray-300 hover:text-red-400 transition-colors">
            <Radio className="w-5 h-5" />
            <span className="text-xs">Band Management</span>
          </a>
          <a href="#admins" className="flex items-center space-x-2 text-gray-300 hover:text-red-400 transition-colors">
            <Shield className="w-5 h-5" />
            <span className="text-xs">Admin Roles</span>
          </a>
          <a href="#analytics" className="flex items-center space-x-2 text-gray-300 hover:text-red-400 transition-colors">
            <BarChart2 className="w-5 h-5" />
            <span className="text-xs">Analytics</span>
          </a>
          <a href="#locations" className="flex items-center space-x-2 text-gray-300 hover:text-red-400 transition-colors">
            <User className="w-5 h-5" />
            <span className="text-xs">Location Insights</span>
          </a>
          <a href="#fonts" className="flex items-center space-x-2 text-gray-300 hover:text-red-400 transition-colors">
            <Type className="w-4 h-4" />
            <span className="text-xs">Fonts</span>
          </a>
          <a href="#profile" className="flex items-center space-x-2 text-gray-300 hover:text-red-400 transition-colors">
            <User className="w-5 h-5" />
            <span className="text-xs">Profile</span>
          </a>
          <a href="#settings" className="flex items-center space-x-2 text-gray-300 hover:text-red-400 transition-colors">
            <SettingsIcon className="w-5 h-5" />
            <span className="text-xs">Site Settings</span>
          </a>
          <div className="h-px bg-red-900/20 my-4" />
          <div className="h-px bg-red-900/20 my-4" />
          <div className="h-px bg-red-900/20 my-4" />
          <button
            onClick={() => setShowSignoutPopup(true)}
            className="flex items-center space-x-2 text-red-400 hover:text-red-300 transition-colors w-full px-2 py-1.5 rounded-lg hover:bg-red-900/20"
          >
            <LogOut className="w-5 h-5" />
            <span className="text-xs">Sign out</span>
          </button>
        </nav>
      </div>
      
      {showSignoutPopup && (
        <SignoutPopup
          onConfirm={() => {
            logout();
            setShowSignoutPopup(false);
          }}
          onCancel={() => setShowSignoutPopup(false)}
        />
      )}

      {/* Main Content */}
      <div className="flex-1 overflow-auto bg-gradient-to-br from-black/80 via-zinc-900/30 to-black/80 p-6 relative z-10">
        <div className="space-y-3">
          <AppDownloadBanner />
          <section id="users">
            <UserManagement />
          </section>
          
          <section id="artists">
            <ArtistVerification />
          </section>
          
          <section id="premium">
            <PremiumSettings />
          </section>
          
          <section id="commission">
            <CommissionManagement />
          </section>
          
          <section id="ads">
            <AdsSettings />
          </section>
          
          <section id="app">
            <AppSettings />
          </section>
          
          <section id="content">
            <ContentModeration />
          </section>
          
          <section id="bands">
            <PlayerProvider>
              <BandManagement />
            </PlayerProvider>
          </section>
          
          <section id="admins">
            <PlayerProvider>
              <AdminRoleManagement />
            </PlayerProvider>
          </section>
          
          <section id="analytics">
            <Analytics />
          </section>
          
          <section id="locations">
            <LocationInsights />
          </section>
          <section id="profile">
            <AdminProfile />
          </section>
          
          
          <section id="fonts">
            <FontSettings />
          </section>

          <section id="settings">
            <SiteSettings />
          </section>
        </div>
      </div>
    </div>
  );
}
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { DollarSign } from 'lucide-react';
import { useNavigation } from '../../contexts/NavigationContext';
import { SongManagement } from './SongManagement';
import { MerchManagement } from './MerchManagement';
import { ReleaseSchedule } from './ReleaseSchedule';
import { BandMembers } from './BandMembers';
import { ArtistAnalytics } from './ArtistAnalytics';
import { ArtistWallet } from './ArtistWallet';
import { VerificationRequest } from './VerificationRequest';
import { Music, ShoppingBag, BarChart2, User, LogOut, Calendar, Users, Settings } from 'lucide-react';
import { SignoutPopup } from '../SignoutPopup';
import { PlayerProvider } from '../../contexts/PlayerContext';
import { ProfileSettings } from '../profile/ProfileSettings';
import { getWebsiteLogo } from '../../utils/imageSync';
import { AppDownloadBanner } from '../AppDownloadBanner';
import { PremiumPlans } from '../premium/PremiumPlans';

export function ArtistDashboard() {
  const { user, logout } = useAuth();
  const { setActiveSection } = useNavigation();
  const [showSignoutPopup, setShowSignoutPopup] = useState(false);
  const [initialized, setInitialized] = useState(false);
  const [dashboardState, setDashboardState] = useState({
    isLoading: false,
    error: null as string | null,
    showPremiumModal: false,
    salesData: {
      revenue: 0,
      grossRevenue: 0,
      commission: 0,
      sales: 0
    }
  });

  const { isLoading, error, showPremiumModal, salesData } = dashboardState;

  useEffect(() => {
    if (user && !initialized) {
      setDashboardState(prev => ({ ...prev, isLoading: true }));
      const initData = async () => {
        try {
          await Promise.all([
            loadArtistData(),
            loadSalesData()
          ]);
        } finally {
          setDashboardState(prev => ({ ...prev, isLoading: false }));
          setInitialized(true);
        }
      };
      initData();
    }
  }, [user, initialized, loadArtistData, loadSalesData]);

  const loadSalesData = async () => {
    try {
      setDashboardState(prev => ({ ...prev, isLoading: true }));
      // Load sales data from local storage
      const storedData = localStorage.getItem(`metal_aloud_artist_sales_${user?.id}`);
      if (storedData) {
        setDashboardState(prev => ({
          ...prev,
          salesData: JSON.parse(storedData)
        }));
      }

      // Calculate commission
      const commission = dashboardState.salesData.grossRevenue * 0.08; // 8% commission
      const revenue = dashboardState.salesData.grossRevenue - commission;

      setDashboardState(prev => ({
        ...prev,
        salesData: {
          ...prev.salesData,
          revenue,
          commission
        }
      }));
    } catch (err) {
      console.error('Failed to load sales data:', err);
      setDashboardState(prev => ({
        ...prev,
        error: 'Failed to load sales data'
      }));
    } finally {
      setDashboardState(prev => ({ ...prev, isLoading: false }));
    }
  };
  const loadArtistData = async () => {
    try {
      setDashboardState(prev => ({ ...prev, error: null }));

      // Load artist's songs
      const songs = JSON.parse(localStorage.getItem('metal_aloud_songs') || '[]')
        .filter((song: Song) => song.artistId === user?.id);

      // Load artist's merch
      const products = JSON.parse(localStorage.getItem('metal_aloud_products') || '[]')
        .filter((product: Product) => product.artistId === user?.id);

      // Load artist's profile
      const profile = JSON.parse(localStorage.getItem('metal_aloud_artist_profiles') || '[]')
        .find((profile: ArtistProfile) => profile.userId === user?.id);

      // Validate data integrity
      if (!Array.isArray(songs) || !Array.isArray(products)) {
        throw new Error('Invalid data format');
      }

      // Store artist data
      localStorage.setItem(`metal_aloud_artist_data_${user?.id}`, JSON.stringify({
        songs,
        products,
        profile,
        lastUpdated: new Date().toISOString()
      }));

      // Show success message
      const message = document.createElement('div');
      message.className = 'fixed top-4 right-4 bg-green-600 text-white px-6 py-3 rounded-lg shadow-lg z-50';
      message.textContent = 'Artist dashboard initialized successfully';
      document.body.appendChild(message);
      setTimeout(() => message.remove(), 3000);

    } catch (err) {
      console.error('Failed to load artist data:', err);
      setDashboardState(prev => ({
        ...prev,
        error: err instanceof Error ? err.message : 'Failed to load artist data'
      }));

      // Show error message
      const message = document.createElement('div');
      message.className = 'fixed top-4 right-4 bg-red-600 text-white px-6 py-3 rounded-lg shadow-lg z-50';
      message.textContent = 'Failed to load artist data. Please try again.';
      document.body.appendChild(message);
      setTimeout(() => message.remove(), 3000);
    }
  };

  useEffect(() => {
    if (user) {
      // Load sales data for the artist
      try {
        const allSales = JSON.parse(localStorage.getItem('metal_aloud_artist_sales') || '{}');
        const userSales = allSales[user.id] || {
          revenue: 0,
          grossRevenue: 0,
          commission: 0,
          sales: 0
        };
        setDashboardState(prev => ({
          ...prev,
          salesData: userSales
        }));
      } catch (err) {
        console.error('Failed to load sales data:', err);
        setDashboardState(prev => ({
          ...prev,
          error: 'Failed to load sales data'
        }));
      }
    }
  }, [user]);

  return (
    <div className="flex h-screen bg-gradient-to-br from-black via-red-900/20 to-black relative overflow-hidden">
      {user?.role !== 'artist' ? (
        <div className="flex items-center justify-center h-screen">
          <p className="text-red-500">Access denied. Artist privileges required.</p>
        </div>
      ) : isLoading ? (
        <div className="flex items-center justify-center h-screen bg-gradient-to-br from-black via-red-900/20 to-black">
          <div className="text-center space-y-4 bg-black/40 p-8 rounded-2xl backdrop-blur-xl border border-red-500/20">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-500 mx-auto"></div>
            <p className="text-red-400 font-metal">Loading artist dashboard...</p>
            <p className="text-sm text-gray-400">Please wait while we load your data...</p>
          </div>
        </div>
      ) : (
        <>
        <div className="w-64 flex-shrink-0 bg-black/60 backdrop-blur-lg border-r border-red-500/20 overflow-y-auto">
          <div className="h-full flex flex-col p-6">
            <div className="flex justify-center mb-6">
              <img 
                src={getWebsiteLogo()}
                alt="Metal Aloud"
                className="w-32 h-32 object-cover rounded-2xl shadow-2xl transform hover:scale-105 transition-transform duration-300"
              />
            </div>
            <div className="flex items-center space-x-3 mb-8 p-3 bg-gradient-to-r from-red-900/20 to-transparent rounded-lg hover:from-red-900/30 transition-all duration-300">
              <img
                src={user.avatarUrl}
                alt={user.name}
                className="w-12 h-12 rounded-full border-2 border-red-500 shadow-lg transform hover:scale-110 transition-all duration-300"
              />
              <div>
                <h2 className="text-xl font-bold bg-gradient-to-r from-red-500 to-red-300 bg-clip-text text-transparent">{user.name}</h2>
                <p className="text-sm text-red-400">Artist Portal</p>
              </div>
            </div>
            <nav className="flex-1 space-y-4">
              <a href="#songs" className="flex items-center space-x-2 text-gray-300 hover:text-red-400 transition-colors">
                <Music className="w-5 h-5" />
                <span>Songs</span>
              </a>
              <a href="#schedule" className="flex items-center space-x-2 text-gray-300 hover:text-red-400 transition-colors">
                <Calendar className="w-5 h-5" />
                <span>Release Schedule</span>
              </a>
              <a href="#merch" className="flex items-center space-x-2 text-gray-300 hover:text-red-400 transition-colors">
                <ShoppingBag className="w-5 h-5" />
                <span>Merchandise</span>
              </a>
              <a href="#band" className="flex items-center space-x-2 text-gray-300 hover:text-red-400 transition-colors">
                <Users className="w-5 h-5" />
                <span>Band Members</span>
              </a>
              <a href="#analytics" className="flex items-center space-x-2 text-gray-300 hover:text-red-400 transition-colors">
                <BarChart2 className="w-5 h-5" />
                <span>Analytics</span>
              </a>
              <a href="#settings" className="flex items-center space-x-2 text-gray-300 hover:text-red-400 transition-colors">
                <Settings className="w-5 h-5" />
                <span>Settings</span>
              </a>
            </nav>
            <button
              onClick={() => setShowSignoutPopup(true)}
              className="flex items-center space-x-2 text-red-400 hover:text-red-300 transition-colors mt-4 pt-4 border-t border-red-900/20"
            >
              <LogOut className="w-5 h-5" />
              <span>Sign out</span>
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          <div className="min-h-full bg-gradient-to-br from-black/80 via-zinc-900/30 to-black/80">
            <div className="w-full">
              <AppDownloadBanner />
            </div>
            
            {error && (
              <div className="fixed top-4 right-4 bg-red-600 text-white px-6 py-3 rounded-lg shadow-lg z-50">
                {error}
              </div>
            )}

            {/* Content */}
            <div className="p-8 space-y-8 pb-24">
              {!user?.subscriptionType && (
                <div className="bg-gradient-to-r from-red-900/50 to-black/50 rounded-lg p-6 border border-red-500/20">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-2xl font-bold text-red-400 mb-2">Upgrade to Pro</h2>
                      <p className="text-gray-300">
                        Get unlimited song uploads, automatic copyright protection, and more!
                      </p>
                    </div>
                    <button
                      onClick={() => setShowPremiumModal(true)}
                      className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition flex items-center space-x-2 transform hover:scale-105"
                    >
                      <DollarSign className="w-5 h-5" />
                      <span>Upgrade Now</span>
                    </button>
                  </div>
                </div>
              )}

              {/* Sales Overview */}
              <div className="bg-gradient-to-br from-zinc-900/50 to-black/50 rounded-2xl p-6 border border-red-500/20 backdrop-blur-sm hover:border-red-500/40 transition-all duration-300 transform hover:scale-[1.01]">
                <h2 className="text-xl font-bold text-red-500 mb-4">Sales Overview</h2>
                <div className="grid grid-cols-4 gap-4">
                  <div className="bg-gradient-to-br from-zinc-900/50 to-black/50 p-4 rounded-xl border border-red-500/10 hover:border-red-500/30 transition-all duration-300">
                    <h3 className="text-sm text-gray-400">Gross Revenue</h3>
                    <p className="text-2xl font-bold text-red-400">${dashboardState.salesData.grossRevenue.toFixed(2)}</p>
                  </div>
                  <div className="bg-gradient-to-br from-zinc-900/50 to-black/50 p-4 rounded-xl border border-red-500/10 hover:border-red-500/30 transition-all duration-300">
                    <h3 className="text-sm text-gray-400">Net Revenue</h3>
                    <p className="text-2xl font-bold text-red-400">${dashboardState.salesData.revenue.toFixed(2)}</p>
                    <p className="text-xs text-gray-400">After 8% commission</p>
                  </div>
                  <div className="bg-gradient-to-br from-zinc-900/50 to-black/50 p-4 rounded-xl border border-red-500/10 hover:border-red-500/30 transition-all duration-300">
                    <h3 className="text-sm text-gray-400">Commission Paid</h3>
                    <p className="text-2xl font-bold text-red-400">${dashboardState.salesData.commission.toFixed(2)}</p>
                    <p className="text-xs text-gray-400">8% of gross sales</p>
                  </div>
                  <div className="bg-gradient-to-br from-zinc-900/50 to-black/50 p-4 rounded-xl border border-red-500/10 hover:border-red-500/30 transition-all duration-300">
                    <h3 className="text-sm text-gray-400">Total Sales</h3>
                    <p className="text-2xl font-bold text-red-400">{dashboardState.salesData.sales} items</p>
                  </div>
                </div>
              </div>

              {/* Main Sections */}
              <section id="songs">
                <PlayerProvider>
                  <SongManagement />
                </PlayerProvider>
              </section>
              
              <section id="schedule">
                <ReleaseSchedule />
              </section>
              
              <section id="merch">
                <MerchManagement />
              </section>
              
              <section id="band">
                <BandMembers />
              </section>
              
              <section id="analytics">
                <ArtistAnalytics />
              </section>
              
              <section id="wallet">
                <ArtistWallet />
              </section>
              
              <section id="settings">
                <ProfileSettings />
              </section>
              
              {!user.verified && (
                <section id="verification">
                  <VerificationRequest />
                </section>
              )}
            </div>
          </div>
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

        {showPremiumModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-zinc-900 rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
              <PremiumPlans initialType="artist" />
              <button
                onClick={() => setShowPremiumModal(false)}
                className="mt-4 px-4 py-2 bg-zinc-700 text-white rounded hover:bg-zinc-600 transition"
              >
                Close
              </button>
            </div>
          </div>
        )}
        </>
      )}
    </div>
  );
}
import React, { useState, useEffect } from 'react';
import { Play, Music } from 'lucide-react';
import { User, PlusCircle, LogOut } from 'lucide-react';
import { usePlayer } from '../contexts/PlayerContext';
import { useAuth } from '../contexts/AuthContext';
import { useMetalContent } from '../hooks/useMetalContent';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { Loader } from 'lucide-react';
import { SignoutPopup } from './SignoutPopup';
import { GenreSection } from './GenreSection';
import { BandsSection } from './BandsSection';
import { SearchBar } from './SearchBar';
import { LibrarySection } from './LibrarySection';
import { LikedSongs } from './LikedSongs';
import { UserProfile } from './profile/UserProfile';
import { UserPlaylists } from './profile/UserPlaylists';
import { UserPreferences } from './profile/UserPreferences';
import { Rewards } from './profile/Rewards';
import { Messages } from './social/Messages';
import { MerchShop } from './shop/MerchShop';
import { PremiumPlans } from './premium/PremiumPlans';
import { FriendRequests } from './social/FriendRequests';
import { Followers } from './social/Followers';
import { Feed } from './social/Feed';
import { NewsSection } from './news/NewsSection';
import { CheckoutPage } from './shop/CheckoutPage';
import { useNavigation } from '../contexts/NavigationContext';
import { AppDownloadBanner } from './AppDownloadBanner';
import { Song, Playlist } from '../types';

export function MainContent() {
  const { activeSection, setActiveSection } = useNavigation();
  const { user } = useAuth();
  const [initialized, setInitialized] = useState(false);
  const [playlists] = useLocalStorage<Playlist[]>('metal_aloud_playlists', []);
  const { logout } = useAuth();
  const { dispatch } = usePlayer();
  const { songs, loading, error } = useMetalContent();
  const [recentUploads, setRecentUploads] = useState<Song[]>([]);
  const [showSignoutPopup, setShowSignoutPopup] = useState(false);

  useEffect(() => {
    if (!initialized) {
      // Initialize any required data
      loadInitialData();
      loadRecentUploads();
      // Scroll to top when section changes
      window.scrollTo(0, 0);
      setInitialized(true);
    }
  }, [initialized]);

  const loadInitialData = async () => {
    try {
      // Load user preferences
      const preferences = JSON.parse(localStorage.getItem('metal_aloud_user_preferences') || '{}');
      
      // Load liked songs
      const likedSongs = JSON.parse(localStorage.getItem('metal_aloud_liked_songs') || '[]');
      
      // Load playlists
      const userPlaylists = JSON.parse(localStorage.getItem('metal_aloud_playlists') || '[]');
      
      // Store all data
      localStorage.setItem('metal_aloud_user_data', JSON.stringify({
        preferences,
        likedSongs,
        playlists: userPlaylists,
        lastUpdated: new Date().toISOString()
      }));
    } catch (err) {
      console.error('Failed to load initial data:', err);
    }
  };

  const loadRecentUploads = () => {
    const allSongs = JSON.parse(localStorage.getItem('metal_aloud_songs') || '[]');
    // Get recent uploads from all artists, sorted by date
    const recent = allSongs
      .sort((a: Song, b: Song) => 
        new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()
      )
      .slice(0, 5);
    setRecentUploads(recent);
  };

  const handlePlaySong = (song: Song | undefined) => {
    if (!song) {
      console.error('No song provided');
      return;
    }
    
    if (!song.audioUrl) {
      console.error('No audio URL available for song:', song);
      alert('Preview not available for this song');
      return;
    }
    
    dispatch({ type: 'SET_SONG', payload: song });
  };

  const handlePlaylistPlay = (playlist: Playlist | undefined) => {
    if (!playlist) {
      console.error('No playlist provided');
      return;
    }
    
    if (playlist.songs.length === 0) {
      console.warn('Playlist is empty');
      return;
    }
    
    const playableSong = playlist.songs.find(song => song.audioUrl);
    if (!playableSong) {
      alert('No playable songs in this playlist');
      return;
    }
    
    handlePlaySong(playableSong);
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <Loader className="w-8 h-8 text-red-500 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <p className="text-red-500">{error}</p>
      </div>
    );
  }

  return (
    <main className="flex-1 min-h-screen bg-gradient-to-br from-black/60 via-red-900/20 to-black/60 p-2 md:p-8 pb-24 backdrop-blur-sm overflow-y-auto">
      {/* Welcome Message for New Users */}
      {activeSection === 'home' && !localStorage.getItem('metal_aloud_welcome_seen') && (
        <div className="bg-gradient-to-r from-red-900/30 to-black/30 rounded-lg p-6 mb-8 border border-red-500/20 animate-fadeIn">
          <h1 className="text-3xl font-metal text-red-400 mb-4">Welcome to Metal Aloud! 🤘</h1>
          <p className="text-gray-300 mb-4">
            Get ready to discover the best metal music, connect with fellow metalheads, and experience
            the power of the metal community.
          </p>
          <button
            onClick={() => {
              localStorage.setItem('metal_aloud_welcome_seen', 'true');
              const message = document.createElement('div');
              message.className = 'fixed top-4 right-4 bg-green-600 text-white px-6 py-3 rounded-lg shadow-lg z-50';
              message.textContent = 'Welcome to Metal Aloud! 🤘';
              document.body.appendChild(message);
              setTimeout(() => message.remove(), 3000);
            }}
            className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition flex items-center space-x-2"
          >
            <Music className="w-4 h-4" />
            <span>Let's Rock!</span>
          </button>
        </div>
      )}
      {/* Mobile Menu Bar */}
      {user && <div className="flex md:hidden items-center justify-between bg-black/80 backdrop-blur-md sticky top-0 p-3 mb-4 z-10">
        <div className="flex items-center space-x-3">
          <img
            src={user?.avatarUrl}
            alt={user?.name}
            className="w-8 h-8 rounded-full hover-glow"
          />
          <span className="font-medium text-white text-sm">{user?.name}</span>
        </div>
        <div className="flex items-center space-x-4">
          <button
            onClick={() => setActiveSection('profile')}
            className="text-gray-400 hover:text-blue-400"
          >
            <User className="w-5 h-5" />
          </button>
          <button
            onClick={() => setShowModal(true)}
            className="text-gray-400 hover:text-blue-400"
          >
            <PlusCircle className="w-5 h-5" />
          </button>
          <button
            onClick={() => {
              if (confirm('Are you sure you want to log out?')) {
                logout();
              }
            }}
            className="text-red-400 hover:text-red-300"
          >
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </div>}

      <AppDownloadBanner />

      <div className="mb-4 md:mb-8">
        <SearchBar />
      </div>
      
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        {/* Main Navigation */}
        <nav className="h-16 flex items-center justify-center overflow-x-auto whitespace-nowrap space-x-8 mb-4 md:mb-8 bg-black/20 rounded-lg backdrop-blur-sm mx-auto w-full">
          <button
            onClick={() => setActiveSection('home')}
            className={`text-lg font-semibold h-full flex items-center justify-center min-w-[80px] ${
              activeSection === 'home' ? 'text-blue-500' : 'text-gray-400 hover:text-blue-400'
            } transition-colors`}
          >
            Home
          </button>
          <button
            onClick={() => setActiveSection('genres')}
            className={`text-lg font-semibold h-full flex items-center justify-center min-w-[80px] ${
              activeSection === 'genres' ? 'text-red-500' : 'text-gray-400 hover:text-red-400'
            } transition-colors`}
          >
            Genres
          </button>
          <button
            onClick={() => setActiveSection('bands')}
            className={`text-lg font-semibold h-full flex items-center justify-center min-w-[80px] ${
              activeSection === 'bands' ? 'text-red-500' : 'text-gray-400 hover:text-red-400'
            } transition-colors`}
          >
            Bands
          </button>
          <button
            onClick={() => setActiveSection('friends')}
            className={`text-lg font-semibold h-full flex items-center justify-center min-w-[80px] ${
              activeSection === 'friends' ? 'text-red-500' : 'text-gray-400 hover:text-red-400'
            } transition-colors`}
          >
            Friends
          </button>
          <button
            onClick={() => setActiveSection('social')}
            className={`text-lg font-semibold h-full flex items-center justify-center min-w-[80px] ${
              activeSection === 'social' ? 'text-red-500' : 'text-gray-400 hover:text-red-400'
            } transition-colors`}
          >
            Social
          </button>
          <button
            onClick={() => setActiveSection('news')}
            className={`text-lg font-semibold h-full flex items-center justify-center min-w-[80px] ${
              activeSection === 'news' ? 'text-red-500' : 'text-gray-400 hover:text-red-400'
            } transition-colors`}
          >
            News
          </button>
          <button
            onClick={() => setActiveSection('shop')}
            className={`text-lg font-semibold h-full flex items-center justify-center min-w-[80px] ${
              activeSection === 'shop' ? 'text-red-500' : 'text-gray-400 hover:text-red-400'
            } transition-colors`}
          >
            Shop
          </button>
          <button
            onClick={() => setActiveSection('premium')}
            className={`text-lg font-semibold h-full flex items-center justify-center min-w-[80px] ${
              activeSection === 'premium' ? 'text-red-500' : 'text-gray-400 hover:text-red-400'
            } transition-colors`}
          >
            Premium
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

      {activeSection === 'home' && (
        <div className="glass-panel p-6 rounded-lg animated-border">
          {/* Recent Uploads Section */}
          {recentUploads.length > 0 && (
            <div className="mb-8">
              <h2 className="text-xl md:text-2xl metal-font text-red-500 mb-4">Recent Uploads</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {recentUploads.map((song) => (
                  <div
                    key={song.id}
                    className="bg-zinc-800/50 p-4 rounded-md hover:bg-red-900/30 transition cursor-pointer group border border-red-900/20"
                    onClick={() => song.audioUrl && handlePlaySong(song)}
                  >
                    <div className="relative">
                      <img
                        src={song.coverUrl}
                        alt={song.title}
                        className="w-full aspect-square object-cover rounded-lg mb-2"
                      />
                      <button 
                        className={`absolute right-2 bottom-2 p-2 rounded-full ${
                          song.audioUrl ? 'bg-red-600' : 'bg-gray-600'
                        } text-white opacity-0 group-hover:opacity-100 transition`}
                        disabled={!song.audioUrl}
                      >
                        <Play className="w-4 h-4" />
                      </button>
                    </div>
                    <h3 className="font-medium truncate">{song.title}</h3>
                    <p className="text-sm text-red-400 truncate">{song.artist}</p>
                    <p className="text-xs text-gray-400 mt-1">
                      {new Date(song.createdAt || '').toLocaleDateString()}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
          <h1 className="text-2xl md:text-3xl metal-font text-blue-500 mb-4 md:mb-6">Welcome to Metal Aloud 🤘</h1>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {playlists.map((playlist) => (
              <div
                key={playlist.id}
                className="bg-black/50 group rounded-md p-3 hover:bg-blue-900/30 transition cursor-pointer flex items-center border border-blue-900/20"
                onClick={() => handlePlaylistPlay(playlist)}
              >
                <img
                  src={playlist.coverUrl}
                  alt={playlist.name}
                  className="w-10 h-10 rounded-full object-cover flex-shrink-0"
                />
                <span className="ml-3 text-blue-100 font-medium text-sm">{playlist.name}</span>
              </div>
            ))}
          </div>
          <h2 className="text-xl md:text-2xl metal-font text-blue-500 mb-4 md:mb-6">Metal Anthems</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
            {songs.map((song) => (
              <div
                key={song.id}
                className="bg-zinc-800/50 p-4 rounded-md hover:bg-red-900/30 transition cursor-pointer group border border-red-900/20"
                onClick={() => song.audioUrl && handlePlaySong(song)}
              >
                <div className="relative">
                  <img
                    src={song.coverUrl}
                    alt={song.title}
                    className="w-full aspect-square object-cover rounded-full mb-4"
                  />
                  <button 
                    className={`absolute right-2 bottom-2 p-3 rounded-full ${
                      song.audioUrl ? 'bg-red-600' : 'bg-gray-600'
                    } text-white opacity-0 group-hover:opacity-100 transition`}
                    disabled={!song.audioUrl}
                  >
                    <Play className="w-4 h-4" />
                  </button>
                </div>
                <h3 className="text-white font-semibold truncate">{song.title}</h3>
                <p className="text-sm text-red-400 truncate">{song.artist}</p>
                {!song.audioUrl && (
                  <p className="text-xs text-gray-400 mt-1">Preview not available</p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {activeSection === 'genres' && (
        <div className="ai-pattern rounded-lg p-4">
          <GenreSection />
        </div>
      )}
      {activeSection === 'bands' && <BandsSection />}
      {activeSection === 'library' && <LibrarySection />}
      {activeSection === 'profile' && <UserProfile />}
      {activeSection === 'playlists' && <UserPlaylists />}
      {activeSection === 'settings' && <UserPreferences />}
      {activeSection === 'liked' && <LikedSongs />}
      {activeSection === 'rewards' && <Rewards />}
      {activeSection === 'premium' && <PremiumPlans />}
      {activeSection === 'social' && <Feed />}
      {activeSection === 'messages' && <Messages />}
      {activeSection === 'news' && <NewsSection />}
      {activeSection === 'shop' && <MerchShop />}
      {activeSection === 'checkout' && <CheckoutPage />}
      {activeSection === 'friends' && (
        <div className="grid grid-cols-3 gap-6">
          <div className="col-span-1">
            <FriendRequests />
          </div>
          <div className="col-span-2">
            <Followers />
          </div>
        </div>
      )}
    </main>
  );
}
import React, { useState } from 'react';
import { Home, Library, Search, PlusCircle } from 'lucide-react';
import { UserMenu } from './UserMenu';
import { PlaylistModal } from './playlist/PlaylistModal';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { useAuth } from '../contexts/AuthContext';
import { Playlist } from '../types';
import { useNavigation } from '../contexts/NavigationContext';
import { usePlayer } from '../contexts/PlayerContext';
import { getWebsiteLogo } from '../utils/imageSync';

export function Sidebar() {
  const { activeSection, setActiveSection } = useNavigation();
  const [showModal, setShowModal] = useState(false);
  const [playlists, setPlaylists] = useLocalStorage<Playlist[]>('metal_aloud_playlists', []);
  const { logout } = useAuth();
  const { dispatch } = usePlayer();

  const handleSectionClick = (section: string) => {
    setActiveSection(section as any);
    // Close any modals or overlays
    setShowModal(false);
  };
  const handleLogout = () => {
    if (confirm('Are you sure you want to log out?')) {
      logout();
    }
  };

  const handleCreatePlaylist = (playlist: Omit<Playlist, 'id' | 'songs'>) => {
    const newPlaylist: Playlist = {
      ...playlist,
      id: crypto.randomUUID(),
      songs: []
    };
    setPlaylists([...playlists, newPlaylist]);
  };

  const handlePlaylistClick = (playlist: Playlist) => {
    if (playlist.songs.length > 0) {
      const firstPlayableSong = playlist.songs.find(song => song.audioUrl);
      if (firstPlayableSong) {
        dispatch({ type: 'SET_SONG', payload: firstPlayableSong });
      } else {
        alert('No playable songs in this playlist');
      }
    }
  };

  return (
    <aside className="w-full md:w-64 bg-black/50 text-white p-4 md:p-6 flex flex-col md:h-screen border-b md:border-r border-blue-900/20">
      <div className="flex justify-center mb-6">
        <img 
          src={getWebsiteLogo()}
          alt="Metal Aloud"
          className="w-32 h-32 object-contain"
        />
      </div>
      <div className="mb-3 md:mb-6">
        <UserMenu />
      </div>
      <div className="space-y-2 md:space-y-4">
        <nav className="space-y-2 md:space-y-4">
          <button
            onClick={() => handleSectionClick('home')}
            className={`flex items-center space-x-2 transition-colors w-full text-left ${
              activeSection === 'home' ? 'text-blue-500' : 'text-gray-400 hover:text-blue-400'
            }`}
          >
            <Home className="w-6 h-6" />
            <span className="text-sm">Home</span>
          </button>
          <button
            onClick={() => handleSectionClick('search')}
            className={`flex items-center space-x-2 transition-colors w-full text-left ${
              activeSection === 'search' ? 'text-blue-500' : 'text-gray-400 hover:text-blue-400'
            }`}
          >
            <Search className="w-6 h-6" />
            <span className="text-sm">Search</span>
          </button>
          <button
            onClick={() => handleSectionClick('shop')}
            className={`flex items-center space-x-2 transition-colors w-full text-left ${
              activeSection === 'shop' ? 'text-blue-500' : 'text-gray-400 hover:text-blue-400'
            }`}
          >
            <ShoppingBag className="w-6 h-6" />
            <span className="text-sm">Shop</span>
          </button>
          <button
            onClick={() => handleSectionClick('library')}
            className={`flex items-center space-x-2 transition-colors w-full text-left ${
              activeSection === 'library' ? 'text-blue-500' : 'text-gray-400 hover:text-blue-400'
            }`}
          >
            <Library className="w-6 h-6" />
            <span className="text-sm">Your Library</span>
          </button>
        </nav>

        <div className="pt-4 border-t border-blue-900/20">
          <h2 className="text-xs font-semibold mb-4 text-blue-500">YOUR PROFILE</h2>
          <nav className="space-y-1 md:space-y-2">
            <button
              onClick={() => handleSectionClick('profile')}
              className={`block text-sm w-full text-left transition-colors ${
                activeSection === 'profile' ? 'text-blue-500' : 'text-gray-400 hover:text-blue-400'
              }`}
            >
              Your Profile
            </button>
            <button
              onClick={() => handleSectionClick('playlists')}
              className={`block text-sm w-full text-left transition-colors ${
                activeSection === 'playlists' ? 'text-blue-500' : 'text-gray-400 hover:text-blue-400'
              }`}
            >
              Your Playlists
            </button>
            <button
              onClick={() => handleSectionClick('liked')}
              className={`block text-sm w-full text-left transition-colors ${
                activeSection === 'liked' ? 'text-blue-500' : 'text-gray-400 hover:text-blue-400'
              }`}
            >
              Liked Songs
            </button>
            <button
              onClick={() => handleSectionClick('settings')}
              className={`block text-sm w-full text-left transition-colors ${
                activeSection === 'settings' ? 'text-blue-500' : 'text-gray-400 hover:text-blue-400'
              }`}
            >
              Settings
            </button>
            <button
              onClick={() => handleSectionClick('messages')}
              className={`block text-sm w-full text-left transition-colors ${
                activeSection === 'messages' ? 'text-blue-500' : 'text-gray-400 hover:text-blue-400'
              }`}
            >
              Messages
            </button>
            <button
              onClick={() => handleSectionClick('rewards')}
              className={`block text-sm w-full text-left transition-colors ${
                activeSection === 'rewards' ? 'text-blue-500' : 'text-gray-400 hover:text-blue-400'
              }`}
            >
              Rewards
            </button>
          </nav>
        </div>
        
        <div className="pt-4">
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center space-x-2 hover:text-blue-400 transition-colors"
          >
            <PlusCircle className="w-6 h-6" />
            <span>Create Playlist</span>
          </button>
        </div>
        
        <div className="pt-4">
          <h2 className="text-sm font-semibold mb-4 text-blue-500">PLAYLISTS</h2>
          <div className="space-y-2">
            {playlists?.map((playlist) => (
              <button
                key={playlist.id}
                onClick={() => handlePlaylistClick(playlist)}
                className="block text-gray-400 hover:text-blue-400 transition-colors w-full text-left"
              >
                {playlist.name}
              </button>
            ))}
            {(!playlists || playlists.length === 0) && (
              <p className="text-sm text-gray-500">No playlists yet</p>
            )}
          </div>
        </div>
      </div>
      
      <div className="mt-auto pt-4 border-t border-blue-900/20">
        {/* Reserved space for future features */}
      </div>
      
      {showModal && (
        <PlaylistModal
          onClose={() => setShowModal(false)}
          onSave={handleCreatePlaylist}
        />
      )}
    </aside>
  );
}
import React, { useState } from 'react';
import { LogOut, User, Settings, Music, ShoppingBag, Heart, Users } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigation } from '../contexts/NavigationContext';
import { SignoutPopup } from './SignoutPopup';

export function UserMenu() {
  const [menuOpen, setMenuOpen] = useState(false);
  const { user, logout } = useAuth();
  const { activeSection, setActiveSection } = useNavigation();
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showSignoutPopup, setShowSignoutPopup] = useState(false);
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);

  if (!user) return null;

  const handleLogout = () => {
    setShowSignoutPopup(true);
    setShowProfileMenu(false);
  };

  const handleNavigation = (section: string) => {
    setIsOpen(false);
    setShowProfileMenu(false);
    setActiveSection(section as any);
  };

  return (
    <div className="relative z-50">
      <div
        onClick={() => {
          setMenuOpen(!menuOpen);
          setShowProfileMenu(!showProfileMenu);
        }}
        className="flex items-center space-x-2 p-3 rounded-lg cursor-pointer transform transition-all duration-300 hover:scale-105 hover:bg-red-900/20 group"
      >
        <img
          src={user.avatarUrl}
          alt={user.name}
          className="w-10 h-10 rounded-full border-2 border-transparent group-hover:border-red-500 transition-all duration-300 shadow-lg"
        />
        <div className="text-left hidden md:block">
          <div className="font-bold text-white group-hover:text-red-400 transition-colors">{user.name}</div>
          <div className="text-sm text-gray-400 group-hover:text-red-300 capitalize transition-colors">{user.role}</div>
        </div>
      </div>

      {showProfileMenu && (
        <div className="fixed md:absolute right-0 mt-2 w-48 rounded-lg shadow-xl bg-gradient-to-br from-zinc-900 to-black border border-red-500/20 backdrop-blur-lg transform transition-all duration-300">
          <div className="p-2 space-y-1">
            {user.role === 'user' && (
              <>
                <button
                  onClick={() => handleNavigation('profile')}
                  onMouseEnter={() => setHoveredItem('profile')}
                  onMouseLeave={() => setHoveredItem(null)}
                  className={`flex items-center w-full px-3 py-2 text-sm rounded-lg transition-all duration-300 ${
                    hoveredItem === 'profile'
                      ? 'bg-red-600 text-white transform scale-105'
                      : 'text-gray-300 hover:bg-red-900/20'
                  }`}
                >
                  <User className="w-4 h-4 mr-2" />
                  Your Profile
                </button>
                <button
                  onClick={() => handleNavigation('premium')}
                  className={`block text-sm w-full text-left transition-colors ${
                    activeSection === 'premium' ? 'text-red-500' : 'text-gray-400 hover:text-red-400'
                  }`}
                >
                  Premium Plans
                </button>
                <button
                  onClick={() => handleNavigation('playlists')}
                  onMouseEnter={() => setHoveredItem('playlists')}
                  onMouseLeave={() => setHoveredItem(null)}
                  className={`flex items-center w-full px-3 py-2 text-sm rounded-lg transition-all duration-300 ${
                    hoveredItem === 'playlists'
                      ? 'bg-red-600 text-white transform scale-105'
                      : 'text-gray-300 hover:bg-red-900/20'
                  }`}
                >
                  <Music className="w-4 h-4 mr-2" />
                  Your Playlists
                </button>
                <button
                  onClick={() => handleNavigation('liked')}
                  className="flex items-center w-full px-3 py-2 text-sm text-gray-300 hover:bg-red-900/20 rounded-lg transition"
                >
                  <Heart className="w-4 h-4 mr-2" />
                  Liked Songs
                </button>
                <button
                  onClick={() => handleNavigation('friends')}
                  className="flex items-center w-full px-3 py-2 text-sm text-gray-300 hover:bg-red-900/20 rounded-lg transition"
                >
                  <Users className="w-4 h-4 mr-2" />
                  Friends
                </button>
              </>
            )}
            
            {user.role === 'artist' && (
              <>
                <button
                  onClick={() => handleNavigation('artist')}
                  className="flex items-center w-full px-3 py-2 text-sm text-gray-300 hover:bg-red-900/20 rounded-lg transition"
                >
                  <Music className="w-4 h-4 mr-2" />
                  Artist Dashboard
                </button>
                <button
                  onClick={() => handleNavigation('merch')}
                  className="flex items-center w-full px-3 py-2 text-sm text-gray-300 hover:bg-red-900/20 rounded-lg transition"
                >
                  <ShoppingBag className="w-4 h-4 mr-2" />
                  Merchandise
                </button>
              </>
            )}
            
            {user.role === 'admin' && (
              <button
                onClick={() => handleNavigation('admin')}
                className="flex items-center w-full px-3 py-2 text-sm text-gray-300 hover:bg-red-900/20 rounded-lg transition"
              >
                <Settings className="w-4 h-4 mr-2" />
                Admin Dashboard
              </button>
            )}
            
            <div className="h-px bg-red-900/20 my-1" />
            
            <button
              onClick={() => handleNavigation('settings')}
              className="flex items-center w-full px-3 py-2 text-sm text-gray-300 hover:bg-red-900/20 rounded-lg transition"
            >
              <Settings className="w-4 h-4 mr-2" />
              Settings
            </button>
            
            <button
              onClick={handleLogout}
              onMouseEnter={() => setHoveredItem('logout')}
              onMouseLeave={() => setHoveredItem(null)}
              className={`flex items-center w-full px-4 py-3 text-sm rounded-lg transition-all duration-300 overflow-visible ${
                hoveredItem === 'logout'
                  ? 'bg-red-600 text-white transform scale-105'
                  : 'text-red-400 hover:bg-red-900/20'
              }`}
            >
              <LogOut className="w-4 h-4 mr-2" />
              Sign out
            </button>
          </div>
        </div>
      )}
      
      {showSignoutPopup && (
        <SignoutPopup
          onConfirm={() => {
            logout();
            setShowSignoutPopup(false);
          }}
          onCancel={() => setShowSignoutPopup(false)}
        />
      )}
    </div>
  );
}
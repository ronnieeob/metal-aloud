import React, { useState, useEffect } from 'react';
import { Music, Mail, Lock, Eye, EyeOff, User } from 'lucide-react';
import { getWebsiteLogo } from '../utils/imageSync';

interface SignupPageProps {
  initialType?: 'artist' | 'user';
}

export function SignupPage({ initialType }: SignupPageProps) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [userType, setUserType] = useState<'artist' | 'user'>(initialType || 'user');
  const [showTypeSelection, setShowTypeSelection] = useState(!initialType);
  const [redirecting, setRedirecting] = useState(false);

  const handleLogoClick = () => {
    if (redirecting) return;
    setRedirecting(true);
    setShowTypeSelection(true);
  };


  useEffect(() => {
    if (initialType) {
      setUserType(initialType);
      setShowTypeSelection(false);
    }
  }, [initialType]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }
    setError(null);

    try {
      if (formData.password !== formData.confirmPassword) {
        throw new Error('Passwords do not match');
      }

      // Store user data in localStorage
      const userId = crypto.randomUUID();
      const user = {
        id: userId,
        name: formData.name,
        email: formData.email,
        role: userType,
        avatarUrl: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61',
        playlists: [],
        bio: '',
        website: '',
        location: ''
      };

      localStorage.setItem('metal_aloud_user', JSON.stringify(user));
      localStorage.setItem('auth_token', crypto.randomUUID());

      if (userType === 'artist') {
        localStorage.setItem('metal_aloud_artist_profile', JSON.stringify({
          id: userId,
          userId,
          bio: '',
          verified: false,
          imageUrl: user.avatarUrl,
          formedIn: new Date().getFullYear().toString(),
          genres: [],
          socialLinks: {}
        }));
      }

      // Show success message
      const message = document.createElement('div');
      message.className = 'fixed top-4 right-4 bg-green-600 text-white px-6 py-3 rounded-lg shadow-lg z-50';
      message.textContent = 'Account created successfully! Redirecting to login...';
      document.body.appendChild(message);

      // Redirect to login after delay
      setTimeout(() => {
        window.location.href = '/login';
      }, 2000);

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create account');
    } finally {
      setLoading(false);
    }
  };

  if (showTypeSelection) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-black via-red-900/20 to-black flex items-center justify-center p-4 relative overflow-hidden">
        {/* Animated background elements */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-red-600/10 rounded-full filter blur-3xl animate-pulse"></div>
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-600/10 rounded-full filter blur-3xl animate-pulse delay-1000"></div>
        </div>

        <div className="flex flex-col md:flex-row items-center justify-center gap-8 max-w-6xl w-full relative z-10">
          {/* Artist Signup Box */}
          <div className="w-full md:w-[400px] bg-gradient-to-br from-red-900/90 to-black p-8 rounded-2xl backdrop-blur-xl border border-red-900/20 hover:border-red-500/50 transition-all duration-300 transform hover:scale-105">
            <div className="text-center">
              <div className="flex justify-center">
                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-red-600 to-red-900 flex items-center justify-center mb-6 shadow-lg transform hover:scale-110 transition-all duration-300">
                  <Music className="w-10 h-10 text-white" />
                </div>
              </div>
              <h2 className="text-3xl metal-font text-red-500">ARTIST SIGNUP</h2>
              <p className="mt-2 text-sm text-gray-400">Share your metal with the world</p>
            </div>
            <div className="mt-8 space-y-4">
              <ul className="space-y-3 text-sm text-gray-400">
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-red-500 rounded-full mr-2"></span>
                  Upload and sell your music
                </li>
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-red-500 rounded-full mr-2"></span>
                  Manage your merch store
                </li>
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-red-500 rounded-full mr-2"></span>
                  Access detailed analytics
                </li>
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-red-500 rounded-full mr-2"></span>
                  Connect with your fans
                </li>
              </ul>
            </div>
            <div className="mt-8">
              <button
                onClick={() => {
                  setUserType('artist');
                  setShowTypeSelection(false);
                }}
                className="w-full py-3 px-6 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-lg hover:from-red-500 hover:to-red-600 transition-all duration-300 transform hover:scale-105 shadow-lg font-medium"
              >
                Start Creating
              </button>
            </div>
          </div>

          {/* Beating Logo */}
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-20">
            <div 
              className="w-32 h-32 mx-auto mb-6 cursor-pointer transform hover:scale-110 transition-all duration-300"
              onClick={handleLogoClick}
            >
              <img 
                src={getWebsiteLogo()}
                alt="Metal Aloud"
                className={`w-full h-full object-contain ${redirecting ? 'scale-110' : 'animate-[beat_2s_ease-in-out_infinite]'}`}
              />
            </div>
          </div>

          {/* Fan Signup Box */}
          <div className="w-full md:w-[400px] bg-gradient-to-br from-zinc-900/90 to-black p-8 rounded-2xl backdrop-blur-xl border border-red-900/20 hover:border-red-500/50 transition-all duration-300 transform hover:scale-105">
            <div className="text-center">
              <div className="flex justify-center">
                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-red-600 to-red-900 flex items-center justify-center mb-6 shadow-lg transform hover:scale-110 transition-all duration-300">
                  <User className="w-10 h-10 text-white" />
                </div>
              </div>
              <h2 className="text-3xl metal-font text-red-500">FAN SIGNUP</h2>
              <p className="mt-2 text-sm text-gray-400">Discover new metal music</p>
            </div>
            <div className="mt-8 space-y-4">
              <ul className="space-y-3 text-sm text-gray-400">
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-red-500 rounded-full mr-2"></span>
                  Stream unlimited metal music
                </li>
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-red-500 rounded-full mr-2"></span>
                  Create custom playlists
                </li>
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-red-500 rounded-full mr-2"></span>
                  Follow your favorite artists
                </li>
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-red-500 rounded-full mr-2"></span>
                  Buy exclusive merch
                </li>
              </ul>
            </div>
            <div className="mt-8">
              <button
                onClick={() => {
                  setUserType('user');
                  setShowTypeSelection(false);
                }}
                className="w-full py-3 px-6 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-lg hover:from-red-500 hover:to-red-600 transition-all duration-300 transform hover:scale-105 shadow-lg font-medium"
              >
                Start Listening
              </button>
            </div>
          </div>
        </div>

        {/* Back to Login Link */}
        <div className="absolute bottom-8 text-center">
          <a
            href="/"
            className="text-red-400 hover:text-red-300 transition-colors text-sm"
          >
            Already have an account? Sign in
          </a>
        </div>
      </div>
    );
  }

  // Show signup form after type selection
  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-red-900/20 to-black flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-black/40 p-8 rounded-2xl backdrop-blur-xl border border-red-500/20 shadow-2xl">
          <div className="text-center mb-8">
            <h2 className="text-3xl metal-font text-red-500">
              {userType === 'artist' ? 'ARTIST SIGNUP' : 'FAN SIGNUP'}
            </h2>
            <p className="text-sm text-gray-400">
              {userType === 'artist' 
                ? 'Share your metal with the world'
                : 'Discover new metal music'}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="bg-red-900/20 text-red-400 p-4 rounded-lg text-sm text-center">
                {error}
              </div>
            )}

            <div>
              <label className="sr-only">Name</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center">
                  <User className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="block w-full pl-10 pr-3 py-2 border border-red-900/20 rounded-lg bg-black/20 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500"
                  placeholder="Full name"
                  required
                />
              </div>
            </div>

            <div>
              <label className="sr-only">Email address</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="block w-full pl-10 pr-3 py-2 border border-red-900/20 rounded-lg bg-black/20 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500"
                  placeholder="Email address"
                  required
                />
              </div>
            </div>

            <div>
              <label className="sr-only">Password</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="text-gray-400 hover:text-white focus:outline-none"
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
                  </button>
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="block w-full pl-10 pr-10 py-2 border border-red-900/20 rounded-lg bg-black/20 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500"
                  placeholder="Password"
                  required
                />
              </div>
            </div>

            <div>
              <label className="sr-only">Confirm Password</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                  className="block w-full pl-10 pr-3 py-2 border border-red-900/20 rounded-lg bg-black/20 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500"
                  placeholder="Confirm password"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2 px-4 border border-transparent rounded-lg text-sm font-medium text-white bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors disabled:opacity-50"
            >
              {loading ? 'Creating Account...' : 'Create Account'}
            </button>

            <div className="text-center mt-4">
              <button
                type="button"
                onClick={() => setShowTypeSelection(true)}
                className="text-sm text-red-400 hover:text-red-300"
              >
                ← Back to signup options
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
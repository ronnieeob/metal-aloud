import React, { useState } from 'react';
import { Mail, Lock, Eye, EyeOff, Smartphone } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { getWebsiteLogo } from '../utils/imageSync';
import { useLocalStorage } from '../hooks/useLocalStorage';

export function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showSignupMessage, setShowSignupMessage] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const [appConfig] = useLocalStorage<{
    androidAppUrl: string;
    appStoreUrl: string;
    appStoreLogo: string;
    playStoreLogo: string;
    crLogo: string;
  }>('metal_aloud_app_config', {
    androidAppUrl: 'https://play.google.com/store/apps/details?id=com.metalaloud',
    appStoreUrl: '',
    appStoreLogo: '',
    playStoreLogo: '',
    crLogo: '/cr-logo.png'
  });

  const handleLogoClick = () => {
    setShowSignupMessage(true);
    setTimeout(() => {
      window.location.href = '/signup';
    }, 2000);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await login(email, password);
      // Show success message and handle redirect
      const message = document.createElement('div');
      message.className = 'fixed top-4 right-4 bg-green-600 text-white px-6 py-3 rounded-lg shadow-lg z-50';
      message.textContent = 'Login successful! Redirecting...';
      document.body.appendChild(message);
      setTimeout(() => {
        message.remove();
        // Redirect based on user role
        const user = JSON.parse(localStorage.getItem('metal_aloud_user') || '{}');
        if (user.role === 'admin') {
          window.location.href = '/admin/dashboard';
        } else if (user.role === 'artist') {
          window.location.href = '/artist';
        } else {
          window.location.href = '/';
        }
      }, 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-black/80 via-red-900/30 to-black/80 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-red-600/10 rounded-full filter blur-3xl animate-pulse"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-600/10 rounded-full filter blur-3xl animate-pulse delay-1000"></div>
      </div>

      <div className="flex items-center justify-center space-x-8 w-full max-w-6xl px-4">
        {/* Download App Box */}
        <div className="w-[400px] h-[500px] bg-black/40 p-8 rounded-2xl backdrop-blur-xl border border-red-500/20 shadow-2xl hover:border-red-500/40 transition-all duration-300 flex flex-col justify-between">
          <div className="space-y-6">
            <div className="flex items-center space-x-4"> 
            <div className="p-4 bg-red-600/20 rounded-lg">
              <Smartphone className="w-8 h-8 text-red-400" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white mb-2">Download Our App</h2>
              <p className="text-sm text-gray-400">Experience metal music on your mobile device</p>
            </div>
            </div>
            
            {/* Features List */}
            <div className="space-y-3 mt-4">
              <div className="flex items-center space-x-3 text-gray-300">
                <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                <span className="text-sm">Offline listening</span>
              </div>
              <div className="flex items-center space-x-3 text-gray-300">
                <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                <span className="text-sm">High-quality audio</span>
              </div>
              <div className="flex items-center space-x-3 text-gray-300">
                <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                <span className="text-sm">Exclusive content</span>
              </div>
              <div className="flex items-center space-x-3 text-gray-300">
                <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                <span className="text-sm">Ad-free experience</span>
              </div>
            </div>
            
            <div className="bg-red-900/20 p-4 rounded-lg">
              <p className="text-sm text-red-300">
                Download now and get 1 month of premium features for free!
              </p>
            </div>
          </div>
          <div className="mt-6 space-y-4">
            {/* Google Play Button */}
            <button
              onClick={() => window.open(appConfig.androidAppUrl, '_blank')}
              className="w-full h-14 bg-black hover:bg-zinc-900 text-white rounded-lg transition-all duration-300 transform hover:scale-105 shadow-lg flex items-center justify-center space-x-3 border border-zinc-800"
            >
              {appConfig.playStoreLogo ? (
                <img src={appConfig.playStoreLogo} alt="Google Play" className="h-8" />
              ) : (
                <svg viewBox="0 0 24 24" className="w-6 h-6 text-white" fill="currentColor">
                  <path d="M3.609 1.814L13.792 12 3.61 22.186a2.372 2.372 0 0 1-.497-1.463V3.277c0-.535.18-1.027.497-1.463zm9.927 10.429l2.214-2.214 4.244 2.478c.617.36.617 1.285 0 1.645l-4.244 2.478-2.214-2.214 2.214-2.173zM4.859.333l8.533 4.975-2.217 2.217L2.09 1.51A2.746 2.746 0 0 1 4.86.333zm0 23.334a2.746 2.746 0 0 1-2.77-1.177l9.085-6.015 2.217 2.217-8.532 4.975z"/>
                </svg>
              )}
              <div className="flex flex-col items-start">
                <span className="text-xs">GET IT ON</span>
                <span className="text-xl font-medium">Google Play</span>
              </div>
            </button>
            
            {/* Apple App Store Button */}
            <button
              onClick={() => alert('Coming soon to the App Store!')}
              className="w-full h-14 bg-black hover:bg-zinc-900 text-white rounded-lg transition-all duration-300 transform hover:scale-105 shadow-lg flex items-center justify-center space-x-3 border border-zinc-800"
            >
              {appConfig.appStoreLogo ? (
                <img src={appConfig.appStoreLogo} alt="App Store" className="h-8" />
              ) : (
                <svg viewBox="0 0 24 24" className="w-6 h-6 text-white" fill="currentColor">
                  <path d="M14.94 5.19A4.38 4.38 0 0 0 16 2a4.38 4.38 0 0 0-3 1.52 4.09 4.09 0 0 0-1 3.09 3.64 3.64 0 0 0 2.94-1.42zm2.52 7.44a4.51 4.51 0 0 1 2.16-3.81 4.66 4.66 0 0 0-3.66-2c-1.56-.16-3 .91-3.83.91-.83 0-2-.89-3.3-.87a4.92 4.92 0 0 0-4.14 2.53C2.93 12.45 4.24 17 6 19.47c.8 1.21 1.8 2.58 3.12 2.53 1.32-.05 1.75-.82 3.28-.82s2 .82 3.3.79c1.3-.03 2.22-1.24 3.06-2.45a11 11 0 0 0 1.38-2.85 4.41 4.41 0 0 1-2.68-4.04z"/>
                </svg>
              )}
              <div className="flex flex-col items-start">
                <span className="text-xs">Download on the</span>
                <span className="text-xl font-medium">App Store</span>
              </div>
            </button>
          </div>
        </div>

        {/* Vertical OR Separator */}
        <div className="flex flex-col items-center justify-center">
          <img
            src={appConfig.crLogo}
            alt="CR Logo"
            className="w-32 h-32 rounded-full border-4 border-red-500/20 shadow-2xl transform hover:scale-110 transition-all duration-500 animate-[spin_10s_linear_infinite] hover:border-red-500/40 my-auto"
          />
        </div>

        {/* Login Box */}
        <div className="w-[400px] h-[500px] bg-black/40 p-8 rounded-2xl backdrop-blur-xl border border-red-500/20 shadow-2xl hover:border-red-500/40 transition-all duration-500 flex flex-col justify-between">
          <div className="text-center">
            <div 
              className="relative w-32 h-32 mx-auto mb-6 animate-[beat_2s_ease-in-out_infinite] cursor-pointer transform hover:scale-110 transition-all duration-300"
              onClick={handleLogoClick}
            >
              <div className="absolute inset-0 bg-red-600/20 rounded-full filter blur-2xl animate-[glow_2s_ease-in-out_infinite]"></div>
              <img 
                src={getWebsiteLogo()}
                alt="Metal Aloud"
                className="relative w-full h-full object-cover rounded-full border-4 border-red-500/50 shadow-lg transform hover:scale-105 transition-transform duration-300 animate-[pulse_2s_ease-in-out_infinite]"
              />
            </div>
            <p className="text-sm text-gray-300">Unleash the Metal Within</p>
            {showSignupMessage && (
              <div className="mt-6 transform transition-all duration-500 animate-pulse">
                <p className="text-2xl font-metal bg-gradient-to-r from-red-500 via-red-400 to-red-500 bg-clip-text text-transparent italic tracking-wider">
                  Let's tune in and headbang! 🤘
                </p>
                <div className="h-0.5 w-full bg-gradient-to-r from-transparent via-red-500 to-transparent mt-2"></div>
              </div>
            )}
          </div>
      
          <form className="mt-8 space-y-6 relative z-10" onSubmit={handleSubmit}>
            {error && (
              <div className="text-red-400 text-sm text-center bg-red-900/30 p-4 rounded-lg border border-red-500/40 shadow-lg backdrop-blur-sm whitespace-pre-line">
                {error}
              </div>
            )}
            
            <div className="space-y-4">
              <div>
                <label className="sr-only">Email address</label>
                <div className="relative text-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center">
                    <Mail className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="block w-full pl-10 pr-3 py-3 border border-red-500/20 rounded-lg bg-black/40 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 text-sm backdrop-blur-sm transition-all duration-300 hover:border-red-500/40"
                    placeholder="Email address"
                    required
                  />
                </div>
              </div>
              
              <div>
                <label className="sr-only">Password</label>
                <div className="relative text-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center">
                    <Lock className="h-5 w-5 text-gray-400" />
                  </div>
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center z-10">
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="text-gray-400 hover:text-white focus:outline-none"
                      aria-label={showPassword ? "Hide password" : "Show password"}
                      tabIndex={-1}
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
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="block w-full pl-10 pr-10 py-3 border border-red-500/20 rounded-lg bg-black/40 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 text-sm backdrop-blur-sm transition-all duration-300 hover:border-red-500/40"
                    placeholder="Password"
                    required
                  />
                </div>
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className="group relative w-full flex justify-center py-3 px-4 border border-transparent rounded-lg text-sm font-bold text-white bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-all duration-300 transform hover:scale-105 shadow-lg"
              >
                {loading ? 'Signing in...' : 'Sign in'}
              </button>
            </div>
            
            <div className="flex justify-between text-sm text-gray-400">
              <a href="/forgot-password" className="text-red-400 hover:text-red-300 transition-colors">
                Forgot password?
              </a>
              <a href="/signup" className="text-red-400 hover:text-red-300 transition-colors">
                Create account
              </a>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { LoadingIndicator } from './components/LoadingIndicator';
import { Sidebar } from './components/Sidebar';
import { MainContent } from './components/MainContent';
import { AudioPlayer } from './components/AudioPlayer';
import { PlayerProvider } from './contexts/PlayerContext';
import { NavigationProvider } from './contexts/NavigationContext';
import { ArtistDashboard } from './components/artist/ArtistDashboard';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { LoginPage } from './components/LoginPage';
import { ForgotPassword } from './components/ForgotPassword';
import { SignupPage } from './components/SignupPage';
import { ResetPassword } from './components/ResetPassword';
import { NotificationBar } from './components/NotificationBar';
import { ErrorBoundary } from './components/ErrorBoundary';
import { AIProvider } from './contexts/AIContext';
import { CartProvider } from './contexts/CartContext';
import { SettingsProvider } from './contexts/SettingsContext';
import { LoadingScreen } from './components/LoadingScreen';
import { Offline } from './components/Offline';
import { CopyrightDashboard } from './components/artist/CopyrightDashboard';
import { CookieConsent } from './components/CookieConsent';
import { PrivacyPolicy } from './components/legal/PrivacyPolicy';
import { TermsAndConditions } from './components/legal/TermsAndConditions';
import { TutorialManager } from './components/tutorials/TutorialManager';
// These components are used in routes/conditionally

function AppContent() {
  const { user, isAuthenticated, isInitialized } = useAuth();
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [isLoading, setIsLoading] = useState(true);
  const [, setError] = useState<string | null>(null);
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    if (!initialized) {
      initializeApp();
      // Register service worker for PWA support
      if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('/sw.js')
          .catch(err => console.warn('Service worker registration failed:', err));
      }
      setInitialized(true);
    }
  }, [initialized]);

  const initializeApp = async () => {
    try {
      setError(null);

      // Initialize any required services
      await Promise.all([
        import('./services/spotify').then(m => m.SpotifyService.getInstance().initialize()),
        import('./utils/security').then(m => m.SecurityManager.getInstance().validateInstallation()),
        import('./services/copyrightService').then(m => m.CopyrightService.getInstance())
      ]);
    } catch (err) {
      console.warn('Service initialization error:', err);
      setError(err instanceof Error ? err.message : 'Failed to initialize services');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Wait for auth to initialize before rendering
  if (!isInitialized) {
    return <LoadingScreen />;
  }

  if (!isOnline) {
    return <Offline />;
  }

  if (isLoading) {
    return <LoadingIndicator fullScreen message="Initializing Metal Aloud..." />;
  }

  if (!isAuthenticated) {
    return (
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/privacy" element={<PrivacyPolicy />} />
        <Route path="/terms" element={<TermsAndConditions />} />
        <Route path="/copyright" element={<CopyrightDashboard />} />
        <Route path="/privacy" element={<PrivacyPolicy />} />
        <Route path="/terms" element={<TermsAndConditions />} />
        <Route path="*" element={<Navigate to="/login" />} />
      </Routes>
    );
  }

  if (user?.role === 'admin') {
    return <AdminDashboard />;
  }

  if (user?.role === 'artist') {
    return <ArtistDashboard />;
  }

  return (
    <PlayerProvider>
      <div className="flex flex-col h-screen">
        <div className="hidden md:flex flex-1">
          <Sidebar />
          <MainContent />
        </div>
        <div className="flex-1 md:hidden">
          <MainContent />
        </div>
        <div className="sticky bottom-0">
          <AudioPlayer />
        </div>
      </div>
    </PlayerProvider>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ErrorBoundary>
          <div className="min-h-screen bg-gradient-to-br from-black/80 via-red-900/30 to-black/80">
            <div className="concert-lights"></div>
            <SettingsProvider>
              <AIProvider>
                <NavigationProvider>
                  <CartProvider>
                    <AppContent />
                    <NotificationBar />
                    <CookieConsent />
                    <TutorialManager />
                  </CartProvider>
                </NavigationProvider>
              </AIProvider>
            </SettingsProvider>
          </div>
        </ErrorBoundary>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
import React, { useState, useEffect } from 'react';
import { Shield, AlertTriangle, Check, X, Upload, Download } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { Song } from '../../types';
import { CopyrightService } from '../../services/copyrightService';
import { CopyrightStats } from './CopyrightStats';
import { useNavigation } from '../../contexts/NavigationContext';

interface CopyrightStatus {
  songId: string;
  status: 'pending' | 'active' | 'rejected';
  registrationDate: string;
  copyrightId: string;
  type: 'automatic' | 'manual';
  protectionLevel: 'basic' | 'standard' | 'premium';
}

export function CopyrightDashboard() {
  const { user } = useAuth();
  const { setActiveSection } = useNavigation();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copyrightStatuses, setCopyrightStatuses] = useState<CopyrightStatus[]>([]);
  const [initialized, setInitialized] = useState(false);
  const [stats, setStats] = useState({
    totalSongs: 0,
    protectedSongs: 0,
    pendingRegistrations: 0,
    quotaUsed: 0,
    quotaTotal: 20,
    subscriptionType: 'basic' as 'basic' | 'pro'
  });
  const copyrightService = CopyrightService.getInstance();

  useEffect(() => {
    if (user && !initialized) {
      loadCopyrightStats();
      setInitialized(true);
    }
  }, [user, initialized]);

  const loadCopyrightStats = async () => {
    try {
      setLoading(true);
      // Get subscription status
      const subscription = JSON.parse(localStorage.getItem(`metal_aloud_subscription_${user?.id}`) || 'null');
      const subscriptionType = subscription?.type || 'basic';
      const quotaTotal = subscriptionType === 'pro' ? 
        (subscription?.interval === 'yearly' ? -1 : 20) : 
        (subscription?.interval === 'yearly' ? 60 : 5);
      
      const songs = JSON.parse(localStorage.getItem('metal_aloud_songs') || '[]');
      const artistSongs = songs.filter((song: Song) => song.artistId === user?.id);
      const protectedSongs = artistSongs.filter((song: Song) => song.copyright?.status === 'active');
      const pendingSongs = artistSongs.filter((song: Song) => song.copyright?.status === 'pending');
      
      setStats({
        totalSongs: artistSongs.length,
        protectedSongs: protectedSongs.length,
        pendingRegistrations: pendingSongs.length,
        quotaUsed: protectedSongs.length + pendingSongs.length,
        quotaTotal: quotaTotal,
        subscriptionType: subscriptionType
      });

      // Load copyright statuses
      const statuses = artistSongs
        .filter((song: Song) => song.copyright)
        .map((song: Song) => ({
          songId: song.id,
          status: song.copyright!.status,
          registrationDate: song.copyright!.registrationDate,
          copyrightId: song.copyright!.id,
          type: song.copyright!.type,
          protectionLevel: song.copyright!.protectionLevel
        }));
      
      setCopyrightStatuses(statuses);
      setError(null);
    } catch (err) {
      console.error('Failed to load copyright stats:', err);
      setError('Failed to load copyright information');
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterCopyright = async (
    song: Song,
    type: 'automatic' | 'manual',
    useSubscription: boolean = true
  ) => {
    try {
      setLoading(true);
      setError(null);

      const registration = await copyrightService.registerCopyright(
        song.id,
        user!.id,
        type,
        useSubscription
      );

      // Update statuses
      setCopyrightStatuses(prev => [
        ...prev,
        {
          songId: song.id,
          status: 'pending',
          registrationDate: new Date().toISOString(),
          copyrightId: registration.copyrightId,
          type,
          protectionLevel: registration.protectionLevel
        }
      ]);

      // Show success message
      const message = document.createElement('div');
      message.className = 'fixed top-4 right-4 bg-green-600 text-white px-6 py-3 rounded-lg shadow-lg z-50';
      message.textContent = `Copyright registration ${registration.copyrightId} submitted successfully`;
      document.body.appendChild(message);
      setTimeout(() => message.remove(), 3000);

      // Refresh stats
      await loadCopyrightStats();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to register copyright');
    } finally {
      setLoading(false);
    }
  };

  const downloadCertificate = async (copyrightId: string) => {
    try {
      setLoading(true);
      // Implementation will be added
      alert('Certificate download will be implemented soon');
    } catch (err) {
      console.error('Failed to download certificate:', err);
      setError('Failed to download certificate');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-red-500"></div>
      </div>
    );
  }

  return (
    <div className="bg-zinc-800/50 rounded-lg p-6 border border-red-900/20">
      {/* Copyright Stats */}
      <CopyrightStats {...stats} />
      
      <div className="h-px bg-red-900/20 my-8" />

      {error && (
        <div className="bg-red-900/20 text-red-400 p-4 rounded-lg mb-6">
          {error}
        </div>
      )}

      <div className="space-y-6">
        {/* Copyright Registrations */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Copyright Registrations</h3>
          
          {copyrightStatuses.map((status) => (
            <div
              key={status.copyrightId}
              className="bg-zinc-900/50 p-4 rounded-lg border border-red-900/10"
            >
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center space-x-2">
                    <h4 className="font-medium">Copyright ID: {status.copyrightId}</h4>
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      status.status === 'active' ? 'bg-green-900/20 text-green-400' :
                      status.status === 'pending' ? 'bg-yellow-900/20 text-yellow-400' :
                      'bg-red-900/20 text-red-400'
                    }`}>
                      {status.status.toUpperCase()}
                    </span>
                  </div>
                  <p className="text-sm text-gray-400 mt-1">
                    Registered on {new Date(status.registrationDate).toLocaleDateString()}
                  </p>
                  <div className="flex items-center space-x-4 mt-2">
                    <span className="text-sm">
                      Type: {status.type === 'automatic' ? 'Automatic' : 'Manual'}
                    </span>
                    <span className="text-sm">
                      Protection: {status.protectionLevel}
                    </span>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  {status.status === 'active' && (
                    <button
                      onClick={() => downloadCertificate(status.copyrightId)}
                      className="p-2 rounded-full bg-green-900/20 text-green-400 hover:bg-green-900/30 transition"
                    >
                      <Download className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}

          {copyrightStatuses.length === 0 && (
            <p className="text-center text-gray-400 py-8">
              No copyright registrations yet
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
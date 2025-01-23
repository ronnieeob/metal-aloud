import React, { useState, useEffect } from 'react';
import { Music, Save, Key } from 'lucide-react';
import { SpotifyService } from '../../services/spotify';

export function SpotifySettings() {
  const [spotifyConfig, setSpotifyConfig] = useState({
    clientId: localStorage.getItem('metal_aloud_spotify_client_id') || '',
    clientSecret: localStorage.getItem('metal_aloud_spotify_client_secret') || '',
    enabled: localStorage.getItem('metal_aloud_spotify_enabled') === 'true'
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [testStatus, setTestStatus] = useState<'idle' | 'testing' | 'success' | 'error'>('idle');

  const handleSave = async () => {
    try {
      setLoading(true);
      setError(null);

      // Save Spotify configuration
      localStorage.setItem('metal_aloud_spotify_client_id', spotifyConfig.clientId);
      localStorage.setItem('metal_aloud_spotify_client_secret', spotifyConfig.clientSecret);
      localStorage.setItem('metal_aloud_spotify_enabled', String(spotifyConfig.enabled));

      // Test the connection if enabled
      if (spotifyConfig.enabled) {
        await testSpotifyConnection();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save settings');
    } finally {
      setLoading(false);
    }
  };

  const testSpotifyConnection = async () => {
    try {
      setTestStatus('testing');
      const spotifyService = new SpotifyService();
      await spotifyService.initialize();
      setTestStatus('success');
    } catch (err) {
      console.error('Spotify connection test failed:', err);
      setTestStatus('error');
      throw new Error('Failed to connect to Spotify API');
    }
  };

  return (
    <div className="bg-zinc-800/50 rounded-lg p-6 border border-red-900/20">
      <h2 className="text-2xl font-bold text-red-500 mb-6">Spotify Integration</h2>

      {error && (
        <div className="bg-red-900/20 text-red-400 p-4 rounded-lg mb-6">
          {error}
        </div>
      )}

      <div className="space-y-6">
        {/* Spotify Integration */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold flex items-center space-x-2">
              <Music className="w-5 h-5 text-red-400" />
              <span>Spotify Integration</span>
            </h3>
            <button
              onClick={() => setSpotifyConfig(prev => ({ ...prev, enabled: !prev.enabled }))}
              className={`relative w-14 h-7 transition-colors rounded-full ${
                spotifyConfig.enabled ? 'bg-red-600' : 'bg-zinc-700'
              }`}
            >
              <div
                className={`absolute w-5 h-5 bg-white rounded-full top-1 transition-transform ${
                  spotifyConfig.enabled ? 'right-1' : 'left-1'
                }`}
              />
            </button>
          </div>

          {spotifyConfig.enabled && (
            <div className="space-y-4 p-4 bg-zinc-900/50 rounded-lg">
              <div>
                <label className="block text-sm font-medium mb-2">Client ID</label>
                <input
                  type="text"
                  value={spotifyConfig.clientId}
                  onChange={(e) => setSpotifyConfig(prev => ({
                    ...prev,
                    clientId: e.target.value
                  }))}
                  className="w-full bg-zinc-700 border border-red-900/20 rounded px-3 py-2"
                  placeholder="Enter your Spotify Client ID"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Client Secret</label>
                <input
                  type="password"
                  value={spotifyConfig.clientSecret}
                  onChange={(e) => setSpotifyConfig(prev => ({
                    ...prev,
                    clientSecret: e.target.value
                  }))}
                  className="w-full bg-zinc-700 border border-red-900/20 rounded px-3 py-2"
                  placeholder="Enter your Spotify Client Secret"
                />
              </div>

              {testStatus !== 'idle' && (
                <div className={`text-sm ${
                  testStatus === 'testing' ? 'text-yellow-400' :
                  testStatus === 'success' ? 'text-green-400' :
                  'text-red-400'
                }`}>
                  {testStatus === 'testing' ? 'Testing connection...' :
                   testStatus === 'success' ? 'Connection successful!' :
                   'Connection failed. Please check your credentials.'}
                </div>
              )}

              <div className="text-sm text-gray-400">
                <p>To get your Spotify API credentials:</p>
                <ol className="list-decimal ml-4 mt-2 space-y-1">
                  <li>Go to the <a href="https://developer.spotify.com/dashboard" target="_blank" rel="noopener noreferrer" className="text-red-400 hover:text-red-300">Spotify Developer Dashboard</a></li>
                  <li>Create a new application</li>
                  <li>Copy the Client ID and Client Secret</li>
                  <li>Configure the redirect URI if needed</li>
                </ol>
              </div>
            </div>
          )}
        </div>

        <div className="flex justify-end pt-4">
          <button
            onClick={handleSave}
            disabled={loading}
            className="flex items-center space-x-2 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span>{loading ? 'Saving...' : 'Save Changes'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
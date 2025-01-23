import { useState, useEffect } from 'react';
import { Song, Playlist } from '../types';
import { LocalStorageService } from '../services/localStorageService';
import { SpotifyService } from '../services/spotify';

export function useMetalContent() {
  const [songs, setSongs] = useState<Song[]>([]);
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [initialized, setInitialized] = useState(false);
  
  useEffect(() => {
    if (!initialized) {
      const storage = new LocalStorageService();
      const spotifyService = new SpotifyService();

      async function fetchContent() {
        try {
          setLoading(true);
          setError(null);

          // Get local songs first
          const localSongs = storage.getSongs();
          setSongs(localSongs);
          setPlaylists(storage.getPlaylists());

          // Try to get Spotify songs
          try {
            await spotifyService.initialize();
            const spotifyTracks = await spotifyService.getMetalTracks();
            
            // Combine local and Spotify songs, avoiding duplicates
            const allSongs = [...localSongs];
            spotifyTracks.forEach(track => {
              if (!allSongs.some(song => song.id === track.id)) {
                allSongs.push(track);
              }
            });
            
            setSongs(allSongs);
          } catch (spotifyError) {
            console.warn('Failed to load Spotify content:', spotifyError);
            // Continue with local songs only
          }
        } catch (err) {
          console.error('Failed to load content:', err);
          setError('Failed to load content');
        } finally {
          setLoading(false);
          setInitialized(true);
        }
      }

      fetchContent();
    }
  }, [initialized]);

  return { 
    songs, 
    playlists, 
    loading, 
    error 
  };
}
import { useState, useCallback } from 'react';
import { SpotifyService } from '../services/spotify';
import { Song } from '../types';

export function useSpotifySync() {
  const [syncing, setSyncing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const spotifyService = new SpotifyService();

  const syncGenreSongs = useCallback(async (genre: string) => {
    try {
      setSyncing(true);
      setError(null);

      const searchTerm = genre.toLowerCase().includes('metal') ? 
        genre : 
        `${genre.replace(/\s+metal\s*/i, '')} metal`;
        
      await spotifyService.initialize();
      const results = await spotifyService.search(searchTerm);
      return results.songs.filter(song => song.audioUrl);
    } catch (err) {
      console.warn('Failed to sync Spotify songs:', err);
      setError('Failed to load songs from Spotify');
      return [];
    } finally {
      setSyncing(false);
    }
  }, []);

  const syncBandSongs = useCallback(async (bandName: string) => {
    try {
      setSyncing(true);
      setError(null);

      await spotifyService.initialize();

      // Try exact artist search first
      let results = await spotifyService.search(`artist:"${bandName}"`);
      let songs = results.songs.filter(song => 
        song.artist.toLowerCase() === bandName.toLowerCase()
      );

      // If no exact matches, try broader search
      if (songs.length === 0) {
        results = await spotifyService.search(bandName);
        songs = results.songs.filter(song => 
          song.artist.toLowerCase().includes(bandName.toLowerCase())
        );
      }
      
      return songs
        .filter(song => song.audioUrl)
        .sort((a, b) => {
          if (!a.album && !b.album) return 0;
          if (!a.album) return 1;
          if (!b.album) return -1;
          return a.album.localeCompare(b.album);
        });
    } catch (err) {
      console.warn('Failed to sync band songs:', err);
      setError('Failed to load songs. Please try again.');
      return [];
    } finally {
      setSyncing(false);
    }
  }, []);

  return {
    syncing,
    syncGenreSongs,
    syncBandSongs,
    error
  };
}
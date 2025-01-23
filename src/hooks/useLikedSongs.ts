import { useState, useEffect } from 'react';
import { Song } from '../types';
import { SpotifyService } from '../services/spotify';
import { useLocalStorage } from './useLocalStorage';
import { useRewards } from './useRewards';

export function useLikedSongs() {
  const [likedSongs, setLikedSongs] = useLocalStorage<Song[]>('metal_aloud_liked_songs', []);
  const [spotifyLikedSongs, setSpotifyLikedSongs] = useState<Song[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const spotifyService = new SpotifyService();
  const { handleSongLike } = useRewards();

  useEffect(() => {
    const syncSpotifyLikes = async () => {
      try {
        if (!spotifyService.isInitialized()) {
          await spotifyService.initialize();
        }
        // TODO: Implement Spotify likes sync when API is available
      } catch (err) {
        console.warn('Failed to sync Spotify likes:', err);
      }
    };

    syncSpotifyLikes();
  }, []);

  const toggleLike = async (song: Song) => {
    try {
      if (song.id.startsWith('spotify:')) {
        // Handle Spotify song likes
        if (spotifyService.isInitialized()) {
          // TODO: Implement Spotify like/unlike when API is available
        }
      }

      // Always store in local storage
      const isLiked = likedSongs.some(s => s.id === song.id);
      if (isLiked) {
        setLikedSongs(prev => prev.filter(s => s.id !== song.id));
      } else {
        setLikedSongs(prev => [...prev, song]);
        handleSongLike(); // Award points for liking a song
      }
    } catch (err) {
      setError('Failed to update liked status');
      console.error('Failed to toggle like:', err);
    }
  };

  const isLiked = (songId: string) => {
    return likedSongs.some(song => song.id === songId) ||
           spotifyLikedSongs.some(song => song.id === songId);
  };

  return {
    likedSongs: [...likedSongs, ...spotifyLikedSongs],
    isLiked,
    toggleLike,
    loading,
    error
  };
}
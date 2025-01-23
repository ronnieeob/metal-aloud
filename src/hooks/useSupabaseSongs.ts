import { useState, useEffect } from 'react';
import { Song } from '../types';
import { SongService } from '../services/supabase/songService';

export function useSupabaseSongs(artistId?: string) {
  const [songs, setSongs] = useState<Song[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const songService = new SongService();

  useEffect(() => {
    loadSongs();
  }, [artistId]);

  const loadSongs = async () => {
    try {
      setLoading(true);
      const data = await songService.getSongs(artistId);
      setSongs(data);
      setError(null);
    } catch (err) {
      setError('Failed to load songs');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const addSong = async (song: Omit<Song, 'id' | 'createdAt'>) => {
    try {
      const newSong = await songService.createSong(song);
      setSongs(prev => [newSong, ...prev]);
      return newSong;
    } catch (err) {
      setError('Failed to add song');
      throw err;
    }
  };

  const updateSong = async (song: Song) => {
    try {
      const updatedSong = await songService.updateSong(song);
      setSongs(prev => prev.map(s => s.id === song.id ? updatedSong : s));
      return updatedSong;
    } catch (err) {
      setError('Failed to update song');
      throw err;
    }
  };

  const deleteSong = async (id: string) => {
    try {
      await songService.deleteSong(id);
      setSongs(prev => prev.filter(s => s.id !== id));
    } catch (err) {
      setError('Failed to delete song');
      throw err;
    }
  };

  return {
    songs,
    loading,
    error,
    addSong,
    updateSong,
    deleteSong,
    refresh: loadSongs
  };
}
import { useState, useEffect } from 'react';
import { Song } from '../types';
import { SongService } from '../services/api/songService';
import { useApi } from './useApi';

export function useSongs(artistId?: string) {
  const songService = new SongService();
  const [songs, setSongs] = useState<Song[]>([]);
  
  const {
    loading,
    error,
    execute: fetchSongs
  } = useApi(
    () => songService.getSongs(artistId),
    {
      onSuccess: (data) => setSongs(data),
    }
  );

  useEffect(() => {
    fetchSongs();
  }, [artistId]);

  const addSong = async (song: Omit<Song, 'id' | 'createdAt'>) => {
    const newSong = await songService.createSong(song);
    setSongs(prev => [newSong, ...prev]);
    return newSong;
  };

  const updateSong = async (song: Song) => {
    const updatedSong = await songService.updateSong(song);
    setSongs(prev => prev.map(s => s.id === song.id ? updatedSong : s));
    return updatedSong;
  };

  const deleteSong = async (id: string) => {
    await songService.deleteSong(id);
    setSongs(prev => prev.filter(s => s.id !== id));
  };

  return {
    songs,
    loading,
    error,
    addSong,
    updateSong,
    deleteSong,
    refresh: fetchSongs
  };
}
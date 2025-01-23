import { useState, useEffect } from 'react';
import { Song } from '../../types';
import { AdminService } from '../../services/api/adminService';
import { useApi } from '../useApi';

export function useContentModeration() {
  const adminService = new AdminService();
  const [flaggedContent, setFlaggedContent] = useState<Song[]>([]);

  const {
    loading,
    error,
    execute: fetchFlaggedContent
  } = useApi(
    () => adminService.getFlaggedContent(),
    {
      onSuccess: (data) => setFlaggedContent(data),
    }
  );

  useEffect(() => {
    fetchFlaggedContent();
  }, []);

  const approveSong = async (songId: string) => {
    await adminService.approveSong(songId);
    setFlaggedContent(prev => prev.filter(song => song.id !== songId));
  };

  const removeSong = async (songId: string) => {
    await adminService.removeSong(songId);
    setFlaggedContent(prev => prev.filter(song => song.id !== songId));
  };

  return {
    flaggedContent,
    loading,
    error,
    approveSong,
    removeSong,
    refresh: fetchFlaggedContent
  };
}
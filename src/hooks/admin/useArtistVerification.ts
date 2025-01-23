import { useState, useEffect } from 'react';
import { ArtistProfile } from '../../types';
import { AdminService } from '../../services/api/adminService';
import { useApi } from '../useApi';

export function useArtistVerification() {
  const adminService = new AdminService();
  const [pendingArtists, setPendingArtists] = useState<ArtistProfile[]>([]);

  const {
    loading,
    error,
    execute: fetchPendingArtists
  } = useApi(
    () => adminService.getPendingArtists(),
    {
      onSuccess: (data) => setPendingArtists(data),
    }
  );

  useEffect(() => {
    fetchPendingArtists();
  }, []);

  const verifyArtist = async (artistId: string) => {
    await adminService.verifyArtist(artistId);
    setPendingArtists(prev => prev.filter(artist => artist.id !== artistId));
  };

  const rejectArtist = async (artistId: string) => {
    await adminService.rejectArtist(artistId);
    setPendingArtists(prev => prev.filter(artist => artist.id !== artistId));
  };

  return {
    pendingArtists,
    loading,
    error,
    verifyArtist,
    rejectArtist,
    refresh: fetchPendingArtists
  };
}
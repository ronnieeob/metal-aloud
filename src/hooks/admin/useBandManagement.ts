import { useState, useEffect } from 'react';
import { BandService } from '../../services/api/bandService';
import { MockService } from '../../services/mockService';
import { BandManagement } from '../../types/admin';

const MOCK_BANDS = [
  {
    id: '1',
    name: 'Metallica',
    formedIn: '1981',
    imageUrl: 'https://images.unsplash.com/photo-1598387993441-a364f854c3e1',
    genres: ['Thrash Metal', 'Heavy Metal'],
    description: 'Legendary thrash metal band from San Francisco',
    members: [],
    socialLinks: {},
    status: 'active',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: '2',
    name: 'Iron Maiden',
    formedIn: '1975',
    imageUrl: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819',
    genres: ['Heavy Metal', 'Power Metal'],
    description: 'Pioneering heavy metal band from London',
    members: [],
    socialLinks: {},
    status: 'active',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

export function useBandManagement() {
  const bandService = new BandService();
  const mockService = new MockService();
  const [bands, setBands] = useState<BandManagement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [initialized, setInitialized] = useState(false);

  const refresh = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // In development or when API is not available, use mock data
      if (import.meta.env.DEV) {
        setBands(MOCK_BANDS);
        return;
      }
      
      const data = await bandService.getBands();
      setBands(data);
    } catch (err) {
      console.error('Failed to load bands:', err);
      setError('Unable to connect to server. Using offline mode.');
      setBands(MOCK_BANDS); // Fallback to mock data
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!initialized) {
      refresh();
      setInitialized(true);
    }
  }, [initialized]);

  const createBand = async (band: Omit<BandManagement, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      setLoading(true);
      const newBand = import.meta.env.DEV
        ? {
            ...band,
            id: crypto.randomUUID(),
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          }
        : await bandService.createBand(band);
        
      setBands(prev => [...prev, newBand]);
      return newBand;
    } catch (err) {
      console.error('Failed to create band:', err);
      setError('Failed to create band');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateBand = async (id: string, updates: Partial<BandManagement>) => {
    try {
      setLoading(true);
      const updatedBand = import.meta.env.DEV
        ? {
            ...bands.find(b => b.id === id)!,
            ...updates,
            updatedAt: new Date().toISOString()
          }
        : await bandService.updateBand(id, updates);
      
      setBands(prev => prev.map(band => band.id === id ? updatedBand : band));
      return updatedBand;
    } catch (err) {
      console.error('Failed to update band:', err);
      setError('Failed to update band');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const deleteBand = async (id: string) => {
    try {
      setLoading(true);
      if (!import.meta.env.DEV) {
        await bandService.deleteBand(id);
      }
      setBands(prev => prev.filter(band => band.id !== id));
    } catch (err) {
      console.error('Failed to delete band:', err);
      setError('Failed to delete band');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    bands,
    loading,
    error,
    createBand,
    updateBand,
    deleteBand,
    refresh
  };
}
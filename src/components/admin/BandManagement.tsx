import React, { useState, useEffect } from 'react';
import { useBandManagement } from '../../hooks/admin/useBandManagement';
import { BandManagement as BandType } from '../../types/admin';
import { Plus, Edit2, Trash2, Music, Upload, Loader, Play, Filter, Search, ArrowUpDown } from 'lucide-react';
import { BandModal } from './BandModal';
import { BandSongs } from './BandSongs';
import { usePlayer } from '../../contexts/PlayerContext';
import { Song } from '../../types';

export function BandManagement() {
  const { bands, loading, error, createBand, updateBand, deleteBand, refresh } = useBandManagement();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGenre, setSelectedGenre] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<'name' | 'formed' | 'songs'>('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const { dispatch } = usePlayer();
  const [showModal, setShowModal] = useState(false);
  const [editingBand, setEditingBand] = useState<BandType | null>(null);
  const [selectedBandId, setSelectedBandId] = useState<string | null>(null);
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    if (!initialized) {
      refresh?.();
      setInitialized(true);
    }
  }, [initialized]);

  const allGenres = Array.from(
    new Set(bands.flatMap(band => band.genres))
  ).sort();

  const filteredBands = bands
    .filter(band => 
      band.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
      (!selectedGenre || band.genres.includes(selectedGenre))
    )
    .sort((a, b) => {
      const order = sortOrder === 'asc' ? 1 : -1;
      switch (sortBy) {
        case 'name':
          return order * a.name.localeCompare(b.name);
        case 'formed':
          return order * a.formedIn.localeCompare(b.formedIn);
        case 'songs':
          return order * ((a.songs?.length || 0) - (b.songs?.length || 0));
        default:
          return 0;
      }
    });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Loader className="w-8 h-8 text-red-500 animate-spin mx-auto mb-4" />
          <p className="text-gray-400">Loading bands...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center text-red-500 py-8 bg-zinc-800/50 rounded-lg p-6 border border-red-900/20">
        <p className="mb-4">Unable to connect to the server. Using offline mode.</p>
        <button
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition"
        >
          Retry Connection
        </button>
      </div>
    );
  }

  const handleSave = async (band: Omit<BandType, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      if (editingBand) {
        await updateBand(editingBand.id, band);
      } else {
        await createBand(band);
      }
      setShowModal(false);
      setEditingBand(null);
    } catch (err) {
      console.error('Failed to save band:', err);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this band?')) {
      try {
        await deleteBand(id);
      } catch (err) {
        console.error('Failed to delete band:', err);
      }
    }
  };

  const handleAddSong = async (song: Omit<Song, 'id'>) => {
    try {
      // In development mode, create a mock song
      if (import.meta.env.DEV) {
        const mockSong: Song = {
          id: crypto.randomUUID(),
          ...song,
          duration: 180, // 3 minutes
          createdAt: new Date().toISOString()
        };
        // Update the band's songs in the mock service
        const band = bands.find(b => b.id === selectedBandId);
        if (band) {
          await updateBand(band.id, {
            ...band,
            songs: [...(band.songs || []), mockSong]
          });
        }
      } else {
        // In production, call the API
        // Implementation will be added later
      }
    } catch (err) {
      console.error('Failed to add song:', err);
    }
  };

  const handleDeleteSong = async (songId: string) => {
    try {
      // In development mode, remove the song from the band
      if (import.meta.env.DEV) {
        const band = bands.find(b => b.id === selectedBandId);
        if (band) {
          await updateBand(band.id, {
            ...band,
            songs: band.songs?.filter(s => s.id !== songId) || []
          });
        }
      } else {
        // In production, call the API
        // Implementation will be added later
      }
    } catch (err) {
      console.error('Failed to delete song:', err);
    }
  };

  const handlePlaySong = (song: Song) => {
    dispatch({ type: 'SET_SONG', payload: song });
  };

  return (
    <div className="bg-zinc-800/50 rounded-lg p-6 border border-red-900/20">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-red-500">Band Management</h2>
        <div className="flex items-center space-x-4">
          <div className="relative">
            <input
              type="text"
              placeholder="Search bands..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-2 bg-zinc-800 border border-red-900/20 rounded text-white placeholder-gray-400"
            />
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          </div>
          
          <select
            value={selectedGenre || ''}
            onChange={(e) => setSelectedGenre(e.target.value || null)}
            className="bg-zinc-800 border border-red-900/20 rounded px-3 py-2 text-white"
          >
            <option value="">All Genres</option>
            {allGenres.map(genre => (
              <option key={genre} value={genre}>{genre}</option>
            ))}
          </select>
          
          <div className="flex items-center space-x-2">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
              className="bg-zinc-800 border border-red-900/20 rounded px-3 py-2 text-white"
            >
              <option value="name">Sort by Name</option>
              <option value="formed">Sort by Formation</option>
              <option value="songs">Sort by Songs</option>
            </select>
            <button
              onClick={() => setSortOrder(order => order === 'asc' ? 'desc' : 'asc')}
              className="p-2 rounded bg-zinc-800 border border-red-900/20 hover:bg-zinc-700"
            >
              <ArrowUpDown className="w-4 h-4" />
            </button>
          </div>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center space-x-2 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition"
        >
          <Plus className="w-4 h-4" />
          <span>Add Band</span>
        </button>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filteredBands.map((band) => (
          <div
            key={band.id}
            className="bg-zinc-900/50 rounded-lg p-4 border border-red-900/10"
          >
            <img
              src={band.imageUrl}
              alt={band.name}
              className="w-full aspect-video object-cover rounded-lg mb-4"
            />
            <h3 className="text-xl font-bold mb-2">{band.name}</h3>
            <p className="text-gray-400 text-sm mb-2">Formed in {band.formedIn}</p>
            
            <div className="flex flex-wrap gap-2 mb-4">
              {band.genres.map((genre, index) => (
                <span
                  key={index}
                  className="px-2 py-1 bg-red-900/20 text-red-400 rounded-full text-xs"
                >
                  {genre}
                </span>
              ))}
            </div>

            <div className="flex justify-end space-x-2">
              <button
                onClick={() => {
                  setSelectedBandId(band.id);
                  setEditingBand(band);
                  setShowModal(true);
                }}
                className="p-2 rounded-full bg-zinc-700/50 hover:bg-zinc-700 transition"
              >
                <Edit2 className="w-4 h-4" />
              </button>
              <button
                onClick={() => handleDelete(band.id)}
                className="p-2 rounded-full bg-red-600/20 text-red-400 hover:bg-red-600/30 transition"
              >
                <Trash2 className="w-4 h-4" />
              </button>
              <button
                onClick={() => setSelectedBandId(selectedBandId === band.id ? null : band.id)}
                className="p-2 rounded-full bg-zinc-700/50 hover:bg-zinc-700 transition"
              >
                <Music className="w-4 h-4" />
              </button>
            </div>
            
            {selectedBandId === band.id && (
              <BandSongs
                bandId={band.id}
                songs={band.songs || []}
                onAddSong={handleAddSong}
                onDeleteSong={handleDeleteSong}
                onPlaySong={handlePlaySong}
              />
            )}
          </div>
        ))}
      </div>

      {bands.length === 0 && (
        <p className="text-center text-gray-400 py-12">No bands added yet</p>
      )}

      {showModal && (
        <BandModal
          onClose={() => {
            setShowModal(false);
            setEditingBand(null);
          }}
          onSave={handleSave}
          band={editingBand}
        />
      )}
    </div>
  );
}
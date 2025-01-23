import React, { useState, useEffect } from 'react';
import { bands } from '../data/bands';
import { Play } from 'lucide-react';
import { usePlayer } from '../contexts/PlayerContext';
import { useSpotifySync } from '../hooks/useSpotifySync';
import { Song, Band } from '../types';
import { useSearch } from '../hooks/useSearch'; 
import { useNavigation } from '../contexts/NavigationContext';
import { MerchSection } from './merch/MerchSection';

export function BandsSection() {
  const { dispatch } = usePlayer();
  const { syncBandSongs } = useSpotifySync();
  const { results } = useSearch();
  const { selectedBand, setSelectedBand } = useNavigation();
  const [activeTab, setActiveTab] = useState('songs');
  const [selectedBandSongs, setSelectedBandSongs] = useState<Record<string, Song[]>>({});

  useEffect(() => {
    if (selectedBand) {
      handleBandClick(selectedBand);
    }
  }, [selectedBand, handleBandClick]);

  const handlePlayBand = async (bandId: string) => {
    const band = [...bands, ...(results?.bands || [])].find(b => b.id === bandId);
    if (!band) return;

    if (!selectedBandSongs[bandId]) {
      const syncedSongs = await syncBandSongs(band.name);
      setSelectedBandSongs(prev => ({
        ...prev,
        [bandId]: syncedSongs
      }));
    }

    const bandSongs = selectedBandSongs[bandId] || [];
    if (band.featuredSong || bandSongs.length > 0) {
      const songToPlay = band.featuredSong || bandSongs[0];
      dispatch({ type: 'SET_SONG', payload: songToPlay });
    }
  };

  const handleBandClick = async (band: Band) => {
    setSelectedBand(band);
    if (!selectedBandSongs[band.id]) {
      // Clear existing songs while loading
      setSelectedBandSongs(prev => ({
        ...prev,
        [band.id]: []
      }));

      try {
        const syncedSongs = await syncBandSongs(band.name);
      
        // Group songs by album
        const sortedSongs = syncedSongs.sort((a, b) => {
          if (!a.album && !b.album) return 0;
          if (!a.album) return 1;
          if (!b.album) return -1;
          return a.album.localeCompare(b.album);
        });
      
        setSelectedBandSongs(prev => ({
          ...prev,
          [band.id]: sortedSongs
        }));
      } catch (err) {
        console.error('Failed to load band songs:', err);
        setSelectedBandSongs(prev => ({
          ...prev,
          [band.id]: []
        }));
      }
    }
  };

  return (
    <div className="mb-12">
      <h2 className="text-2xl metal-font text-red-500 mb-6">Legendary Bands</h2>
      
      {selectedBand ? (
        <div className="mb-8">
          <button
            onClick={() => setSelectedBand(null)}
            className="text-red-400 hover:text-red-300 mb-4"
          >
            ← Back to all bands
          </button>
          
          <div className="flex items-start space-x-8 mb-8">
            <img
              src={selectedBand.imageUrl}
              alt={selectedBand.name}
              className="w-48 h-48 rounded-lg object-cover"
            />
            <div>
              <h3 className="text-3xl font-bold mb-2">{selectedBand.name}</h3>
              <p className="text-gray-400 mb-4">Formed in {selectedBand.formedIn}</p>
              <div className="flex flex-wrap gap-2">
                {selectedBand.genres.map((genre, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 rounded-full bg-red-900/30 text-red-300 text-sm"
                  >
                    {genre}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Tabs for Songs and Merch */}
          <div className="border-b border-red-900/20 mb-6">
            <div className="flex space-x-4">
              <button
                onClick={() => setActiveTab('songs')}
                className={`py-2 px-4 border-b-2 transition-colors ${
                  activeTab === 'songs'
                    ? 'border-red-500 text-red-500'
                    : 'border-transparent text-gray-400 hover:text-red-400'
                }`}
              >
                Songs
              </button>
              <button
                onClick={() => setActiveTab('merch')}
                className={`py-2 px-4 border-b-2 transition-colors ${
                  activeTab === 'merch'
                    ? 'border-red-500 text-red-500'
                    : 'border-transparent text-gray-400 hover:text-red-400'
                }`}
              >
                Merch
              </button>
            </div>
          </div>

          {activeTab === 'songs' ? (

          <div className="space-y-2">
            <h4 className="text-xl font-bold mb-4">Songs</h4>
            {Object.entries(
              selectedBandSongs[selectedBand.id]?.reduce((acc, song) => {
                const album = song.album || 'Singles';
                if (!acc[album]) acc[album] = [];
                acc[album].push(song);
                return acc;
              }, {} as Record<string, Song[]>) || {}
            ).map(([album, songs]) => (
              <div key={album} className="mb-8">
                <h5 className="text-lg font-semibold text-red-400 mb-4">{album}</h5>
                {songs.map((song) => (
                  <div
                    key={song.id}
                    className="flex items-center justify-between p-3 bg-zinc-900/50 rounded hover:bg-red-900/30 transition group"
                  >
                    <div className="flex items-center space-x-3">
                      <img
                        src={song.coverUrl}
                        alt={song.title}
                        className="w-10 h-10 rounded"
                      />
                      <div>
                        <h4 className="font-medium">{song.title}</h4>
                        <p className="text-sm text-gray-400">
                          {song.audioUrl ? 'Preview available' : 'No preview'}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => song.audioUrl && dispatch({ type: 'SET_SONG', payload: song })}
                      className="p-2 rounded-full bg-red-600 text-white opacity-0 group-hover:opacity-100 transition"
                      disabled={!song.audioUrl}
                    >
                      <Play className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            ))}
            {(!selectedBandSongs[selectedBand.id] || selectedBandSongs[selectedBand.id].length === 0) && (
              <p className="text-center text-gray-400 py-8">No songs available</p>
            )}
          </div>
          ) : (
            <MerchSection artistId={selectedBand.id} />
          )}
        </div>
      ) : (
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {[...bands, ...(results?.bands || [])].filter((band, index, self) => 
          // Remove duplicates based on name
          index === self.findIndex(b => b.name === band.name)
        ).map((band) => (
          <div
            key={band.id}
            className="bg-zinc-800/50 rounded-lg p-4 border border-red-900/20 group relative"
            onClick={() => handleBandClick(band)}
          >
            <div className="relative mb-4">
              <img
                src={band.imageUrl}
                alt={band.name}
                className="w-full aspect-square object-cover rounded-full"
              />
              {band.featuredSong && (
                <button
                  onClick={() => handlePlayBand(band.id)}
                  className="absolute right-2 bottom-2 p-3 rounded-full bg-red-600 text-white opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <Play className="w-4 h-4" />
                </button>
              )}
            </div>
            <h3 className="text-lg font-bold text-white mb-1">{band.name}</h3>
            <p className="text-sm text-gray-400 mb-2">{band.formedIn}</p>
            <div className="flex flex-wrap gap-2">
              {band.genres.map((genre, index) => (
                <span
                  key={index}
                  className="text-xs px-2 py-1 rounded-full bg-red-900/30 text-red-300"
                >
                  {genre}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
      )}
    </div>
  );
}
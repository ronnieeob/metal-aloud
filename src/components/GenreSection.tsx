import React, { useState } from 'react';
import { genres } from '../data/genres';
import { useMetalContent } from '../hooks/useMetalContent';
import { Play } from 'lucide-react';
import { usePlayer } from '../contexts/PlayerContext';
import { Song } from '../types';
import { useSpotifySync } from '../hooks/useSpotifySync';

export function GenreSection() {
  const [selectedGenre, setSelectedGenre] = useState<string | null>(null);
  const { songs } = useMetalContent();
  const { syncing, syncGenreSongs } = useSpotifySync();
  const { dispatch } = usePlayer();
  const [spotifySongs, setSpotifySongs] = useState<Song[]>([]);

  const handleGenreClick = async (genreName: string) => {
    const newGenre = selectedGenre === genreName ? null : genreName;
    setSelectedGenre(newGenre);
    if (newGenre) {
      setSpotifySongs([]); // Clear previous songs while loading
      const syncedSongs = await syncGenreSongs(genreName);
      setSpotifySongs(syncedSongs);
    } else {
      setSpotifySongs([]);
    }
  };

  const handlePlaySong = (song: Song) => {
    if (!song.audioUrl) {
      console.error('No audio URL available for song:', song);
      alert('Preview not available for this song');
      return;
    }
    dispatch({ type: 'SET_SONG', payload: song });
  };

  const filteredSongs = selectedGenre
    ? [...songs, ...spotifySongs].filter(song => {
        // Check if song has genres array
        if (song?.genres && Array.isArray(song.genres) && song.genres.length > 0) {
          return song.genres.some(genre => 
            typeof genre === 'string' && genre.toLowerCase().includes(selectedGenre.toLowerCase())
          );
        }
        // Fallback to checking artist and album for genre keywords
        const searchTerm = selectedGenre.toLowerCase();
        const artistMatch = song?.artist && typeof song.artist === 'string' && 
          song.artist.toLowerCase().includes(searchTerm);
        const albumMatch = song?.album && typeof song.album === 'string' && 
          song.album.toLowerCase().includes(searchTerm);
        return artistMatch || albumMatch;
      })
    : [];

  return (
    <div className="mb-12">
      <h2 className="text-2xl metal-font text-red-500 mb-6">Metal Genres</h2>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {genres.map((genre) => (
          <div
            key={genre.id}
            className={`relative group overflow-hidden rounded-lg cursor-pointer ${
              selectedGenre === genre.name ? 'ring-2 ring-red-500' : ''
            }`}
            onClick={() => handleGenreClick(genre.name)}
          >
            <img
              src={genre.imageUrl}
              alt={genre.name}
              className="w-full h-48 object-cover transition-transform duration-300 group-hover:scale-110"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent flex items-end">
              <div className="p-4 w-full">
                <h3 className="text-xl font-bold text-white mb-1">{genre.name}</h3>
                <p className="text-sm text-gray-300">{genre.description}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      {selectedGenre && (
        <div className="mt-8">
          <h3 className="text-xl font-bold text-red-400 mb-4">
            {selectedGenre} Songs
            {syncing && <span className="text-sm text-gray-400 ml-2">(Syncing with Spotify...)</span>}
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {filteredSongs.map((song) => (
              <div
                key={song.id}
                className="bg-zinc-800/50 p-4 rounded-lg hover:bg-red-900/30 transition cursor-pointer group border border-red-900/20"
                onClick={() => handlePlaySong(song)}
              >
                <div className="relative">
                  <img
                    src={song.coverUrl || 'https://images.unsplash.com/photo-1511735111819-9a3f7709049c'}
                    alt={song.title}
                    className="w-full aspect-square object-cover rounded-lg mb-2"
                  />
                  <button className="absolute right-2 bottom-2 p-2 rounded-full bg-red-600 text-white opacity-0 group-hover:opacity-100 transition">
                    <Play className="w-4 h-4" />
                  </button>
                </div>
                <h4 className="font-medium truncate">{song.title}</h4>
                <p className="text-sm text-gray-400 truncate">{song.artist}</p>
              </div>
            ))}
            {filteredSongs.length === 0 && (
              <div className="col-span-full text-center py-8 text-gray-400">
                No songs found for {selectedGenre}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
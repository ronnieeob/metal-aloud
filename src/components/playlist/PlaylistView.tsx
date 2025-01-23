import React from 'react';
import { Play, Plus, Trash2 } from 'lucide-react';
import { Playlist, Song } from '../../types';
import { usePlayer } from '../../contexts/PlayerContext';

interface PlaylistViewProps {
  playlist: Playlist;
  onAddSongs?: () => void;
  onRemoveSong?: (songId: string) => void;
}

export function PlaylistView({ playlist, onAddSongs, onRemoveSong }: PlaylistViewProps) {
  const { dispatch } = usePlayer();

  const handlePlaySong = (song: Song) => {
    dispatch({ type: 'SET_SONG', payload: song });
  };

  return (
    <div className="bg-zinc-800/50 rounded-lg p-6 border border-red-900/20">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-4">
          <img
            src={playlist.coverUrl}
            alt={playlist.name}
            className="w-24 h-24 rounded-lg object-cover"
          />
          <div>
            <h2 className="text-2xl font-bold text-red-500">{playlist.name}</h2>
            <p className="text-sm text-gray-400">{playlist.songs.length} songs</p>
          </div>
        </div>
        {onAddSongs && (
          <button
            onClick={onAddSongs}
            className="flex items-center space-x-2 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition"
          >
            <Plus className="w-4 h-4" />
            <span>Add Songs</span>
          </button>
        )}
      </div>

      <div className="space-y-2">
        {playlist.songs.map((song) => (
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
                <h3 className="font-medium">{song.title}</h3>
                <p className="text-sm text-gray-400">{song.artist}</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <button
                onClick={() => handlePlaySong(song)}
                className="p-2 rounded-full bg-red-600 text-white opacity-0 group-hover:opacity-100 transition"
              >
                <Play className="w-4 h-4" />
              </button>
              {onRemoveSong && (
                <button
                  onClick={() => onRemoveSong(song.id)}
                  className="p-2 rounded-full bg-red-900/20 text-red-400 opacity-0 group-hover:opacity-100 transition"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        ))}

        {playlist.songs.length === 0 && (
          <p className="text-center text-gray-400 py-8">
            No songs in this playlist yet
          </p>
        )}
      </div>
    </div>
  );
}